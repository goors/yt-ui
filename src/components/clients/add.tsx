import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Building2, User, MapPin, Phone, Mail, Fingerprint, Globe } from "lucide-react";
import { clientAddSchema, ClientAddSchema } from "@/validators/clients/client-add";

interface ClientFormProps {
    open: boolean;
    onClose: () => void;
    client?: ClientAddSchema | null;
}

export function ClientFormSheet({ open, onClose, client }: ClientFormProps) {
    const [countries, setCountries] = useState<{name: string, code: string}[]>([]);

    const form = useForm<ClientAddSchema>({
        resolver: zodResolver(clientAddSchema),
        defaultValues: client || {
            id: crypto.randomUUID(),
            company: "",
            contact: "",
            address: "",
            phone: "",
            email: "",
            requestedPositions: [],
        },
    });

    useEffect(() => {
        // Fetch countries from your new endpoint
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8001"}/countries`)
            .then(res => res.json())
            .then(data => setCountries(data))
            .catch(err => console.error("Failed to load countries", err));
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-sm transition-all">
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
            <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-zinc-200 bg-white shadow-2xl z-10 text-zinc-900">
                <form onSubmit={form.handleSubmit((data) => { console.log(data); onClose(); })} className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-10 py-5">
                        <div>
                            <span className="mb-0.5 text-[10px] font-normal uppercase tracking-wider text-zinc-400 block font-mono">Registry Administration System</span>
                            <h3 className="text-lg font-medium text-zinc-900 tracking-tight uppercase">
                                {client ? "Update Client Dossier" : "Register New Client"}
                            </h3>
                        </div>
                        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-normal uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
                                    <Fingerprint className="w-4 h-4 text-zinc-450" /> Client Registry UUID
                                </label>
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 font-mono text-xs text-zinc-500 select-all">
                                    {form.watch("id")}
                                </div>
                            </div>

                            {[
                                { name: "company", label: "Company Name", icon: Building2 },
                                { name: "contact", label: "Contact Person", icon: User },
                                { name: "address", label: "Office Address", icon: MapPin },
                                { name: "phone", label: "Phone Number", icon: Phone },
                                { name: "email", label: "Email Address", icon: Mail },
                            ].map((field) => (
                                <div key={field.name} className="space-y-2 md:col-span-2">
                                    <label className="text-[11px] font-normal uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
                                        <field.icon className="w-4 h-4 text-zinc-450" /> {field.label}
                                    </label>
                                    <input
                                        {...form.register(field.name as keyof ClientAddSchema)}
                                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-4 text-xs outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 text-zinc-900 transition-all shadow-sm"
                                    />
                                </div>
                            ))}

                            {/* Country Selector Design Match */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-normal uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
                                    <Globe className="w-4 h-4 text-zinc-450" /> Base Country
                                </label>
                                <select
                                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-4 text-xs outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 text-zinc-900 transition-all shadow-sm"
                                >
                                    <option value="">Select Country</option>
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <footer className="sticky bottom-0 flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-10 py-4.5">
                        <span className="text-[10px] font-normal uppercase tracking-wider text-zinc-450 font-mono">
                            {client ? `NODE: ${client.id.split("-")[0]}` : "NEW_DOSS_ENTRY"}
                        </span>
                        <button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 px-6 text-xs font-normal text-white transition-all shadow-sm cursor-pointer">
                            <Save className="w-4 h-4" /> Save Client Dossier
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}