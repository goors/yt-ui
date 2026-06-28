import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconReload } from "@tabler/icons-react";
import { CandidateTable } from "@/components/candidates/consider-table";
import { User } from "lucide-react";

interface PotentialCandidatesSheetProps {
    potentialCandidates: string | null;
    setPotentialCandidates: (val: string | null) => void;
    clientsPositionsQueryData: any[] | undefined;
    refetchClientsPositions: () => void;
    handleStatusUpdate: any;
    onCrawl: any;
    isPendingCandidatePositionUpdate?: boolean;
}

export function PotentialCandidatesSheet({
    potentialCandidates,
    setPotentialCandidates,
    clientsPositionsQueryData,
    refetchClientsPositions,
    handleStatusUpdate,
    onCrawl,
    isPendingCandidatePositionUpdate,
}: PotentialCandidatesSheetProps) {
    return (
        <Sheet
            open={potentialCandidates !== null}
            onOpenChange={(open) => !open && setPotentialCandidates(null)}
        >
            <SheetContent side="right" className="w-full sm:max-w-4xl p-0 border-l border-zinc-200/80 shadow-2xl bg-white">
                {potentialCandidates !== null && (() => {
                    const activePos = clientsPositionsQueryData?.find((x) => x.id === potentialCandidates);
                    const candidatesForPos = activePos?.potentialCandidates || [];

                    return (
                        <div className="flex flex-col h-full bg-white">
                            <div className="border-b flex items-center border-zinc-200 bg-zinc-50/50 px-8 py-5 justify-between">
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest block font-mono text-indigo-600 mb-0.5">
                                        Recruitment Pipeline
                                    </span>
                                    <SheetTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                                        Possible Candidates
                                    </SheetTitle>
                                    <p className="text-[10px] text-zinc-450 uppercase font-mono mt-0.5">
                                        Position: {activePos?.name || "Loading..."}
                                    </p>
                                </div>

                                <Button
                                    onClick={() => refetchClientsPositions()}
                                    variant="ghost"
                                    className="h-9 w-9 rounded-xl border border-zinc-200/60 p-0 flex items-center justify-center bg-white text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm cursor-pointer"
                                >
                                    <IconReload className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {candidatesForPos.length > 0 ? (
                                    <CandidateTable
                                        candidates={candidatesForPos}
                                        onStatusChange={handleStatusUpdate}
                                        onCrawl={onCrawl}
                                        position_id={potentialCandidates}
                                        isPendingCandidatePositionUpdate={isPendingCandidatePositionUpdate}
                                    />
                                ) : (
                                    <div className="px-8 py-12 text-center flex flex-col items-center justify-center">
                                        <User size={32} className="text-zinc-300 mb-3" />
                                        <p className="text-xs text-zinc-500 italic">
                                            No candidates assigned to {activePos?.name} yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </SheetContent>
        </Sheet>
    );
}
