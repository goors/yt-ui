import { useNavigate, useLocation } from '@tanstack/react-router';
import { Terminal, Activity, Share2, Bookmark, ArrowLeft } from 'lucide-react';

interface NavbarProps {
    onOpenArchive?: () => void;
}

export default function Navbar({ onOpenArchive }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine the current "view"
    const isHome = location.pathname === '/';
    const isAbout = location.pathname === '/about';
    const isAudit = location.pathname.startsWith('/audit/');

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[100] px-6 py-4 flex justify-between items-center border-b border-slate-100 h-[64px]">
            {/* LEFT SIDE: Brand / Back Button */}
            <div className="flex items-center">
                {isHome ? (
                    <div className="flex items-center gap-3">
                        <Terminal size={16} />
                        <span className="text-[11px] tracking-[0.3em] font-bold uppercase">Logic Registry</span>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate({ to: '/' })}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        {isAbout ? "Back to Registry" : "Return to Index"}
                    </button>
                )}
            </div>

            {/* RIGHT SIDE: Action Tools */}
            <div className="flex items-center gap-6">
                {/* Always show About link except when on About page */}
                {/*{!isAbout && (*/}
                {/*    <button*/}
                {/*        onClick={() => navigate({ to: '/about' })}*/}
                {/*        className="text-[10px] tracking-[0.2em] font-bold hover:text-red-600 transition-colors uppercase"*/}
                {/*    >*/}
                {/*        About*/}
                {/*    </button>*/}
                {/*)}*/}

                {/* Show Share/Bookmark only on Audits */}
                {isAudit && (
                    <div className="flex items-center gap-6 border-l border-slate-100 pl-6">
                        <Share2 size={16} className="cursor-pointer text-slate-400 hover:text-black transition-colors" />
                        <Bookmark size={16} className="cursor-pointer text-slate-400 hover:text-black transition-colors" />
                    </div>
                )}

                {/*/!* Full Archive Button - Show on Home (or everywhere if you prefer) *!/*/}
                {/*{isHome && (*/}
                {/*    <button*/}
                {/*        onClick={onOpenArchive}*/}
                {/*        className="text-[10px] tracking-[0.2em] font-bold hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-100 hover:border-slate-200"*/}
                {/*    >*/}
                {/*        <Activity size={12} /> Full Archive*/}
                {/*    </button>*/}
                {/*)}*/}
            </div>
        </nav>
    );
}