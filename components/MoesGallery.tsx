
import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, PlayIcon, PauseIcon, UsersIcon, SkipBackIcon, SkipForwardIcon, ChevronDownIcon } from './icons';
import { studioFaqs, featuredSessions as defaultFeaturedSessions } from '../data/studioData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from './common/Modal';
import { GalleryLayout } from '../layouts/GalleryLayout';
import { BookingForm } from './BookingForm';
import { blueprintStyleFuchsia } from '../styles/common';
import type { FeaturedSession } from '../types';
import SEO from './SEO';

// --- TYPES & DATA ---

interface Session {
  id: number;
  artist: string;
  type: 'image' | 'video';
  description: string;
  images: string[];
  rotation: number;
  widthClass: string;
  zIndex: string;
}

const moesSessions: Session[] = [
  { 
    id: 1, 
    artist: 'Weekly DJ Showcase', 
    type: 'image', 
    description: 'Our weekly live stream fundraiser, every Monday at 8 PM PT. Support local artists and keep the music alive!',
    images: [
        'https://images.unsplash.com/photo-1571266028243-37160d7f0e53?q=80&w=1000&auto=format&fit=crop&fm=webp&q=80',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop&fm=webp&q=80'
    ],
    rotation: -1.5,
    widthClass: 'w-full max-w-4xl',
    zIndex: 'z-30'
  },
  { 
    id: 2, 
    artist: 'Under LA: Monday Nite', 
    type: 'image', 
    description: 'Join us for a night of music and unity! Experience live performances and incredible energy.',
    images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop&fm=webp&q=80',
        'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=1000&auto=format&fit=crop&fm=webp&q=80'
    ],
    rotation: 2.5,
    widthClass: 'w-full lg:w-[500px]',
    zIndex: 'z-40'
  },
  {
    id: 3,
    artist: 'Studio Sessions Vol. 1',
    type: 'image',
    description: 'A collection of raw moments and creative breakthroughs from our recent recording blocks.',
    images: [
        'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1000&auto=format&fit=crop&fm=webp&q=80',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop&fm=webp&q=80'
    ],
    rotation: -2.8,
    widthClass: 'w-full lg:w-[480px]',
    zIndex: 'z-20'
  }
];

// --- SUB-COMPONENTS ---

/**
 * Added missing export PolicyModal component used by BookingForm.
 */
export const PolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <Modal isOpen={true} onClose={onClose} ariaLabelledBy="policy-modal-title">
        <div className="bg-[#0a0a0a] rounded-3xl border border-fuchsia-500/30 p-8 md:p-12 overflow-y-auto max-h-[80vh] custom-scrollbar">
            <h3 id="policy-modal-title" className="text-3xl font-bold text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <div className="w-2 h-2 bg-fuchsia-500 rounded-full shadow-[0_0_8px_#ff00ff]"></div>
                Studio Policies
            </h3>
            
            <div className="space-y-8 text-gray-400">
                <section>
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-3">1. Booking & Deposits</h4>
                    <p className="text-sm leading-relaxed">
                        A 50% non-refundable deposit is required to secure all session bookings. The remaining balance is due upon arrival at the studio. Sessions are not confirmed until the deposit is received.
                    </p>
                </section>

                <section>
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-3">2. Cancellation & Rescheduling</h4>
                    <p className="text-sm leading-relaxed">
                        Cancellations or rescheduling requests must be made at least 48 hours in advance. Failure to provide 48 hours' notice will result in the forfeiture of your deposit. 
                    </p>
                </section>

                <section>
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-3">3. File Delivery & Storage</h4>
                    <p className="text-sm leading-relaxed">
                        Final session files will be delivered via secure digital link (Dropbox/WeTransfer) after full payment is received. We maintain a backup of session files for 30 days post-session. UNDR:LA is not responsible for data loss beyond this period.
                    </p>
                </section>

                <section>
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-3">4. Conduct & Damages</h4>
                    <p className="text-sm leading-relaxed">
                        Clients are responsible for any damages to studio equipment or property caused by negligence or improper conduct. Smoking is permitted in designated outdoor areas only.
                    </p>
                </section>
            </div>

            <div className="mt-12 flex justify-center">
                <button 
                    onClick={onClose}
                    className="px-10 py-3 bg-fuchsia-600 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-fuchsia-500 transition-all shadow-lg shadow-fuchsia-500/20"
                >
                    Acknowledge & Close
                </button>
            </div>
        </div>
    </Modal>
);

const TapeOverlay: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' }> = ({ position }) => {
    const posClasses = {
        'top-left': "-top-4 -left-6 rotate-[-45deg]",
        'top-right': "-top-4 -right-6 rotate-[45deg]",
        'bottom-left': "-bottom-4 -left-6 rotate-[45deg]",
        'bottom-right': "-bottom-4 -right-6 rotate-[-45deg]",
        'top': "-top-6 left-1/2 -translate-x-1/2 rotate-[2deg]"
    };

    return (
        <div className={`absolute z-50 w-32 h-10 bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-700 ${posClasses[position]}`}
             style={{ 
                 maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                 WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                 clipPath: 'polygon(0% 15%, 10% 0%, 90% 5%, 100% 15%, 95% 85%, 100% 100%, 0% 90%)'
             }}>
        </div>
    );
};

