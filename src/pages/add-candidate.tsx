import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ChevronLeft,
    UploadCloud,
    Check,
    X,
    User,
    Mail,
    Link2,
    Flag,
    FileText,
    ChevronsUpDown,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner.tsx";
import { candidatesCreateMutation } from "@/mutations/candidates/candidates-create-mutation";
import { countriesQueryOptions } from "@/queries/misc/countries-query-options";
import { CountriesQuery } from "@/validators/misc/countries-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Local Zod validation schema for form field state validation
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    link: z.url("Invalid URL").or(z.literal("")).optional(),
    country: z.object({
        name: z.string().min(1, "Country name is required"),
        id: z.string().min(1, "Country ID is required"),
    }),
    notes: z.string().optional(),
    snippet: z.string().optional(),
    cv: z
        .instanceof(File, { message: "CV file is required" })
        .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be under 5MB")
        .refine(
            (file) =>
                [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/msword",
                    "text/plain",
                ].includes(file.type),
            "Only PDF, DOCX, DOC, or TXT files are allowed"
        )
        .optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function AddCandidate() {
    const navigate = useNavigate();
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset
    } = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            link: "",
            country: {
                name: "",
                id: "",
            },
            notes: "",
        }
    });

    const selectedCountry = watch("country");

    const [countriesQuery, setCountriesQuery] = useState<CountriesQuery>({
        maxItemCount: 6,
    });

    const { data: countriesQueryData } = useQuery(countriesQueryOptions(true, countriesQuery));

    const { isPending: isPendingCreate, mutateAsync: candidatesCreateMutationMutateAsync } =
        useMutation(candidatesCreateMutation);

    const onSubmit = async (values: FormSchema): Promise<void> => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("snippet", values.snippet ?? "");
        formData.append("link", values.link || "");
        
        // Append country object details for standard parsing frameworks
        formData.append("country[name]", values.country.name);
        formData.append("country[id]", values.country.id);
        formData.append("country", JSON.stringify(values.country));

        if (values.notes) {
            formData.append("notes", values.notes);
        }

        if (cvFile) {
            formData.append("cv", cvFile);
        }

        await candidatesCreateMutationMutateAsync(
            { data: formData },
            {
                onSuccess: () => {
                    toast.success("Candidate record created successfully.");
                    reset();
                    setCvFile(null);
                    void navigate({ to: "/candidates" });
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to create candidate.");
                },
            }
        );
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setCvFile(file);
            setValue("cv", file, { shouldValidate: true });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCvFile(file);
            setValue("cv", file, { shouldValidate: true });
        }
    };

    const removeFile = () => {
        setCvFile(null);
        setValue("cv", undefined, { shouldValidate: true });
    };

    const searchCountries = (value: string) => {
        setCountriesQuery((prev) => ({
            ...prev,
            name: value
        }));
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden text-zinc-900">
            {/* Header Area matching Clients layout */}
            <div className="border-b border-zinc-200/80 flex items-center justify-between bg-white flex-none px-8 py-3">
                <div className="flex items-center gap-4">
                    <Link
                        to="/candidates"
                        className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-all shadow-sm text-zinc-500 hover:text-zinc-900 cursor-pointer"
                        title="Back to candidates list"
                    >
                        <ChevronLeft size={16} />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Registry Admin</span>
                        <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Add Candidate</h2>
                    </div>
                </div>
            </div>

            {/* Flat Dashboard Workspace */}
            <main className="flex-1 overflow-y-auto p-12 bg-zinc-50/20">
                <div className="max-w-3xl pb-20 text-left">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Title Section */}
                        <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/80">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 font-mono">
                                Administration Panel
                            </h2>
                            <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-900">
                                Create Candidate Dossier
                            </h1>
                        </div>

                        {/* Section 1: Candidate Details */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-3 bg-indigo-600 rounded-full" />
                                Candidate Details
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <User size={12} className="text-zinc-400" />
                                        Candidate Name
                                    </label>
                                    <input
                                        {...register("name")}
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                        placeholder="Enter full name..."
                                    />
                                    {errors.name && (
                                        <p className="text-[10px] text-rose-600 font-semibold">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <Mail size={12} className="text-zinc-400" />
                                        Email Address
                                    </label>
                                    <input
                                        {...register("email")}
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-[10px] text-rose-600 font-semibold">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Link */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <Link2 size={12} className="text-zinc-400" />
                                        Profile Link
                                    </label>
                                    <input
                                        {...register("link")}
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                        placeholder="LinkedIn or GitHub link..."
                                    />
                                    {errors.link && (
                                        <p className="text-[10px] text-rose-600 font-semibold">{errors.link.message}</p>
                                    )}
                                </div>


                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <Link2 size={12} className="text-zinc-400" />
                                        Summary (this is important)
                                    </label>
                                    <input
                                        {...register("snippet")}
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                        placeholder="Summary ..."
                                    />
                                    {errors.snippet && (
                                        <p className="text-[10px] text-rose-600 font-semibold">{errors.snippet.message}</p>
                                    )}
                                </div>

                                {/* Country Selection */}
                                <div className="space-y-1.5 flex flex-col">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <Flag size={12} className="text-zinc-400" />
                                        Country Location
                                    </label>
                                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                role="combobox"
                                                aria-expanded={countryOpen}
                                                className="w-full flex items-center justify-between border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-700 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-left uppercase"
                                            >
                                                {selectedCountry?.name ? (
                                                    selectedCountry.name
                                                ) : (
                                                    <span className="text-zinc-400 font-normal normal-case">Select location...</span>
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-zinc-200 rounded-xl shadow-lg" align="start">
                                            <Command shouldFilter={false} className="w-full">
                                                <CommandInput 
                                                    placeholder="Search country..." 
                                                    className="text-xs" 
                                                    onValueChange={searchCountries}
                                                />
                                                <CommandList className="max-h-48 overflow-y-auto">
                                                    {countriesQueryData && countriesQueryData.length > 0 ? (
                                                        <CommandGroup>
                                                            {countriesQueryData.map((c) => (
                                                                <CommandItem
                                                                    key={c.id}
                                                                    value={c.name}
                                                                    onSelect={() => {
                                                                        setValue("country", {
                                                                            id: c.id,
                                                                            name: c.name,
                                                                        }, { shouldValidate: true });
                                                                        setCountryOpen(false);
                                                                    }}
                                                                    className="cursor-pointer text-xs flex items-center justify-between hover:bg-zinc-50 p-2"
                                                                >
                                                                    <span className="uppercase font-semibold text-zinc-750">{c.name}</span>
                                                                    {selectedCountry?.id === c.id && (
                                                                        <Check className="h-4 w-4 text-indigo-600" />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    ) : (
                                                        <CommandEmpty className="text-xs p-3 text-zinc-500 text-center">No location found.</CommandEmpty>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.country && (
                                        <p className="text-[10px] text-rose-600 font-semibold">
                                            {errors.country.name?.message || errors.country.id?.message || errors.country.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: CV File & Notes */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-3 bg-indigo-600 rounded-full" />
                                CV File & Notes
                            </h3>

                            <div className="space-y-6">
                                {/* CV drag-and-drop zone */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <UploadCloud size={12} className="text-zinc-400" />
                                        Curriculum Vitae (CV)
                                    </label>
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-all min-h-[160px]",
                                            dragActive
                                                ? "border-indigo-500 bg-indigo-50/10"
                                                : cvFile
                                                    ? "border-emerald-200 bg-emerald-50/10"
                                                    : "border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50"
                                        )}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        {cvFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                                                    <Check size={18} />
                                                </div>
                                                <span className="text-xs font-bold text-zinc-900 line-clamp-1 max-w-[280px]">
                                                    {cvFile.name}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-400">
                                                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    className="mt-2 text-[10px] text-rose-600 font-bold uppercase flex items-center gap-1 hover:underline cursor-pointer"
                                                >
                                                    <X size={10} />
                                                    Remove file
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5">
                                                <UploadCloud size={28} className="text-zinc-400" />
                                                <span className="text-xs font-semibold text-zinc-800">
                                                    Drag & drop candidate CV here
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                    or{" "}
                                                    <label className="text-zinc-900 underline font-bold cursor-pointer hover:text-indigo-600 transition-colors">
                                                        browse files
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf,.docx,.doc,.txt"
                                                            onChange={handleFileChange}
                                                        />
                                                    </label>
                                                </span>
                                                <span className="text-[9px] text-zinc-400 uppercase tracking-wider mt-1.5">
                                                    PDF, DOCX, TXT (Max 5MB)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {errors.cv && (
                                        <p className="text-[10px] text-rose-600 font-semibold">{errors.cv.message}</p>
                                    )}
                                </div>

                                {/* Notes field */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                        <FileText size={12} className="text-zinc-400" />
                                        Dossier Notes
                                    </label>
                                    <textarea
                                        {...register("notes")}
                                        className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs h-32 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white resize-none leading-relaxed"
                                        placeholder="Add notes, qualifications, or interview feedback here..."
                                    />
                                    {errors.notes && (
                                        <p className="text-[10px] text-rose-600 font-semibold">{errors.notes.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons matching Clients form layout */}
                        <div className="flex gap-3 pt-6 border-t border-zinc-200/80">
                            <button
                                type="submit"
                                disabled={isPendingCreate}
                                className="h-10 px-8 rounded-xl bg-zinc-950 text-white text-xs font-bold uppercase hover:bg-zinc-850 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isPendingCreate && <Spinner className="w-3.5 h-3.5" />} Create Dossier
                            </button>
                            <Link
                                to="/candidates"
                                className="h-10 px-6 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold uppercase hover:bg-zinc-50 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
