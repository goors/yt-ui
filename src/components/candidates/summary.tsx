import React, { useState } from "react";
import {
    X,
    Award,
    Brain,
    FolderGit2,
    ShieldCheck,
    Target,
    Activity,
    Users,
    Heart,
    Briefcase,
    Sparkles,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    ThumbsUp
} from "lucide-react";

// --- TYPES & INTERFACES ---
interface ProjectProps {
    name: string;
    description: string;
    problem_type?: string;
    used_solution?: string;
}

// --- SUB-COMPONENT: REUSABLE HIGH-CONTRAST PROJECT CARD ---
function ProjectCard({ name, description, problem_type, used_solution }: ProjectProps) {
    return (
        <div className="w-full bg-white p-5 hover:bg-zinc-50/40 transition-all duration-300 border-b border-zinc-100 last:border-b-0">
            <h5 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {name}
            </h5>
            <p className="text-xs text-zinc-500 leading-relaxed mt-2 pl-3.5">
                {description}
            </p>

            {(problem_type || used_solution) && (
                <div className="flex flex-wrap gap-3 mt-4 pl-3.5 pt-3 border-t border-zinc-100 text-[10px] font-mono">
                    {problem_type && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400 font-semibold uppercase tracking-wider">Problem:</span>
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                {problem_type}
              </span>
                        </div>
                    )}
                    {used_solution && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400 font-semibold uppercase tracking-wider">Solution:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                {used_solution}
              </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// --- TOPICS CONFIGURATION & ICONS LOOKUP ---
const STANDARD_TOPICS = [
    { key: "Project_DeepDive", label: "Project Deep-Dive" },
    { key: "Professional_Values_and_Ethics", label: "Values & Ethics" },
    { key: "Conflict_Resolution_Experience", label: "Conflict Resolution" },
    { key: "Current_Status", label: "Current Status" },
    { key: "Career_Growth", label: "Career Growth" },
    { key: "Role_Expectations", label: "Role Expectations" },
    { key: "Team_Dynamics", label: "Team Dynamics" },
    { key: "Personal_Info_and_Interests", label: "Personal Info & Interests" }
];

const TOPIC_ICONS: Record<string, React.ComponentType<{ className?: string, size?: number }>> = {
    Project_DeepDive: FolderGit2,
    Professional_Values_and_Ethics: ShieldCheck,
    Conflict_Resolution_Experience: AlertTriangle,
    Current_Status: Activity,
    Career_Growth: Target,
    Role_Expectations: Briefcase,
    Team_Dynamics: Users,
    Personal_Info_and_Interests: Heart,
};

interface SummaryProps {
    analyses: any;
    final_profile: any;
    gemini: any;
    candidateName: string;
    dossierOpen: boolean;
    closeDossier: () => void;
}

export const Summary = ({
                            analyses,
                            final_profile,
                            gemini,
                            candidateName,
                            dossierOpen,
                            closeDossier
                        }: SummaryProps) => {

    const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
    const [selectedFlags, setSelectedFlags] = useState<{ title: string; type: "green" | "red"; flags: any[] } | null>(null);
    const [dossierTab, setDossierTab] = useState<"ai_analysis" | "assessment_topics">("ai_analysis");

    if (!dossierOpen) return null;

    return (
        <div className="h-screen flex flex-col font-sans antialiased overflow-hidden bg-zinc-50 text-zinc-900">
            <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 backdrop-blur-sm transition-all">
                {/* Backdrop Click */}
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => closeDossier()}
                />

                {/* Drawer Content Panel */}
                <div className="flex h-full w-full max-w-4xl flex-col border-l border-zinc-200 shadow-2xl relative z-10 overflow-hidden bg-zinc-50">

                    {/* Drawer Header */}
                    <div className="flex items-center justify-between border-b px-8 py-5 bg-white border-zinc-200 flex-shrink-0">
                        <div>
              <span className="text-[10px] font-bold uppercase tracking-widest block font-mono text-indigo-600 mb-0.5">
                Assessment Examination Folders
              </span>
                            <h3 className="text-lg font-bold tracking-tight text-zinc-900">
                                Candidate Report Card // {candidateName}
                            </h3>
                        </div>
                        <button
                            onClick={() => closeDossier()}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 transition-all shadow-sm cursor-pointer bg-white text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                            type="button"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    </div>

                    {/* Drawer Tabs */}
                    <div className="flex px-8 border-b border-zinc-200 bg-white flex-shrink-0">
                        <button
                            onClick={() => setDossierTab("ai_analysis")}
                            className={`py-4 px-4 text-xs font-bold tracking-tight border-b-2 transition-all relative ${
                                dossierTab === "ai_analysis"
                                    ? "border-indigo-600 text-indigo-650"
                                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                            }`}
                            type="button"
                        >
                            AI Analysis & Recommendations
                        </button>
                        <button
                            onClick={() => setDossierTab("assessment_topics")}
                            className={`py-4 px-4 text-xs font-bold tracking-tight border-b-2 transition-all relative ${
                                dossierTab === "assessment_topics"
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                            }`}
                            type="button"
                        >
                            Interview Assessment Topics
                        </button>
                    </div>

                    {/* Dossier Report Viewport */}
                    <div className="flex-1 overflow-y-auto p-0">
                        {dossierTab === "ai_analysis" ? (
                            /* TAB 1: AI Analysis & Recommendations */
                            gemini ? (() => {
                                const msgData = gemini.data || {};
                                const pillars = msgData.pillars || [];
                                const verdict = msgData.verdict || "";
                                const recommendation = msgData.recommendation || {};
                                const evaluatedFor = gemini.evaluated_for || "AI Automation Engineer";
                                const updatedAt = gemini.updated_at ? new Date(gemini.updated_at).toLocaleString() : "";

                                return (
                                    <div className="p-8 space-y-6">
                                        {/* Meta Information Header Card */}
                                        <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                                                    <Brain size={16} />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">Assessed Role</span>
                                                    <span className="text-sm font-semibold text-zinc-800">
                            {evaluatedFor}
                          </span>
                                                </div>
                                            </div>
                                            {updatedAt && (
                                                <div className="sm:text-right pl-11 sm:pl-0">
                                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">Evaluation Date</span>
                                                    <span className="text-xs text-zinc-500 font-medium">{updatedAt}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* The Executive Verdict */}
                                        {verdict && (
                                            <div className="p-6 bg-gradient-to-br from-indigo-50/20 via-white to-white border border-zinc-200/60 rounded-2xl shadow-sm relative overflow-hidden space-y-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles size={12} className="text-indigo-600" />
                                                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Executive Verdict Summary</span>
                                                </div>
                                                <p className="text-zinc-700 text-xs leading-relaxed font-normal">
                                                    {verdict}
                                                </p>
                                            </div>
                                        )}

                                        {/* AI Strategy & Recommendation */}
                                        {Object.keys(recommendation).length > 0 && (
                                            <div className="p-6 border border-zinc-200/60 rounded-2xl bg-white shadow-sm space-y-4">
                                                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">AI Action Directive</span>
                                                    <span
                                                        onClick={() => setSelectedRecommendation(recommendation)}
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wide border shadow-sm cursor-pointer transition-colors ${
                                                            recommendation.action === "TECHNICAL_TEST"
                                                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                : recommendation.action === "PRACTICAL_TASK"
                                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                                                        }`}
                                                    >
                            {recommendation.action?.replace("_", " ")}
                          </span>
                                                </div>
                                                <div className="space-y-4 text-xs leading-relaxed">
                                                    <p className="font-normal text-zinc-700">{recommendation.reasoning}</p>
                                                    {recommendation.focus_area && (
                                                        <div className="pt-3 flex flex-col gap-1.5 border-t border-zinc-100">
                                                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">FOCUS AREA DIRECTIVE:</span>
                                                            <span className="text-[11px] bg-zinc-950 border border-zinc-900 p-4 rounded-xl font-mono text-zinc-200 leading-relaxed shadow-inner">
                                {recommendation.focus_area}
                              </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Narrative Analysis Pillars */}
                                        {pillars.length > 0 && (
                                            <div className="space-y-4">
                                                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Narrative Analysis Pillars</span>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {pillars.map((p: any, idx: number) => (
                                                        <div key={idx} className="p-5 bg-white border border-zinc-200/60 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all duration-300">
                                                            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                                                <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">{p.pillar}</h5>
                                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-zinc-900 text-zinc-100 rounded-md">
                                  {p.result}
                                </span>
                                                            </div>
                                                            <p className="text-xs text-zinc-500 leading-relaxed font-normal flex-1">
                                                                {p.reasoning}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })() : (
                                <div className="p-8 text-center text-xs text-zinc-400 italic">
                                    No AI Analysis & Recommendations payload registered for this candidate.
                                </div>
                            )
                        ) : (
                            /* TAB 2: Interview Assessment Topics */
                            <div className="p-8 space-y-6">
                                {STANDARD_TOPICS.map((std) => {
                                    const topicObj = analyses.topics?.find((t: any) => t.category === std.key);
                                    if (!topicObj || !topicObj.summary) return null;

                                    const epistemicData = topicObj.explanation === "DATA_FOUND" ?
                                        final_profile?.per_category?.[std.key] ||
                                        final_profile?.per_category?.[std.key] ||
                                        {} : {};

                                    const TopicIcon = TOPIC_ICONS[std.key] || Brain;

                                    return (
                                        <div key={std.key} className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4">

                                            {/* Topic Category Title */}
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500">
                                                    <TopicIcon size={14} />
                                                </div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
                                                    {std.label}
                                                </h4>
                                            </div>

                                            {/* Topic summary */}
                                            <p className="text-xs leading-relaxed text-zinc-500 font-normal">
                                                {topicObj.summary}
                                            </p>

                                            {/* Render ProjectCard if it's Project_DeepDive */}
                                            {std.key === "Project_DeepDive" && topicObj.projects && topicObj.projects.length > 0 && (
                                                <div className="mt-5 border border-zinc-200/60 rounded-xl overflow-hidden divide-y divide-zinc-100 shadow-sm">
                                                    {topicObj.projects.map((proj: any, pIdx: number) => (
                                                        <ProjectCard
                                                            key={proj.name || pIdx}
                                                            name={proj.name}
                                                            description={proj.description}
                                                            problem_type={proj.problem_type}
                                                            used_solution={proj.used_solution}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Epistemic Data Metric Details */}
                                            {Object.entries(epistemicData).map(([metricKey, val]: [string, any]) => {
                                                const label = metricKey.replace(/_/g, " ");

                                                // Check if it's the specific Vibe Check metric
                                                const isVibeCheck = metricKey === "The_Vibe_Check";

                                                // Standard variables with fallbacks
                                                const weight = val.overall_weight ?? 0;
                                                const purity = val.purity_score ?? 0;
                                                const redCount = Array.isArray(val.red_flags) ? val.red_flags.length : 0;
                                                const greenCount = Array.isArray(val.green_flags) ? val.green_flags.length : 0;

                                                return (
                                                    <div key={metricKey} className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-3">
                                                        <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 font-mono">
                    {label}
                </span>

                                                            {/* Only show flags if it's not the Vibe Check */}
                                                            {!isVibeCheck && (
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        onClick={() => {
                                                                            if (greenCount > 0 && Array.isArray(val.green_flags)) {
                                                                                setSelectedFlags({
                                                                                    title: `${label} - Green Flags`,
                                                                                    type: "green",
                                                                                    flags: val.green_flags
                                                                                });
                                                                            }
                                                                        }}
                                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-emerald-50 border border-emerald-200 text-emerald-700 ${greenCount > 0 ? 'cursor-pointer hover:bg-emerald-100 transition-colors' : ''}`}
                                                                    >
                                                                        {greenCount} GREEN
                                                                    </span>
                                                                    <span
                                                                        onClick={() => {
                                                                            if (redCount > 0 && Array.isArray(val.red_flags)) {
                                                                                setSelectedFlags({
                                                                                    title: `${label} - Red Flags`,
                                                                                    type: "red",
                                                                                    flags: val.red_flags
                                                                                });
                                                                            }
                                                                        }}
                                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-rose-50 border border-rose-200 text-rose-700 ${redCount > 0 ? 'cursor-pointer hover:bg-rose-100 transition-colors' : ''}`}
                                                                    >
                                                                        {redCount} RED
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content Logic */}
                                                        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-200/40">

                                                            {isVibeCheck ? (
                                                                /* Simple view for Vibe Check */
                                                                <div className="col-span-2 space-y-1">
                                                                    <div className="flex justify-between text-zinc-400">
                                                                        <span>VIBE RATING:</span>
                                                                        <span className="text-zinc-900 font-bold text-sm">{val.score ?? 0} / 5.0</span>
                                                                    </div>
                                                                    <div className="h-1.5 w-full bg-zinc-200/70 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-amber-500 rounded-full"
                                                                            style={{ width: `${((val.score ?? 0) / 5) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* Standard view for all other metrics */
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-zinc-400">
                                                                            <span>COGNITIVE FOCUS:</span>
                                                                            <span className="text-zinc-700 font-bold">{weight}/10</span>
                                                                        </div>
                                                                        <div className="h-1.5 w-full bg-zinc-200/70 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(weight / 10) * 100}%` }} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-zinc-400">
                                                                            <span>{metricKey === "Logic_Consistency" ? "LOGICAL RIGOR:" : metricKey === "Contextual_Clarity" ? "COMMUNICATION SOUNDNESS:" : "EXECUTION EFFICIENCY:"}</span>
                                                                            <span className="text-zinc-700 font-bold">{purity}%</span>
                                                                        </div>
                                                                        <div className="h-1.5 w-full bg-zinc-200/70 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${purity}%` }} />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI STRATEGY AND RECOMMENDATION ACTION DETAIL MODAL (LIGHT THEME) */}
            {selectedRecommendation && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-sm transition-all">
                    <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl space-y-6 text-zinc-900">
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                            <div className="flex items-center gap-2.5">
                                <Award className="w-5 h-5 text-indigo-500"/>
                                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">AI Strategy Assessment</h3>
                            </div>
                            <button
                                onClick={() => setSelectedRecommendation(null)}
                                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all cursor-pointer"
                                type="button"
                            >
                                <X className="w-4 h-4"/>
                            </button>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono tracking-widest">Action Directive</span>
                            <span className="text-base font-bold uppercase tracking-wider text-zinc-900">
                {selectedRecommendation.action?.replace("_", " ")}
              </span>
                            <p className="text-xs leading-relaxed text-zinc-500 mt-3 border-t border-zinc-200/40 pt-3 font-sans">
                                {selectedRecommendation.reasoning}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Directive Goal Explanation</h4>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-500 leading-relaxed font-normal">
                                {selectedRecommendation.action === "TECHNICAL_TEST" ? (
                                    <>
                                        <span className="font-bold text-zinc-800">Validation Rationale:</span> Dispatch
                                        an algorithms assessment. Core goal: inspect logical baseline clarity, extreme
                                        case boundary validation, and syntactic safety.
                                    </>
                                ) : selectedRecommendation.action === "PRACTICAL_TASK" ? (
                                    <>
                                        <span className="font-bold text-zinc-800">Validation Rationale:</span> Dispatch
                                        a custom system design challenge. Core goal: verify technical velocity,
                                        structural clean hygiene, and interface integration safety.
                                    </>
                                ) : (
                                    "Candidate shows optimal credentials. Formulate standard next assessment phases."
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedRecommendation(null)}
                            className="h-11 w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white transition-all shadow-md shadow-zinc-900/10 cursor-pointer"
                            type="button"
                        >
                            Acknowledge AI Directive
                        </button>
                    </div>
                </div>
            )}

            {/* RED/GREEN FLAGS DETAIL DIALOG */}
            {selectedFlags && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-sm transition-all">
                    <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-5 text-zinc-900 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 shrink-0">
                            <div className="flex items-center gap-2.5">
                                {selectedFlags.type === "green" ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                                )}
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-mono">
                                    {selectedFlags.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedFlags(null)}
                                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all cursor-pointer"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Flags List Content */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {selectedFlags.flags && selectedFlags.flags.length > 0 ? (
                                selectedFlags.flags.map((flag: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl border space-y-2.5 ${
                                            selectedFlags.type === "green"
                                                ? "bg-emerald-50/30 border-emerald-200/80"
                                                : "bg-rose-50/30 border-rose-200/80"
                                        }`}
                                    >
                                        {/* Label */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    selectedFlags.type === "green" ? "bg-emerald-500" : "bg-rose-500"
                                                }`}
                                            />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
                                                {flag.label || flag.name || `Indicator #${index + 1}`}
                                            </h4>
                                        </div>

                                        {/* Description */}
                                        {flag.description && (
                                            <p className="text-xs text-zinc-650 leading-relaxed font-sans">
                                                {flag.description}
                                            </p>
                                        )}

                                        {/* Quotes */}
                                        {flag.quotes && Array.isArray(flag.quotes) && flag.quotes.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono block">
                                                    VERBATIM QUOTES
                                                </span>
                                                <div className="space-y-1.5">
                                                    {flag.quotes.map((quote: any, qIdx: number) => {
                                                        const quoteText = typeof quote === "string" ? quote : quote.text || quote.quote || JSON.stringify(quote);
                                                        return (
                                                            <div
                                                                key={qIdx}
                                                                className="border-l-2 border-indigo-400 pl-3 py-1 bg-white/80 rounded-r-lg text-xs italic text-zinc-700 font-serif shadow-2xs"
                                                            >
                                                                &ldquo;{quoteText}&rdquo;
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-zinc-400 italic text-center py-8">
                                    No detailed indicators available for this item.
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 pt-2 border-t border-zinc-100">
                            <button
                                onClick={() => setSelectedFlags(null)}
                                className="h-10 w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white transition-all shadow-md cursor-pointer uppercase tracking-wider"
                                type="button"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};