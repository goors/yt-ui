import { useEffect, useState } from "react";
import { useSearch, useNavigate } from '@tanstack/react-router';
import {
    Plus,
    Edit3,
    MapPin,
    Phone,
    Mail,
    User,
    Loader2,
    Briefcase,
    X,
    FileText,
    Check,
    Video,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientPosition, clientPosition, ClientsModel, clientsModel } from "@/validators/clients/client-add";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { countriesQueryOptions } from "@/queries/misc/countries-query-options";
import { ClientsQuery } from "@/validators/clients/clients-query";
import { CountriesQuery } from "@/validators/misc/countries-query";
import { clientsQueryOptions } from "@/queries/clients/clients-query-options";
import { ClientsQueryResponse } from "@/validators/clients/clients-query-response";
import { CountriesQueryResponse } from "@/validators/misc/countries-query-response";
import { clientsCreateMutation } from "@/mutations/clients/clients-create-mutation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { clientsUpdateMutation } from "@/mutations/clients/clients-update-mutation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import React from "react";
import { MultiAsyncSelect } from "@/components/ui/async-select";
import { cn } from "@/lib/utils";
import { clientsCreatePositionMutation } from "@/mutations/clients/clients-create-position-mutation";
import { clientsPositionsQueryOptions } from "@/queries/clients/clients-positions-query-options";
import { Badge } from "@/components/ui/badge";
import { ClientPositionQueryResponse } from "@/validators/clients/clients-position-query-response";
import { clientsUpdatePositionsMutation } from "@/mutations/clients/clients-update-position-mutation";
import { CandidateTable, statuses } from "@/components/candidates/consider-table.tsx";
import {
    candidatesUpdatePositionsStatusMutation
} from "@/mutations/candidates/candidates-update-position-status-mutation.ts";
import { CandidatePositionStatusUpdate } from "@/validators/candidates/candidates-position-status-update.ts";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Summary } from "@/components/candidates/summary.tsx";
import {IconFileCv, IconReload} from "@tabler/icons-react";
import {candidatesCvMutation} from "@/mutations/candidates/candidates-cv-mutation.ts";

interface DroppableColumnProps {
    id: string;
    title: string;
    count?: number;
    children: React.ReactNode;
}

