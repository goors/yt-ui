import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import {
    ChevronLeft,
    ChevronRight,
    FileJson,
    Globe,
    Edit3,
    Flag,
    Check,
    Mail,
    X,
    Briefcase,
    FolderGit2,
    Award,
    Languages,
} from "lucide-react";
import LinkedinIcon from "@/components/icons/linkedin.tsx";
import GithubIcon from "@/components/icons/github.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { candidateUpdateSchema, CandidateUpdateSchema } from "@/validators/candidates/candidate-update.ts";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CandidatesQuery } from "@/validators/candidates/candidates-query.ts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { candidatesQueryOptions } from "@/queries/candidates/candidates-query-options.ts";
import { candidatesQueryFiltersOptions } from "@/queries/candidates/candidates-query-filters-options.ts";
import CandidateSideSheet from "@/components/candidates/info.tsx";
import { toast } from "sonner";
import { candidatesUpdatePositionsStatusMutation } from "@/mutations/candidates/candidates-update-mutation.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {IconFileCv} from "@tabler/icons-react";
import {candidatesCvMutation} from "@/mutations/candidates/candidates-cv-mutation.ts";

export const CopyableEmail = ({ email }: { email: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-900 mt-1 transition-colors cursor-pointer"
            title="Click to copy email"
        >
            {copied ? <Check size={10} className="text-emerald-500" /> : <Mail size={10} />}
            {email}
        </button>
    );
};

