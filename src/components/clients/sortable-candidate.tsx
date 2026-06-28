import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Edit3, FileText, User, Video } from "lucide-react";
import { IconFileCv } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { candidatesCvMutation } from "@/mutations/candidates/candidates-cv-mutation";
import { EditCandidateDialog } from "./edit-candidate-dialog";
import { TranscriptDialog } from "./transcript-dialog";

interface SortableCandidateProps {
    candidate: any;
    handleStatusUpdate: any;
    positionId: string;
    setDossierCandidate: (candidate: any) => void;
}

export function SortableCandidate({ candidate, handleStatusUpdate, positionId, setDossierCandidate }: SortableCandidateProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.candidateId });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition: transition,
    };

    const openDossier = () => {
        if (candidate.candidate_profiling === "done") {
            setDossierCandidate(candidate);
        }
    };

    const { isPending: isPendingDownloadCv, mutateAsync: candidatesCvMutationMutateAsync } =
        useMutation(candidatesCvMutation);

    const downloadCv = async (id: string, name: string) => {
        await candidatesCvMutationMutateAsync(
            { id },
            {
                onSuccess: (data: any) => {
                    const url = window.URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                },
                onError: () => {
                    toast.error("Candidate CV download error.");
                },
            }
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing hover:border-zinc-300/80 relative"
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-xs text-zinc-955 leading-snug group-hover:text-indigo-600 transition-colors">
                    {candidate.name || "No Title"}
                </h3>
                <span className="text-[9px] text-zinc-400 bg-zinc-50 border border-zinc-200/50 px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0">
                    {candidate.source}
                </span>
            </div>

            <p className="text-[10px] text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
                {candidate.snippet}
            </p>

            <div
                className="flex flex-col border border-zinc-100 rounded-lg bg-zinc-50/50 p-3 gap-2.5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Transcript Crawl Status */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        Transcript Crawl
                    </span>
                    <div
                        className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1",
                            candidate.transcript_crawled_status === "done"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold"
                                : "border-zinc-200 bg-zinc-100 text-zinc-500"
                        )}
                    >
                        {candidate.transcript_crawled_status === "done" && <Check className="w-2.5 h-2.5" />}
                        {!candidate.video_url ? "No Video" : (candidate.transcript_crawled_status || "Processing")}
                    </div>
                </div>

                {/* Profiling Status */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        Profiling Status
                    </span>
                    <div
                        className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1",
                            candidate.candidate_profiling === "done"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold"
                                : "border-zinc-200 bg-zinc-100 text-zinc-500"
                        )}
                    >
                        {candidate.candidate_profiling === "done" && <Check className="w-2.5 h-2.5" />}
                        {candidate.candidate_profiling ?? "Not started"}
                    </div>
                </div>

                {/* Video URL Input Field */}
                <div className="relative mt-1">
                    <Video className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Paste video URL here..."
                        defaultValue={candidate.video_url || ""}
                        onPointerDown={(e) => e.stopPropagation()}
                        onBlur={(e) => {
                            handleStatusUpdate({ video_url: e.target.value, status: candidate.status }, positionId, candidate.candidateId);
                            candidate.video_url = e.target.value;
                        }}
                        className="w-full text-[10px] bg-white border border-zinc-200 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-400"
                    />
                </div>

                {/* ICON-ONLY ACTION ROW */}
                <div className="flex items-center gap-1 mt-1 border-t border-zinc-200 pt-3">
                    {/* 1. Dossier (Left) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); openDossier(); }}
                        disabled={candidate.candidate_profiling !== "done"}
                        className={cn(
                            "flex-1 flex items-center justify-center p-2 rounded-lg transition-all border",
                            candidate.candidate_profiling === "done"
                                ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                        )}
                        title="View Candidate Dossier"
                    >
                        <User className="w-4 h-4" />
                    </button>

                    {/* 2. Transcript (Middle) */}
                    <TranscriptDialog candidate={candidate}>
                        <button
                            disabled={candidate.transcript_crawled_status !== "done"}
                            className={cn(
                                "flex-1 flex items-center justify-center p-2 rounded-lg transition-all border",
                                candidate.transcript_crawled_status === "done"
                                    ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                                    : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                            )}
                            title="View Transcript"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    </TranscriptDialog>

                    {/* 3. Edit (Right) */}
                    <EditCandidateDialog candidate={candidate} handleStatusUpdate={handleStatusUpdate} positionId={positionId} candidateId={candidate.candidateId}>
                        <button
                            className="flex-1 flex items-center justify-center p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-950 hover:text-white transition-all"
                            title="Edit Candidate Details"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </EditCandidateDialog>

                    {candidate.cv && (
                        <button
                            onClick={() => void downloadCv(candidate.candidateId, candidate.name)}
                            disabled={isPendingDownloadCv}
                            className={cn(
                                "cursor-pointer flex-1 flex items-center justify-center p-2 rounded-lg transition-all border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                            )}
                            title="Download cv"
                        >
                            <IconFileCv className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
