import { useState, useEffect } from 'react';
import {
    Save, X, Fingerprint, FileText, Image as ImageIcon,
    Hash, MessageSquare, ChevronRight, Activity, AlertCircle, Plus,
    ExternalLink, RefreshCw, Layout, Database
} from 'lucide-react';
import { useParams, useNavigate } from "@tanstack/react-router";
import {AuditStats} from "@/components/audit-stats.tsx";
import ForensicAuditUI from "@/components/forensic-audit-ui.tsx";

export default function EditPodcast() {
    const { auditId } = useParams({ from: '/edit/$auditId' });
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [pod, setPod] = useState(null);
    const [segments, setSegments] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const [labelCounts, setLabelCounts] = useState({});

    useEffect(() => {
        const fetchFullAudit = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;
                const podRes = await fetch(`${baseUrl}/podcasts/${auditId}`);
                const podData = await podRes.json();

                setPod(podData);
                const topics = podData?.analyses?.topics || [];
                setSegments(topics);

                // --- AGGREGATE COUNTS ---
                const counts = {};

                topics.forEach(topic => {
                    if (topic.results && topic.results.length > 0) {
                        topic.results.forEach(res => {
                            // Iterating over the keys in analysis_data (e.g., "equivocation")
                            Object.keys(res.analysis_data).forEach(label => {
                                counts[label] = (counts[label] || 0) + 1;
                            });
                        });
                    }
                });

                setLabelCounts(counts);
                setLoading(false);

            } catch (err) {
                console.error("Audit Retrieval Failed:", err);
                setLoading(false);
            }
        };
        fetchFullAudit();
    }, [auditId]);

    // Handlers (Updating logic remains the same as your previous implementation)
    const handlePodUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.target);
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            labels: formData.get('labels').split(",").map(l => l.trim()),
            thumbnail: formData.get('thumbnail'),
            url: formData.get('url'),
        };
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            await fetch(`${baseUrl}/podcasts/${auditId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            setIsSaving(false);
        } catch (err) { console.error(err); setIsSaving(false); }
    };

    const handleLabelUpdate = async (segmentId, oldLabel, newLabel, newScore) => {
        const segment = segments.find(s => s.id === segmentId);
        if (!segment) return;
        const updatedResults = { ...segment.results };
        if (oldLabel !== newLabel) delete updatedResults[oldLabel];
        updatedResults[newLabel] = parseFloat(newScore);

        try {

            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, results: updatedResults, has_labels: true } : s));
        } catch (err) { console.error(err); }
    };

    const handleRemoveLabel = async (segmentId, labelToRemove) => {
        const segment = segments.find(s => s.id === segmentId);
        const updatedResults = { ...segment.results };
        delete updatedResults[labelToRemove];
        const hasLabelsLeft = Object.keys(updatedResults).length > 0;
        try {

            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, results: updatedResults, has_labels: hasLabelsLeft } : s));
        } catch (err) { console.error(err); }
    };

    const handleAddLabel = async (segmentId) => {
        const defaultLabel = pod.labels?.[0] || 'baseline_reality';
        const updatedResults = { ...segments.find(s => s.id === segmentId).results, [defaultLabel]: 1.0 };
        try {

            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, results: updatedResults, has_labels: true } : s));
        } catch (err) { console.error(err); }
    };



    const handleRemoveSegment = async (topicId) => { // Rename for clarity
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${baseUrl}/analyses/${auditId}/${topicId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Server rejected the purge request");
            }

            // FIX: The local state must filter by topic_id, not id
            setSegments(prev => prev.filter(s => s.topic_id !== topicId));

            console.log(`Topic ${topicId} purged from local state.`);
        } catch (err) {
            console.error("Forensic Purge Failed:", err);
        }
    };

    const handleSegmentUpdate = async (e, seg) => {
        e.preventDefault();

        // Construct the payload from the current segment state
        const payload = {
            results: seg.results,
            explanation: seg.explanation,
            has_labels: Object.keys(seg.results || {}).length > 0
        };

        console.log(payload)

        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${baseUrl}/analyses/${pod.id}/${seg.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP_ERROR: ${response.status}`);

            console.log(`AXIOM_SYNC_SUCCESS: Node_${seg.id}`);
            // Add toast notification here if needed
        } catch (err) {
            console.error("AXIOM_SYNC_FAILURE:", err);
        }
    };

    const updateSegment = async (segmentId, newExplanation) => {
        try {

            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, explanation: newExplanation } : s));
        } catch (err) { console.error(err); }
    };



    if (loading) return <div className="p-20 font-mono text-xs animate-pulse">RECONSTRUCTING_NODE...</div>;
    if (!pod) return <div className="p-20 font-mono text-xs text-red-500">ERROR: NODE_NOT_FOUND</div>;

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans pb-40">
            {/* GLOBAL NAV */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="bg-black p-1.5">
                        <Activity size={16} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400">Axiom // Forensic_Editor</span>
                        <h2 className="text-xs font-bold font-mono uppercase truncate max-w-[300px]">{pod.podcast}</h2>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate({ to: '/registry' })} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 transition-all px-4">Exit</button>
                    <button form="main-form" type="submit" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-lg shadow-black/10">
                        {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                        Commit_Registry_Changes
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto pt-32 px-6">

                {/* SECTION 1: CORE IDENTITY (METADATA) - FULL WIDTH */}
                {/* SECTION 1: CORE IDENTITY (METADATA) - FULL WIDTH */}
                <section className="bg-white border border-slate-200 p-12 mb-16 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Fingerprint size={120} />
                    </div>

                    <header className="mb-12 border-b border-slate-100 pb-8">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Section_01 // Root_Metadata</span>
                        <h1 className="text-5xl font-normal tracking-tight leading-none text-slate-900">{pod.title}</h1>
                    </header>

                    <form id="main-form" onSubmit={handlePodUpdate} className="grid grid-cols-1 md:grid-cols-12 gap-12">
                        {/* Changed from md:col-span-8 to md:col-span-12 w-full to let components expand completely */}
                        <div className="md:col-span-12 w-full space-y-12">
                            <ForensicAuditUI auditData={pod?.final_profile} msg={pod?.msg}/>
                            <AuditStats counts={labelCounts}/>
                        </div>
                    </form>
                </section>

                {/* SECTION 2: THE AUDIT TRAIL (SEGMENTS) - FULL WIDTH STACK */}
                <section>
                    <header className="mb-12 flex justify-between items-end border-b border-slate-200 pb-8">
                        <div>
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 block">Section_02 // Segment_Registry</span>
                            <h2 className="text-5xl font-normal tracking-tight leading-none text-slate-900">The Audit Trail.</h2>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-5xl font-mono font-light tracking-tighter">{segments.length}</span>
                            <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black">Brakes_Detected</span>
                        </div>
                    </header>

                    {/* TAXONOMY QUICK-REFERENCE BAR */}
                    <div className="mb-8 bg-slate-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Active_Taxonomy_Reference</span>
                            <div className="text-xs font-mono text-slate-300 break-all select-all cursor-pointer" title="Click to select all for copy/paste">
                                {pod.labels?.join(", ") || "NO_LABELS_DEFINED"}
                            </div>
                        </div>
                        <div className="flex gap-6 items-center border-l border-slate-700 pl-6">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Schema_Strict</span>
                                <span className="text-[10px] font-mono text-green-500">REQUIRED</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Sync_Status</span>
                                <span className="text-[10px] font-mono text-blue-400">ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {segments.map((seg, idx) => (
                            <form
                                key={seg.topic_id} // Use topic_id as the key
                                onSubmit={(e) => handleSegmentUpdate(e, seg)}
                            >
                                <div className="group bg-white border border-slate-200 shadow-sm hover:border-slate-400 transition-all overflow-hidden">

                                    {/* HEADER: TOPIC IDENTITY & MULTIPLE OCCURRENCES */}
                                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                            <span className="text-[11px] font-mono font-black text-slate-400">
                                TOPIC_{String(seg.topic_id).padStart(3, '0')}
                            </span>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                                                    {seg.title}
                                                </h3>
                                            </div>

                                            {/* THE TIMELINE BADGES: Showing all occurrences */}
                                            <div className="flex flex-wrap gap-2">
                                                {seg.occurrences?.map((occ, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                                                        <span className="text-[10px] font-bold text-blue-600">{occ.start}s</span>
                                                        <ChevronRight size={10} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold text-slate-600">{occ.end}s</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end mr-4">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Density</span>
                                                <span className="text-xs font-mono font-bold text-slate-900">{seg.num_segments} Segments</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSegment(seg.topic_id)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 transition-all flex items-center gap-2 border border-slate-200"
                                            >
                                                <AlertCircle size={12} /> Purge_Topic
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        {/* ANALYSIS_PROMPT_BUFFER (Unchanged logic, just ensure it maps correctly) */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Thematic_Context_Hash</label>
                                            <div className="w-full bg-slate-50 border border-slate-100 p-3 text-[10px] font-mono text-slate-500 select-all cursor-pointer">
                                                {/* Logic for results summary goes here */}
                                                {seg.title} | {seg.num_segments} Segments | UID: {seg.topic_id}
                                            </div>
                                        </div>

                                        {seg.results && seg.results.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-600">Forensic_Analysis_Hits</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {seg.results.map((res) => (
                                                        Object.entries(res.analysis_data).map(([label, score]) => (
                                                            <div
                                                                key={res.id + label}
                                                                className="flex items-center gap-2 bg-slate-900 px-2 py-1 border-l-2 border-cyan-500"
                                                            >
                            <span className="text-[10px] font-bold text-slate-100 uppercase tracking-tighter">
                                {label}
                            </span>
                                                                <span className="text-[10px] font-mono text-cyan-400">
                                {(score * 100).toFixed(1)}%
                            </span>
                                                            </div>
                                                        ))
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* THE EVIDENCE: Consolidated text from all occurrences */}
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2">
                                                <FileText size={10} /> Consolidated_Thematic_Transcript
                                            </label>
                                            <p
                                                className="text-lg font-light text-slate-700 leading-relaxed border-l-4 border-blue-100 pl-8 py-2 italic"
                                                dangerouslySetInnerHTML={{ __html: seg.text.join("\n") }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}