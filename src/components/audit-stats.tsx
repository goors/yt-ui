export const AuditStats = ({ counts }) => {
    // Sort labels by highest count first
    const sortedLabels = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
            {sortedLabels.map(([label, count]) => (
                <div
                    key={label}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-sm flex flex-col justify-between"
                >
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        {label.replace('_', ' ')}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-blue-400">
                            {count}
                        </span>
                        <span className="text-[10px] text-slate-600">HITS</span>
                    </div>
                </div>
            ))}
        </div>
    );
};