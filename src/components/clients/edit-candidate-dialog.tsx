import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditCandidateDialogProps {
    candidate: any;
    children: React.ReactNode;
    handleStatusUpdate: any;
    positionId: string;
    candidateId: string;
}

export function EditCandidateDialog({ candidate, children, handleStatusUpdate, positionId, candidateId }: EditCandidateDialogProps) {
    // 1. Initialize state with existing notes
    const [notes, setNotes] = useState(candidate.notes || "");

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                        Edit Candidate Notes
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Candidate Notes</label>
                        <textarea
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-xs h-32 outline-none focus:border-indigo-500 transition-all bg-zinc-50"
                            placeholder="Add internal notes or observations..."
                            value={notes} // Controlled input
                            onChange={(e) => setNotes(e.target.value)} // Update state on change
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" className="text-xs font-bold uppercase">Cancel</Button>
                    <Button
                        onClick={() => {
                            // 2. Use the 'notes' state variable here
                            handleStatusUpdate({ notes: notes, status: candidate.status }, positionId, candidateId);
                        }}
                        className="bg-zinc-950 text-white text-xs font-bold uppercase"
                    >
                        Save Notes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
