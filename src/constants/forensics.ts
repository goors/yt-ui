export const LABEL_MAP: Record<string, string> = {
    "fallacy of logic": "fallacy of logic",
    "faulty generalization": "faulty generalization",
    "equivocation": "equivocation",
    "intentional": "intentional",
    "appeal to emotion": "appeal to emotion",
    "personal opinion": "personal opinion",
    "storytelling / anecdote": "storytelling / anecdote",
    "rhetorical question": "rhetorical question",
    "neutral statement": "neutral statement",
    "generalization": "generalization",
    "factual claim": "factual claim",
    "causal claim": "causal claim",
    "logical inference": "logical inference"
};

export const LABEL_COLORS: Record<string, string> = {
    "fallacy of logic": "#dc2626",
    "faulty generalization": "#991b1b",
    "equivocation": "#7c3aed",
    "intentional": "#000000",
    "appeal to emotion": "#ea580c",
    "personal opinion": "#f59e0b",
    "storytelling / anecdote": "#d97706",
    "rhetorical question": "#64748b",
    "neutral statement": "#cbd5e1",
    "generalization": "#475569",
    "factual claim": "#0f172a",
    "causal claim": "#2563eb",
    "logical inference": "#10b981"
};

export const DARK_LOGIC_KEYS = [
    "fallacy of logic",
    "faulty generalization",
    "equivocation",
    "intentional",
    "appeal to emotion"
];

export const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [
        hrs > 0 ? hrs.toString().padStart(2, '0') : null,
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].filter(Boolean);
    return parts.join(':');
};