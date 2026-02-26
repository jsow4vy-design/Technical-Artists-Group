
import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, PlayIcon, PauseIcon, UsersIcon, SkipBackIcon, SkipForwardIcon, ChevronDownIcon } from './icons';
import { studioFaqs, featuredSessions as defaultFeaturedSessions, studioTeam } from '../data/studioData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from './common/Modal';
import { GalleryLayout } from '../layouts/GalleryLayout';
import { BookingForm } from './BookingForm';
import { blueprintStyleFuchsia } from '../styles/common';
import type { FeaturedSession, GallerySession } from '../types';
import SEO from './SEO';

// ============================================================================
// Types & Interfaces
// ============================================================================

// (Types are imported from ../types)

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Modal displaying studio policies.
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

/**
 * Decorative tape overlay for the collage items.
 */
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

/**
 * Individual collage item displaying a session with rotating images.
 */
const CollageItem: React.FC<{ session: GallerySession; index: number; className?: string; isPolaroid?: boolean }> = ({ session, index, className = "", isPolaroid = true }) => {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIdx(prev => (prev + 1) % session.images.length);
        }, 6000 + (index * 800));
        return () => clearInterval(interval);
    }, [session.images.length, index]);

    return (
        <article 
            className={`transition-all duration-1000 ${className}`}
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

/**
 * FAQ Accordion Item.
 */
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

/**
 * Individual track item in the showcase player playlist.
 */
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

/**
 * Audio player component for the studio showcase.
 */
const StudioShowcasePlayer: React.FC<{ playlist: FeaturedSession[] }> = ({ playlist }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const currentTrack = playlist[currentIndex];
    const audioRef = useRef<HTMLAudioElement>(null);

    // Auto-play effect when track changes IF already playing
    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(() => {});
        }
    }, [currentIndex]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col lg:flex-row max-w-7xl mx-auto shadow-2xl">
            <div className="flex-grow p-12 flex flex-col items-center justify-center bg-gradient-to-br from-black to-[#111] relative">
                {/* Header/Badge */}
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_8px_#ff00ff]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Live Roster Showcase</span>
                </div>
                
                {/* Album Art */}
                <div className="relative w-full max-w-sm aspect-square mb-12 group">
                    <div className="absolute -inset-4 bg-fuchsia-500/10 rounded-full blur-[60px] animate-pulse group-hover:bg-fuchsia-500/20 transition-colors"></div>
                    <img src={currentTrack.imageUrl} alt="" className="relative w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" loading="lazy" />
                </div>
                
                {/* Track Info */}
                <div className="text-center mb-8 w-full max-w-lg">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 line-clamp-1">{currentTrack.title}</h3>
                    <p className="text-fuchsia-500 text-sm font-bold uppercase tracking-widest">{currentTrack.artist}</p>
                </div>

                {/* Progress Bar (Only for Audio) */}
                {currentTrack.mediaType === 'audio' && (
                    <div className="w-full max-w-md mb-8 flex items-center gap-4">
                        <span className="text-[10px] text-gray-500 font-mono font-bold w-8 text-right">{formatTime(currentTime)}</span>
                        <div className="flex-grow relative h-1.5 bg-gray-800 rounded-full group cursor-pointer">
                             <input 
                                type="range" 
                                min="0" 
                                max={duration || 100} 
                                value={currentTime} 
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                             />
                             <div className="absolute top-0 left-0 h-full bg-fuchsia-600 rounded-full pointer-events-none transition-all duration-100 ease-linear z-10" style={{ width: `${progressPercent}%` }}></div>
                             <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-lg pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-10" style={{ left: `${progressPercent}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono font-bold w-8">{formatTime(duration)}</span>
                    </div>
                )}
                
                {/* Controls */}
                <div className="flex items-center gap-10">
                    <button onClick={handlePrev} className="text-gray-500 hover:text-white transition-colors hover:scale-110 active:scale-95"><SkipBackIcon className="w-8 h-8" /></button>
                    <button 
                        onClick={togglePlay} 
                        className="w-20 h-20 bg-fuchsia-600 rounded-full flex items-center justify-center text-white hover:bg-fuchsia-500 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(217,70,239,0.3)]"
                    >
                        {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8 ml-1" />}
                    </button>
                    <button onClick={handleNext} className="text-gray-500 hover:text-white transition-colors hover:scale-110 active:scale-95"><SkipForwardIcon className="w-8 h-8" /></button>
                </div>

                {currentTrack.mediaType === 'audio' && (
                    <audio 
                        ref={audioRef} 
                        src={currentTrack.mediaUrl} 
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleTimeUpdate}
                        onEnded={handleNext} 
                    />
                )}
            </div>
            
            {/* Playlist Sidebar */}
            <div className="lg:w-96 bg-black/40 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col h-[500px] lg:h-auto">
                <header className="flex justify-between items-center mb-8 flex-shrink-0">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">Studio Queue</h4>
                  <div className="h-px flex-grow ml-4 bg-white/10"></div>
                </header>
                <div className="space-y-1 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                    {playlist.map((track, idx) => (
                        <ShowcaseItem 
                            key={track.id} 
                            track={track} 
                            index={idx} 
                            isActive={currentIndex === idx} 
                            isPlaying={isPlaying && currentIndex === idx} 
                            onSelect={(i) => {
                                setCurrentIndex(i);
                                setIsPlaying(true);
                            }} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... (imports remain the same)

