import { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import {
    Database, FileJson, X, ExternalLink, Edit3, Trash2, Award,
    Fingerprint, FileText, ImageIcon, Save, Link as LinkIcon, IdCardIcon, BuildingIcon, Info
} from 'lucide-react';
import { Link } from "@tanstack/react-router";
import Navbar from "@/components/navbar.tsx";
import React from "react";

export default function Cms() {
    const [podcasts, setPodcasts] = useState([]);
    const [selectedRaw, setSelectedRaw] = useState(null);
    const [editingPod, setEditingPod] = useState(null);

    const getCount = (arr) => Array.isArray(arr) ? arr.reduce((acc, item) => acc + (item.count || 0), 0) : 0;

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
                const response = await fetch(`${baseUrl}/predictions`);
                const data = await response.json();
                setPodcasts(data ? Object.values(data) : []);
            } catch (err) { console.error("Failed to fetch:", err); }
        };
        fetchSignals();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            description: formData.get('description'),
            url: formData.get('url'),
            thumbnail: formData.get('thumbnail'),
            audio: formData.get('audio'),
            title: formData.get('title'),
            podcast: formData.get('title'),
            paradigm_baseline: formData.get('paradigm_baseline'),
            speaker: formData.get('speaker'),
            position: formData.get('position'),
            labels: formData.get('labels')?.split(", "),
        };
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/podcasts/${editingPod.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (response.ok) {
            setPodcasts(prev => prev.map(p => p.id === editingPod.id ? { ...p, ...updates } : p));
            setEditingPod(null);
        }
    };

    const deletePodcast = async (id) => {
        if (!window.confirm("Confirm deletion?")) return;
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/podcasts/${id}`, { method: 'DELETE' });
        if (response.ok) setPodcasts(prev => prev.filter(p => p.id !== id));
    };

    // RAW DATA DISPLAY ONLY. No labels, no logic, no thresholds.
    const CompetencyCell = ({ metrics }) => {
        const greens = getCount(metrics.green_flags);
        const reds = metrics.red_flags_count || 0;
        const total = greens + reds || 1;
        const greenWidth = (greens / total) * 100;

        return (
            <div className="flex flex-col gap-1 w-44">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    <span>Focus: {metrics.overall_weight}%</span>
                    <span className="text-blue-600">Clarity: {metrics.purity_score}%</span>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="bg-blue-600" style={{ width: `${greenWidth}%` }} />
                    <div className="bg-gray-300" style={{ width: `${100 - greenWidth}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                    <span className="text-blue-600 font-bold">{greens} Valid</span>
                    <span className="text-red-500 font-bold">{reds} Errors</span>
                </div>
            </div>
        );
    };

    const getMainPillar = (metrics = {}) => {
        // Map your internal keys to your human-readable Pillar Names
        const pillarMapping = {
            'Logic_Consistency': 'Critical Thinking',
            'Contextual_Clarity': 'Contextual Clarity',
            'Execution_Velocity': 'Problem Solving'
        };

        const entries = Object.entries(metrics);
        if (entries.length === 0) return "N/A";

        const winner = entries.reduce((prev, curr) =>
            (curr[1].overall_weight > prev[1].overall_weight) ? curr : prev
        );

        return pillarMapping[winner[0]] || winner[0].replace(/_/g, ' ');
    };

    const [selectedRecommendation, setSelectedRecommendation] = useState(null);

