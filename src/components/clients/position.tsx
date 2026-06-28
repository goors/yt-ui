import { Badge } from "@/components/ui/badge";
import { Edit3 } from "lucide-react";
import React from "react";

interface PositionComponentProps {
    p: any;
    jobs: any;
    editPosition: any;
    setPotentialCandidates: any;
    setShowCandidates: any;
}

export default function PositionComponent({ p, jobs, editPosition, setPotentialCandidates, setShowCandidates }: PositionComponentProps) {
    const jobInfo = jobs[p.id];

    return (
        <tr key={p.id} className="hover:bg-zinc-50/40 transition-colors group">
            {/* Position Name & Purpose */}
            <td className="py-4 px-6 align-top max-w-[280px]">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-650 transition-colors">{p.name}</span>
                    {p.purpose && (
                        <span className="text-xs text-zinc-500 leading-snug line-clamp-2" title={p.purpose}>
                            {p.purpose}
                        </span>
                    )}
                </div>
            </td>

            {/* Target Countries */}
            <td className="py-4 px-6 align-top">
                <div className="flex flex-wrap gap-1">
                    {p.countries?.map((country: any) => (
                        <Badge key={country.id} className="text-[9px] uppercase bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-0.5 font-semibold">
                            {country.name}
                        </Badge>
                    ))}
                </div>
            </td>

            {/* Dynamic Job Status */}
            <td className="py-4 px-6 align-top">
                {jobInfo ? (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        jobInfo.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    }`}>
                        {jobInfo.status !== 'completed' ? (
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                            </span>
                        ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        <span>{jobInfo.phase || jobInfo.status}</span>
                    </div>
                ) : (
                    <span className="text-xs text-zinc-400 font-mono">-</span>
                )}
            </td>

            {/* Signals & Risk Indicators */}
            <td className="py-4 px-6 align-top">
                <div className="flex flex-col gap-1.5">
                    {p.positiveSignals && p.positiveSignals.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                +{p.positiveSignals.length} Pos:
                            </span>
                            {p.positiveSignals.slice(0, 2).map((sig: string, s: number) => (
                                <span key={s} className="text-[10px] bg-emerald-50/50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded truncate max-w-[110px]" title={sig}>
                                    {sig}
                                </span>
                            ))}
                            {p.positiveSignals.length > 2 && (
                                <span className="text-[10px] text-zinc-400 font-medium" title={p.positiveSignals.slice(2).join(", ")}>
                                    +{p.positiveSignals.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                    {p.riskIndicators && p.riskIndicators.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                -{p.riskIndicators.length} Risk:
                            </span>
                            {p.riskIndicators.slice(0, 2).map((risk: string, r: number) => (
                                <span key={r} className="text-[10px] bg-rose-50/50 text-rose-800 border border-rose-100 px-1.5 py-0.5 rounded truncate max-w-[110px]" title={risk}>
                                    {risk}
                                </span>
                            ))}
                            {p.riskIndicators.length > 2 && (
                                <span className="text-[10px] text-zinc-400 font-medium" title={p.riskIndicators.slice(2).join(", ")}>
                                    +{p.riskIndicators.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                    {(!p.positiveSignals || p.positiveSignals.length === 0) && (!p.riskIndicators || p.riskIndicators.length === 0) && (
                        <span className="text-xs text-zinc-400 font-mono">-</span>
                    )}
                </div>
            </td>

            {/* Candidate Pipelines & Actions */}
            <td className="py-4 px-6 align-top text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => setPotentialCandidates(p.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg hover:border-zinc-900 hover:bg-white hover:text-zinc-900 transition-all shadow-2xs cursor-pointer"
                    >
                        <span>Potential</span>
                        <span className="bg-zinc-900 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {p.potentialCandidates?.length ?? 0}
                        </span>
                    </button>

                    <button
                        onClick={() => setShowCandidates({
                            selectedCandidates: p.selectedCandidates,
                            positionId: p.id
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 border border-indigo-200/60 text-indigo-900 text-xs font-semibold rounded-lg hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs cursor-pointer group"
                    >
                        <span>Selected</span>
                        <span className="bg-indigo-600 group-hover:bg-white group-hover:text-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors">
                            {p.selectedCandidates ? p.selectedCandidates.length : 0}
                        </span>
                    </button>

                    <button
                        onClick={() => editPosition(p)}
                        className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                        title="Edit Position"
                    >
                        <Edit3 size={15} />
                    </button>
                </div>
            </td>
        </tr>
    );
}