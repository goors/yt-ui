import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MultiAsyncSelect } from "@/components/ui/async-select";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PositionDossierSheetProps {
    editingIdx: string | null;
    setEditingIdx: (idx: string | null) => void;
    formPositions: any;
    onCreatePosition: (data: any) => Promise<void>;
    onUpdatePosition: (data: any, idx: string) => Promise<void>;
    isFetchingClients: boolean;
    countries: any[];
    searchCountries: any;
    resetPositionForm: () => void;
    isPendingClientPositionCreate: boolean;
    isPendingClientPositionUpdate: boolean;
}

export function PositionDossierSheet({
    editingIdx,
    setEditingIdx,
    formPositions,
    onCreatePosition,
    onUpdatePosition,
    isFetchingClients,
    countries,
    searchCountries,
    resetPositionForm,
    isPendingClientPositionCreate,
    isPendingClientPositionUpdate,
}: PositionDossierSheetProps) {
    return (
        <Sheet open={editingIdx !== null} onOpenChange={(open) => !open && setEditingIdx(null)}>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l border-zinc-200/80 shadow-2xl bg-white">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/50 px-8 py-5">
                        <SheetTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                            {editingIdx === "new" ? "Create Position Dossier" : "Update Position Dossier"}
                        </SheetTitle>
                    </div>

                    <form
                        onSubmit={formPositions.handleSubmit(
                            (positionsData: any) =>
                                editingIdx === "new"
                                    ? onCreatePosition(positionsData)
                                    : onUpdatePosition(positionsData, editingIdx ?? ""),
                            (errors: any) => console.log("FORM VALIDATION FAILED:", errors)
                        )}
                        className="flex flex-col h-full overflow-hidden"
                    >
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Position Name</label>
                                <input
                                    {...formPositions.register("name")}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                    placeholder="e.g. Senior Backend Engineer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Target Countries</label>
                                <div className="w-full">
                                    <MultiAsyncSelect
                                        loading={isFetchingClients}
                                        options={
                                            countries.map((item) => ({
                                                label: item.name,
                                                value: item.id,
                                            })) || []
                                        }
                                        defaultValue={editingIdx !== "new" ? countries.map((item) => item.id) || [] : []}
                                        onValueChange={(value: any[]) => {
                                            const selectedCountries = value.map((c) => ({
                                                id: countries.find((x) => x.id === c)?.id ?? "",
                                                name: countries.find((x) => x.id === c)?.name ?? "",
                                            }));

                                            if (editingIdx !== "new") {
                                                const currentCountries = formPositions.getValues("countries") || [];
                                                const merged = [
                                                    ...currentCountries,
                                                    ...selectedCountries.filter((nc) => !currentCountries.find((c: any) => c.id === nc.id)),
                                                ];
                                                formPositions.setValue("countries", merged);
                                            } else {
                                                formPositions.setValue("countries", selectedCountries);
                                            }
                                        }}
                                        onSearch={searchCountries}
                                        className="w-full"
                                        searchPlaceholder="Search countries..."
                                        placeholder="Select countries..."
                                        maxCount={4}
                                        async
                                        clearSearchOnClose={false}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Role Purpose & Vision</label>
                                <textarea
                                    {...formPositions.register("purpose")}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs h-32 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white leading-relaxed resize-none"
                                    placeholder="Describe the main purpose of this role..."
                                />
                            </div>

                            {["positiveSignals", "riskIndicators"].map((key) => {
                                const isPositive = key === "positiveSignals";
                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                            {isPositive ? "Positive Signals" : "Risk Indicators"}
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(formPositions.watch(`${key as "positiveSignals"}`) || []).map((val: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1.5 uppercase tracking-wider border",
                                                        isPositive
                                                            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                                            : "bg-rose-50 text-rose-800 border-rose-100"
                                                    )}
                                                >
                                                    {val}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const c = formPositions.getValues(`${key as "positiveSignals"}`);
                                                            formPositions.setValue(
                                                                `${key as "positiveSignals"}`,
                                                                c.filter((_: any, idx: number) => idx !== i)
                                                            );
                                                        }}
                                                        className="hover:text-zinc-955 transition-colors p-0.5 rounded-full hover:bg-zinc-200/50 cursor-pointer"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                            placeholder={isPositive ? "+ Add positive signal & hit Enter" : "+ Add risk indicator & hit Enter"}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const v = e.currentTarget.value.trim();
                                                    if (v) {
                                                        const c = formPositions.getValues(`${key as "positiveSignals"}`) || [];
                                                        formPositions.setValue(`${key as "positiveSignals"}`, [...c, v]);
                                                        e.currentTarget.value = "";
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-zinc-200 bg-zinc-50 px-8 py-4 flex gap-2 shrink-0">
                            <button
                                type="submit"
                                disabled={isPendingClientPositionCreate || isPendingClientPositionUpdate}
                                className="h-10 w-full rounded-xl bg-zinc-950 text-white text-xs font-bold uppercase hover:bg-zinc-850 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                {(isPendingClientPositionCreate || isPendingClientPositionUpdate) && <Spinner className="w-3.5 h-3.5" />} Confirm & Save
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    resetPositionForm();
                                    setEditingIdx(null);
                                }}
                                className="h-10 px-6 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold uppercase hover:bg-zinc-50 transition-all active:scale-98 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