// --- Updated Table Layout ---
    return (
        <div className="min-h-screen bg-white text-[#202124] font-sans">
            <Navbar />
            <main className="w-full bg-[#f8f9fa] ">
                {/* Remove overflow-hidden from here, it breaks sticky */}
                <div className="border border-gray-200 bg-white shadow-sm rounded-lg">

                    {/* Table needs a defined height or the container needs it to scroll */}
                    <div className="max-h-[85vh] overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#f1f3f4] z-20 border-b border-gray-300 shadow-sm">
                            <tr className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Candidate</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Position</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Focus</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Space</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Critical Thinking</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Contextual Clarity</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">Problem Solving</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4]">AI Recommendation</th>
                                <th className="py-3 px-6 sticky top-0 bg-[#f1f3f4] text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {podcasts.map((pod) => {
                                const m = pod.final_profile?.metrics || {};
                                const isStrict = pod.paradigm_baseline === 'is_strict';
                                const details = pod.gemini?.data;

                                return (
                                    <React.Fragment key={pod.id}>
                                        <tr className="bg-white hover:bg-[#e8f0fe] transition-colors group">
                                            <td className="py-4 px-6 text-[13px] font-medium text-gray-900 border-l-4 border-l-transparent group-hover:border-l-blue-500">{pod.podcast}</td>
                                            <td className="py-4 px-6 text-[13px] text-gray-600">{pod.position}</td>
                                            <td className="py-4 px-6 text-[11px] font-bold text-blue-700 uppercase tracking-tight">{getMainPillar(m)}</td>
                                            <td className="py-4 px-6 text-[11px] font-medium text-gray-500">{isStrict ? "STRICT" : "FLEX"}</td>
                                            <td className="py-2 px-6"><CompetencyCell metrics={m.Logic_Consistency || {}} /></td>
                                            <td className="py-2 px-6"><CompetencyCell metrics={m.Contextual_Clarity || {}} /></td>
                                            <td className="py-2 px-6"><CompetencyCell metrics={m.Execution_Velocity || {}} /></td>
                                            <td className="py-4 px-6">
                                                {details?.recommendation?.action ? (
                                                    <span className="text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                    {details.recommendation.action}
                                </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300">Pending</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-3 text-gray-400 group-hover:text-gray-600">
                                                    <button className="hover:text-blue-600" onClick={() => setSelectedRaw(pod)}><FileJson size={15} /></button>
                                                    <button className="hover:text-blue-600" onClick={() => setEditingPod(pod)}><Edit3 size={15} /></button>
                                                    <button className="hover:text-red-600"><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>

                                        {details && (
                                            <tr className="bg-[#f8f9fa]">
                                                <td colSpan="9" className="px-10 py-6">
                                                    <div className="grid grid-cols-4 gap-6">
                                                        {details.pillars.map((p, i) => (
                                                            <div key={i} className="bg-white p-4 rounded border border-gray-200">
                                                                <div className="flex justify-between mb-2">
                                                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{p.pillar}</span>
                                                                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">{p.result}</span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-600 leading-relaxed">{p.reasoning}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="md:col-span-2 p-4 bg-blue-50/50 border border-blue-100 rounded text-[11px] text-gray-700">
                                                            <span className="font-bold text-blue-900 uppercase tracking-wider mr-2">Verdict:</span>
                                                            {details.verdict}
                                                        </div>
                                                        {details.recommendation && (
                                                            <div className="p-4 bg-white border-2 border-gray-900 rounded shadow-sm flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">
                                                                            Recommendation: {details.recommendation.action}
                                                                        </div>
                                                                        {/* CLICKABLE INFO ICON */}
                                                                        <button
                                                                            onClick={() => setSelectedRecommendation(details.recommendation)}
                                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                        >
                                                                            <Info size={14} />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[10px] text-gray-600 mb-3">{details.recommendation.reasoning}</p>
                                                                    {details.recommendation.focus_area && (
                                                                        <div className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded inline-block">
                                                                            Focus: {details.recommendation.focus_area}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {selectedRecommendation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedRecommendation(null)} />

                    {/* Modal */}
                    <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-lg w-full border border-gray-200">
                        <h3 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                            Action: {selectedRecommendation.action.replace('_', ' ')}
                        </h3>

                        {/* The Specific Reasoning */}
                        <p className="text-[13px] text-gray-700 leading-relaxed mb-6 bg-blue-50 p-4 rounded border border-blue-100">
                            {selectedRecommendation.reasoning}
                        </p>

                        {/* Educational Context Section */}
                        <div className="border-t border-gray-100 pt-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Why this step?
                            </h4>
                            <p className="text-[12px] text-gray-600 leading-relaxed">
                                {selectedRecommendation.action === "TECHNICAL_TEST" ? (
                                    <>
                                        <strong>Goal:</strong> Validate the candidate's <em>logical reasoning</em>.
                                        We are checking if they can think through complex problems without making bad assumptions.
                                        This is appropriate when we have concerns about their accuracy or analytical process.
                                    </>
                                ) : selectedRecommendation.action === "PRACTICAL_TASK" ? (
                                    <>
                                        <strong>Goal:</strong> Validate the candidate's <em>execution capability</em>.
                                        We are checking if they can deliver clean, working results in a real-world environment.
                                        This is appropriate when we need to confirm their speed matches their claims.
                                    </>
                                ) : (
                                    "This recommendation is based on the synthesized audit of the candidate's transcript and performance metrics."
                                )}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedRecommendation(null)}
                            className="w-full mt-6 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Editing Side Sheet - Identical to your original */}
            {editingPod && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setEditingPod(null)} />
                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-500">
                        <form onSubmit={handleUpdate} className="flex flex-col h-full">
                            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1 block">Data_Maintenance</span>
                                    <h3 className="text-2xl font-normal tracking-tight">Update Signal Node</h3>
                                </div>
                                <button type="button" onClick={() => setEditingPod(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-10 space-y-12">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <Fingerprint size={12} /> Id
                                    </label>
                                    {editingPod.id}
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <Fingerprint size={12} /> Title
                                    </label>
                                    <input name="title" defaultValue={editingPod.podcast} className="w-full text-2xl font-light border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <IdCardIcon size={12} /> Speaker id
                                    </label>
                                    <input name="speaker" defaultValue={editingPod.speaker} className="w-full text-2xl font-light border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <BuildingIcon size={12} /> Position
                                    </label>
                                    <input name="position" defaultValue={editingPod.position} className="w-full text-2xl font-light border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                </div>
                                {/*<div className="space-y-4">*/}
                                {/*    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">*/}
                                {/*        <FileText size={12} /> Description*/}
                                {/*    </label>*/}
                                {/*    <textarea name="description" defaultValue={editingPod.description} rows={3} className="w-full text-sm font-light leading-relaxed border border-slate-100 focus:border-slate-900 outline-none p-4 transition-all resize-none" />*/}
                                {/*</div>*/}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <Database size={12} /> Audio File Name (Reference)
                                    </label>
                                    <input name="audio" defaultValue={editingPod.audio} className="w-full text-xs font-mono text-slate-500 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                </div>
                                <div className="grid grid-cols-1 gap-12">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                            <LinkIcon size={12} /> URL
                                        </label>
                                        <input name="url" defaultValue={editingPod.url} className="w-full text-xs font-mono text-blue-600 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                            <ImageIcon size={12} /> Thumbnail_URI
                                        </label>
                                        <input name="thumbnail" defaultValue={editingPod.thumbnail} className="w-full text-xs font-mono text-slate-500 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                            Paradigm_Baseline
                                        </label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paradigm_baseline"
                                                    value="is_strict"
                                                    defaultChecked={editingPod.paradigm_baseline === 'is_strict'}
                                                    className="accent-slate-900"
                                                />
                                                <span className="text-sm text-slate-700">Strict</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paradigm_baseline"
                                                    value="is_metaphorical"
                                                    defaultChecked={editingPod.paradigm_baseline === 'is_metaphorical'}
                                                    className="accent-slate-900"
                                                />
                                                <span className="text-sm text-slate-700">Metaphorical</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Labels</label>
                                        <input name="labels" defaultValue={editingPod.labels?.join(", ")} className="w-full text-xs font-mono text-slate-500 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                    </div>
                                </div>
                            </div>
                            <footer className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center sticky bottom-0">
                                <span className="text-[9px] font-mono text-slate-400 uppercase">Registry_UID: {editingPod.id?.split('-')[0]}</span>
                                <button type="submit" className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                                    <Save size={14} /> Persist_Changes
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {selectedRaw && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedRaw(null)} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-500">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="text-2xl font-normal tracking-tight">{selectedRaw.podcast}</h3>
                            <button onClick={() => setSelectedRaw(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-10 bg-[#1a1a1a]">
                            <ReactJson src={selectedRaw} theme="monokai" collapsed={2} displayDataTypes={false} style={{ backgroundColor: 'transparent' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}