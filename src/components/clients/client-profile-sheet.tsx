import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Briefcase, Mail, MapPin, Phone, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ClientProfileSheetProps {
    isEditing: boolean;
    setIsEditing: (open: boolean) => void;
    activeId: string | null;
    form: any;
    onSubmit: (data: any) => Promise<void>;
    isPendingClientCreate: boolean;
    isPendingClientUpdate: boolean;
}

export function ClientProfileSheet({
    isEditing,
    setIsEditing,
    activeId,
    form,
    onSubmit,
    isPendingClientCreate,
    isPendingClientUpdate,
}: ClientProfileSheetProps) {
    return (
        <Sheet open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l border-zinc-200/80 shadow-2xl bg-white">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/50 px-8 py-5">
                        <SheetTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                            {activeId === "new" ? "Register New Client" : "Update Client Profile"}
                        </SheetTitle>
                    </div>

                    <form
                        onSubmit={form.handleSubmit(
                            (data: any) => onSubmit(data),
                            (errors: any) => console.log("FORM VALIDATION FAILED:", errors)
                        )}
                        className="flex flex-col h-full overflow-hidden"
                    >
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                            {["company", "contact", "phone", "email"].map((f) => {
                                const Icon = {
                                    company: Briefcase,
                                    contact: User,
                                    phone: Phone,
                                    email: Mail,
                                }[f as "company" | "contact" | "phone" | "email"];

                                return (
                                    <div key={f} className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                            <Icon size={12} className="text-zinc-400" />
                                            {f}
                                        </label>
                                        <input
                                            {...form.register(f as any)}
                                            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                            placeholder={`Enter ${f}...`}
                                        />
                                    </div>
                                );
                            })}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                    <MapPin size={12} className="text-zinc-400" />
                                    Address
                                </label>
                                <input
                                    {...form.register("address")}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                    placeholder="Enter address..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-zinc-200 bg-zinc-50 px-8 py-4 flex gap-2 shrink-0">
                            <button
                                type="submit"
                                disabled={isPendingClientCreate || isPendingClientUpdate}
                                className="h-10 w-full rounded-xl bg-zinc-950 text-white text-xs font-bold uppercase hover:bg-zinc-850 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                {(isPendingClientCreate || isPendingClientUpdate) && <Spinner className="w-3.5 h-3.5" />} Confirm & Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
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
