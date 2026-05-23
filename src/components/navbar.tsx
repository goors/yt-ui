// import { useNavigate, useLocation } from '@tanstack/react-router';
// import { Terminal, Activity, Share2, Bookmark, ArrowLeft } from 'lucide-react';
//
// interface NavbarProps {
//     onOpenArchive?: () => void;
// }
//
// export default function Navbar({ onOpenArchive }: NavbarProps) {
//     const navigate = useNavigate();
//     const location = useLocation();
//
//     // Determine the current "view"
//     const isHome = location.pathname === '/';
//     const isAbout = location.pathname === '/about';
//     const isAudit = location.pathname.startsWith('/audit/');
//
//     return (
//         <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[100] px-6 py-4 flex justify-between items-center border-b border-slate-100 h-[64px]">
//             {/* LEFT SIDE: Brand / Back Button */}
//             <div className="flex items-center">
//                 {isHome ? (
//                     <div className="flex items-center gap-3">
//                         <Terminal size={16} />
//                         <span className="text-[11px] tracking-[0.3em] font-bold uppercase">Logic Registry</span>
//                     </div>
//                 ) : (
//                     <button
//                         onClick={() => navigate({ to: '/' })}
//                         className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors group"
//                     >
//                         <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
//                         {isAbout ? "Back to Registry" : "Return to Index"}
//                     </button>
//                 )}
//             </div>
//
//             {/* RIGHT SIDE: Action Tools */}
//             <div className="flex items-center gap-6">
//                 {/* Always show About link except when on About page */}
//                 {/*{!isAbout && (*/}
//                 {/*    <button*/}
//                 {/*        onClick={() => navigate({ to: '/about' })}*/}
//                 {/*        className="text-[10px] tracking-[0.2em] font-bold hover:text-red-600 transition-colors uppercase"*/}
//                 {/*    >*/}
//                 {/*        About*/}
//                 {/*    </button>*/}
//                 {/*)}*/}
//
//                 {/* Show Share/Bookmark only on Audits */}
//                 {isAudit && (
//                     <div className="flex items-center gap-6 border-l border-slate-100 pl-6">
//                         <Share2 size={16} className="cursor-pointer text-slate-400 hover:text-black transition-colors" />
//                         <Bookmark size={16} className="cursor-pointer text-slate-400 hover:text-black transition-colors" />
//                     </div>
//                 )}
//
//                 {/*/!* Full Archive Button - Show on Home (or everywhere if you prefer) *!/*/}
//                 {/*{isHome && (*/}
//                 {/*    <button*/}
//                 {/*        onClick={onOpenArchive}*/}
//                 {/*        className="text-[10px] tracking-[0.2em] font-bold hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-100 hover:border-slate-200"*/}
//                 {/*    >*/}
//                 {/*        <Activity size={12} /> Full Archive*/}
//                 {/*    </button>*/}
//                 {/*)}*/}
//             </div>
//         </nav>
//     );
// }

import { useNavigate, useLocation } from '@tanstack/react-router';
import { Terminal, Share2, Bookmark, ArrowLeft, RefreshCw, MoreVertical, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface NavbarProps {
    onOpenArchive?: () => void;
    totalCount?: number;
}

export default function Navbar({ onOpenArchive, totalCount = 0 }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';
    const isAbout = location.pathname === '/about';
    const isAudit = location.pathname.startsWith('/audit/');

    return (
        /* REMOVED: fixed, top-0, z-[100] */
        /* ADDED: shrink-0 (prevents the flex container from squishing the header height) */
        <nav className="w-full bg-white border-b border-[#f0f0f0] h-[48px] px-4 flex justify-between items-center select-none shrink-0">
            {/* LEFT SIDE: Identity or Context-Aware Back Button */}
            <div className="flex items-center gap-6">
                {isHome ? (
                    <div className="flex items-center gap-2.5 text-[#444746]">
                        <Terminal size={18} className="text-[#1f1f1f]" />
                        <span className="text-[14px] font-semibold tracking-normal text-[#1f1f1f]">Logic Audit</span>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate({ to: '/' })}
                        className="flex items-center gap-2 text-[12px] font-medium text-[#444746] hover:bg-[#f1f3f4] px-3 py-1.5 rounded-md transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>{isAbout ? "Back to Registry" : "Back to Index"}</span>
                    </button>
                )}

                {/* Gmail-style primary action bar items (visible on index view) */}
                {isHome && (
                    <div className="flex items-center gap-1 border-l border-[#e0e0e0] pl-4 text-[#444746]">
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors"
                            title="Refresh index"
                        >
                            <RefreshCw size={15} />
                        </button>
                        <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                            <MoreVertical size={15} />
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: Pagination Controls & Shared Tools */}
            <div className="flex items-center gap-2 text-[#444746]">
                {isHome && (
                    <div className="flex items-center gap-4 text-xs text-[#5f6368] mr-2">
                        <span>1–{totalCount} of {totalCount}</span>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full opacity-50 cursor-not-allowed">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full opacity-50 cursor-not-allowed">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {isAudit && (
                    <div className="flex items-center gap-1 border-r border-[#e0e0e0] pr-3 mr-1">
                        <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors" title="Share Audit">
                            <Share2 size={15} />
                        </button>
                        <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors" title="Bookmark Node">
                            <Bookmark size={15} />
                        </button>
                    </div>
                )}

                <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                    <Settings size={16} />
                </button>
            </div>
        </nav>
    );
}