import React, { useEffect, useMemo, useState } from "react";
import ReactJson from "react-json-view";

import {
    Database,
    FileJson,
    X,
    Edit3,
    Trash2,
    Fingerprint,
    ImageIcon,
    Save,
    Link as LinkIcon,
    IdCardIcon,
    BuildingIcon,
    Info,
    Search,
} from "lucide-react";

export default function Cms() {
    const [podcasts, setPodcasts] = useState([]);
    const [selectedRaw, setSelectedRaw] = useState(null);
    const [editingPod, setEditingPod] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);

    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const baseUrl =
                    import.meta.env.VITE_API_URL ||
                    "http://localhost:8001";

                const response = await fetch(
                    `${baseUrl}/predictions`
                );

                const data = await response.json();

                setPodcasts(data ? Object.values(data) : []);
            } catch (err) {
                console.error("Failed to fetch:", err);
            }
        };

        fetchSignals();
    }, []);

    const filteredPodcasts = useMemo(() => {
        if (!search.trim()) return podcasts;

        const q = search.toLowerCase();

        return podcasts.filter((p) => {
            return (
                p?.podcast?.toLowerCase().includes(q) ||
                p?.position?.toLowerCase().includes(q) ||
                p?.speaker?.toLowerCase().includes(q)
            );
        });
    }, [podcasts, search]);

    const getCount = (arr) =>
        Array.isArray(arr)
            ? arr.reduce(
                (acc, item) => acc + (item.count || 0),
                0
            )
            : 0;

    const handleUpdate = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const updates = {
            description: formData.get("description"),
            url: formData.get("url"),
            thumbnail: formData.get("thumbnail"),
            audio: formData.get("audio"),
            title: formData.get("title"),
            podcast: formData.get("title"),
            paradigm_baseline:
                formData.get("paradigm_baseline"),
            speaker: formData.get("speaker"),
            position: formData.get("position"),
            labels: formData
                .get("labels")
                ?.split(", "),
        };

        const baseUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(
            `${baseUrl}/podcasts/${editingPod.id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(updates),
            }
        );

        if (response.ok) {
            setPodcasts((prev) =>
                prev.map((p) =>
                    p.id === editingPod.id
                        ? { ...p, ...updates }
                        : p
                )
            );

            setEditingPod(null);
        }
    };

    const deletePodcast = async (id) => {
        if (!window.confirm("Confirm deletion?"))
            return;

        const baseUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(
            `${baseUrl}/podcasts/${id}`,
            {
                method: "DELETE",
            }
        );

        if (response.ok) {
            setPodcasts((prev) =>
                prev.filter((p) => p.id !== id)
            );
        }
    };

    const CompetencyCell = ({ metrics }) => {
        const greens = getCount(metrics.green_flags);

        const reds = metrics.red_flags_count || 0;

        const total = greens + reds || 1;

        const greenWidth = (greens / total) * 100;

        return (
            <div >
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide">
                    <span className="text-slate-500">
                        Focus {metrics.overall_weight}%
                    </span>

                    <span className="text-blue-600">
                        Clarity {metrics.purity_score}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{
                            width: `${greenWidth}%`,
                        }}
                    />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] font-medium">
                    <span className="text-emerald-600">
                        {greens} Valid
                    </span>

                    <span className="text-red-500">
                        {reds} Errors
                    </span>
                </div>
            </div>
        );
    };

    const getMainPillar = (metrics = {}) => {
        const pillarMapping = {
            Logic_Consistency:
                "Critical Thinking",

            Contextual_Clarity:
                "Contextual Clarity",

            Execution_Velocity:
                "Problem Solving",
        };

        const entries = Object.entries(metrics);

        if (entries.length === 0) return "N/A";

        const winner = entries.reduce((prev, curr) =>
            curr[1].overall_weight >
            prev[1].overall_weight
                ? curr
                : prev
        );

        return (
            pillarMapping[winner[0]] ||
            winner[0].replace(/_/g, " ")
        );
    };

    return (
        <div className=" bg-[#f5f7fb] text-slate-900">
            <main className="w-full">

                {/* TABLE */}
                <div className="overflow-hidden  bg-white shadow-sm">
                    <div className="overflow-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-20 bg-white">
                            <tr className="border-b border-slate-200">
                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Candidate
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Position
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Focus
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Space
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Critical Thinking
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Contextual Clarity
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Problem Solving
                                </th>

                                <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                    Recommendation
                                </th>

                                {/*<th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">*/}
                                {/*    Actions*/}
                                {/*</th>*/}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredPodcasts.map(
                                (pod) => {
                                    const m =
                                        pod.final_profile
                                            ?.metrics ||
                                        {};

                                    const isStrict =
                                        pod.paradigm_baseline ===
                                        "is_strict";

                                    const details =
                                        pod.gemini
                                            ?.data;

                                    return (
                                        <React.Fragment
                                            key={
                                                pod.id
                                            }
                                        >
                                            <tr className="border-b border-slate-100 transition-all hover:bg-slate-50">
                                                <td className="px-6 py-6">
                                                    <div>
                                                        <div className="text-[14px] font-semibold text-slate-900 flex gap-2 items-center">
                                                            {
                                                                pod.podcast
                                                            }
                                                                <button
                                                                    onClick={() =>
                                                                        setSelectedRaw(
                                                                            pod
                                                                        )
                                                                    }
                                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                                >
                                                                    <FileJson
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        setEditingPod(
                                                                            pod
                                                                        )
                                                                    }
                                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                                                >
                                                                    <Edit3
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        deletePodcast(
                                                                            pod.id
                                                                        )
                                                                    }
                                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                        </div>

                                                        <div className="mt-1 text-[12px] text-slate-400">
                                                            ID:{" "}
                                                            {
                                                                pod.id
                                                            }
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-[13px] text-slate-600">
                                                    {
                                                        pod.position
                                                    }
                                                </td>

                                                <td className="px-6 py-6">
                                                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                                                            {getMainPillar(
                                                                m
                                                            )}
                                                        </span>
                                                </td>

                                                <td className="px-6 py-6">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                                                isStrict
                                                                    ? "bg-red-50 text-red-600"
                                                                    : "bg-violet-50 text-violet-700"
                                                            }`}
                                                        >
                                                            {isStrict
                                                                ? "STRICT"
                                                                : "FLEX"}
                                                        </span>
                                                </td>

                                                <td className="px-6 py-6">
                                                    <CompetencyCell
                                                        metrics={
                                                            m.Logic_Consistency ||
                                                            {}
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-6">
                                                    <CompetencyCell
                                                        metrics={
                                                            m.Contextual_Clarity ||
                                                            {}
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-6">
                                                    <CompetencyCell
                                                        metrics={
                                                            m.Execution_Velocity ||
                                                            {}
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-6">
                                                    {details
                                                        ?.recommendation
                                                        ?.action ? (
                                                        <div className="flex items-center gap-3">
                                                                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                                                                    {
                                                                        details
                                                                            .recommendation
                                                                            .action
                                                                    }
                                                                </span>

                                                            <button
                                                                onClick={() =>
                                                                    setSelectedRecommendation(
                                                                        details.recommendation
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Info
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[12px] text-slate-300">
                                                                Pending
                                                            </span>
                                                    )}
                                                </td>


                                            </tr>

                                            {details && (
                                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                                    <td
                                                        colSpan="9"
                                                        className="px-8 py-8"
                                                    >
                                                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                                                            {details.pillars?.map(
                                                                (
                                                                    p,
                                                                    i
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            i
                                                                        }
                                                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                                                    >
                                                                        <div className="mb-4 flex items-center justify-between">
                                                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                                                                                    {
                                                                                        p.pillar
                                                                                    }
                                                                                </span>

                                                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                                                                                    {
                                                                                        p.result
                                                                                    }
                                                                                </span>
                                                                        </div>

                                                                        <p className="text-[13px] leading-relaxed text-slate-600">
                                                                            {
                                                                                p.reasoning
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>

                                                        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                                                            <div className="lg:col-span-2 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                                                                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-700">
                                                                    Verdict
                                                                </div>

                                                                <p className="text-[13px] leading-relaxed text-slate-700">
                                                                    {
                                                                        details.verdict
                                                                    }
                                                                </p>
                                                            </div>

                                                            {details.recommendation && (
                                                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                                    <div className="mb-3 flex items-center justify-between">
                                                                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                                                                Recommendation
                                                                            </span>

                                                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                                                                {
                                                                                    details
                                                                                        .recommendation
                                                                                        .action
                                                                                }
                                                                            </span>
                                                                    </div>

                                                                    <p className="text-[13px] leading-relaxed text-slate-600">
                                                                        {
                                                                            details
                                                                                .recommendation
                                                                                .reasoning
                                                                        }
                                                                    </p>

                                                                    {details
                                                                        .recommendation
                                                                        ?.focus_area && (
                                                                        <div className="mt-4">
                                                                                <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                                                                                    Focus:{" "}
                                                                                    {
                                                                                        details
                                                                                            .recommendation
                                                                                            .focus_area
                                                                                    }
                                                                                </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                }
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* RECOMMENDATION MODAL */}
            {selectedRecommendation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() =>
                            setSelectedRecommendation(
                                null
                            )
                        }
                    />

                    <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
                        <h3 className="mb-6 text-lg font-semibold text-slate-900">
                            Action:{" "}
                            {selectedRecommendation.action.replace(
                                "_",
                                " "
                            )}
                        </h3>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                            <p className="text-[14px] leading-relaxed text-slate-700">
                                {
                                    selectedRecommendation.reasoning
                                }
                            </p>
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                Why this step?
                            </h4>

                            <p className="text-[13px] leading-relaxed text-slate-600">
                                {selectedRecommendation.action ===
                                "TECHNICAL_TEST" ? (
                                    <>
                                        <strong>
                                            Goal:
                                        </strong>{" "}
                                        Validate
                                        candidate logical
                                        reasoning and
                                        analytical
                                        consistency.
                                    </>
                                ) : selectedRecommendation.action ===
                                "PRACTICAL_TASK" ? (
                                    <>
                                        <strong>
                                            Goal:
                                        </strong>{" "}
                                        Validate
                                        execution
                                        capability and
                                        delivery quality
                                        in real-world
                                        scenarios.
                                    </>
                                ) : (
                                    "Recommendation generated from transcript intelligence and performance metrics."
                                )}
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setSelectedRecommendation(
                                    null
                                )
                            }
                            className="mt-8 h-12 w-full rounded-2xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* EDIT DRAWER */}
            {editingPod && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                        onClick={() =>
                            setEditingPod(null)
                        }
                    />

                    <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">
                        <form
                            onSubmit={handleUpdate}
                            className="flex h-full flex-col"
                        >
                            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-10 py-8">
                                <div>
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                                        Data Maintenance
                                    </span>

                                    <h3 className="text-3xl font-semibold text-slate-900">
                                        Update Signal
                                        Node
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingPod(
                                            null
                                        )
                                    }
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto px-10 py-10">
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <Fingerprint size={13} />
                                            ID
                                        </label>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                                            {
                                                editingPod.id
                                            }
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <Fingerprint size={13} />
                                            Title
                                        </label>

                                        <input
                                            name="title"
                                            defaultValue={
                                                editingPod.podcast
                                            }
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <IdCardIcon
                                                size={
                                                    13
                                                }
                                            />
                                            Speaker ID
                                        </label>

                                        <input
                                            name="speaker"
                                            defaultValue={
                                                editingPod.speaker
                                            }
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <BuildingIcon
                                                size={
                                                    13
                                                }
                                            />
                                            Position
                                        </label>

                                        <input
                                            name="position"
                                            defaultValue={
                                                editingPod.position
                                            }
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <Database
                                                size={13}
                                            />
                                            Audio File
                                        </label>

                                        <input
                                            name="audio"
                                            defaultValue={
                                                editingPod.audio
                                            }
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <LinkIcon
                                                size={
                                                    13
                                                }
                                            />
                                            URL
                                        </label>

                                        <input
                                            name="url"
                                            defaultValue={
                                                editingPod.url
                                            }
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            <ImageIcon
                                                size={
                                                    13
                                                }
                                            />
                                            Thumbnail
                                        </label>

                                        <input
                                            name="thumbnail"
                                            defaultValue={
                                                editingPod.thumbnail
                                            }
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            Paradigm Baseline
                                        </label>

                                        <div className="flex gap-4">
                                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4">
                                                <input
                                                    type="radio"
                                                    name="paradigm_baseline"
                                                    value="is_strict"
                                                    defaultChecked={
                                                        editingPod.paradigm_baseline ===
                                                        "is_strict"
                                                    }
                                                />

                                                <span className="text-sm text-slate-700">
                                                    Strict
                                                </span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4">
                                                <input
                                                    type="radio"
                                                    name="paradigm_baseline"
                                                    value="is_metaphorical"
                                                    defaultChecked={
                                                        editingPod.paradigm_baseline ===
                                                        "is_metaphorical"
                                                    }
                                                />

                                                <span className="text-sm text-slate-700">
                                                    Metaphorical
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                            Labels
                                        </label>

                                        <input
                                            name="labels"
                                            defaultValue={editingPod.labels?.join(
                                                ", "
                                            )}
                                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <footer className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-10 py-6">
                                <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
                                    Registry UID:{" "}
                                    {editingPod.id?.split(
                                        "-"
                                    )[0]}
                                </span>

                                <button
                                    type="submit"
                                    className="flex h-14 items-center gap-3 rounded-2xl bg-slate-900 px-8 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                                >
                                    <Save size={16} />
                                    Persist Changes
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* RAW JSON */}
            {selectedRaw && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                        onClick={() =>
                            setSelectedRaw(null)
                        }
                    />

                    <div className="relative flex h-full w-full max-w-3xl flex-col border-l border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-10 py-8">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900">
                                    {
                                        selectedRaw.podcast
                                    }
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Raw candidate
                                    payload
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedRaw(
                                        null
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-[#111827] p-8">
                            <ReactJson
                                src={selectedRaw}
                                theme="monokai"
                                collapsed={2}
                                displayDataTypes={false}
                                style={{
                                    backgroundColor:
                                        "transparent",
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}