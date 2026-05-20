import { useState, useMemo, useEffect } from 'react';
import { Clock, ShieldCheck, Loader2, Info } from 'lucide-react';
import { useParams } from "@tanstack/react-router";
import { LABEL_COLORS, formatTime } from "@/constants/forensics";

const NOISE_LABELS = [
    "fallacy of logic", "appeal to emotion", "intentional manipulation",
    "faulty generalization", "equivocation", "personal opinion"
];

export default function ForensicAudit() {
    const { auditId } = useParams({ from: '/audit/$auditId' });
    const [podcast, setPodcast] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('GOLD');
    const [selectedIdx, setSelectedIdx] = useState(0);

    useEffect(() => {
        if (!auditId) return;
        const fetchAudit = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;
                const res = await fetch(`${baseUrl}/podcasts/${auditId}`);
                const data = await res.json();
                setPodcast(data);
            } catch (err) {
                console.error("Audit Fetch Failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, [auditId]);

    const getSignals = (topic: any) => {
        const data = topic.results?.[0]?.analysis_data || {};
        const metadata = ['created_at', 'approved', 'id', 'explanation'];

        return Object.entries(data)
            .filter(([k, v]) => !metadata.includes(k) && typeof v === 'number' && v > 0.01)
            .map(([label, pHat]) => ({ label, pHat: pHat as number }))
            .sort((a, b) => b.pHat - a.pHat);
    };

    // RESTORED: Label distribution stats for badges
    const stats = useMemo(() => {
        if (!podcast?.analyses?.topics) return [];
        const counts: Record<string, number> = {};
        podcast.analyses.topics.forEach((t: any) => {
            const signals = getSignals(t);
            signals.forEach(s => {
                counts[s.label] = (counts[s.label] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count);
    }, [podcast]);

    const processedTopics = useMemo(() => {
        if (!podcast?.analyses?.topics) return { GOLD: [], NOISE: [] };
        const gold: any[] = [];
        const noise: any[] = [];

        podcast.analyses.topics.forEach((topic: any) => {
            const signals = getSignals(topic);
            if (signals.length === 0) return;

            const topicData = {
                topicId: topic.topic_id,
                title: topic.title,
                text: topic.text,
                signals,
                explanation: topic.results?.[0]?.analysis_data?.explanation || "",
                occurrences: [...topic.occurrences].sort((a, b) => a.start - b.start),
                primaryStart: topic.occurrences[0]?.start || 0
            };

            const topLabel = signals[0].label;
            NOISE_LABELS.includes(topLabel) ? noise.push(topicData) : gold.push(topicData);
        });

        return {
            GOLD: gold.sort((a, b) => a.primaryStart - b.primaryStart),
            NOISE: noise.sort((a, b) => a.primaryStart - b.primaryStart)
        };
    }, [podcast]);

    const currentHits = processedTopics[activeTab as keyof typeof processedTopics] || [];
    const activeSegment = currentHits[selectedIdx] || null;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-200" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <article className="max-w-6xl mx-auto pt-32 pb-24 px-6">

                <header className="mb-24 border-b border-slate-100 pb-16">
                    <h1 className="text-sm uppercase tracking-[0.3em] font-bold text-slate-400 mb-12">Forensic Transcript Audit</h1>
                    <div className="max-w-4xl">
                        <h2 className="text-5xl font-light leading-tight mb-8">
                            {podcast?.title}
                        </h2>

                        {/* RESTORED: Distribution Badges */}
                        <div className="flex flex-wrap gap-2 mb-10">
                            {stats.map((s) => (
                                <div key={s.label} className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-sm">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LABEL_COLORS[s.label] }} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{s.label}</span>
                                    <span className="text-[10px] font-mono text-slate-400 border-l pl-2">{s.count}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-xl text-slate-500 font-light italic leading-relaxed">
                            {podcast?.description}
                        </p>
                    </div>
                </header>

                <nav className="flex items-center gap-12 mb-16 border-b border-slate-100">
                    <button
                        onClick={() => { setActiveTab('GOLD'); setSelectedIdx(0); }}
                        className={`pb-6 text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'GOLD' ? 'text-black border-b-2 border-black' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                        Filtered Gold
                    </button>
                    <button
                        onClick={() => { setActiveTab('NOISE'); setSelectedIdx(0); }}
                        className={`pb-6 text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'NOISE' ? 'text-black border-b-2 border-black' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                        Extracted Noise
                    </button>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
                    <section className="space-y-24">
                        {currentHits.map((topic, i) => (
                            <div
                                key={topic.topicId}
                                onClick={() => setSelectedIdx(i)}
                                className={`group cursor-pointer transition-opacity ${selectedIdx === i ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                            >
                                <div className="flex items-center gap-4 mb-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{formatTime(topic.primaryStart)}</span>
                                    {topic.occurrences.length > 1 && <span className="bg-slate-50 px-2 py-0.5 rounded">+{topic.occurrences.length - 1} more</span>}
                                </div>

                                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-900 mb-6">
                                    {topic.title}
                                </h3>

                                <blockquote className="text-2xl font-light leading-relaxed text-slate-800 mb-8 border-l-2 border-black pl-8">
                                    "{topic.text}"
                                </blockquote>

                                <div className="flex flex-wrap gap-6">
                                    {topic.signals.map((s: any) => (
                                        <div key={s.label} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LABEL_COLORS[s.label] }} />
                                            <span className="text-[10px] uppercase font-bold tracking-tighter text-slate-500">{s.label}</span>
                                            <span className="text-[10px] font-mono text-slate-300">
                                                {`$\\hat{p} = ${s.pHat.toFixed(4)}$`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>

                    <aside className="sticky top-12 h-fit space-y-12">
                        {activeSegment && (
                            <div className="bg-slate-50 p-8 border border-slate-100">
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
                                    <Info size={14} className="text-slate-900" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Logic Breakdown</span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600 font-light mb-8">
                                    {activeSegment.explanation}
                                </p>
                                <div className="space-y-4">
                                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 block mb-2">Timestamps</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {activeSegment.occurrences.map((occ: any, idx: number) => (
                                            <span key={idx} className="text-[10px] font-mono bg-white border border-slate-200 py-1 text-center rounded-sm">
                                                {formatTime(occ.start)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-8 py-4 border-l border-slate-100">
                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4">Manifesto</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                "The cost of winning an audience is zero, if you can filter the noise for the gold."
                            </p>
                        </div>
                    </aside>
                </div>
            </article>
        </div>
    );
}