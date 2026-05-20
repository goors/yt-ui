import { Shield, Layout, Zap, Flame, Users, Target, AlertCircle } from 'lucide-react';

export default function ForensicAuditUI({ auditData, msg }) {
    // Safety check for both data sources
    if (!auditData?.metrics || !msg?.data) return null;

    const { metrics, raw_counts } = auditData;
    const { pillars, verdict } = msg.data;

    // Mapping your refined logic keys to UI Config
    const getConfig = (key) => {
        switch(key) {
            case 'Is_it_Real_or_Fake':
                return {
                    label: 'Technical Integrity',
                    border: 'border-l-blue-600',
                    icon: <Shield size={14} className="text-blue-600" />,
                    alert: metrics[key].purity_score < 40 ? "CRITICAL_LOGIC_FAILURE" : null
                };
            case 'Can_they_explain_the_plan':
                return {
                    label: 'Stakeholder Bridge',
                    border: 'border-l-purple-600',
                    icon: <Layout size={14} className="text-purple-600" />
                };
            case 'How_fast_do_they_finish':
                return {
                    label: 'Execution Velocity',
                    border: 'border-l-amber-600',
                    icon: <Zap size={14} className="text-amber-600" />
                };
            default:
                return { label: 'Metric Node', border: 'border-l-slate-900', icon: null };
        }
    };

    return (
        <div className="space-y-10 bg-slate-50/30 px-4">



            {/* NARRATIVE ANALYSIS GRID (The Pillars) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                {pillars.map((p, idx) => (
                    <div key={idx} className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.pillar}</h5>
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                parseInt(p.result) < 3 ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                            }`}>
                                {p.result}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">
                            "{p.reasoning}"
                        </p>
                    </div>
                ))}
            </div>

            {/* THE EXECUTIVE VERDICT */}
            <div className="max-w-5xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                    <Target size={120} className="text-white" />
                </div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3 block">Final_Deployment_Verdict</span>
                <p className="text-slate-200 text-sm font-medium leading-relaxed relative z-10">
                    {verdict}
                </p>
            </div>

            {/* DETERMINISTIC TELEMETRY CARDS (From your Python Logic) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {['Logic_Consistency', 'Contextual_Clarity', 'Execution_Velocity'].map((key) => {
                    const data = metrics[key];
                    const config = getConfig(key);
                    return (
                        <div key={key} className={`bg-white border border-slate-200 border-l-4 ${config.border} p-6 shadow-sm`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        {config.icon} {key}
                                    </span>
                                    <h4 className="text-xs font-black uppercase text-slate-900">{config.label}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-mono font-bold text-slate-900">{data.overall_weight}%</span>
                                    <span className="block text-[7px] font-black uppercase text-slate-400">Weight</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-500 font-bold">PURITY:</span>
                                    <span className={data.purity_score < 50 ? 'text-red-600' : 'text-slate-900'}>{data.purity_score}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5">
                                    <div
                                        className={`h-full transition-all duration-1000 ${data.purity_score < 40 ? 'bg-red-600' : 'bg-slate-900'}`}
                                        style={{ width: `${data.purity_score}%` }}
                                    />
                                </div>
                                {config.alert && (
                                    <div className="flex items-center gap-1 text-[8px] font-bold text-red-600 animate-pulse">
                                        <AlertCircle size={10} /> {config.alert}
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono">
                                <span className="text-slate-400">TOTAL_RED_FLAGS:</span>
                                <span className="font-bold text-slate-900">{data.red_flags}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* VIBE CHECK & HIT FREQUENCY */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto">
                <div className="md:col-span-4 bg-white border border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Calibration // Vibe_Check</span>
                        <h4 className="text-lg font-black uppercase text-slate-900 mt-1 leading-tight">{metrics.The_Vibe_Check.label}</h4>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-5xl font-mono font-light text-slate-900">{metrics.The_Vibe_Check.score}</span>
                        <span className="text-[10px] font-bold text-slate-400">/10.0</span>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <div className="flex-1 bg-slate-50 p-2 border border-slate-100">
                            <span className="text-[8px] block text-slate-400 uppercase font-bold">Attacks</span>
                            <span className="text-sm font-bold text-red-600">{metrics.The_Vibe_Check.attacks}</span>
                        </div>
                        <div className="flex-1 bg-slate-50 p-2 border border-slate-100">
                            <span className="text-[8px] block text-slate-400 uppercase font-bold">Team_Moves</span>
                            <span className="text-sm font-bold text-blue-600">{metrics.The_Vibe_Check.team_moves}</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-8 bg-white border border-slate-200 p-6 overflow-hidden">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase mb-4 block">Axiom_Frequency_Distribution</span>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 h-[140px] overflow-y-auto custom-scrollbar">
                        {Object.entries(raw_counts).sort((a,b) => b[1]-a[1]).map(([label, count]) => (
                            <div key={label} className="flex justify-between border-b border-slate-50 py-1 items-center">
                                <span className="text-[10px] text-slate-600 truncate max-w-[120px]">{label}</span>
                                <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 rounded">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}