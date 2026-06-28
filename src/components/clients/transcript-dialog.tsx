import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptDialogProps {
    candidate: any;
    children?: React.ReactNode;
}

export function TranscriptDialog({ candidate, children }: TranscriptDialogProps) {
    const cues = candidate.transcriptCues || [];

    const formatTime = (totalSeconds: number) => {
        const seconds = Math.floor(totalSeconds || 0);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Flatten nested cues for cleaner rendering
    const normalizedCues = cues.flatMap((cue: any) => {
        if (Array.isArray(cue)) return cue;
        return [cue];
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <button
                        disabled={candidate.transcript_crawled_status !== "done"}
                        onPointerDown={(e) => e.stopPropagation()}
                        title="View Transcript"
                        className={cn(
                            "flex-1 flex items-center justify-center p-2 rounded-lg transition-all border",
                            candidate.transcript_crawled_status === "done"
                                ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-row items-center justify-between shrink-0">
                    <div>
                        <DialogTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                            Interview Transcript
                        </DialogTitle>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono mt-0.5">
                            Candidate: {candidate.name}
                        </p>
                    </div>
                </DialogHeader>

                {/* Scrollable area for the transcript */}
                <ScrollArea className="flex-1 bg-zinc-50/30 p-6 overflow-y-auto">
                    {normalizedCues.length > 0 ? (
                        <div className="relative pl-6 border-l border-zinc-200 ml-3 space-y-6 py-2">
                            {normalizedCues.map((cue: any, index: number) => (
                                <div key={index} className="relative space-y-1">
                                    {/* Timeline bullet */}
                                    <div className="absolute left-[-31px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    </div>

                                    {/* Cue Header */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-zinc-900">
                                            {cue.speaker_name || "Speaker"}
                                        </span>
                                        <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                            {formatTime(cue.start_time)} - {formatTime(cue.end_time)}
                                        </span>
                                    </div>

                                    {/* Text Content */}
                                    <p className="text-xs text-zinc-650 leading-relaxed pt-0.5">
                                        {cue.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                            <FileText className="w-8 h-8 mb-2 text-zinc-300" />
                            <p className="text-xs font-medium">No transcript text available.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
