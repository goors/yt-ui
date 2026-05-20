import React, { useState, useEffect, useRef } from 'react';
import {Link, useNavigate} from '@tanstack/react-router';
import {
    Terminal, Activity, ChevronRight, Fingerprint,
    ShieldAlert, Download, Eye, AlertTriangle, Calendar, X, MessageSquare, Image as ImageIcon, ArrowRight
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {LABEL_MAP} from "@/constants/forensics.ts";


export default function Home() {
    const navigate = useNavigate();
    const [isMaximized, setIsMaximized] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMaximized(false); };
        if (isMaximized) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isMaximized]);

    const handleDownload = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        console.log(`Downloading forensic transcript: ${id}`);
    };

    const [audits, setAudits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const featuredAudit = audits[0];

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                // Use your FastAPI backend URL (usually port 8001)
                const baseUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${baseUrl}/registry`);
                const data = await response.json();
                setAudits(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch AXIOM registry:", err);
                setIsLoading(false);
            }
        };
        fetchRegistry();
    }, []);

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col overflow-x-hidden">


            <main className="flex flex-col w-full min-h-screen">


                <section className="w-full border-b border-slate-100 bg-slate-50/50">
                    <div className="max-w-6xl mx-auto px-6 py-4">
                        {/* COMPACT LEGEND: Tells the user what the numbers mean globally */}


                        <TooltipProvider delayDuration={100}>
                            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-2 md:pb-0 snap-x snap-mandatory no-scrollbar">
                                {audits.slice(0, 3).map((audit) => {
                                    const total = audit.positive_count + audit.negative_count || 1;
                                    const posPercent = (audit.positive_count / total) * 100;

                                    return (
                                        <div key={audit.id} className="min-w-[280px] md:min-w-0 snap-start shrink-0 border-r border-slate-200/50 last:border-0 md:border-0 pr-4">

                                            {/* TOP BADGES LAYER - TOOLTIPS REMOVED */}
                                            <div className="flex gap-2 mb-2 h-4"> {/* Fixed height prevents layout jump */}
                                                {audit.top_positive_label && (
                                                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-[2px] text-[7px] font-bold uppercase tracking-wider">
                                {LABEL_MAP[audit.top_positive_label]}
                            </span>
                                                )}

                                                {audit.top_negative_label && (
                                                    <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-[2px] text-[7px] font-bold uppercase tracking-wider">
                                {LABEL_MAP[audit.top_negative_label]}
                            </span>
                                                )}
                                            </div>

                                            {/* MAIN CARD CONTENT */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        onClick={() => navigate({ to: '/audit/$auditId', params: { auditId: audit.id } })}
                                                        className="flex items-center gap-4 group cursor-pointer"
                                                    >
                                                        <div className="w-10 h-10 bg-white border border-slate-200 shrink-0 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shadow-sm overflow-hidden rounded-sm">
                                                            {audit.thumbnail ? (
                                                                <img src={audit.thumbnail} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <ImageIcon size={12} className="text-slate-300 group-hover:text-red-400" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-grow">
                                                            <div className="text-[12px] font-bold truncate group-hover:text-red-600 transition-colors uppercase tracking-tight leading-none">
                                                                {audit.title}
                                                            </div>

                                                            <div className="flex items-center justify-between mt-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex flex-col">
                                                <span className="text-[10px] text-green-600 font-bold leading-none">
                                                    +{audit.positive_count}
                                                </span>
                                                                        <span className="text-[5px] uppercase text-slate-400 font-bold tracking-tighter">Logic</span>
                                                                    </div>
                                                                    <div className="flex flex-col border-l border-slate-200 pl-2">
                                                <span className="text-[10px] text-red-500 font-bold leading-none">
                                                    -{audit.negative_count}
                                                </span>
                                                                        <span className="text-[5px] uppercase text-slate-400 font-bold tracking-tighter">Hits</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className="text-[6px] text-slate-400 uppercase tracking-widest leading-none">Ratio</span>
                                                                    <div className="w-12 h-[3px] bg-slate-200 rounded-full overflow-hidden flex">
                                                                        <div className="h-full bg-green-500" style={{ width: `${posPercent}%` }} />
                                                                        <div className="h-full bg-red-500" style={{ width: `${100 - posPercent}%` }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="max-w-[280px] bg-black text-white border-slate-800 p-3 rounded-sm shadow-2xl">
                                                    <p className="text-[11px] leading-relaxed text-slate-200  ">
                                                        {audit.description || "Analysis finalized. No meta-description generated."}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                            </div>
                        </TooltipProvider>
                    </div>
                </section>

                {/* VIEWPORT WRAPPER */}
                <div className="flex flex-col flex-grow min-h-[calc(100vh-155px)]">

                    <div className="w-full bg-gray-200">
                    <header className="max-w-6xl mx-auto px-6 py-24 flex-grow flex flex-col justify-center w-full">
                        <div className="flex items-center gap-4 mb-8">
                            <Fingerprint size={20} className="text-slate-900" />
                            <span className="text-[10px] tracking-[0.4em] text-slate-400 font-bold uppercase">// Recursive Self-Diagnostic</span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-16 items-start">
                            {/* LEFT: The Audited Headline */}
                            <div className="flex-grow pt-20">
                                <h1 className="text-8xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-8 max-w-5xl uppercase">
                                    What is the <br/>
                                    Cost of <br/>
                                    <span className="text-red-600 underline decoration-[12px] md:decoration-[20px] underline-offset-[14px]">Winning</span> the Audience?
                                </h1>

                                {/* The Subtitle: High-Vis Block Style */}
                                <div className="inline-block bg-black text-white px-6 py-3 mb-12">
                                    <p className="text-xl md:text-3xl font-black uppercase tracking-tight">
                                        Zero, if you can filter the noise for the gold.
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-12 items-start">
                                    <p className="text-1xl font-light text-slate-500 max-w-2xl leading-relaxed border-l-4 border-red-600 pl-8">
                                        We ran our own headline through the Logic registry engine. It <span className="font-bold text-black underline">FAILED</span>.
                                        The model caught us using the word "Cost" as a trick to get your attention
                                        instead of using it as a real number—proving that our logic audit doesn't
                                        care who wrote the text.
                                    </p>
                                </div>

                                <Link
                                    to="/about"
                                    className="mt-16 group flex items-center gap-4 text-sm font-black uppercase tracking-[0.4em] text-black hover:text-red-600 transition-all"
                                >
        <span className="border-b-4 border-black group-hover:border-red-600 pb-1">
            Read the Manifesto
        </span>
                                    <div className="flex items-center justify-center w-10 h-10 border-4 border-black group-hover:border-red-600 transition-colors">
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </div>


                            {/* RIGHT: The Forensic Output Sidebar */}
                            <div className="w-full lg:w-80 shrink-0 bg-slate-50 border border-slate-200 p-6 rounded-sm shadow-sm relative overflow-hidden">
                                {/* Scanned Line Effect */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/20 animate-scan z-0" />

                                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Activity size={14} className="text-red-500" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Internal Audit</span>
                                    </div>
                                    <div className="px-1.5 py-0.5 bg-red-600 text-[8px] text-white font-bold uppercase tracking-tighter rounded-sm">Failed</div>
                                </div>


                                <div className="space-y-8 relative z-10">
                                    {/* DEFINITIONS WRAPPED IN TEMPLATE LITERALS TO ESCAPE PARSER ERRORS */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm mb-8">
                                        <div className="flex flex-col gap-3 text-[11px] leading-tight text-blue-900">
                                            <div className="flex gap-4">
                                                <span className="font-bold shrink-0">{`$\\hat{p}$`}</span>
                                                <span>{`= The Robot's calculated guess`}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {[
                                        { id: "equivocation", score: 0.9201 },
                                        { id: "false_causality", score: 0.7470 },
                                        { id: "objective_statement_of_fact", score: 0.7013 },
                                        { id: "faulty_generalization", score: 0.6860 },
                                    ].map((item) => {
                                        const isPositive = [
                                            "empathetic_truth",
                                            "valid_technical_reasoning",
                                            "objective_statement_of_fact",
                                            "established_empirical_consensus",
                                            "contextual_generalization"
                                        ].includes(item.id);

                                        return (
                                            <div key={item.id} className="group/item relative space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col min-w-0">
                        <span className={`text-[13px] font-black tracking-tight uppercase leading-none ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {LABEL_MAP[item.id] || item.id.replace(/_/g, ' ')}
                        </span>
                                                        <span className="text-[9px] text-slate-400 uppercase tracking-tighter mt-1 font-mono">
                            LOGIC_ID: {item.id.toUpperCase()}
                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-end shrink-0">
                        <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">
                            {`$\\hat{p}$ Estimator`}
                        </span>
                                                        <span className={`text-xl font-bold tabular-nums ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {item.score.toFixed(4)}
                        </span>
                                                    </div>
                                                </div>

                                                {/* THE GAUGE BAR: FIXED DESIGN */}
                                                <div className="h-4 w-full bg-slate-50 border border-black overflow-hidden relative">
                                                    {/* Background track (now slight gray for contrast) */}
                                                    <div className="absolute inset-0 bg-slate-100" />

                                                    {/* The Fill Bar */}
                                                    <div
                                                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out z-10 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                                                        style={{ width: `${item.score * 100}%` }}
                                                    />

                                                    {/* THRESHOLD LINE AT 0.5 (The "Tipping Point") */}
                                                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black z-20" />

                                                    {/* OPTIONAL: SCANNING ANIMATION OVERLAY */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] z-30" />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* PARSE-SAFE FOOTER */}
                                    <div className="mt-8 pt-4 border-t border-slate-100">
                                        <p className="text-[10px] text-slate-500 italic leading-snug">
                                            {`Note: We calculate $\\hat{p}$ because the absolute truth ($p$) is a latent variable in linguistic analysis.`}
                                        </p>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </header>
                    </div>

                    {/* LATEST ENTRY: Anchored to bottom of viewport */}

                    {featuredAudit && (
                        <div className="w-full mt-5">
                            <section className="w-full bg-slate-50/30 border-b border-slate-100">

                                {/* NEW: TOP DIAGNOSTIC BADGES */}
                                <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-wrap gap-2">
                                    {featuredAudit.top_positive_label && (
                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-[2px] text-[8px] font-bold uppercase tracking-wider">
                        Primary Logic: {LABEL_MAP[featuredAudit.top_positive_label]}
                    </span>
                                    )}
                                    {featuredAudit.top_negative_label && (
                                        <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-[2px] text-[8px] font-bold uppercase tracking-wider">
                        Primary Risk: {LABEL_MAP[featuredAudit.top_negative_label]}
                    </span>
                                    )}
                                    {/* Visual Separator if badges exist */}
                                    {(featuredAudit.top_positive_label || featuredAudit.top_negative_label) && (
                                        <div className="w-px h-3 bg-slate-200 mx-2 self-center" />
                                    )}
                                    <div className="flex gap-4 text-[8px] uppercase tracking-[0.2em] text-slate-400 self-center">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            <span>Empirical</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                            <span>Fallacy</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center justify-between cursor-pointer group"
                                     onClick={() => navigate({ to: '/audit/$auditId', params: { auditId: featuredAudit.id } })}>

                                    <div className="flex items-center gap-10 overflow-hidden">
                                        <div className="flex flex-col min-w-0">
                                            <h2 className="text-2xl font-black tracking-tighter group-hover:text-red-600 transition-colors truncate uppercase">
                                                {featuredAudit.title}
                                            </h2>
                                            <p className="text-[13px] text-slate-500 mt-2   max-w-2xl leading-relaxed">
                                                {featuredAudit.description || "Analytical node registered. Awaiting manual review."}
                                            </p>
                                            <div className="flex items-center gap-4 mt-4">
                            <span className="text-[9px] text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2 font-bold">
                                <Calendar size={10} /> {new Date(featuredAudit.updated_at).toLocaleDateString()}
                            </span>
                                                <span className="text-[9px] text-slate-300 tracking-widest uppercase ">
                                Node_ID: {featuredAudit.id.slice(0, 8)}...
                            </span>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex items-center gap-12 border-l border-slate-200 pl-10 shrink-0">
                                            {/* SIGNAL HEALTH */}
                                            <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold mb-1">
                                Forensic Ratio
                            </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-[16px] font-black text-green-600">+{featuredAudit.positive_count}</span>
                                                    <span className="text-[10px] text-slate-300 ">/</span>
                                                    <span className="text-[16px] font-black text-red-600">-{featuredAudit.negative_count}</span>
                                                </div>
                                                <div className="w-28 h-1.5 bg-slate-100 mt-2 rounded-full overflow-hidden flex border border-slate-200/50">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${(featuredAudit.positive_count / (featuredAudit.positive_count + featuredAudit.negative_count || 1)) * 100}%` }}
                                                    />
                                                    <div
                                                        className="h-full bg-red-500"
                                                        style={{ width: `${(featuredAudit.negative_count / (featuredAudit.positive_count + featuredAudit.negative_count || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* AUDIT HITS */}
                                            <div className="flex flex-col">
                            <span className="text-[9px] text-red-500 uppercase tracking-tighter font-bold mb-1">
                                Critical Hits
                            </span>
                                                <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-red-600 tabular-nums leading-none">
                                    {featuredAudit.negative_count}
                                </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-[7px] text-slate-400 font-bold uppercase leading-none">Total</span>
                                                        <span className="text-[7px] text-slate-400 font-bold uppercase">Failures</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <footer className="max-w-6xl mx-auto px-6 py-12 w-full flex justify-between items-center text-[9px] tracking-[0.2em] text-slate-400">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={14} />
                        <span>System Status: Monitoring</span>
                    </div>
                    <span>Logic Node // SRB // 2026</span>
                </footer>
            </main>


        </div>
    );
}