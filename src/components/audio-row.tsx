import { useEffect, useRef, useState } from 'react';
import { get, set } from 'idb-keyval';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export const ForensicMasterPlayer: React.FC<{ url: string; auditId: string, seekTo: any }> = ({ url, auditId, seekTo }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState("00:00:00");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (seekTo !== null && audioRef.current) {
            audioRef.current.currentTime = seekTo;
            audioRef.current.play(); // Auto-play when jumping from graph
        }
    }, [seekTo]);

    useEffect(() => {
        const initAudio = async () => {
            let audioBlob: Blob | undefined;
            const cacheKey = `audio_${auditId}`;

            try { audioBlob = await get(cacheKey); } catch (e) { console.warn(e); }

            if (!audioBlob) {
                try {
                    const response = await fetch(url);
                    audioBlob = await response.blob();
                    await set(cacheKey, audioBlob);
                } catch (e) { console.error("Cache Error:", e); }
            }

            if (audioBlob && audioRef.current) {
                audioRef.current.src = URL.createObjectURL(audioBlob);
                setIsReady(true);
            }
        };

        initAudio();
    }, [url, auditId]);

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const time = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 1;
        setProgress((time / duration) * 100);

        const h = Math.floor(time / 3600).toString().padStart(2, '0');
        const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        setCurrentTime(`${h}:${m}:${s}`);
    };

    const handleSeek = (e: any) => {
        if (!audioRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        audioRef.current.currentTime = percentage * audioRef.current.duration;
        if (!isPlaying) audioRef.current.play();
    };

    const skip = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime += seconds;
    };

    return (
        <div className="w-full border-b border-slate-100 bg-white select-none">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="relative w-full">
                {/* Header: Controls & TC */}
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => isPlaying ? audioRef.current?.pause() : audioRef.current?.play()}
                            className={`text-[11px] font-mono font-black uppercase tracking-tighter px-2 py-1 rounded border ${
                                isPlaying ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-900 text-white border-slate-900'
                            }`}
                        >
                            {isPlaying ? "STOP" : "PLAY"}
                        </button>

                        <div className="flex gap-1">
                            <button onClick={() => skip(-10)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronLeft size={14}/></button>
                            <button onClick={() => skip(10)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronRight size={14}/></button>
                        </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                        {currentTime}
                    </span>
                </div>

                {/* THE GRAPH: Forensic Density Strip */}
                <div
                    ref={containerRef}
                    onClick={handleSeek}
                    className="relative w-full h-[40px] bg-slate-50 cursor-crosshair overflow-hidden rounded-sm border border-slate-100"
                >
                    {/* Visual Density Pattern (Pre-baked pattern to avoid decoding) */}
                    <div className="absolute inset-0 flex items-center justify-between opacity-[0.15] px-0.5 pointer-events-none">
                        {Array.from({ length: 180 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-[1px] bg-slate-900"
                                style={{ height: `${20 + (Math.sin(i * 0.5) * 15) + (Math.random() * 40)}%` }}
                            />
                        ))}
                    </div>

                    {/* Active Progress Overlay */}
                    <div
                        className="absolute top-0 left-0 h-full bg-indigo-500/10 border-r-2 border-indigo-600 transition-all duration-75 ease-out pointer-events-none"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Playhead Glow */}
                        <div className="absolute right-[-4px] top-0 h-full w-[8px] bg-indigo-400/20 blur-sm" />
                    </div>
                </div>

                {!isReady && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
                        <Loader2 className="h-3 w-3 animate-spin text-slate-400 mr-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mounting Stream</span>
                    </div>
                )}
            </div>
        </div>
    );
};