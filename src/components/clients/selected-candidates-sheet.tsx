import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DroppableColumn } from "./droppable-column";
import { SortableCandidate } from "./sortable-candidate";
import { statuses } from "@/components/candidates/consider-table";
import { Summary } from "@/components/candidates/summary";

interface SelectedCandidatesSheetProps {
    showCandidates: any;
    setShowCandidates: (val: any) => void;
    sensors: any;
    activeDragCandidateId: string | null;
    setActiveDragCandidateId: (id: string | null) => void;
    handleStatusUpdate: any;
    setDossierCandidate: (candidate: any) => void;
    dossierCandidate: any;
    closeDossier: () => void;
}

export function SelectedCandidatesSheet({
    showCandidates,
    setShowCandidates,
    sensors,
    activeDragCandidateId,
    setActiveDragCandidateId,
    handleStatusUpdate,
    setDossierCandidate,
    dossierCandidate,
    closeDossier,
}: SelectedCandidatesSheetProps) {
    if (!showCandidates) return null;

    return (
        <Sheet open={!!showCandidates} onOpenChange={() => setShowCandidates(null)}>
            <SheetContent className="min-w-full h-full p-0 flex flex-col overflow-hidden bg-white gap-0 border-none">
                <SheetHeader className="px-8 py-5 border-b border-zinc-200 bg-white flex flex-row items-center justify-between shrink-0">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest block font-mono text-indigo-600 mb-0.5">
                            Kanban Task Board
                        </span>
                        <SheetTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                            Selected Candidates Pipeline
                        </SheetTitle>
                    </div>
                    <Button
                        onClick={() => setShowCandidates(null)}
                        variant="ghost"
                        className="h-9 px-4 rounded-xl border border-zinc-200/80 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors shadow-sm bg-white cursor-pointer"
                    >
                        <X size={14} /> Close Board
                    </Button>
                </SheetHeader>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(e) => setActiveDragCandidateId(e.active.id as string)}
                    onDragEnd={(event) => {
                        setActiveDragCandidateId(null);
                        const { active, over } = event;
                        if (!over) return;

                        const activeCandidate = showCandidates.selectedCandidates.find((c: any) => c.candidateId === active.id);
                        const overId = over.id;

                        const targetStatus = statuses.includes(overId as string)
                            ? overId
                            : showCandidates.selectedCandidates.find((c: any) => c.candidateId === overId)?.status;

                        if (activeCandidate && targetStatus && activeCandidate.status !== targetStatus) {
                            void handleStatusUpdate(
                                {
                                    status: targetStatus,
                                },
                                showCandidates.positionId,
                                activeCandidate.candidateId
                            );

                            activeCandidate.status = targetStatus;
                        }
                    }}
                >
                    <div className="flex-1 flex overflow-x-auto min-h-0 p-6 gap-4 items-stretch justify-start bg-white">
                        {statuses.map((status) => (
                            <DroppableColumn
                                key={status}
                                id={status}
                                title={status || "Unassigned"}
                                count={showCandidates.selectedCandidates.filter((c: any) => c.status === status).length}
                            >
                                <SortableContext
                                    items={showCandidates.selectedCandidates.filter((c: any) => c.status === status).map((c: any) => c.candidateId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {showCandidates.selectedCandidates
                                        .filter((c: any) => c.status === status)
                                        .map((candidate: any) => (
                                            <SortableCandidate
                                                key={candidate.candidateId}
                                                candidate={candidate}
                                                handleStatusUpdate={handleStatusUpdate}
                                                positionId={showCandidates.positionId}
                                                setDossierCandidate={setDossierCandidate}
                                            />
                                        ))}
                                </SortableContext>
                            </DroppableColumn>
                        ))}
                    </div>

                    {/* The global overlay that follows the mouse */}
                    <DragOverlay>
                        {activeDragCandidateId ? (
                            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xl cursor-grabbing w-80 opacity-95 ring-1 ring-zinc-950/5">
                                {(() => {
                                    const c = showCandidates.selectedCandidates.find((x: any) => x.candidateId === activeDragCandidateId);
                                    return c ? (
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-xs text-zinc-955">{c.title ?? c.name}</h3>
                                            <span className="text-[9px] text-zinc-400 bg-zinc-50 border border-zinc-200/50 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                                                {c.source}
                                            </span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {/* Summary rendered inside Kanban Portal to sit on top of the Sheet Content */}
                {dossierCandidate && (
                    <Summary
                        gemini={dossierCandidate.gemini}
                        final_profile={dossierCandidate.final_profile}
                        analyses={dossierCandidate.analyses}
                        candidateName={dossierCandidate.name || "No Title"}
                        dossierOpen={!!dossierCandidate}
                        closeDossier={closeDossier}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}
