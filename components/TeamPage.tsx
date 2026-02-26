
import React, { useState, useEffect, useMemo } from 'react';
import { GalleryLayout } from '../layouts/GalleryLayout';
import { blueprintStyleFuchsia } from '../styles/common';
import { getTeamMembers } from '../services/teamService';
import type { TeamMember } from '../types';
import { LoadingSpinnerIcon, InstagramIcon, SearchIcon, CloseIcon, ArrowUpRightIcon } from './icons';
import SEO from './SEO';

const MemberCard: React.FC<{ member: TeamMember; index: number; onTagClick: (tag: string) => void }> = ({ member, index, onTagClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <article 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-fuchsia-500/40 transition-all duration-700 flex flex-col h-full shadow-2xl hover:-translate-y-1"
            style={{ 
              animation: `fade-in-fwd 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both ${index * 0.05}s`,
            }}
        >
            {/* Visual Header */}
            <div className="relative aspect-[1/1.2] overflow-hidden bg-gray-900">
                {!isLoaded && (
                    <div className="absolute inset-0 animate-shimmer z-30" />
                )}
                
                {/* Branding Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 opacity-90 transition-opacity duration-700 group-hover:opacity-30"></div>
                <div className="absolute inset-0 bg-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>

                <img 
                    src={member.imageUrl} 
                    alt={`${member.name} - ${member.role}`} 
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-[1500ms] group-hover:scale-110 filter grayscale group-hover:grayscale-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                />

                {/* Categories Badge */}
                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                    {member.categories.map((cat) => (
                        <span key={cat} className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-xl border ${
                            cat === 'Team' 
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' 
                                : 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40'
                        }`}>
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-8 flex flex-col flex-grow relative z-20 -mt-16 bg-gradient-to-b from-transparent via-[#0a0a0a] to-[#0a0a0a] transition-transform duration-700">
                <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0">
                        <h3 className="text-3xl font-bold text-white leading-tight group-hover:text-fuchsia-400 transition-colors duration-500">
                            {member.name}
                        </h3>
                        <p className="text-[10px] font-black text-fuchsia-500/80 uppercase tracking-[0.4em] mt-2">
                           {member.role}
                        </p>
                    </div>
                    <a 
                      href={`https://instagram.com/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-white/5 rounded-full text-gray-500 hover:text-white hover:bg-fuchsia-500 transition-all border border-white/10 group/icon"
                    >
                        <InstagramIcon className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
                    </a>
                </div>

                <div className="relative mb-6 overflow-hidden">
                    <p className={`text-gray-400 text-sm leading-relaxed transition-all duration-700 ease-in-out ${isHovered ? 'max-h-[500px] opacity-100' : 'max-h-20 opacity-60 line-clamp-3'}`}>
                        {member.bio}
                    </p>
                    <div className={`mt-2 transition-all duration-700 ${isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                         <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">+ Hover to expand bio</span>
                    </div>
                </div>

                {/* Expertise Footer */}
                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onTagClick(skill)}
                                className="text-[9px] uppercase font-black px-3 py-1.5 bg-white/[0.03] text-gray-500 rounded-lg border border-white/5 hover:border-fuchsia-500/40 hover:text-white hover:bg-fuchsia-500/10 transition-all"
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
};

const TeamPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPageVisible, setIsPageVisible] = useState(false);
    const [filter, setFilter] = useState<'All' | 'Team' | 'Artist'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTeam = async () => {
            setIsLoading(true);
            const data = await getTeamMembers();
            setMembers(data);
            setIsLoading(false);
            setTimeout(() => setIsPageVisible(true), 100);
        };
        fetchTeam();
    }, []);

    const counts = useMemo(() => ({
        All: members.length,
        Team: members.filter(m => m.categories.includes('Team')).length,
        Artist: members.filter(m => m.categories.includes('Artist')).length,
    }), [members]);

    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesCategory = filter === 'All' || m.categories.includes(filter as any);
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                m.name.toLowerCase().includes(query) || 
                m.role.toLowerCase().includes(query) || 
                m.expertise.some(e => e.toLowerCase().includes(query));
            
            return matchesCategory && matchesSearch;
        });
    }, [members, filter, searchQuery]);

    const handleTagClick = (tag: string) => {
        setSearchQuery(tag);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <GalleryLayout
            onBack={onBack}
            title="ROSTER"
            tagline="Precision Engineering. Authentic Artistry."
            brandColor="#ff00ff"
            blueprintStyle={blueprintStyleFuchsia}
        >
            <SEO 
                title="The Roster" 
                description="Meet the human element behind the sound of UNDR:LA. Our elite team of engineers and producers defines Los Angeles production."
            />

            <main className={`max-w-7xl mx-auto px-6 py-20 transition-all duration-1000 delay-300 ${isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* Search and Navigation Suite */}
                <div className="flex flex-col gap-10 mb-24">
                    <header className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 transition-all duration-1000 ${!isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div>
                            <p className="text-fuchsia-500 text-xs font-black uppercase tracking-[0.6em] mb-4">Discovery Engine</p>
                            <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter">Explore the Collective</h2>
                        </div>
                        
                        <div className="relative w-full lg:max-w-sm group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon className={`h-5 w-5 transition-colors ${searchQuery ? 'text-fuchsia-500' : 'text-gray-600'}`} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by name, role, or skill..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-12 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all text-sm font-medium"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Filter Tabs */}
                    <nav className="flex items-center gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit overflow-hidden backdrop-blur-md">
                        {(['All', 'Team', 'Artist'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 flex items-center gap-3 ${
                                    filter === f 
                                        ? 'bg-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/20' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                                aria-pressed={filter === f}
                            >
                                {f === 'All' ? 'Full Roster' : f === 'Team' ? 'Staff & Engineers' : 'Resident Artists'}
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${filter === f ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-600'}`}>
                                    {counts[f]}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-20 animate-pulse"></div>
                            <LoadingSpinnerIcon className="w-16 h-16 text-fuchsia-500 relative z-10" />
                        </div>
                        <p className="text-gray-500 font-black text-xs uppercase tracking-[0.6em] animate-pulse">Syncing Personnel Database</p>
                    </div>
                ) : (
                    <>
                        {filteredMembers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredMembers.map((member, index) => (
                                    <MemberCard key={member.id} member={member} index={index} onTagClick={handleTagClick} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5 animate-fade-in">
                                <SearchIcon className="w-16 h-16 text-gray-800 mx-auto mb-8 opacity-40" />
                                <h3 className="text-2xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">No Signals Detected</h3>
                                <p className="text-gray-600 text-sm mb-12 max-w-sm mx-auto leading-relaxed">We couldn't find any team members or artists matching your criteria. Try adjusting your search or filters.</p>
                                <button 
                                    onClick={() => {setSearchQuery(''); setFilter('All');}}
                                    className="px-8 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-white/10 transition-all"
                                >
                                    Reset Discovery Parameters
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Collaborative Footer Section */}
                <section className="mt-60 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-32 items-center">
                        <div className="space-y-8 text-center md:text-left">
                            <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter leading-none">
                                Your Vision. <br />
                                <span className="text-fuchsia-500">Our Experts.</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                                Whether you're tracking live drums or crafting a dark pop masterpiece, our roster provides the technical bridge between your imagination and reality.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <button className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-fuchsia-500 hover:text-white transition-all shadow-2xl shadow-white/5">
                                    Start a Collaboration
                                </button>
                                <button 
                                    onClick={onBack}
                                    className="px-10 py-4 bg-transparent border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-white/5 transition-all"
                                >
                                    View Session Packages
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 relative">
                            <div className="absolute inset-0 bg-fuchsia-600/5 blur-[120px] rounded-full"></div>
                            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm group hover:border-fuchsia-500/30 transition-all cursor-pointer">
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-fuchsia-500 rounded-full shadow-[0_0_8px_#ff00ff]"></div>
                                    TALENT INQUIRY
                                </h4>
                                <p className="text-gray-500 text-[11px] font-bold leading-relaxed mb-6 uppercase tracking-wider">Want to work with a specific producer or artist? We manage all logistics for external collaborations.</p>
                                <ArrowUpRightIcon className="w-5 h-5 text-gray-700 group-hover:text-fuchsia-500 transition-colors" />
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm group hover:border-cyan-500/30 transition-all translate-y-8 cursor-pointer">
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#00ffff]"></div>
                                    ENGINEER BOOKING
                                </h4>
                                <p className="text-gray-500 text-[11px] font-bold leading-relaxed mb-6 uppercase tracking-wider">Need a pro behind the desk? Book our staff by the hour to elevate your next tracking or mixing session.</p>
                                <ArrowUpRightIcon className="w-5 h-5 text-gray-700 group-hover:text-cyan-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </GalleryLayout>
    );
};

export default TeamPage;
