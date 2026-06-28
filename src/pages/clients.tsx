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
    X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientPosition, clientPosition, ClientsModel, clientsModel } from "@/validators/clients/client-add";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {useMutation, useQueries, useQuery} from "@tanstack/react-query";
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
import { MultiAsyncSelect } from "@/components/ui/async-select";
import { cn } from "@/lib/utils";
import { clientsCreatePositionMutation } from "@/mutations/clients/clients-create-position-mutation";
import { clientsPositionsQueryOptions } from "@/queries/clients/clients-positions-query-options";
import { ClientPositionQueryResponse } from "@/validators/clients/clients-position-query-response";
import { clientsUpdatePositionsMutation } from "@/mutations/clients/clients-update-position-mutation";
import { CandidateTable, statuses } from "@/components/candidates/consider-table.tsx";
import {
    candidatesUpdatePositionsStatusMutation
} from "@/mutations/candidates/candidates-update-position-status-mutation";
import { CandidatePositionStatusUpdate } from "@/validators/candidates/candidates-position-status-update";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Summary } from "@/components/candidates/summary.tsx";
import {IconReload} from "@tabler/icons-react";
import {clientsPositionsJobsQueryOptions} from "@/queries/clients/clients-positions-jobs-query-options";
import PositionComponent from "@/components/clients/position.tsx";
import { DroppableColumn } from "@/components/clients/droppable-column";
import { SortableCandidate } from "@/components/clients/sortable-candidate";
import { ClientProfileSheet } from "@/components/clients/client-profile-sheet";
import { PositionDossierSheet } from "@/components/clients/position-dossier-sheet";
import { PotentialCandidatesSheet } from "@/components/clients/potential-candidates-sheet";
import { SelectedCandidatesSheet } from "@/components/clients/selected-candidates-sheet";

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
        isLoading: isLoadingClientsPositions,
        data: clientsPositionsQueryData,
        refetch: refetchClientsPositions,
    } = useQuery(clientsPositionsQueryOptions(activeId !== null, clientsPositionsQuery, activeId ?? ""));

    const jobsQueries = useQueries({
        queries: clientsPositionsQueryData
            ? clientsPositionsQueryData.map((pos) => {
                const baseOptions = clientsPositionsJobsQueryOptions(
                    !!activeId,
                    activeId ?? "",
                    pos.id
                );

                return {
                    ...baseOptions,
                    refetchInterval: (query) => {
                        const data = query.state.data;

                        // 1. If data is undefined (loading/no initial response), poll every 2 seconds
                        if (data === undefined) {
                            return 2000;
                        }

                        // 2. If data is explicitly null, return true (polls at the default/fastest interval)
                        if (data === null) {
                            return true;
                        }

                        // 3. If data is an empty array, return true (polls at the default/fastest interval)
                        if (Array.isArray(data) && data.length === 0) {
                            return true;
                        }

                        // 4. If it's a populated array or object, check if status is 'completed'
                        const isCompleted = Array.isArray(data)
                            ? data.some(job => job?.status === 'completed')
                            : data?.status === 'completed';

                        void refetchClientsPositions();
                        // 5. Stop polling if completed, otherwise keep polling every 2 seconds
                        return isCompleted ? false : 2000;
                    }
                };
            })
            : [],
    });


    const [jobs, setJobs] = useState({});

    useEffect(() => {
        if (jobsQueries) {
            const allJobsData = jobsQueries.map((query) => query.data);

            // 1. Create a local temporary object to batch the updates
            const nextJobs = {};
            let hasData = false;

            for (const rec of allJobsData) {
                if (Array.isArray(rec) && rec.length > 0) {
                    const job = rec[0];

                    // 2. Assign keys directly to our temporary object
                    nextJobs[job.position_id] = {
                        phase: job.phase,
                        status: job.status
                    };
                    hasData = true;
                }
            }

            // 3. Call setJobs EXACTLY ONCE outside the loop, only if we found data
            if (hasData) {
                setJobs((prevJobs) => ({
                    ...prevJobs,
                    ...nextJobs // Merges all positions at the exact same time
                }));
            }
        }
// 4. Use stringified data comparison to avoid reference-triggering on jobsQueries
    }, [JSON.stringify(jobsQueries.map(q => q.data))]);

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
                    setIsEditing(false);
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
                    setIsEditing(false);
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
                    void refetchClientsPositions();
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

    const [potentialCandidates, setPotentialCandidates] = useState<string | null>(null);
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
            <div className="border-b border-zinc-200 bg-white flex-none px-8 py-3.5 flex items-center justify-between">
                <nav className="flex items-center space-x-6 overflow-x-auto">
                    {clients.map(c => (
                        <button
                            key={c.id}
                            onClick={() => { handleSelect(c.id); }}
                            className={cn(
                                "whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
                                activeId === c.id
                                    ? "text-indigo-600"
                                    : "text-zinc-400 hover:text-zinc-800"
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
                        className="text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold uppercase"
                        title="Register New Client"
                    >
                        <Plus size={14} />
                        <span>New Client</span>
                    </button>
                </nav>
            </div>

            <main className="flex-1 overflow-y-auto p-8 bg-white">
                <div className="w-full text-left pb-20">
                    {activeClient ? (
                        <div className="w-full">
                            {/* Flat 100% Width Client Info Header */}
                            <div className="w-full pb-6 border-b border-zinc-200 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl uppercase tracking-tight text-zinc-950">{activeClient.company}</h1>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded font-mono">
                                            Client Dossier
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-zinc-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-zinc-400" />
                                            <span className="text-zinc-400 uppercase text-[10px] font-bold">Contact:</span>
                                            <span className="font-semibold text-zinc-900">{activeClient.contact}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-zinc-400" />
                                            <span className="text-zinc-400 uppercase text-[10px] font-bold">Email:</span>
                                            <a href={`mailto:${activeClient.email}`} className="font-semibold text-zinc-900 hover:text-indigo-600 transition-colors">{activeClient.email}</a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-zinc-400" />
                                            <span className="text-zinc-400 uppercase text-[10px] font-bold">Phone:</span>
                                            <span className="font-semibold text-zinc-900">{activeClient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-zinc-400" />
                                            <span className="text-zinc-400 uppercase text-[10px] font-bold">Address:</span>
                                            <span className="font-semibold text-zinc-900">{activeClient.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <Button
                                        onClick={() => clientAction(activeClient?.id)}
                                        variant="outline"
                                        className="flex items-center gap-1.5 border-zinc-200 bg-white hover:bg-zinc-100 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-zinc-700 h-9 cursor-pointer"
                                    >
                                        <Edit3 size={13} /> Edit Profile
                                    </Button>
                                    <Button
                                        onClick={() => setEditingIdx("new")}
                                        className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all h-9 cursor-pointer"
                                    >
                                        <Plus size={13} /> Add Position
                                    </Button>
                                </div>
                            </div>

                            {/* Flat 100% Width Requested Positions Table Sticked to Separator */}
                            <div className="w-full">
                                {isLoadingClientsPositions ? (
                                    <div className="py-16 text-center flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                                    </div>
                                ) : clientsPositionsQueryData && clientsPositionsQueryData.length > 0 ? (
                                    <div className="w-full overflow-x-auto bg-white">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-zinc-500 border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-wider">
                                                    <th className="py-4 px-6">Position Name & Purpose</th>
                                                    <th className="py-4 px-6">Target Countries</th>
                                                    <th className="py-4 px-6">Job Processing</th>
                                                    <th className="py-4 px-6">Signals & Risks</th>
                                                    <th className="py-4 px-6 text-right">Candidate Pipelines</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y text-xs text-zinc-700 divide-zinc-100">
                                                {clientsPositionsQueryData.map((p) => (
                                                    <PositionComponent
                                                        key={p.id}
                                                        p={p}
                                                        jobs={jobs}
                                                        editPosition={editPosition}
                                                        setPotentialCandidates={setPotentialCandidates}
                                                        setShowCandidates={setShowCandidates}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 flex flex-col items-center justify-center">
                                        <Briefcase className="w-8 h-8 text-zinc-300 mb-2" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">No Positions Registered</h4>
                                        <p className="text-xs text-zinc-400 mt-1">Get started by creating a position for this client dossier.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : <div className="text-zinc-450 text-xs uppercase font-bold font-mono tracking-wider">Select or create a client.</div>}
                </div>
            </main>


            {/* Edit/Create Client Profile Sheet */}
            <ClientProfileSheet
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                activeId={activeId}
                form={form}
                onSubmit={onSubmit}
                isPendingClientCreate={isPendingClientCreate}
                isPendingClientUpdate={isPendingClientUpdate}
            />

            {/* Edit/Create Position Dossier Sheet */}
            <PositionDossierSheet
                editingIdx={editingIdx}
                setEditingIdx={setEditingIdx}
                formPositions={formPositions}
                onCreatePosition={onCreatePosition}
                onUpdatePosition={onUpdatePosition}
                isFetchingClients={isFetchingClients}
                countries={countries}
                searchCountries={searchCountries}
                resetPositionForm={resetPositionForm}
                isPendingClientPositionCreate={isPendingClientPositionCreate}
                isPendingClientPositionUpdate={isPendingClientPositionUpdate}
            />

            {/* Possible Candidates Table Sheet */}
            <PotentialCandidatesSheet
                potentialCandidates={potentialCandidates}
                setPotentialCandidates={setPotentialCandidates}
                clientsPositionsQueryData={clientsPositionsQueryData}
                refetchClientsPositions={refetchClientsPositions}
                handleStatusUpdate={handleStatusUpdate}
                onCrawl={onCrawl}
                isPendingCandidatePositionUpdate={isPendingCandidatePositionUpdate}
            />

            {/* Selected Candidates Kanban Sheet */}
            <SelectedCandidatesSheet
                showCandidates={showCandidates}
                setShowCandidates={setShowCandidates}
                sensors={sensors}
                activeDragCandidateId={activeDragCandidateId}
                setActiveDragCandidateId={setActiveDragCandidateId}
                handleStatusUpdate={handleStatusUpdate}
                setDossierCandidate={setDossierCandidate}
                dossierCandidate={dossierCandidate}
                closeDossier={closeDossier}
            />

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