const CollageItem: React.FC<{ session: Session; index: number; className?: string; isPolaroid?: boolean }> = ({ session, index, className = "", isPolaroid = true }) => {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIdx(prev => (prev + 1) % session.images.length);
        }, 6000 + (index * 800));
        return () => clearInterval(interval);
    }, [session.images.length, index]);

    return (
        <article 
            className={`transition-all duration-1000 ${session.widthClass} ${session.zIndex} ${className}`}
            style={{ 
                transform: `rotate(${session.rotation}deg)`,
                perspective: '1500px'
            }}
        >
            <div className={`group relative p-4 pb-16 bg-[#fcfcfc] shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-700 hover:rotate-0 hover:scale-[1.05] hover:z-[100] hover:shadow-fuchsia-500/40 ${isPolaroid ? 'border border-gray-200' : ''}`}>
                
                {/* Scrapbook Tape */}
                {index === 0 && <TapeOverlay position="top" />}
                {index === 1 && <TapeOverlay position="top-right" />}
                {index === 2 && <TapeOverlay position="top-left" />}

                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 mb-6">
                    {session.images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt=""
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 ${
                                idx === currentImageIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                            }`}
                        />
                    ))}
                    <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                </div>

                <div className="px-2">
                    <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight mb-1 group-hover:text-fuchsia-600 transition-colors">
                        {session.artist}
                    </h3>
                    <p className="text-gray-500 text-[10px] font-bold leading-tight opacity-80 italic font-mono">
                        // {session.description}
                    </p>
                </div>
            </div>
        </article>
    );
};

const FaqItem: React.FC<{ faq: { id: number; question: string; answer: string }; index: number }> = ({ faq, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={`group relative bg-white/[0.02] rounded-2xl border transition-all duration-500 overflow-hidden ${
                isOpen ? 'border-fuchsia-500/50 bg-white/[0.05]' : 'border-white/5 hover:border-white/10'
            }`}>
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 text-left">
                    <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-fuchsia-400' : 'text-gray-200'}`}>{faq.question}</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-fuchsia-500' : 'text-gray-500'}`} />
                </button>
                <div className={`grid transition-all duration-500 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <p className="px-6 pb-6 text-gray-400 leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShowcaseItem: React.FC<{ 
    track: FeaturedSession; 
    index: number; 
    isActive: boolean; 
    isPlaying: boolean; 
    onSelect: (index: number) => void 
}> = ({ track, index, isActive, isPlaying, onSelect }) => (
    <button 
        onClick={() => onSelect(index)}
        className={`w-full flex items-center gap-4 p-5 text-left border-b border-white/5 transition-all duration-300 group relative overflow-hidden ${
          isActive 
            ? 'bg-fuchsia-500/20 translate-x-2' 
            : 'hover:bg-white/[0.06] hover:translate-x-1 hover:scale-[1.01]'
        }`}
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-fuchsia-500 transition-all duration-500 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`} />
        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg group-hover:shadow-fuchsia-500/20 transition-all">
            <img src={track.imageUrl} alt="" className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`} loading="lazy" />
            {isActive && isPlaying && (
              <div className="absolute inset-0 bg-fuchsia-600/40 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-4">
                  <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                  <div className="w-0.5 bg-white animate-[music-bar_1.2s_ease-in-out_infinite]" />
                  <div className="w-0.5 bg-white animate-[music-bar_0.9s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
        </div>
        <div className="min-w-0 flex-grow">
            <h5 className={`text-sm font-black uppercase tracking-[0.15em] truncate transition-colors duration-300 ${isActive ? 'text-fuchsia-400 font-extrabold' : 'text-white group-hover:text-fuchsia-300'}`}>{track.title}</h5>
            <div className="flex items-center gap-2">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{track.artist}</p>
              {isActive && isPlaying && <span className="text-[8px] text-fuchsia-500 animate-pulse font-black uppercase tracking-[0.2em]">• Now Playing</span>}
            </div>
        </div>
        <div className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <div className="w-10 h-10 rounded-full border-2 border-fuchsia-500/50 bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
             {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
          </div>
        </div>
    </button>
);

const StudioShowcasePlayer: React.FC<{ playlist: FeaturedSession[] }> = ({ playlist }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const currentTrack = playlist[currentIndex];
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col lg:flex-row max-w-7xl mx-auto shadow-2xl">
            <div className="flex-grow p-12 flex flex-col items-center justify-center bg-gradient-to-br from-black to-[#111] relative">
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_8px_#ff00ff]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Live Roster Showcase</span>
                </div>
                <div className="relative w-full max-w-sm aspect-square mb-12">
                    <div className="absolute -inset-4 bg-fuchsia-500/10 rounded-full blur-[60px] animate-pulse"></div>
                    <img src={currentTrack.imageUrl} alt="" className="relative w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl" loading="lazy" />
                </div>
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{currentTrack.title}</h3>
                    <p className="text-fuchsia-500 text-sm font-bold uppercase tracking-widest">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => setCurrentIndex((currentIndex - 1 + playlist.length) % playlist.length)} className="text-gray-600 hover:text-white transition-colors"><SkipBackIcon className="w-8 h-8" /></button>
                    <button onClick={togglePlay} className="w-20 h-20 bg-fuchsia-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-xl shadow-fuchsia-500/20">
                        {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8 ml-1" />}
                    </button>
                    <button onClick={() => setCurrentIndex((currentIndex + 1) % playlist.length)} className="text-gray-600 hover:text-white transition-colors"><SkipForwardIcon className="w-8 h-8" /></button>
                </div>
                {currentTrack.mediaType === 'audio' && <audio ref={audioRef} src={currentTrack.mediaUrl} onEnded={() => setIsPlaying(false)} />}
            </div>
            <div className="lg:w-96 bg-black/40 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col">
                <header className="flex justify-between items-center mb-8">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">Studio Queue</h4>
                  <div className="h-px flex-grow ml-4 bg-white/10"></div>
                </header>
                <div className="space-y-1 overflow-y-auto flex-grow pr-2">
                    {playlist.map((track, idx) => (
                        <ShowcaseItem key={track.id} track={track} index={idx} isActive={currentIndex === idx} isPlaying={isPlaying} onSelect={setCurrentIndex} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const MoesGallery: React.FC<{ onBack: () => void; onViewTeam: () => void }> = ({ onBack, onViewTeam }) => {
  const [featuredSessions] = useLocalStorage<FeaturedSession[]>('underla_featured_sessions', defaultFeaturedSessions);
  const [studioName] = useLocalStorage<string>('tag_studio_name', 'UNDR:LA Studios');
  const bookingFormRef = useRef<HTMLDivElement>(null);

  return (
    <GalleryLayout
        onBack={onBack}
        title={studioName}
        tagline="Where Sound Meets Soul."
        brandColor="#ff00ff"
        blueprintStyle={blueprintStyleFuchsia}
    >
        <SEO title="Studio Experience" description={`Immersive snapshots and sonic breakthroughs at ${studioName}.`} />

        <section className="relative px-6 py-32 max-w-[1400px] mx-auto overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-32 gap-12 relative z-[70]">
                <header className="max-w-xl">
                    <p className="text-fuchsia-500 text-xs font-black uppercase tracking-[0.8em] mb-4">Underground Archives</p>
                    <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter mb-6 whitespace-nowrap">
                        The Visual Journal
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">A tactile exploration of our sonic journey. Each snapshot is carefully layered to tell our story of creative breakthrough.</p>
                </header>
            </div>
            
            <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={blueprintStyleFuchsia}></div>
                
                {/* Large Top Cover Album (Base) */}
                <div className="w-full flex justify-center z-10 lg:-mb-16">
                    <CollageItem session={moesSessions[0]} index={0} />
                </div>

                {/* Overlapping Pair (Layered on top of base) */}
                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 mt-8 lg:mt-0 px-4">
                    {/* Monday Nite (Left) */}
                    <div className="lg:-mr-20 z-40 transform translate-x-4">
                        <CollageItem session={moesSessions[1]} index={1} />
                    </div>
                    {/* Vol 1 (Right) */}
                    <div className="lg:-ml-20 z-20 mt-12 lg:mt-24 transform -translate-x-4">
                        <CollageItem session={moesSessions[2]} index={2} />
                    </div>
                </div>
            </div>
        </section>

        <section className="py-40 bg-[#050505] border-y border-white/5 cursor-pointer group" onClick={onViewTeam}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl animate-pulse"></div>
                    <UsersIcon className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-6 group-hover:text-fuchsia-400 transition-colors">Resident Personnel</h2>
                <p className="text-gray-500 text-xl max-w-2xl mb-12">Collaborate with the world-class engineers and visionary artists that define our sonic fingerprint.</p>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-fuchsia-500 border-b-2 border-fuchsia-500 pb-2 group-hover:tracking-[0.6em] transition-all">View Full Roster</span>
            </div>
        </section>

        <section className="py-40 px-6">
            <StudioShowcasePlayer playlist={featuredSessions} />
        </section>

        <section className="py-24 bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto px-6">
                <p className="text-center text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.6em] mb-4">Support Engine</p>
                <h2 className="text-3xl font-bold text-center text-white uppercase tracking-widest mb-16">Intelligence Base</h2>
                <div className="space-y-4">
                    {studioFaqs.map((faq, idx) => (
                        <FaqItem key={faq.id} faq={faq} index={idx} />
                    ))}
                </div>
            </div>
        </section>

        <section ref={bookingFormRef} className="py-16">
            <BookingForm />
        </section>
        
        <style>{`
          @keyframes music-bar {
            0%, 100% { height: 4px; }
            50% { height: 16px; }
          }
        `}</style>
    </GalleryLayout>
  );
};

export default MoesGallery;
