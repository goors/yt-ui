import { Fingerprint, ShieldCheck, Scale, Code, MessageSquare, Activity, MessageSquareQuote } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
            <article className="max-w-5xl mx-auto pt-40 pb-24 px-6">
                <header className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-[10px] px-3 py-1 uppercase bg-slate-50 font-normal tracking-widest text-slate-600">
                            Axiom // Manifesto
                        </span>
                        <span className="text-slate-400 text-[11px] uppercase tracking-widest font-normal">
                            Updated April 14, 2026
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-normal tracking-tight leading-[1.1] mb-10 text-slate-900">
                        The Appeal for Standardized Moderation.
                    </h1>

                    <div className="max-w-2xl">
                        <p className="text-xl leading-relaxed text-slate-700 font-light mb-6">
                            Moderation isn't the enemy of free speech—chaos is. For a conversation to be productive, it requires a foundation of logic. Without rules, discourse isn't "free"; it's just broken.
                        </p>

                        <div className="inline-flex items-center gap-4 px-4 py-2 border border-red-100 bg-red-50/50 rounded-sm">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">Self_Audit_Log</span>
                                <span className="text-xs font-mono font-bold text-red-700 italic">"False Dilemma // p̂ 60"</span>
                            </div>
                            <div className="w-[1px] h-6 bg-red-200" />
                            <p className="text-[10px] text-red-800 leading-tight max-w-[300px]">
                                The system flags this opening as a <strong>False Dilemma</strong>. It presents a binary choice between "Moderation" and "Chaos," ignoring the nuance of unmoderated healthy systems.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="mb-24">
                    <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-4">
                        <Activity size={22} className="text-slate-900" />
                        <h2 className="text-[12px] uppercase tracking-[0.2em] font-normal">System Philosophy</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3 text-red-600">
                                    <Scale size={20} />
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest">The Rule of Law</h2>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-400">
                                    <MessageSquareQuote size={12} />
                                    <span className="text-[8px] font-bold uppercase tracking-tighter">Opinion_Entry</span>
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed font-light text-lg mb-8">
                                I believe moderation is a <strong>fundamental good</strong>—provided it follows transparent, auditable rules. In engineering, we use linters to catch syntax errors. In human discourse, we need logic to catch rhetorical fallacies that derail the collective signal.
                            </p>

                            <div className="flex items-center gap-6 p-4 border-l-2 border-amber-500 bg-amber-50/30">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">Logic p̂</span>
                                    <span className="text-lg font-mono font-bold text-amber-700">60</span>
                                </div>
                                <div className="h-8 w-[1px] bg-amber-200" />
                                <p className="text-[11px] text-amber-800 leading-tight">
                                    <strong>Audit Status: Opinionated.</strong> The model detects <strong>Circular Reasoning (p̂ 60)</strong>
                                    and <strong>Intentionality (p̂ 60)</strong>. While the engineering analogy is <strong>Valid (p̂ 62)</strong>,
                                    the premise that moderation is a "fundamental good" is identified as a baseline axiom rather than a
                                    provable fact.
                                </p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3 text-red-600">
                                    <ShieldCheck size={20} />
                                    <h2 className="text-[11px] font-bold uppercase tracking-widest">Protocol over Preference</h2>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-400">
                                    <Activity size={12} />
                                    <span className="text-[8px] font-bold uppercase tracking-tighter">Signal_Confirmed</span>
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed font-light text-lg mb-8">
                                Human moderators are currently jammed by an impossible volume of data. Modern moderation is reduced to
                                binary pattern matching—flagging "hate speech" or "insults" while the actual structural integrity of
                                the discourse is ignored. <strong>AXIOM</strong> solves this bandwidth crisis. By using the DeBERTa-v3
                                architecture, we move beyond simple sentiment filters to identify the specific rhetorical "tricks"
                                that high-speed moderation is physically unable to detect.
                            </p>

                            <div className="flex items-center gap-6 p-4 border-l-2 border-green-500 bg-green-50/30">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Tech Reason p̂</span>
                                    <span className="text-lg font-mono font-bold text-green-700">72</span>
                                </div>
                                <div className="h-8 w-[1px] bg-green-200" />
                                <p className="text-[11px] text-green-800 leading-tight">
                                    <strong>Audit Status: Valid.</strong> The model identifies this claim as a structural description
                                    of a systemic failure, rather than a rhetorical attempt to bypass critical reasoning.
                                </p>
                            </div>
                        </section>
                    </div>
                </section>

                <section className="pt-16 border-t border-slate-100">
                    <div className="w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Code size={18} className="text-slate-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">The Builder's Intent</h2>
                        </div>

                        <div className="space-y-10">
                            <p className="text-2xl text-slate-900 leading-tight font-light italic">
                                "I see conversation as data. When that data is corrupted (anything designed to bypass a listener's critical processing), the listener becomes a node processing malicious code."
                            </p>

                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System_Self_Audit: Flagged</span>
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                    When we ran our core manifesto through the AXIOM linter, it didn’t give us a free pass. It flagged the statement above as a <strong>p̂ 71 match for Circular Reasoning</strong> and <strong>p̂ 69 for Equivocation</strong>.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 uppercase">Circular p̂</span>
                                        <span className="text-xs font-mono font-bold">71</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 uppercase">Equivocation p̂</span>
                                        <span className="text-xs font-mono font-bold">69</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 uppercase">Valid Tech p̂</span>
                                        <span className="text-xs font-mono font-bold text-blue-600">63</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 uppercase">Objective p̂</span>
                                        <span className="text-xs font-mono font-bold">45</span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-500 italic leading-relaxed border-t border-slate-200 pt-4">
                                    Why show this? Because a standard for logic must be indifferent to its author. If the linter won't let the builder get away with a rhetorical shortcut, it won't let anyone else either. The model recognizes the <strong>Valid Technical Reasoning (p̂ 63)</strong>, but correctly identifies that we are using a metaphorical hack to explain it.
                                </p>
                            </div>

                            <p className="text-lg text-slate-500 leading-relaxed font-light">
                                I didn't build this to silence people; I built it in the hope that we can finally see the mechanics of how we are being silenced by noise. By identifying these structural failures, we reveal why a conversation actually failed: not because of a lack of consensus, but because the <strong>signal-to-noise ratio</strong> dropped so low that meaningful exchange became mathematically impossible.
                            </p>
                            <div className="flex items-center gap-6 p-4 border-l-2 border-slate-900 bg-slate-50">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-900 font-bold uppercase tracking-widest">Intentionality p̂</span>
                                    <span className="text-lg font-mono font-bold text-slate-900">95</span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-200" />
                                <p className="text-[11px] text-slate-600 leading-tight">
                                    <strong>Audit Status: High Intent.</strong> The model identifies a maximum-probability
                                    <strong> Intentional (p̂ 95)</strong> drive. It also detects <strong>Ad Populum (p̂ 71)</strong>,
                                    noting that the "hope for clarity" is itself a rhetorical appeal to common values.
                                    Despite this, <strong>Valid Technical Reasoning (p̂ 68)</strong> remains the structural floor.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="mt-32 pt-16 border-t border-slate-100 text-center">
                    <MessageSquare size={24} className="mx-auto mb-6 text-slate-200" />

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">
                            Moderation is the linter for the human mind.
                        </p>

                        <div className="flex items-center gap-3 px-3 py-1.5 border border-slate-100 bg-white rounded-full">
                            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">Final_Audit:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-slate-800 uppercase">Equivocation</span>
                                <span className="text-[9px] font-mono text-slate-500">p̂ 62</span>
                            </div>
                            <div className="w-[1px] h-3 bg-slate-200" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-slate-800 uppercase">Objective_Fact</span>
                                <span className="text-[9px] font-mono text-slate-500">p̂ 60</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    );
}