function DroppableColumn({ id, title, count = 0, children }: DroppableColumnProps) {
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

interface SortableCandidateProps {
    candidate: any;
    handleStatusUpdate: any;
    positionId: string;
    setDossierCandidate: (candidate: any) => void;
}

export function EditCandidateDialog({ candidate, children, handleStatusUpdate, positionId, candidateId }) {
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

function SortableCandidate({ candidate, handleStatusUpdate, positionId, setDossierCandidate }: SortableCandidateProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.candidateId });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition: transition,
    };

    const openDossier = () => {
        if (candidate.candidate_profiling === "done") {
            setDossierCandidate(candidate);
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing hover:border-zinc-300/80 relative"
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-xs text-zinc-950 leading-snug group-hover:text-indigo-650 transition-colors">
                    {candidate.name || "No Title"}
                </h3>
                <span className="text-[9px] text-zinc-400 bg-zinc-50 border border-zinc-200/50 px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0">
                    {candidate.source}
                </span>
            </div>

            <p className="text-[10px] text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
                {candidate.snippet}
            </p>

            <div
                className="flex flex-col border border-zinc-100 rounded-lg bg-zinc-50/50 p-3 gap-2.5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Transcript Crawl Status */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        Transcript Crawl
                    </span>
                    <div
                        className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1",
                            candidate.transcript_crawled_status === "done"
                                ? "border-emerald-250 bg-emerald-50 text-emerald-700 font-semibold"
                                : "border-zinc-200 bg-zinc-100 text-zinc-500"
                        )}
                    >
                        {candidate.transcript_crawled_status === "done" && <Check className="w-2.5 h-2.5" />}
                        {!candidate.video_url ? "No Video" : (candidate.transcript_crawled_status || "Processing")}
                    </div>
                </div>

                {/* Profiling Status */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        Profiling Status
                    </span>
                    <div
                        className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1",
                            candidate.candidate_profiling === "done"
                                ? "border-emerald-250 bg-emerald-50 text-emerald-700 font-semibold"
                                : "border-zinc-200 bg-zinc-100 text-zinc-500"
                        )}
                    >
                        {candidate.candidate_profiling === "done" && <Check className="w-2.5 h-2.5" />}
                        {candidate.candidate_profiling ?? "Not started"}
                    </div>
                </div>

                {/* Video URL Input Field */}
                <div className="relative mt-1">
                    <Video className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-450" />
                    <input
                        type="text"
                        placeholder="Paste video URL here..."
                        defaultValue={candidate.video_url || ""}
                        onPointerDown={(e) => e.stopPropagation()}
                        onBlur={(e) => {
                            handleStatusUpdate({ video_url: e.target.value, status: candidate.status }, positionId, candidate.candidateId);
                            candidate.video_url = e.target.value;
                        }}
                        className="w-full text-[10px] bg-white border border-zinc-200 rounded-lg pl-8 pr-2 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-400"
                    />
                </div>

                {/* ICON-ONLY ACTION ROW */}
                <div className="flex items-center gap-1 mt-1 border-t border-zinc-200 pt-3">
                    {/* 1. Dossier (Left) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); openDossier(); }}
                        disabled={candidate.candidate_profiling !== "done"}
                        className={cn(
                            "flex-1 flex items-center justify-center p-2 rounded-lg transition-all border",
                            candidate.candidate_profiling === "done"
                                ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                                : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                        )}
                        title="View Candidate Dossier"
                    >
                        <User className="w-4 h-4" />
                    </button>

                    {/* 2. Transcript (Middle) */}
                    <TranscriptDialog candidate={candidate}>
                        <button
                            disabled={candidate.transcript_crawled_status !== "done"}
                            className={cn(
                                "flex-1 flex items-center justify-center p-2 rounded-lg transition-all border",
                                candidate.transcript_crawled_status === "done"
                                    ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                                    : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                            )}
                            title="View Transcript"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    </TranscriptDialog>

                    {/* 3. Edit (Right) */}
                    <EditCandidateDialog candidate={candidate} handleStatusUpdate={handleStatusUpdate} positionId={positionId} candidateId={candidate.candidateId}>
                        <button
                            className="flex-1 flex items-center justify-center p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-950 hover:text-white transition-all"
                            title="Edit Candidate Details"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </EditCandidateDialog>

                    {candidate.cv &&
                    <button
                        onClick={() => void downloadCv(candidate.candidateId, candidate.name)}
                        disabled={isPendingDownloadCv}
                        className={cn(
                            "cursor-pointer flex-1 flex items-center justify-center p-2 rounded-lg transition-all border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                        )}
                        title="Download cv"
                    >
                        <IconFileCv className="w-4 h-4" />
                    </button>
                    }

                </div>
            </div>
        </div>
    );
}

