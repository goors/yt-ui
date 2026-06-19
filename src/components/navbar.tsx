import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, UserPlus, Users } from 'lucide-react';
import { UserProfile } from "@/components/user-profile.tsx";
import { Link } from "@tanstack/react-router";

export default function Sidebar() {
    return (
        <aside className="w-[68px] flex flex-col justify-between items-center py-6 bg-zinc-950 h-screen border-r border-zinc-900 shrink-0">
            <TooltipProvider delayDuration={0}>
                <div className="flex flex-col items-center gap-8 w-full">
                    {/* Brand Logo - Sleek Monochrome Metallic Frame */}
                    <Link
                        to="/"
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-zinc-950 shadow-md shadow-white/5 hover:scale-[1.04] active:scale-95 transition-all duration-300 border border-zinc-200"
                    >
                        <Command className="w-5 h-5" />
                    </Link>

                    {/* Nav Items */}
                    <nav className="flex flex-col items-center gap-2 w-full">
                        {/* Add Candidate (Action Button, Uniform Design) */}
                        <SidebarLink to="/add-candidate" icon={UserPlus} label="New Candidate" />

                        {/* Faded Divider */}
                        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-3" />

                        {/* Navigation Links */}
                        <SidebarLink to="/candidates" icon={Users} label="Candidates" />
                    </nav>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-5 w-full">
                    <div className="p-1 rounded-full border border-zinc-800/60 bg-zinc-900/30">
                        <UserProfile />
                    </div>
                </div>
            </TooltipProvider>
        </aside>
    );
}

interface SidebarLinkProps {
    to?: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
}

function SidebarLink({ to, icon: Icon, label, onClick }: SidebarLinkProps) {
    const baseClass = "w-11 h-11 rounded-xl transition-all duration-300 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 hover:scale-[1.03] active:scale-95 flex items-center justify-center relative group [&.active]:text-white [&.active]:bg-zinc-900 [&.active]:ring-1 [&.active]:ring-zinc-800";

    const content = (
        <>
            {/* Active & Hover Line Indicator on Left Edge (White Accent) */}
            <div className="absolute left-0 w-[3px] h-5 rounded-r-md bg-white origin-left scale-y-0 group-hover:scale-y-50 group-[.active]:scale-y-100 transition-all duration-200" />
            <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-[1.05]" />
        </>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {to ? (
                    <Link to={to} className={baseClass}>
                        {content}
                    </Link>
                ) : (
                    <button onClick={onClick} className={baseClass}>
                        {content}
                    </button>
                )}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 text-zinc-200 text-[11px] border border-zinc-800 px-2.5 py-1.5 rounded-lg shadow-xl ml-3">
                {label}
            </TooltipContent>
        </Tooltip>
    );
}
