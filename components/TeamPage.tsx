
import React, { useState, useEffect } from 'react';
import { GalleryLayout } from '../layouts/GalleryLayout';
import { blueprintStyleFuchsia } from '../styles/common';
import { getTeamMembers } from '../services/teamService';
import type { TeamMember } from '../types';
import { LoadingSpinnerIcon, TwitterIcon, InstagramIcon } from './icons';
import SEO from './SEO';

const MemberCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <article 
            className="group relative bg-gray-900/40 rounded-xl overflow-hidden border border-gray-800 hover:border-fuchsia-500/50 transition-all duration-500 hover:-translate-y-2 animate-fade-in-on-scroll is-visible"
            style={{ transitionDelay: `${index * 50}ms` }}
        >
            <div className="aspect-w-1 aspect-h-1 relative overflow-hidden bg-gray-800">
                {!isLoaded && (
                    <div className="absolute inset-0 animate-shimmer z-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <img 
                    src={member.imageUrl} 
                    alt={`${member.name} - ${member.role}`} 
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                />
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                    {member.categories.map((cat) => (
                        <span key={cat} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md shadow-lg ${
                            cat === 'Team' 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                                : 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                        }`}>
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-6 relative z-20 -mt-12">
                <div className="bg-[#111] p-6 rounded-lg shadow-xl border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-fuchsia-400 transition-colors">{member.name}</h3>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{member.role}</p>
                    
                    <div className="h-px w-full bg-gray-800 mb-4 group-hover:bg-fuchsia-500/30 transition-colors"></div>
                    
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4 hover:line-clamp-none transition-all">
                        {member.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {member.expertise.map((skill, idx) => (
                            <span key={idx} className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-800 text-gray-400 rounded-sm border border-gray-700">
                                {skill}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 text-gray-500">
                        <button className="hover:text-white transition-colors" aria-label={`${member.name} Instagram profile`}><InstagramIcon className="w-5 h-5" /></button>
                        <button className="hover:text-white transition-colors" aria-label={`${member.name} Twitter profile`}><TwitterIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </article>
    );
};

const TeamPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Team' | 'Artist'>('All');

    useEffect(() => {
        const fetchTeam = async () => {
            setIsLoading(true);
            const data = await getTeamMembers();
            setMembers(data);
            setIsLoading(false);
        };
        fetchTeam();
    }, []);

    const filteredMembers = members.filter(m => filter === 'All' || m.categories.includes(filter as any));

    return (
        <GalleryLayout
            onBack={onBack}
            title="TEAM & ARTISTS"
            tagline="The Minds Behind The Music."
            brandColor="#ff00ff"
            blueprintStyle={blueprintStyleFuchsia}
        >
            <SEO 
                title="Our Roster" 
                description="Meet the world-class engineers, producers, and resident artists at UNDR:LA Studios. Professional expertise meets creative vision."
            />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <nav className="flex justify-center gap-4 mb-16" aria-label="Team filters">
                    {['All', 'Team', 'Artist'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${
                                filter === f 
                                    ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' 
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                            aria-pressed={filter === f}
                        >
                            {f === 'All' ? 'Full Roster' : f === 'Team' ? 'Studio Team' : 'Artists'}
                        </button>
                    ))}
                </nav>

                {isLoading ? (
                    <div className="flex justify-center py-20"><LoadingSpinnerIcon /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
                        {filteredMembers.map((member, index) => (
                            <MemberCard key={member.id} member={member} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </GalleryLayout>
    );
};

export default TeamPage;
