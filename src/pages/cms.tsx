import{ useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import {
    Activity, Database, FileJson, X, ExternalLink,
    Edit3, Fingerprint, Save, FileText, Image as ImageIcon, Trash2, FileVideo, Eye
} from 'lucide-react';
import {Link} from "@tanstack/react-router";

export default function Cms() {
    const [podcasts, setPodcasts] = useState([]);
    const [selectedRaw, setSelectedRaw] = useState(null);
    const [editingPod, setEditingPod] = useState(null);

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${baseUrl}/predictions`);
                const data = await response.json();
                const podList = data ? Object.values(data) : [];
                setPodcasts(podList);
            } catch (err) {
                console.error("Failed to fetch from TinyDB:", err);
            }
        };
        fetchSignals();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Maps the form fields to your PodcastUpdate BaseModel
        const updates = {
            description: formData.get('description'),
            url: formData.get('url'),
            thumbnail: formData.get('thumbnail'),
            audio: formData.get('audio'),
            title: formData.get('title'),
            podcast: formData.get('title'),
            labels: formData.get('labels').split(", "),
        };

        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${baseUrl}/podcasts/${editingPod.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                // Update local state and close sidesheet
                setPodcasts(prev => prev.map(p => p.id === editingPod.id ? { ...p, ...updates } : p));
                setEditingPod(null);
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const deletePodcast = async (id) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            // Explicitly point to the backend port 8001
            const response = await fetch(`${baseUrl}/podcasts/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setPodcasts(prev => prev.filter(p => p.id !== id));
            } else {
                console.error("Server returned an error:", response.status);
            }
        } catch (err) {
            console.error("Network error - is the backend running on 8001?", err);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
            <article className="max-w-5xl mx-auto pt-40 pb-24 px-6">

                {/*<header className="mb-20">*/}
                {/*    <div className="flex items-center gap-4 mb-8">*/}
                {/*        <span className="text-[10px] px-3 py-1 uppercase bg-slate-50 font-normal tracking-widest text-slate-600 border border-slate-100">*/}
                {/*            Axiom // Registry*/}
                {/*        </span>*/}
                {/*        <span className="text-slate-400 text-[11px] uppercase tracking-widest font-normal font-mono">*/}
                {/*            Protocol: PodcastUpdate_Model*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*    <h1 className="text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] mb-10 text-slate-900">*/}
                {/*        Registry Maintenance.*/}
                {/*    </h1>*/}
                {/*</header>*/}

                <section className="mb-24">
                    <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-4">
                        <Database size={22} className="text-slate-900" />
                        <h2 className="text-[12px] uppercase tracking-[0.2em] font-normal text-slate-500">Document_Store_Index</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 w-12 text-center italic">p̂</th>
                                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Signal Source</th>
                                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center">Topics no</th>
                                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right pr-4">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {podcasts.map((pod) => (
                                <tr key={pod.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-8 text-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto" />
                                    </td>
                                    <td className="py-8">
                                        <div className="flex items-center gap-6">

                                            <div>
                                                <span className="text-lg font-light text-slate-900 block">{pod.podcast}</span>
                                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{pod.file_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 text-center font-mono text-sm italic font-bold">
                                        {pod.results?.topics?.length || 0}
                                    </td>
                                    <td className="py-8 text-right pr-2">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setSelectedRaw(pod)}
                                                className="p-2.5 bg-slate-50 border border-slate-100 rounded-sm text-slate-400 hover:text-slate-900 transition-all"
                                                title="View Raw JSON"
                                            >
                                                <FileJson size={14} />
                                            </button>

                                            {/*<button*/}
                                            {/*    onClick={() => setEditingPod(pod)}*/}
                                            {/*    className="p-2.5 bg-slate-50 border border-slate-100 rounded-sm text-slate-400 hover:text-slate-900 transition-all"*/}
                                            {/*    title="Edit Node"*/}
                                            {/*>*/}
                                            {/*    <Edit3 size={14} />*/}
                                            {/*</button>*/}

                                            <Link to={`/edit/${pod.id}`} aria-label="View audit details" className="p-2.5 bg-slate-50 border border-slate-100 rounded-sm text-slate-400 hover:text-slate-900 transition-all">
                                                <ExternalLink size={14} />
                                            </Link>
                                            {/*<Link to={`/audit/${pod.id}`} aria-label="View audit details" className="p-2.5 bg-slate-50 border border-slate-100 rounded-sm text-slate-400 hover:text-slate-900 transition-all">*/}
                                            {/*    <Eye size={14} />*/}
                                            {/*</Link>*/}


                                            {/* THE DELETE ACTION */}
                                            {/*<button*/}
                                            {/*    onClick={() => deletePodcast(pod.id) }*/}
                                            {/*    className="p-2.5 bg-red-50/50 border border-red-100 rounded-sm text-red-400 hover:bg-red-500 hover:text-white transition-all"*/}
                                            {/*    title="Delete Signal"*/}
                                            {/*>*/}
                                            {/*    <Trash2 size={14} />*/}
                                            {/*</button>*/}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </article>

            {/* SIDESHEET: PODCASTUPDATE MODEL FORM */}
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
                                {/* Title (podcast) */}

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
                                    <input name="title" defaultValue={editingPod.podcast} className="w-full text-2xl font-light border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" placeholder="Enter title..." />
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <FileText size={12} /> Description
                                    </label>
                                    <textarea name="description" defaultValue={editingPod.description} rows={3} className="w-full text-sm font-light leading-relaxed border border-slate-100 focus:border-slate-900 outline-none p-4 transition-all resize-none" placeholder="Add signal context..." />
                                </div>

                                {/* File Name (Mechanical Field) */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                        <Database size={12} /> Audio File Name (Reference)
                                    </label>
                                    <input name="audio" defaultValue={editingPod.audio} className="w-full text-xs font-mono text-slate-500 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                </div>

                                <div className="grid grid-cols-1 gap-12">
                                    {/* URL */}
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                            <Link size={12} /> URL
                                        </label>
                                        <input name="url" defaultValue={editingPod.url} className="w-full text-xs font-mono text-blue-600 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                            <ImageIcon size={12} /> Thumbnail_URI
                                        </label>
                                        <input name="thumbnail" defaultValue={editingPod.thumbnail} className="w-full text-xs font-mono text-slate-500 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                                            Labels
                                        </label>
                                        <input name="labels" defaultValue={editingPod.labels?.join(", ")} className="w-full text-xs font-mono text-slate-500 border-b border-slate-100 focus:border-slate-900 outline-none pb-2 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <footer className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center sticky bottom-0">
                                <span className="text-[9px] font-mono text-slate-400 uppercase">Registry_UID: {editingPod.id?.split('-')[0]}</span>
                                <button type="submit" className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                                    <Save size={14} />
                                    Persist_Changes
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* RAW INSPECTOR SIDESHEET */}
            {selectedRaw && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/5 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedRaw(null)} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-500">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1 block">Ground_Truth_Explorer</span>
                                <h3 className="text-2xl font-normal tracking-tight">{selectedRaw.podcast}</h3>
                            </div>
                            <button onClick={() => setSelectedRaw(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-10 bg-[#1a1a1a]">
                            <ReactJson src={selectedRaw} theme="monokai" collapsed={2} displayDataTypes={false} name={false} style={{ backgroundColor: 'transparent', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.6' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}