export function TranscriptDialog({ candidate }) {
    const cues = candidate.transcriptCues || [];

    const formatTime = (totalSeconds) => {
        const seconds = Math.floor(totalSeconds || 0);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Flatten nested cues for cleaner rendering
    const normalizedCues = cues.flatMap((cue) => {
        if (Array.isArray(cue)) return cue;
        return [cue];
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    disabled={candidate.transcript_crawled_status !== "done"}
                    onPointerDown={(e) => e.stopPropagation()}
                    title="View Transcript"
                    className={cn(
                        "flex-1 flex items-center justify-center p-2 rounded-lg transition-all border",
                        candidate.transcript_crawled_status === "done"
                            ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-950 hover:text-white"
                            : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                    )}
                >
                    <FileText className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-row items-center justify-between shrink-0">
                    <div>
                        <DialogTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                            Interview Transcript
                        </DialogTitle>
                        <p className="text-[10px] text-zinc-400 uppercase font-mono mt-0.5">
                            Candidate: {candidate.name}
                        </p>
                    </div>
                </DialogHeader>

                {/* Scrollable area for the transcript */}
                <ScrollArea className="flex-1 bg-zinc-50/30 p-6 overflow-y-auto">
                    {normalizedCues.length > 0 ? (
                        <div className="relative pl-6 border-l border-zinc-200 ml-3 space-y-6 py-2">
                            {normalizedCues.map((cue, index) => (
                                <div key={index} className="relative space-y-1">
                                    {/* Timeline bullet */}
                                    <div className="absolute left-[-31px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    </div>

                                    {/* Cue Header */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-zinc-900">
                                            {cue.speaker_name || "Speaker"}
                                        </span>
                                        <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                            {formatTime(cue.start_time)} - {formatTime(cue.end_time)}
                                        </span>
                                    </div>

                                    {/* Text Content */}
                                    <p className="text-xs text-zinc-650 leading-relaxed pt-0.5">
                                        {cue.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                            <FileText className="w-8 h-8 mb-2 text-zinc-300" />
                            <p className="text-xs font-medium">No transcript text available.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export default function Clients() {
    const [clients, setClients] = useState<ClientsQueryResponse>([]);
    const [countries, setCountries] = useState<CountriesQueryResponse>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIdx, setEditingIdx] = useState<string | null>(null);

    const activeClient = clients.find(c => c.id === activeId);

    const resetPositionForm = () => {
        formPositions.reset({
            name: "",
            purpose: "",
            positiveSignals: [],
            riskIndicators: [],
            countries: []
        });
        setCountries([]);
    };

    const form = useForm<ClientsModel>({
        resolver: zodResolver(clientsModel),
        defaultValues: { company: "", contact: "", address: "", phone: "", email: "" }
    });

    const formPositions = useForm<ClientPosition>({
        resolver: zodResolver(clientPosition),
        defaultValues: {
            name: "",
            purpose: "",
            positiveSignals: [],
            riskIndicators: [],
            countries: []
        }
    });

    useEffect(() => {
        if (activeClient) form.reset(activeClient);
    }, [activeClient, form]);

    const [countriesQuery, setCountriesQuery] = useState<CountriesQuery>({
        maxItemCount: 6,
    });

    const {
        data: countriesQueryData,
        refetch: refetchCountries,
    } = useQuery(countriesQueryOptions(true, countriesQuery));

    const [clientsQuery, setClientsQuery] = useState<ClientsQuery>({
        page: 1,
        pageSize: 10,
    });

    const {
        data: clientsQueryData,
        isFetching: isFetchingClients,
        refetch: refetchClients,
    } = useQuery(clientsQueryOptions(true, clientsQuery));

    const [clientsPositionsQuery, setClientsPositionsQuery] = useState<ClientsQuery>({
        page: 1,
        pageSize: 10,
        topK: 30
    });

    const {
        data: clientsPositionsQueryData,
        refetch: refetchClientsPositions,
    } = useQuery(clientsPositionsQueryOptions(activeId !== null, clientsPositionsQuery, activeId ?? ""));

    useEffect(() => {
        if (countriesQueryData) {
            setCountries(countriesQueryData);
        }
    }, [countriesQueryData]);

    const { isPending: isPendingClientCreate, mutateAsync: clientsCreateMutationMutateAsync } =
        useMutation(clientsCreateMutation);

    const onSubmit = async (data: ClientsModel): Promise<void> => {
        if (activeId !== "new") {
            void onUpdate(data);
            return;
        }
        await clientsCreateMutationMutateAsync(
            data,
            {
                onSuccess: () => {
                    toast.success(`Client created: ${data.company}.`);
                    void refetchClients();
                },
                onError: () => {
                    toast.error("Client create error.");
                },
            }
        );
    };

    const { isPending: isPendingClientUpdate, mutateAsync: clientsUpdateMutationMutateAsync } =
        useMutation(clientsUpdateMutation);

    const onUpdate = async (data: ClientsModel): Promise<void> => {
        await clientsUpdateMutationMutateAsync(
            { id: activeId ?? "", data },
            {
                onSuccess: () => {
                    toast.success(`Client updated ${data.company}.`);
                    void refetchClients();
                },
                onError: () => {
                    toast.error("Client update error.");
                },
            }
        );
    };

    const { isPending: isPendingClientPositionCreate, mutateAsync: clientsCreatePositionMutationMutateAsync } =
        useMutation(clientsCreatePositionMutation);

    const onCreatePosition = async (data: ClientPosition): Promise<void> => {
        await clientsCreatePositionMutationMutateAsync(
            { id: activeId ?? "", data },
            {
                onSuccess: () => {
                    toast.success(`Position created ${data.name}.`);
                    void refetchClients();
                },
                onError: () => {
                    toast.error("Position create error.");
                },
            }
        );
    };

    const { isPending: isPendingClientPositionUpdate, mutateAsync: clientsUpdatePositionsMutationMutationMutateAsync } =
        useMutation(clientsUpdatePositionsMutation);

    const onUpdatePosition = async (data: ClientPosition, positionId: string): Promise<void> => {
        await clientsUpdatePositionsMutationMutationMutateAsync(
            { id: activeId ?? "", data, position_id: positionId },
            {
                onSuccess: () => {
                    toast.success(`Position updated ${data.name}.`);
                    void refetchClientsPositions();
                },
                onError: () => {
                    toast.error("Position update error.");
                },
            }
        );
    };

    const { isPending: isPendingCandidatePositionUpdate, mutateAsync: candidatesUpdatePositionsStatusMutationMutateAsync } =
        useMutation(candidatesUpdatePositionsStatusMutation);

    const handleStatusUpdate = async (data: CandidatePositionStatusUpdate, positionId: string, candidateId: string): Promise<void> => {
        data.paradigm_baseline = "is_metaphorical"

        await candidatesUpdatePositionsStatusMutationMutateAsync(
            { id: candidateId ?? "", data, position_id: positionId },
            {
                onSuccess: () => {
                    toast.success(`Position updated.`);
                    void refetchClientsPositions();
                },
                onError: () => {
                    toast.error("Position update error.");
                },
            }
        );
    };

    const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
    const [activeDragCandidateId, setActiveDragCandidateId] = useState<string | null>(null);
    const [showCandidates, setShowCandidates] = useState<any | null>(null);

    const onCrawl = async (id: string, source: string) => {
        console.log(id);
        console.log(source);
    };

    const clientAction = (id?: string) => {
        setActiveId(id ?? null);
        setIsEditing(true);
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const searchCountries = (value: string) => {
        setCountriesQuery((prev) => ({
            ...prev,
            name: value
        }));
    };

    const editPosition = (position: ClientPositionQueryResponse) => {
        formPositions.reset({
            name: position.name,
            positiveSignals: position.positiveSignals,
            riskIndicators: position.riskIndicators,
            purpose: position.purpose,
            countries: position.countries,
        });
        setCountries(position.countries);
        setEditingIdx(position.id);
    };

    const [dossierCandidate, setDossierCandidate] = useState<any | null>(null);

    const closeDossier = () => {
        setDossierCandidate(null);
    };

    const search = useSearch({ from: '/' }); // 'from' must match the route path
    const navigate = useNavigate();

// 2. Sync URL changes to your state
    useEffect(() => {
        const idFromUrl = search.id;
        if (idFromUrl && idFromUrl !== activeId && activeId !== "new") {
            setActiveId(idFromUrl);
            setIsEditing(false);
        }
    }, [search.id, activeId]);

// 3. Update your handler to use navigate
    const handleSelect = (id) => {
        setActiveId(id);
        navigate({
            search: { id: id },
        });
        setIsEditing(false);
    };

    useEffect(() => {
        if (clientsQueryData && clientsQueryData.length > 0) {
            setClients(clientsQueryData);

            // Only auto-select if there is NO ID in the URL
            if (!search.id) {
                handleSelect(clientsQueryData[0].id);
            }
        }
    }, [clientsQueryData, search.id]); // Added search.id as a dependency

    if (isFetchingClients) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden text-zinc-900">
            {/* Header Control Center with tabs */}
            <div className="border-b border-zinc-200/80 flex items-center justify-between bg-white flex-none px-8 py-3">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Registry Admin</span>
                        <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Client Accounts</h2>
                    </div>
                    <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/60">
                        {clients.map(c => (
                            <button
                                key={c.id}
                                onClick={() => { handleSelect(c.id); }}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all uppercase tracking-wider",
                                    activeId === c.id
                                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/40"
                                        : "text-zinc-500 hover:text-zinc-855 hover:bg-zinc-50"
                                )}
                            >
                                {c.company}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                clientAction("new");
                                form.reset({
                                    company: "",
                                    contact: "",
                                    address: "",
                                    phone: "",
                                    email: "",
                                });
                            }}
                            className="p-1.5 text-zinc-500 hover:text-indigo-655 hover:bg-white rounded-md transition-all cursor-pointer"
                        >
                            <Plus size={16} />
                        </button>
                    </nav>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-12 bg-zinc-50/20">
                <div className="max-w-3xl pb-20 text-left">
                    {isEditing ? (
                        <form
                            onSubmit={form.handleSubmit(
                                (data) => onSubmit(data),
                                (errors) => console.log("FORM VALIDATION FAILED:", errors)
                            )}
                            className="space-y-8"
                        >
                            <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/80">
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-605 font-mono">
                                    Administration Panel
                                </h2>
                                <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-900">
                                    {activeId === "new" ? "Register New Client" : "Modify Client Registry"}
                                </h1>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-indigo-600 rounded-full" />
                                    Company Details
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {["company", "contact", "phone", "email"].map((f) => {
                                        const Icon = {
                                            company: Briefcase,
                                            contact: User,
                                            phone: Phone,
                                            email: Mail
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
                                    <div className="col-span-2 space-y-1.5">
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
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-zinc-100">
                                <button
                                    type="submit"
                                    disabled={isPendingClientCreate || isPendingClientUpdate}
                                    className="h-10 px-6 rounded-xl bg-zinc-950 text-white text-xs font-bold uppercase hover:bg-zinc-850 transition-all shadow-sm active:scale-98 flex items-center gap-2 cursor-pointer"
                                >
                                    {(isPendingClientCreate || isPendingClientUpdate) && <Spinner className="w-3.5 h-3.5" />} Save Profile
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
                    ) : activeClient ? (
                        <div className="space-y-8">
                            {/* Client Header Info */}
                            <div className="flex justify-between items-center pb-6 border-b border-zinc-200/80">
                                <div className="flex items-center gap-4">

                                    <div>
                                        <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-900">{activeClient.company}</h1>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold font-mono mt-0.5">Client Dossier Registry</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => clientAction(activeClient?.id)}
                                        className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-zinc-700 shadow-sm"
                                    >
                                        <Edit3 size={12} /> Edit Profile
                                    </Button>

                                    <Button
                                        onClick={() => setEditingIdx("new")}
                                        className="flex items-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-zinc-700 shadow-sm"
                                    >
                                        <Edit3 size={12} /> Add position
                                    </Button>

                                </div>
                            </div>

                            {/* Client Grid Details */}
                            <div className="grid grid-cols-2 gap-4 text-zinc-700">
                                <div className="bg-zinc-50/50 border border-zinc-200/40 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-600 shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">Contact Representative</p>
                                        <p className="font-semibold text-sm text-zinc-900">{activeClient.contact}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-50/50 border border-zinc-200/40 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-600 shrink-0">
                                        <Mail size={16} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">Email Address</p>
                                        <p className="font-semibold text-sm text-zinc-900">{activeClient.email}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-50/50 border border-zinc-200/40 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-600 shrink-0">
                                        <Phone size={16} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">Phone Line</p>
                                        <p className="font-semibold text-sm text-zinc-900">{activeClient.phone}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-50/50 border border-zinc-200/40 p-4 rounded-xl flex items-start gap-3.5 shadow-sm">
                                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-600 shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">Location Address</p>
                                        <p className="font-semibold text-sm text-zinc-900">{activeClient.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Requested Positions List */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Requested Positions</span>
                                    <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-full">
                                        {clientsPositionsQueryData?.length ?? 0} Positions
                                    </span>
                                </div>
                                {clientsPositionsQueryData?.map((p) => {
                                    return (
                                        <div key={p.id} className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col gap-4">
                                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-500 to-violet-600" />

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-bold text-sm text-zinc-900 tracking-tight">{p.name}</h5>
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {p.countries.map((country) => (
                                                            <Badge key={country.id} className="text-[9px] uppercase bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 px-2 py-0.5 font-semibold">
                                                                {country.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 items-center">
                                                    <button
                                                        onClick={() => editPosition(p)}
                                                        className="text-[10px] uppercase font-bold text-zinc-500 hover:text-indigo-650 border border-zinc-200 hover:border-indigo-100 px-3 py-1.5 rounded-lg bg-white transition-all shadow-sm hover:bg-indigo-50/20 cursor-pointer"
                                                    >
                                                        Edit Position
                                                    </button>

                                                    <button
                                                        onClick={() => setActiveCandidateId(p.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-755 text-[10px] font-bold uppercase rounded-lg hover:border-zinc-950 hover:bg-zinc-50 hover:text-zinc-955 transition-all shadow-sm cursor-pointer"
                                                    >
                                                        Potential
                                                        <span className="bg-zinc-900 text-white px-2 py-0.5 rounded-full text-[9px]">{p.potentialCandidates?.length ?? 0}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setShowCandidates({
                                                            selectedCandidates: p.selectedCandidates,
                                                            positionId: p.id
                                                        })}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-755 text-[10px] font-bold uppercase rounded-lg hover:border-zinc-950 hover:bg-zinc-50 hover:text-zinc-955 transition-all shadow-sm cursor-pointer"
                                                    >
                                                        Selected
                                                        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[9px]">{p.selectedCandidates ? p.selectedCandidates.length : 0}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-xs text-zinc-500 leading-relaxed">{p.purpose}</p>

                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                                                <div className="space-y-1.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Positive Signals</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {p.positiveSignals.map((sig, s) => (
                                                            <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 uppercase tracking-wider">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                {sig}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Risk Indicators</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {p.riskIndicators.map((risk, r) => (
                                                            <span key={r} className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 uppercase tracking-wider">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                {risk}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : <div className="text-zinc-450 text-xs uppercase font-bold font-mono tracking-wider">Select or create a client.</div>}
                </div>
            </main>

            {/* Edit/Create Position Dossier Sheet */}
            <Sheet
                open={editingIdx !== null}
                onOpenChange={(open) => !open && setEditingIdx(null)}
            >
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
                                (positionsData) => editingIdx === "new" ? onCreatePosition(positionsData) : onUpdatePosition(positionsData, editingIdx),
                                (errors) => console.log("FORM VALIDATION FAILED:", errors)
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
                                            options={countries.map((item) => ({
                                                label: item.name,
                                                value: item.id
                                            })) || []}
                                            defaultValue={editingIdx !== "new" ? countries.map((item) => item.id) || [] : []}
                                            onValueChange={(value) => {
                                                const selectedCountries = value.map((c) => ({
                                                    id: countries.find(x => x.id === c)?.id ?? "",
                                                    name: countries.find(x => x.id === c)?.name ?? ""
                                                }));

                                                if (editingIdx !== "new") {
                                                    const currentCountries = formPositions.getValues("countries") || [];
                                                    const merged = [
                                                        ...currentCountries,
                                                        ...selectedCountries.filter(nc => !currentCountries.find(c => c.id === nc.id))
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
                                                {(formPositions.watch(`${key as "positiveSignals"}`) || []).map((val, i) => (
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
                                                                formPositions.setValue(`${key as "positiveSignals"}`, c.filter((_, idx) => idx !== i));
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
                                        resetPositionForm()
                                        setEditingIdx(null)
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

            {/* Possible Candidates Table Sheet */}
            <Sheet
                open={activeCandidateId !== null}
                onOpenChange={(open) => !open && setActiveCandidateId(null)}
            >
                <SheetContent side="right" className="w-full sm:max-w-4xl p-0 border-l border-zinc-200/80 shadow-2xl bg-white">
                    {activeCandidateId !== null && (() => {
                        const activePos = clientsPositionsQueryData?.find(x => x.id === activeCandidateId);
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
                                            position_id={activeCandidateId}
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

            {/* Selected Candidates Kanban Sheet */}
            {showCandidates && (
                <Sheet open={!!showCandidates} onOpenChange={() => setShowCandidates(null)}>
                    <SheetContent className="min-w-full h-full p-0 flex flex-col overflow-hidden bg-white gap-0 border-none ">
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

                                const activeCandidate = showCandidates.selectedCandidates.find(c => c.candidateId === active.id);
                                const overId = over.id;

                                const targetStatus = statuses.includes(overId as string)
                                    ? overId
                                    : showCandidates.selectedCandidates.find(c => c.candidateId === overId)?.status;

                                if (activeCandidate && targetStatus && activeCandidate.status !== targetStatus) {
                                    void handleStatusUpdate({
                                        status: targetStatus
                                    }, showCandidates.positionId, activeCandidate.candidateId);

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
                                        count={showCandidates.selectedCandidates.filter(c => c.status === status).length}
                                    >
                                        <SortableContext
                                            items={showCandidates.selectedCandidates.filter(c => c.status === status).map(c => c.candidateId)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {showCandidates.selectedCandidates
                                                .filter(c => c.status === status)
                                                .map((candidate) => (
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
                                            const c = showCandidates.selectedCandidates.find(x => x.candidateId === activeDragCandidateId);
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
            )}

            {/* Root-Level Dossier Summary (Candidate Report Card) */}
            {dossierCandidate && !showCandidates && (
                <Summary
                    gemini={dossierCandidate.gemini}
                    final_profile={dossierCandidate.final_profile}
                    analyses={dossierCandidate.analyses}
                    candidateName={dossierCandidate.name || "No Title"}
                    dossierOpen={!!dossierCandidate}
                    closeDossier={closeDossier}
                />
            )}
        </div>
    );
}