export default function Candidates() {
    const [selectedRaw, setSelectedRaw] = useState<any | null>(null);
    const [editingCandidate, setEditingCandidate] = useState<any | null>(null);

    const {
        data: candidatesQueryFiltersData,
    } = useQuery(candidatesQueryFiltersOptions(true));
    
    const [candidatesQuery, setCandidatesQuery] = useState<CandidatesQuery>({
        page: 1,
        pageSize: 25,
    });

    const [candidatesQuerySearch, setCandidatesQuerySearch] = useState<CandidatesQuery>({
        maxItemCount: 6,
    });

    const {
        data: candidatesQuerySearchData,
    } = useQuery(candidatesQueryOptions(candidatesQuerySearch.text !== undefined, "search", candidatesQuerySearch));

    const handlePageChange = (newPage: number) => {
        setCandidatesQuery((prev) => ({
            ...prev,
            page: Math.max(1, newPage) // Ensure page never goes below 1
        }));
    };

    const handleFiltersChange = (type: 'country' | 'source', value: string) => {
        setCandidatesQuery((prev) => ({
            ...prev,
            [type]: (value !== "All") ? value : undefined,
            page: 1 // Always reset to page 1
        }));
    };

    const {
        data: candidatesQueryData,
        refetch: refetchCandidates,
    } = useQuery(candidatesQueryOptions(true, "pag", candidatesQuery));


    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<CandidateUpdateSchema>({
        resolver: zodResolver(candidateUpdateSchema),

    });

    // const form = useForm<CandidateUpdateSchema>({
    //     resolver: zodResolver(candidateUpdateSchema),
    // });

    // Sync form values when editingCandidate changes
    useEffect(() => {
        if (editingCandidate) {
            reset({
                link: editingCandidate.link || "",
                email: editingCandidate.email || "",
                title: editingCandidate.name || editingCandidate.snippet || "",
            });
        }
    }, [editingCandidate]);

    const { isPending: isPendingUpdate, mutateAsync: updateMutationMutateAsync } =
        useMutation(candidatesUpdatePositionsStatusMutation);

    const onSubmit = async (data: CandidateUpdateSchema): Promise<void> => {

        const formData = new FormData();

        // Append text fields
        formData.append("title", data.title);
        formData.append("email", data.email);
        formData.append("link", data.link);

        // Append the file if a new one is selected
        if (data.cv instanceof File) {
            formData.append("cv", data.cv);
        }

        await updateMutationMutateAsync(
            { id: editingCandidate.id ?? "", data: formData },
            {
                onSuccess: () => {
                    toast.success(`Candidate updated.`);
                    void refetchCandidates();
                    setEditingCandidate(null);
                },
                onError: () => {
                    toast.error("Candidate update error.");
                },
            }
        );
    };

    const [cvFile, setCvFile] = useState<File | null>(null);

    const [dragActive, setDragActive] = useState(false);

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

    const { isPending: isPendingDownloadCv, mutateAsync: candidatesCvMutationMutateAsync } =
        useMutation(candidatesCvMutation);

    const downloadCv = async (id: string, name: string) =>  {
        await candidatesCvMutationMutateAsync(
            { id },
            {
                onSuccess: (data) => {
                    const url = window.URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.href = url;

                    // Use the filename from the Content-Disposition header if possible,
                    // or a fallback name
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();

                    // Cleanup
                    a.remove();
                    window.URL.revokeObjectURL(url);
                },
                onError: () => {
                    toast.error("Candidate CV download error.");
                },
            }
        );
    }

    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    return (
        <div className="h-screen flex flex-col font-sans bg-zinc-50/50">
            <main className="flex-1 w-full p-0 flex flex-col overflow-hidden">
                {/* Control Header Bar */}
                <div className="px-8 py-4 border-b border-zinc-200 bg-white flex flex-wrap gap-4 items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Registry Records</span>
                            <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Candidates Database</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Search box with autocomplete */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    className="border border-zinc-200 rounded-xl pl-3 pr-8 py-2 text-xs w-52 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white placeholder:text-zinc-400"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCandidatesQuerySearch({ text: val, maxItemCount: 6 });
                                    }}
                                    value={candidatesQuerySearch.text || ""}
                                />
                                {candidatesQuerySearch.text && (
                                    <button
                                        className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-800 transition-colors text-xs cursor-pointer"
                                        onClick={() => {
                                            setCandidatesQuerySearch(prev => ({ ...prev, text: '', maxItemCount: 6 }));
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}

                                {/* Autocomplete Suggestion Dropdown */}
                                {candidatesQuerySearchData && candidatesQuerySearchData.candidates && candidatesQuerySearchData.candidates.length > 0 && (
                                    <div className="absolute top-full mt-2 w-[420px] bg-white border border-zinc-200/80 rounded-xl shadow-xl z-50 py-2 divide-y divide-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                        {candidatesQuerySearchData.candidates.map((c) => (
                                            <div
                                                key={c.id}
                                                className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50/80 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedCandidate(c);
                                                    setCandidatesQuerySearch(prev => ({ ...prev, text: '', maxItemCount: 6 }));
                                                }}
                                            >
                                                {c.data?.avatar ? (
                                                    <img
                                                        src={c.data.avatar}
                                                        alt={c.data.name || c.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-zinc-200/60 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {(c.data?.name || c.name || "?")[0].toUpperCase()}
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-zinc-900">{c.name}</span>
                                                        <span className="text-[9px] font-mono font-bold text-indigo-650 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-full uppercase">
                                                            {c.source}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                                        <span>Score: <strong className="text-zinc-800 font-semibold">{(c.score * 100).toFixed(1)}%</strong></span>
                                                        {c.country && <span>• {c.country}</span>}
                                                    </div>
                                                    {c.text_found && (
                                                        <p
                                                            className="text-[10px] text-zinc-500 line-clamp-1 leading-snug [&_em]:text-indigo-600 [&_em]:font-semibold [&_em]:not-italic mt-0.5"
                                                            dangerouslySetInnerHTML={{ __html: c.text_found }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Country Filter Selector */}
                            <select
                                className="border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl px-3 py-2 text-xs font-semibold uppercase text-zinc-650 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                value={candidatesQuery.country ?? "All"}
                                onChange={(e) => handleFiltersChange('country', e.target.value)}
                            >
                                <option value="All">All Countries</option>
                                {candidatesQueryFiltersData?.countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {/* Source Filter Selector */}
                            <select
                                className="border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl px-3 py-2 text-xs font-semibold uppercase text-zinc-650 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                value={candidatesQuery.source ?? "All"}
                                onChange={(e) => handleFiltersChange('source', e.target.value)}
                            >
                                <option value="All">All Sources</option>
                                {candidatesQueryFiltersData?.sources.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Pagination control */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 mr-4">
                        <span>
                            Page {candidatesQuery.page} of {candidatesQueryData?.total_pages ?? 1}
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={candidatesQuery.page === 1}
                                onClick={() => handlePageChange(candidatesQuery.page - 1)}
                                className="p-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                disabled={candidatesQuery.page >= (candidatesQueryData?.total_pages ?? 1)}
                                onClick={() => handlePageChange(candidatesQuery.page + 1)}
                                className="p-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table list */}
                <div className="flex-1 overflow-auto bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider">
                                <th className="py-4 px-6">Candidate</th>
                                <th className="py-4 px-6">Current Company</th>
                                <th className="py-4 px-6">Dossier Metrics</th>
                                <th className="py-4 px-6">Crawl Status</th>
                                <th className="py-4 px-6">Source</th>
                                <th className="py-4 px-6">Country</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-xs text-zinc-700 divide-zinc-100">
                            {candidatesQueryData?.candidates?.map((c) => (
                                <tr key={c.id} className="hover:bg-zinc-50/40 transition-colors group">
                                    <td
                                        className="cursor-pointer py-4 px-6 font-medium text-zinc-900 flex items-center gap-3.5"
                                        onClick={() => setSelectedCandidate(c)}
                                    >
                                        {/* Avatar element */}
                                        {c.data?.avatar ? (
                                            <img
                                                src={c.data.avatar}
                                                alt={c.data.name || c.name}
                                                className="w-9 h-9 rounded-full object-cover border border-zinc-200/60 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px] font-bold shrink-0">
                                                {(c.data?.name || c.name || "?")[0].toUpperCase()}
                                            </div>
                                        )}

                                        {/* Identity stack */}
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-650 transition-colors">
                                                {c.data?.name || c.name}
                                            </span>
                                            <span className="text-xs text-zinc-500 leading-snug">
                                                {c.snippet && c.snippet.length > 50
                                                    ? `${c.snippet.slice(0, 50)}...`
                                                    : c.snippet || "No biography info available"}
                                            </span>
                                            {c.email && (
                                                <div className="mt-0.5">
                                                    <CopyableEmail email={c.email} />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Current Company */}
                                    <td className="py-4 px-6 text-zinc-800">
                                        {c.data?.current_company?.name ? (
                                            <span className="inline-flex items-center gap-1.5 text-zinc-900 font-semibold bg-zinc-50 border border-zinc-200/50 px-2.5 py-1 rounded-lg text-xs">
                                                <Briefcase size={12} className="text-zinc-500" />
                                                {c.data.current_company.name}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400 font-normal">-</span>
                                        )}
                                    </td>

                                    {/* Dossier Metrics */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {c.data?.projects?.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg uppercase" title={`${c.data.projects.length} Projects`}>
                                                    <FolderGit2 size={11} />
                                                    {c.data.projects.length}
                                                </span>
                                            )}
                                            {c.data?.certifications?.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-lg uppercase" title={`${c.data.certifications.length} Certifications`}>
                                                    <Award size={11} />
                                                    {c.data.certifications.length}
                                                </span>
                                            )}
                                            {c.data?.languages?.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-lg uppercase" title={`${c.data.languages.length} Languages`}>
                                                    <Languages size={11} />
                                                    {c.data.languages.length}
                                                </span>
                                            )}
                                            {!c.data?.projects?.length && !c.data?.certifications?.length && !c.data?.languages?.length && (
                                                <span className="text-zinc-400 font-normal">-</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Status caps */}
                                    <td className="py-4 px-6">
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit",
                                                c.crawled
                                                    ? "border-emerald-250 bg-emerald-50 text-emerald-700 font-semibold"
                                                    : "border-zinc-200 bg-zinc-100 text-zinc-500"
                                            )}
                                        >
                                            {c.crawled && <Check className="w-3 h-3" />}
                                            {c.crawled ? "Crawled" : "Pending"}
                                        </span>
                                    </td>

                                    {/* Source link */}
                                    <td className="py-4 px-6">
                                        <a
                                            href={c.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-zinc-650 hover:text-indigo-600 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            {c.source === "linkedin" ? <LinkedinIcon size={12} /> : c.source === "github" ? <GithubIcon size={12} /> : <Globe size={12} />}
                                            {c.source}
                                        </a>
                                    </td>

                                    {/* Country */}
                                    <td className="py-4 px-6 text-zinc-650">
                                        <span className="flex items-center gap-2 font-semibold">
                                            <Flag size={12} className="text-zinc-400" />
                                            {c.country}
                                        </span>
                                    </td>

                                    {/* Row Action Controls */}
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setEditingCandidate(c)}
                                                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                                title="Update Candidate Dossier"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedRaw(c)}
                                                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                                title="View Raw JSON Object"
                                            >
                                                <FileJson size={14} />
                                            </button>

                                            {c.cv &&
                                            <button
                                                onClick={() => void downloadCv(c.id, c.data?.name || c.name)}
                                                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                                title="Download cv"
                                            >
                                                <IconFileCv size={14} />
                                            </button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Dossier info sheet */}
            <CandidateSideSheet
                selectedCandidate={selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
            />

            {/* Editing candidates sheet */}
            <Sheet open={!!editingCandidate} onOpenChange={(open) => !open && setEditingCandidate(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l border-zinc-200/80 shadow-2xl bg-white">
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
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile Name/Title</label>
                                <input
                                    {...register("title")}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                    placeholder="Candidate name or profile title..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile Link</label>
                                <input
                                    {...register("link")}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                    placeholder="LinkedIn or GitHub link..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                                <input
                                    {...register("email")}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-zinc-50/30 hover:bg-zinc-50/80 focus:bg-white"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Update CV</label>
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
                                {isPendingUpdate && <Spinner className="w-3.5 h-3.5" />} Confirm & Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingCandidate(null)}
                                className="h-10 px-6 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-bold uppercase hover:bg-zinc-50 transition-all active:scale-98 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Raw JSON modal using custom themed Dialog */}
            {selectedRaw && (
                <Dialog open={!!selectedRaw} onOpenChange={(open) => !open && setSelectedRaw(null)}>
                    <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-zinc-950 border border-zinc-850 rounded-2xl p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="px-6 py-4 border-b border-zinc-850 bg-zinc-900/40 flex flex-row items-center justify-between shrink-0">
                            <div>
                                <DialogTitle className="text-sm font-bold uppercase tracking-wider text-zinc-150 flex items-center gap-2">
                                    <FileJson size={16} className="text-indigo-400" />
                                    Raw Candidate Record
                                </DialogTitle>
                                <p className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">
                                    ID: {selectedRaw.id}
                                </p>
                            </div>
                            <Button
                                onClick={() => setSelectedRaw(null)}
                                variant="ghost"
                                className="h-7 w-7 rounded-lg border border-zinc-800 p-0 flex items-center justify-center bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                            >
                                <X size={12} />
                            </Button>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto p-6 bg-zinc-950 font-mono text-[11px] custom-json-view">
                            <ReactJson
                                src={selectedRaw}
                                collapsed={1}
                                theme="ocean"
                                style={{ backgroundColor: 'transparent' }}
                                displayDataTypes={false}
                                displayObjectSize={true}
                                enableClipboard={true}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
