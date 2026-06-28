import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
    id: string;
    title: string;
    count?: number;
    children: React.ReactNode;
}

export function DroppableColumn({ id, title, count = 0, children }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    // Map status names to premium colors
    const statusColorMap: Record<string, { dot: string }> = {
        applied: { dot: "bg-blue-500" },
        interviewing: { dot: "bg-amber-500" },
        offered: { dot: "bg-emerald-500" },
        rejected: { dot: "bg-rose-500" },
    };

    const colors = statusColorMap[id.toLowerCase()] || { dot: "bg-zinc-400" };

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-80 flex-shrink-0 flex flex-col bg-zinc-50 border border-zinc-200 rounded-2xl h-full transition-all duration-300 shadow-sm",
                isOver && "bg-indigo-50/30 border-indigo-300 ring-1 ring-indigo-500/10 shadow-md"
            )}
        >
            {/* Header stays pinned to the top of the column */}
            <div className="p-4 border-b border-zinc-200 bg-white/90 backdrop-blur-sm rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                    <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                        {title || "Unassigned"}
                    </span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-full">
                    {count}
                </span>
            </div>

            {/* Scrollable area for cards in the column */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin">
                {children}
            </div>
        </div>
    );
}
