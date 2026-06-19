import React, { useState } from 'react';
import { Briefcase, Globe } from "lucide-react";
import LinkedinIcon from "@/components/icons/linkedin.tsx";
import GithubIcon from "@/components/icons/github.tsx";
import {CopyableEmail} from "@/pages/candidates.tsx";
import {IconGraph} from "@tabler/icons-react";
import {CandidatePositionStatusUpdate} from "@/validators/candidates/candidates-position-status-update.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

export const statuses = [
    "", "Scoured or contacted", "Prescreen", "Waiting feedback from hiring manager",
    "Test or project", "Hiring manager interview", "2nd interview",
    "Offer", "Rejected", "Ghosted me", "Not interested"
];

interface CandidateTableProps {
    candidates: any[];
    onStatusChange: (model: CandidatePositionStatusUpdate, position_id: string, candidate_id: string) => void;
    onCrawl: (id: string, source: string) => void;
    position_id: string;
    isPendingCandidatePositionUpdate?: boolean;
}

export const CandidateTable = ({ candidates, onStatusChange, onCrawl, position_id, isPendingCandidatePositionUpdate }: CandidateTableProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <table className="w-full text-left border-collapse">
            <thead>
            <tr className="text-zinc-500 border-b bg-zinc-50 text-sm">
                <th className="py-3 px-6">Candidate</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6 flex">{isPendingCandidatePositionUpdate && <Spinner className="mr-2"/>}Status</th>
                <th className="py-3 px-6">Crawl Status</th>
                <th className="py-3 px-6">Source</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
            {candidates.map((c) => (
                <React.Fragment key={c.candidateId}>
                    {/* Original Row */}
                    <tr
                        className="hover:bg-zinc-50 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === c.candidateId ? null : c.candidateId)}
                    >
                        <td className="py-4 px-6 font-medium text-zinc-900 flex items-center gap-3">
                            {/* Avatar */}
                            {c.data?.avatar ? (
                                <img
                                    src={c.data.avatar}
                                    alt={c.data.name || c.title}
                                    className="w-8 h-8 rounded-full object-cover border border-zinc-200 shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px] font-bold shrink-0">
                                    {(c.data?.name || c.title || c.name || "?")[0].toUpperCase()}
                                </div>
                            )}

                            {/* Identity Stack */}
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{c.data?.name || c.title || c.name}</span>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-normal">
                                    <Briefcase className="w-3 h-3 text-zinc-400" />
                                    {c.position_name}
                                </div>
                                {c.email && (
                                    <div className="mt-0.5">
                                        <CopyableEmail email={c.email} />
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>
                            {c.score?  <span className="flex items-center"><IconGraph size={12} className="mr-1"/> {(c.score * 100).toFixed(2)} / 100</span> : "-" }
                        </td>
                        <td className="py-4 px-6">
                            <select
                                defaultValue={c.status || statuses[0]}

                                onClick={(e) => e.stopPropagation()} // Prevent row toggle
                                onChange={(e) => onStatusChange(
                                    {
                                        status: e.target.value,

                                    },
                                    position_id,
                                    c.candidateId

                                )}
                                className="bg-transparent text-xs border border-zinc-200 rounded px-2 py-1 outline-none hover:border-zinc-400"
                            >
                                {statuses.map((s) => (
                                    <option
                                        key={s}
                                        value={s}
                                        selected={c.status === s}
                                    >
                                        {s === "" ? "Select Status" : s}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td className="py-4 px-6">
                            {c.crawled ? (
                                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-50 text-emerald-700">Crawled</span>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onCrawl(c.candidateId, c.source); }}
                                    className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-100 text-zinc-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-dashed border-zinc-300"
                                >
                                    Crawl Now
                                </button>
                            )}
                        </td>
                        <td className="py-4 px-6">
                            <a href={c.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                                {c.source === "linkedin" ? <LinkedinIcon size={12} /> : c.source === "github" ? <GithubIcon size={12} /> : <Globe size={12} />}
                                {c.source}
                            </a>
                        </td>
                    </tr>

                    {/* c.data Fragment */}
                    {expandedId === c.candidateId && c.data && (
                        <tr className="bg-zinc-50/50">
                            <td colSpan={6} className="px-6 pb-6 pt-2">
                                <div className="bg-white space-y-6">

                                    {/* 1. Main Data Grid (Everything except Projects) */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                                        {/* Identity Group */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                <Globe size={10} /> Profile
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-semibold text-zinc-800">{c.data.city}, {c.data.country_code}</p>
                                                {c.data.current_company?.name && (
                                                    <a href={c.data.current_company.link} target="_blank" rel="noreferrer"
                                                       className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                        <Briefcase size={12} /> {c.data.current_company.name}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Languages Group */}
                                        {c.data.languages?.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Languages</div>
                                                <div className="flex flex-col gap-2">
                                                    {c.data.languages.map((l: any, i: number) => (
                                                        <div key={i} className="border-l-2 border-zinc-200 pl-2">
                                                            <p className="text-xs font-bold text-zinc-800">{l.title}</p>
                                                            <p className="text-[10px] text-zinc-500">{l.subtitle}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Education Group */}
                                        {c.data.education?.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Education</div>
                                                <div className="flex flex-col gap-2">
                                                    {c.data.education.map((e: any, i: number) => (
                                                        <div key={i} className="border-l-2 border-indigo-200 pl-2">
                                                            <p className="text-xs font-bold text-zinc-800">{e.title}</p>
                                                            <p className="text-[10px] text-zinc-500">{e.start_year} – {e.end_year}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bio Links Group */}
                                        {c.data.bio_links?.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Links</div>
                                                <div className="flex flex-col gap-1.5">
                                                    {c.data.bio_links.map((link: any, i: number) => (
                                                        <a key={i} href={link.link} target="_blank" rel="noreferrer"
                                                           className="text-xs text-blue-600 hover:underline truncate">
                                                            {link.title || "External Link"}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Certifications Group */}

                                    </div>
                                    {c.data.certifications?.length > 0 && (
                                        <div className="pt-4 border-t border-zinc-100 relative">
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Certifications</div>

                                            {/* Changed to flex-wrap to keep them side-by-side */}
                                            <div className="flex flex-wrap gap-2">
                                                {c.data.certifications.map((cert: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={cert.credential_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-100 hover:bg-amber-100 transition-colors whitespace-nowrap"
                                                    >
                                                        📜 {cert.title || "Certification"}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Full-Width Projects Section */}
                                    {c.data.projects?.length > 0 && (
                                        <div className="pt-4 border-t border-zinc-100 relative">
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Projects</div>
                                            <div className="flex flex-wrap gap-2">
                                                {c.data.projects.filter((p: any) => p != null).map((p: any, i: number) => (
                                                    <details key={i} className="group relative">
                                                        <summary className="list-none cursor-pointer">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-medium border border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                                            {p.title || "Untitled"}
                                        </span>
                                                        </summary>
                                                        {/* Expanded card - now positioned relatively within the row */}
                                                        <div className="absolute top-8 left-0 w-80 p-4 bg-white border border-zinc-200 rounded-lg shadow-xl z-20">
                                                            <h4 className="text-sm font-bold text-zinc-900 mb-1">{p.title}</h4>
                                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">{p.start_date || "N/A"}</p>
                                                            <p className="text-xs text-zinc-600 leading-relaxed">{p.description || "No description provided."}</p>
                                                        </div>
                                                    </details>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {c.data.posts?.length > 0 && (
                                        <div className="w-full">
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Posts & Articles</div>

                                            <div className="overflow-hidden border border-zinc-200 rounded-lg">
                                                <table className="w-full text-left">
                                                    <thead className="bg-zinc-50 border-b border-zinc-200">
                                                    <tr>
                                                        <th className="py-2 px-3 text-[10px] font-bold text-zinc-500 uppercase">Title</th>
                                                        <th className="py-2 px-3 text-[10px] font-bold text-zinc-500 uppercase">Interactions</th>
                                                        <th className="py-2 px-3 text-[10px] font-bold text-zinc-500 uppercase text-right">Date</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-100">
                                                    {c.data.posts.map((post: any, i: number) => (
                                                        <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                                            <td className="py-2 px-3">
                                                                <a href={post.link} target="_blank" rel="noreferrer" className="block group">
                                                                    <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-blue-700 truncate max-w-sm">
                                                                        {post.title}
                                                                    </h4>
                                                                    <p className="text-[10px] text-zinc-400 truncate max-w-sm">{post.attribution}</p>
                                                                </a>
                                                            </td>
                                                            <td className="py-2 px-3 text-[10px] font-medium text-zinc-600">
                                                                {post.interaction}
                                                            </td>
                                                            <td className="py-2 px-3 text-[10px] text-zinc-400 text-right whitespace-nowrap">
                                                                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            ))}
            </tbody>
        </table>
    );
};