// ... (sub-components remain the same)

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Gallery Page Component.
 * Displays the visual journal, resident personnel, and studio showcase.
 */
const UNDRLAGallery: React.FC<{ onBack: () => void; onViewTeam: () => void }> = ({ onBack, onViewTeam }) => {
  const [featuredSessions] = useLocalStorage<FeaturedSession[]>('underla_featured_sessions', defaultFeaturedSessions);
  const [studioName] = useLocalStorage<string>('tag_studio_name', 'UNDR:LA Studios');
  const [gallerySessions, setGallerySessions] = useState<GallerySession[]>([]);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  // Fetch gallery data from the backend
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setGallerySessions(data);
        }
      })
      .catch(err => console.error("Failed to fetch gallery data:", err));
  }, []);

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
                    <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-6 whitespace-nowrap">
                        The Visual Journal
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">A tactile exploration of our sonic journey. Each snapshot is carefully layered to tell our story of creative breakthrough.</p>
                </header>
            </div>
            
            <div className="relative w-full max-w-7xl mx-auto flex justify-center items-center overflow-x-auto pb-12 custom-scrollbar">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={blueprintStyleFuchsia}></div>
                
                <div className="flex flex-nowrap items-center justify-center px-12 min-w-full">
                    {gallerySessions.map((session, index) => (
                        <div 
                            key={session.id} 
                            className={`relative transition-all duration-500 hover:z-[100] hover:scale-105 ${index !== 0 ? '-ml-16 lg:-ml-24' : ''}`}
                            style={{ zIndex: 50 - index }}
                        >
                            <CollageItem 
                                session={session} 
                                index={index} 
                                className="w-[300px] md:w-[360px]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-40 bg-[#050505] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                <div className="mb-12 relative cursor-pointer group" onClick={onViewTeam}>
                    <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl animate-pulse"></div>
                    <UsersIcon className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-6 cursor-pointer hover:text-fuchsia-400 transition-colors" onClick={onViewTeam}>Resident Personnel</h2>
                <p className="text-gray-500 text-xl max-w-2xl mb-16">Collaborate with the world-class engineers and visionary artists that define our sonic fingerprint.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full mb-16">
                    {studioTeam.slice(0, 5).map((member) => (
                        <div key={member.id} className="group relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 hover:border-fuchsia-500/40 transition-all duration-500 cursor-pointer" onClick={onViewTeam}>
                            <div className="aspect-square relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 opacity-90 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" loading="lazy" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h4 className="text-white font-bold text-sm uppercase tracking-tight truncate">{member.name}</h4>
                                <p className="text-fuchsia-500 text-[9px] font-black uppercase tracking-widest truncate mt-1">{member.role.split('&')[0]}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={onViewTeam} className="text-xs font-black uppercase tracking-[0.4em] text-fuchsia-500 border-b-2 border-fuchsia-500 pb-2 hover:tracking-[0.6em] transition-all">View Full Roster</button>
            </div>
        </section>

        <section className="py-40 px-6">
            <StudioShowcasePlayer playlist={featuredSessions} />
        </section>

        <section className="py-24 bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto px-6">
                <p className="text-center text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.6em] mb-4">Support Engine</p>
                <h2 className="text-4xl md:text-6xl font-bold text-center text-white uppercase tracking-widest mb-16">Intelligence Base</h2>
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

export default UNDRLAGallery;
