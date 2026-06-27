import React, {useEffect, useState} from 'react';
import {
    Link2,
    FileText,
    Flag,
    ChevronsUpDown,
    Check
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet";
import {cn} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";
import {useForm} from "react-hook-form";
import {candidateUpdateSchema, CandidateUpdateSchema} from "@/validators/candidates/candidate-update";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {useMutation, useQuery} from "@tanstack/react-query";
import {candidatesUpdatePositionsStatusMutation} from "@/mutations/candidates/candidates-update-mutation";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {CountriesQuery} from "@/validators/misc/countries-query";
import {countriesQueryOptions} from "@/queries/misc/countries-query-options";

interface CandidateSideSheetProps {
    selectedCandidate: any | null;
    setSelectedCandidate: (d: any) => void;
    refetchCandidates: () => void;
}

export default function CandidateEditSideSheet({
                                                   selectedCandidate,
                                                   setSelectedCandidate,
                                                   refetchCandidates
                                               }: CandidateSideSheetProps) {
    const {isPending: isPendingUpdate, mutateAsync: updateMutationMutateAsync} =
        useMutation(candidatesUpdatePositionsStatusMutation);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
        reset,
    } = useForm<CandidateUpdateSchema>({
        resolver: zodResolver(candidateUpdateSchema),

    });

    useEffect(() => {
        if (selectedCandidate) {
            reset({
                link: selectedCandidate.link || "",
                email: selectedCandidate.email || "",
                title: selectedCandidate.name || selectedCandidate.snippet || "",
                notes: selectedCandidate.notes,
                snippet: selectedCandidate.snippet,
                countryObject: selectedCandidate.countryObject,
            });

        }


    }, [selectedCandidate]);

    const onSubmit = async (data: CandidateUpdateSchema): Promise<void> => {

        const formData = new FormData();

        // Append text fields
        formData.append("title", data.title);
        if (data.email) {
            formData.append("email", data.email);
        }
        if (data.link) {
            formData.append("link", data.link);
        }
        if (data.notes) {
            formData.append("notes", data.notes);
        }
        if (data.snippet) {
            formData.append("snippet", data.snippet);
        }
        if (data.countryObject) {
            formData.append("countryObject", JSON.stringify(data.countryObject));
        }

        // Append the file if a new one is selected
        if (data.cv instanceof File) {
            formData.append("cv", data.cv);
        }

        await updateMutationMutateAsync(
            {id: selectedCandidate.id ?? "", data: formData},
            {
                onSuccess: () => {
                    toast.success(`Candidate updated.`);
                    void refetchCandidates();
                    selectedCandidate(null);
                },
                onError: () => {
                    toast.error("Candidate update error.");
                },
            }
        );
    };

    const [cvFile, setCvFile] = useState<File | null>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setCvFile(file);
            setValue("cv", file, {shouldValidate: false});
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCvFile(file);
            setValue("cv", file, {shouldValidate: false});
        }
    };

    const [countriesQuery, setCountriesQuery] = useState<CountriesQuery>({
        maxItemCount: 6,
    });

    const {data: countriesQueryData} = useQuery(countriesQueryOptions(true, countriesQuery));


    const searchCountries = (value: string) => {
        setCountriesQuery((prev) => ({
            ...prev,
            name: value
        }));
    };
    const [countryOpen, setCountryOpen] = useState(false);
    const selectedCountry = watch("countryObject");

    return (
        <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
            <SheetContent side="right"
                          className="w-full sm:max-w-xl p-0 border-l border-zinc-200/80 shadow-2xl bg-white">
                <div className="flex flex-col h-full bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/50 px-8 py-5">
                        <SheetTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                            Update Candidate Dossier
                        </SheetTitle>
                    </div>

                    {/* Content Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile
                                Name/Title</label>
                            <input
                                id="title"
                                {...register("title")}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                placeholder="Candidate name or profile title..."
                            />

                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <label
                                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                <Flag size={12} className="text-zinc-400"/>
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
                                            <span
                                                className="text-zinc-400 font-normal normal-case">Select location...</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400"/>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-zinc-200 rounded-xl shadow-lg"
                                    align="start">
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
                                                                setValue("countryObject", {
                                                                    id: c.id,
                                                                    name: c.name,
                                                                }, {shouldValidate: true});
                                                                setCountryOpen(false);
                                                            }}
                                                            className="cursor-pointer text-xs flex items-center justify-between hover:bg-zinc-50 p-2"
                                                        >
                                                            <span
                                                                className="uppercase font-semibold text-zinc-750">{c.name}</span>
                                                            {selectedCountry?.id === c.id && (
                                                                <Check className="h-4 w-4 text-indigo-600"/>
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            ) : (
                                                <CommandEmpty className="text-xs p-3 text-zinc-500 text-center">No
                                                    location found.</CommandEmpty>
                                            )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.countryObject && (
                                <p className="text-[10px] text-rose-600 font-semibold">
                                    {errors.countryObject.name?.message || errors.countryObject.id?.message || errors.countryObject.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label
                                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                <Link2 size={12} className="text-zinc-400"/>
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
                        <div className="space-y-1.5">
                            <label
                                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                <FileText size={12} className="text-zinc-400"/>
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
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile
                                Link</label>
                            <input
                                {...register("link")}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                placeholder="LinkedIn or GitHub link..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email
                                Address</label>
                            <input
                                {...register("email")}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Update
                                CV</label>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer",
                                    cvFile ? "border-emerald-300 bg-emerald-50" : "border-zinc-200"
                                )}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    id="cv-upload"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="cv-upload" className="text-xs font-bold uppercase text-zinc-600">
                                    {cvFile ? cvFile.name : "Click or Drop to Replace CV"}
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* Footer Controls */}
                    <div className="border-t border-zinc-200 bg-zinc-50 px-8 py-4 flex gap-2">
                        <button
                            disabled={isPendingUpdate}
                            onClick={handleSubmit(onSubmit)}
                            className="h-10 w-full rounded-xl bg-zinc-950 text-white text-xs font-bold uppercase hover:bg-zinc-850 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            {isPendingUpdate && <Spinner className="w-3.5 h-3.5"/>} Confirm & Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCandidate(null)}
                            className="h-10 px-6 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold uppercase hover:bg-zinc-50 transition-all active:scale-98 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}