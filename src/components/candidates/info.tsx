import React from 'react';
import {
    Briefcase,
    ExternalLink,
    Link2,
    MapPin,
    GraduationCap,
    Award,
    FolderGit2,
    FileText,
    Languages,
    Calendar,
    ThumbsUp,
    Sparkles
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet";
import Linkedin from "@/components/icons/linkedin.tsx";
import Github from "@/components/icons/github.tsx";

interface CandidateSideSheetProps {
    selectedCandidate: any | null;
    onClose: () => void;
}

export default function CandidateSideSheet({
                                               selectedCandidate,
                                               onClose
                                           }: CandidateSideSheetProps) {
    if (!selectedCandidate) return null;

    const data = selectedCandidate.data || {};
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const posts = data.posts || [];
    const languages = data.languages || [];
    const education = data.education || [];
    const bioLinks = data.bio_links || [];
    const currentCompany = data.current_company || {};

    // Check if candidate link is linkedin or github
    const isLinkedin = selectedCandidate.source === 'linkedin' || selectedCandidate.link?.includes('linkedin');

    const stats = [
        {
            label: 'Projects',
            value: projects.length,
            icon: FolderGit2,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            barColor: 'bg-indigo-600'
        },
        {
            label: 'Certifications',
            value: certifications.length,
            icon: Award,
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            barColor: 'bg-amber-500'
        },
        {
            label: 'Posts',
            value: posts.length,
            icon: FileText,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            barColor: 'bg-emerald-600'
        },
        {
            label: 'Languages',
            value: languages.length,
            icon: Languages,
            color: 'text-rose-600 bg-rose-50 border-rose-100',
            barColor: 'bg-rose-500'
        },
    ];

    // Dynamic baseline for auto-scaling the vertical bars
    const maxVal = Math.max(...stats.map(s => s.value), 4) || 4;

    const initials = selectedCandidate.name
        ? selectedCandidate.name
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '??';

    return (
        <Sheet
            open={selectedCandidate !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <SheetContent
                side="right"
                className="w-full sm:max-w-3xl p-0 border-l border-zinc-200 bg-zinc-50 shadow-2xl"
            >
                <div className="flex flex-col h-full bg-zinc-50 font-sans text-zinc-800">

                    {/* Header Section */}
                    <div className="relative border-b border-zinc-200 bg-white px-10 py-8 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                {/* Initials Avatar Box with Active Indicator */}

                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <SheetTitle className="text-2xl font-bold text-zinc-900 tracking-tight">
                                            {selectedCandidate.name}
                                        </SheetTitle>
                                        {selectedCandidate.source && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Sparkles size={10} /> {selectedCandidate.source}
                      </span>
                                        )}
                                    </div>
                                    {currentCompany.name && (
                                        <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1.5">
                                            <Briefcase size={13} className="text-zinc-400" />
                                            <span>Current: </span>
                                            {currentCompany.link ? (
                                                <a
                                                    href={currentCompany.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-zinc-700 hover:text-indigo-600 font-semibold inline-flex items-center gap-0.5 transition-colors group hover:underline"
                                                >
                                                    {currentCompany.name}
                                                    <ExternalLink size={10} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                                </a>
                                            ) : (
                                                <span className="text-zinc-700 font-semibold">{currentCompany.name}</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* View Profile Action */}
                            {selectedCandidate.link && (
                                <a
                                    href={selectedCandidate.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all border ${
                                        isLinkedin
                                            ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                                            : "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-950"
                                    }`}
                                    title={isLinkedin ? "View LinkedIn Profile" : "View GitHub Profile"}
                                >
                                    {isLinkedin ? <Linkedin size={14} className="fill-current" /> : <Github size={14} />}
                                    <span>View Profile</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">

                        {/* Summary Statistics Dashboard */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dossier Metrics</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {stats.map((stat, i) => {
                                    const StatIcon = stat.icon;
                                    const heightPercent = stat.value > 0 ? Math.min((stat.value / maxVal) * 100, 100) : 0;
                                    return (
                                        <div key={i} className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300">
                                            <div className="flex items-center justify-between gap-4">
                        <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                          {stat.value}
                        </span>
                                                <div className={`p-2 rounded-xl border ${stat.color}`}>
                                                    <StatIcon size={15} />
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                    {stat.label}
                                                </p>
                                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${stat.barColor} rounded-full transition-all duration-550 ease-out`}
                                                        style={{ width: `${heightPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grid Section for Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Location & Languages (Left column) */}
                            <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-6">

                                {/* Location */}
                                {(data.city || data.country_code) && (
                                    <div className="space-y-2.5">
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={13} className="text-zinc-400" /> Location
                                        </h4>
                                        <p className="text-sm font-semibold text-zinc-800">
                                            {data.city}{data.city && data.country_code ? ', ' : ''}{data.country_code}
                                        </p>
                                    </div>
                                )}

                                {/* Languages */}
                                {languages.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Languages size={13} className="text-zinc-400" /> Languages
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {languages.map((l: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-800">{l.title}</p>
                                                        <p className="text-[10px] text-zinc-400 font-medium">{l.subtitle}</p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-50 border border-zinc-200 text-zinc-500">
                            Verified
                          </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Education & Links (Right column) */}
                            <div className="space-y-6">

                                {/* Education */}
                                {education.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <GraduationCap size={14} className="text-zinc-400" /> Education
                                        </h4>
                                        <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
                                            {education.map((e: any, i: number) => (
                                                <div key={i} className="relative group">
                                                    {/* Node Dot */}
                                                    <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-zinc-300 group-hover:bg-indigo-600 transition-colors" />
                                                    <p className="text-xs font-bold text-zinc-800 leading-snug group-hover:text-indigo-600 transition-colors">
                                                        {e.title}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                                                        {e.start_year} – {e.end_year}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bio Links */}
                                {bioLinks.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4">
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Link2 size={13} className="text-zinc-400" /> Links
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                            {bioLinks.map((link: any, i: number) => (
                                                <a
                                                    key={i}
                                                    href={link.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all"
                                                >
                          <span className="text-xs font-semibold text-zinc-700 group-hover:text-indigo-600 transition-colors">
                            {link.title || "External Link"}
                          </span>
                                                    <ExternalLink size={12} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Certifications Section */}
                        {certifications.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Award size={14} className="text-zinc-400" /> Certifications
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {certifications.map((cert: any, i: number) => (
                                        <a
                                            key={i}
                                            href={cert.credential_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 group"
                                        >
                                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 transition-colors group-hover:bg-amber-100">
                                                <Award size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-zinc-800 truncate group-hover:text-amber-700 transition-colors">
                                                    {cert.title || "Certification"}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-0.5 mt-0.5">
                                                    <span>Credential Link</span>
                                                    <ExternalLink size={8} />
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects Section */}
                        {projects.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FolderGit2 size={14} className="text-zinc-400" /> Projects
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {projects.filter(Boolean).map((p: any, i: number) => (
                                        <div key={i} className="group relative bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                                                        <FolderGit2 size={14} />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                                                        {p.title}
                                                    </h4>
                                                </div>
                                                {p.start_date && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-50 text-zinc-500 border border-zinc-200">
                            <Calendar size={10} />
                            <span>{p.start_date}</span>
                          </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed mt-3 pl-0 sm:pl-10">
                                                {p.description || "No description provided."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Posts Section */}
                        {posts.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FileText size={14} className="text-zinc-400" /> Posts & Articles
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {posts.map((post: any, i: number) => {
                                        let postDate = "Recent";
                                        try {
                                            if (post.created_at) {
                                                postDate = new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
                                            }
                                        } catch (e) {
                                            // fallback if date parse fails
                                        }
                                        return (
                                            <a
                                                key={i}
                                                href={post.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group block p-4 rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <h4 className="text-xs font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors leading-snug">
                                                        {post.title}
                                                    </h4>
                                                    <span className="text-[10px] font-semibold text-zinc-400 shrink-0 bg-zinc-50 px-2.5 py-0.5 rounded-full border border-zinc-200">
                            {postDate}
                          </span>
                                                </div>
                                                <div className="flex items-center gap-2.5 mt-3 text-[10px] text-zinc-400 font-medium">
                                                    {post.attribution && (
                                                        <span className="px-2 py-0.5 rounded bg-indigo-50/50 text-indigo-700 font-semibold border border-indigo-100/50">
                              {post.attribution}
                            </span>
                                                    )}
                                                    {post.attribution && <span>•</span>}
                                                    <span className="flex items-center gap-1">
                            <ThumbsUp size={10} className="text-zinc-400" />
                            <span>{post.interaction} interactions</span>
                          </span>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
}