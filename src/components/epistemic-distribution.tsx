"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {formatTime, LABEL_COLORS, LABEL_MAP} from "@/constants/forensics.ts"
import { useEffect, useMemo, useState } from "react"

const GROUPS = [
    { name: "Danger / Fallacies", items: ["fallacy of logic", "intentional manipulation", "equivocation", "faulty generalization"] },
    { name: "Warning / Bias", items: ["appeal to emotion", "personal opinion"] },
    { name: "Soundness", items: ["factual claim", "logical inference", "causal claim", "generalization"] },
    { name: "Neutral", items: ["neutral statement", "storytelling / anecdote"] }
];

const chartConfig = Object.keys(LABEL_MAP).reduce((acc, key) => {
    acc[key] = { label: LABEL_MAP[key], color: LABEL_COLORS[key] };
    return acc;
}, {} as ChartConfig);

export default function ForensicAreaChart({ podcast, usedLabels, onSeek, index }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        if(index >= 0) setSelectedIndex(index);
    }, [index]);

    const chartData = useMemo(() => {
        // 1. Check if we have the nested structure
        const topics = podcast?.analyses?.topics;

        if (topics && Array.isArray(topics)) {
            const timeline: any[] = [];
            topics.forEach((topic: any) => {
                const analysis = topic.results?.[0]?.analysis_data || {};
                topic.occurrences?.forEach((occ: any) => {
                    timeline.push({
                        time: formatTime(occ.start),
                        startTimeSeconds: occ.start,
                        displayTime: `${formatTime(occ.start)} - ${formatTime(occ.end)}`,
                        ...analysis,
                        text: topic.text,
                        title: topic.title
                    });
                });
            });
            return timeline.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
        }

        // 2. Fallback: If the parent already flattened it into podcast.analyses
        if (Array.isArray(podcast?.analyses)) {
            return podcast.analyses.map((a: any) => ({
                time: formatTime(a.start),
                startTimeSeconds: a.start,
                displayTime: `${formatTime(a.start)} - ${formatTime(a.end)}`,
                ...a,
                text: a.text
            })).sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
        }

        return [];
    }, [podcast]);

    const { labelCounts, dominantLabel } = useMemo(() => {
        if (!chartData.length || !usedLabels.length) {
            return { labelCounts: {}, dominantLabel: "none" };
        }
        const counts: Record<string, number> = {};
        const totals: Record<string, number> = {};

        chartData.forEach((point: any) => {
            usedLabels.forEach((label: string) => {
                const score = point[label] || 0;
                if (score > 0.5) counts[label] = (counts[label] || 0) + 1;
                totals[label] = (totals[label] || 0) + score;
            });
        });

        const winner = Object.entries(totals).reduce((a, b) => (a[1] > b[1] ? a : b), ["none", 0])[0];
        return { labelCounts: counts, dominantLabel: winner };
    }, [chartData, usedLabels]);

    const [activeSignal, setActiveSignal] = useState<string>(dominantLabel);

    useEffect(() => {
        if (dominantLabel !== "none") setActiveSignal(dominantLabel);
    }, [dominantLabel]);

    const handleChartClick = (state: any) => {
        if (!state || state.activeTooltipIndex === undefined) return;
        const idx = Number(state.activeTooltipIndex);
        const dataPoint = chartData[idx];
        setSelectedIndex(idx);
        if (onSeek && dataPoint?.startTimeSeconds !== undefined) {
            onSeek(dataPoint.startTimeSeconds);
        }
    };

    const activePoint = selectedIndex !== null ? chartData[selectedIndex] : null;

    return (
        <Card className="border-slate-200 shadow-sm overflow-visible">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">
                        Epistemic Signal Audit
                    </CardTitle>
                    <CardDescription className="text-[11px] text-slate-500">
                        Primary Signal: <span className="font-bold text-slate-900 uppercase">
                            {LABEL_MAP[activeSignal] || activeSignal}
                        </span>
                    </CardDescription>
                </div>

                <Select value={activeSignal} onValueChange={setActiveSignal}>
                    <SelectTrigger className="w-[280px] rounded-lg bg-white border-slate-200 font-mono text-[10px] uppercase font-bold shadow-sm">
                        <SelectValue placeholder="Select Logic Signal" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white border border-slate-200 shadow-xl z-50">
                        <SelectItem value="all" className="text-[10px] uppercase font-bold text-indigo-600 border-b mb-1">
                            Full Spectrum Audit
                        </SelectItem>
                        {GROUPS.map((group) => {
                            const availableItems = group.items.filter(id => usedLabels.includes(id));
                            if (availableItems.length === 0) return null;
                            return (
                                <SelectGroup key={group.name}>
                                    <SelectLabel className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                        {group.name}
                                    </SelectLabel>
                                    {availableItems.map((id) => (
                                        <SelectItem key={id} value={id} className="text-[10px] uppercase">
                                            <div className="flex w-full items-center justify-between gap-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LABEL_COLORS[id] }} />
                                                    <span>{LABEL_MAP[id] || id}</span>
                                                </div>
                                                <span className="font-mono text-[9px] text-slate-400">[{labelCounts[id] || 0}]</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            );
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                    <AreaChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                        <defs>
                            {usedLabels.map((label: string) => (
                                <linearGradient key={`gradient-${label}`} id={`fill-${label}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={LABEL_COLORS[label]} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={LABEL_COLORS[label]} stopOpacity={0.01} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={48} className="text-[10px] font-mono" />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[10px] font-mono" domain={[0, 1]} tickCount={6} />

                        <ChartTooltip
                            cursor={{ stroke: "#000", strokeWidth: 1, strokeDasharray: "4 4" }}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    className="w-72 font-mono text-[10px] bg-white border border-slate-200 shadow-lg z-40"
                                />
                            }
                        />

                        {usedLabels.map((label: string) => {
                            const isVisible = activeSignal === "all" || activeSignal === label;
                            if (!isVisible) return null;
                            return (
                                <Area
                                    key={label}
                                    dataKey={label}
                                    type="stepAfter" // Changed to stepAfter to represent discrete segments better
                                    fill={`url(#fill-${label})`}
                                    stroke={LABEL_COLORS[label]}
                                    strokeWidth={2}
                                    stackId={activeSignal === "all" ? "a" : undefined}
                                />
                            );
                        })}
                        <ChartLegend content={<ChartLegendContent className="mt-4 text-[9px] uppercase font-bold" />} />
                    </AreaChart>
                </ChartContainer>

                <div className="mt-8 border-t border-slate-100 pt-6">
                    {activePoint ? (
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-tighter bg-slate-900 text-white px-2 py-0.5 rounded">
                                        {activePoint.displayTime}
                                    </span>
                                    <div className="flex gap-1 flex-wrap">
                                        {usedLabels
                                            .filter(label => (activePoint[label] || 0) > 0.4)
                                            .sort((a, b) => (activePoint[b] || 0) - (activePoint[a] || 0))
                                            .map(label => (
                                                <span
                                                    key={label}
                                                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border"
                                                    style={{
                                                        borderColor: LABEL_COLORS[label],
                                                        color: LABEL_COLORS[label],
                                                        backgroundColor: `${LABEL_COLORS[label]}10`
                                                    }}
                                                >
                                                    {LABEL_MAP[label] || label}
                                                    <span className="opacity-80 font-mono ml-1">
                                                        ({(activePoint[label] as number).toFixed(2)})
                                                    </span>
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {activePoint.title}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-[13px] leading-relaxed text-slate-700 font-medium italic">
                                    "{activePoint.text}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-10 border-2 border-dashed border-slate-50 rounded-lg">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Click graph to audit logic at specific time
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}