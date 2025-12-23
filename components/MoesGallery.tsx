
import React, { useState, useRef, forwardRef, useEffect, memo } from 'react';
import { CloseIcon, PlayIcon, PauseIcon, UsersIcon, SkipBackIcon, SkipForwardIcon, VolumeIcon, ChevronDownIcon } from './icons';
import { studioFaqs, featuredSessions as defaultFeaturedSessions } from '../data/studioData';
import { useAnimateOnScroll } from '../hooks/useAnimateOnScroll';
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
}

const moesSessions: Session[] = [
  { 
    id: 1, 
    artist: 'Weekly DJ Showcase', 
    type: 'image', 
    description: 'Our weekly live stream fundraiser, every Monday at 8 PM PT. Scan the code to support local artists and keep the music alive!',
    images: [
        'https://images.unsplash.com/photo-1571266028243-37160d7f0e53?q=80&w=1200&auto=format&fit=crop&fm=webp',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop&fm=webp',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1200&auto=format&fit=crop&fm=webp'
    ]
  },
  { 
    id: 2, 
    artist: 'Under LA: Monday Nite Fundraiser', 
    type: 'image', 
    description: 'Join us for a night of music and unity! Experience live performances, great vibes, and incredible energy every Monday night at our studio.',
    images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop&fm=webp',
        'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=1200&auto=format&fit=crop&fm=webp',
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop&fm=webp'
    ]
  },
  {
    id: 3,
    artist: 'Studio Sessions Vol. 1',
    type: 'image',
    description: 'A collection of raw moments and creative breakthroughs from our recent recording blocks. This is where the magic happens.',
    images: [
        'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1200&auto=format&fit=crop&fm=webp',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1200&auto=format&fit=crop&fm=webp',
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1200&auto=format&fit=crop&fm=webp'
    ]
  }
];

// --- SUB-COMPONENTS ---

const FaqItem: React.FC<{ faq: { id: number; question: string; answer: string }; index: number }> = ({ faq, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const isVisible = useAnimateOnScroll(itemRef, { threshold: 0.1 });

    return (
        <div 
            ref={itemRef}
            style={{ transitionDelay: `${index * 100}ms` }}
            className={`transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
            <div className={`group relative bg-gray-800/20 rounded-xl border transition-all duration-500 overflow-hidden hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.98] ${
                isOpen 
                    ? 'border-fuchsia-500/80 bg-gray-800/60 shadow-[0_10px_40px_rgba(217,70,239,0.2)]' 
                    : 'border-gray-700/50 hover:border-fuchsia-500/50 hover:bg-gray-800/40 hover:shadow-[0_0_20px_rgba(217,70,239,0.1)]'
            }`}>
                <div className={`absolute inset-0 bg-gradient-to-tr from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isOpen ? 'opacity-100' : ''}`}></div>

                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full flex items-center justify-between p-6 text-left focus:outline-none z-10"
                    aria-expanded={isOpen}
                >
                    <span className={`font-bold text-lg md:text-xl tracking-tight transition-all duration-300 ${isOpen ? 'text-fuchsia-400 translate-x-1' : 'text-gray-100 group-hover:text-fuchsia-200'}`}>
                        {faq.question}
                    </span>
                    <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-fuchsia-500 text-black rotate-180 shadow-[0_0_15px_rgba(217,70,239,0.6)]' : 'bg-gray-700/50 text-fuchsia-400 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-300'}`}>
                        <ChevronDownIcon className="w-6 h-6" />
                    </div>
                </button>
                
                <div 
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className={`px-6 pb-8 text-gray-400 leading-relaxed border-t border-gray-700/30 pt-6 transition-all duration-700 delay-100 transform ${
                            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`}>
                            <p className="text-base md:text-lg font-medium bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                                {faq.answer}
                            </p>
                        </div>
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
}> = ({ track, index, isActive, isPlaying, onSelect }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <button 
            onClick={() => onSelect(index)}
            className={`w-full flex items-center gap-4 p-4 text-left border-b border-gray-800/50 hover:bg-white/5 transition-colors group ${isActive ? 'bg-fuchsia-500/10' : ''}`}
        >
            <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-gray-700 bg-gray-900">
                {!isLoaded && (
                    <div className="absolute inset-0 animate-shimmer z-10" />
                )}
                <img 
                    src={track.imageUrl} 
                    alt={track.title} 
                    onLoad={() => setIsLoaded(true)}
                    decoding="async"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
                    loading="lazy" 
                />
                {isActive && isPlaying && track.mediaType === 'audio' && (
                    <div className="absolute inset-0 bg-fuchsia-500/40 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-4">
                            <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}
                <div className="absolute top-0 right-0 p-1 bg-black/60 rounded-bl">
                   <span className="text-[8px] text-white font-bold uppercase">{track.mediaType}</span>
                </div>
            </div>
            <div className="min-w-0 flex-grow">
                <h5 className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-fuchsia-400' : 'text-gray-200'}`}>
                    {track.title}
                </h5>
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
            </div>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_5px_#ff00ff]"></div>}
        </button>
    );
};

const StudioShowcasePlayer: React.FC<{ playlist: FeaturedSession[] }> = ({ playlist }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const currentTrack = playlist[currentIndex];

    useEffect(() => {
        setIsImageLoaded(false);
        setIsPlaying(false);
        setProgress(0);
    }, [currentIndex]);

    const togglePlay = () => {
        if (currentTrack.mediaType === 'audio') {
            if (!audioRef.current) return;
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play().catch(console.error);
        } else {
            if (!videoRef.current) return;
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const ref = currentTrack.mediaType === 'audio' ? audioRef.current : videoRef.current;
        if (!ref) return;
        const current = ref.currentTime;
        const total = ref.duration || 1;
        setProgress((current / total) * 100);
    };

    const handleLoadedMetadata = () => {
        const ref = currentTrack.mediaType === 'audio' ? audioRef.current : videoRef.current;
        if (!ref) return;
        setDuration(ref.duration);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const ref = currentTrack.mediaType === 'audio' ? audioRef.current : videoRef.current;
        if (!ref) return;
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        ref.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
        if (videoRef.current) videoRef.current.volume = newVolume;
    };

    const nextTrack = () => {
        const next = (currentIndex + 1) % playlist.length;
        setCurrentIndex(next);
    };

    const prevTrack = () => {
        const prev = (currentIndex - 1 + playlist.length) % playlist.length;
        setCurrentIndex(prev);
    };

    const selectTrack = (index: number) => {
        setCurrentIndex(index);
    };

    const handleEnded = () => {
        nextTrack();
    };

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const idMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            if (idMatch) return `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0`;
        }
        if (url.includes('vimeo.com')) {
            const idMatch = url.match(/vimeo.com\/(\d+)/);
            if (idMatch) return `https://player.vimeo.com/video/${idMatch[1]}?autoplay=1`;
        }
        return null;
    };

    const embedUrl = getEmbedUrl(currentTrack.mediaUrl);

    if (!currentTrack) return <div className="p-12 text-center text-gray-500 italic">No showcase items available.</div>;

    return (
        <div className="bg-[#111] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-7xl mx-auto">
            <div className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800 bg-gradient-to-br from-black to-gray-900">
                <div className="relative w-full aspect-video lg:aspect-square max-w-2xl mb-8 group flex items-center justify-center">
                    {currentTrack.mediaType === 'video' ? (
                        <div className="w-full h-full rounded-xl overflow-hidden border border-gray-700 bg-black relative">
                            {embedUrl ? (
                                <iframe 
                                    src={embedUrl} 
                                    className="w-full h-full" 
                                    allow="autoplay; fullscreen; picture-in-picture" 
                                    allowFullScreen
                                    title={currentTrack.title}
                                />
                            ) : (
                                <video 
                                    ref={videoRef}
                                    src={currentTrack.mediaUrl}
                                    className="w-full h-full object-contain"
                                    poster={currentTrack.imageUrl}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onEnded={handleEnded}
                                    onClick={togglePlay}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full max-sm aspect-square">
                            <div className="absolute inset-0 bg-fuchsia-500/10 rounded-xl blur-2xl animate-pulse group-hover:bg-fuchsia-500/20 transition-all"></div>
                            <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                                {!isImageLoaded && <div className="absolute inset-0 animate-shimmer z-10"></div>}
                                <img 
                                    src={currentTrack.imageUrl} 
                                    alt={currentTrack.title} 
                                    onLoad={() => setIsImageLoaded(true)}
                                    decoding="async"
                                    className={`w-full h-full object-cover transition-all duration-1000 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                    loading="eager"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mb-8">
                    <p className="text-fuchsia-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Studio Showcase // {currentTrack.mediaType}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 uppercase tracking-wider">{currentTrack.title}</h3>
                    <p className="text-gray-400 text-lg">{currentTrack.artist}</p>
                </div>

                <div className="w-full max-w-md space-y-6">
                    {!embedUrl && (
                        <>
                        <div className="space-y-2">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={progress || 0} 
                                onChange={handleProgressChange}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                <span>{Math.floor((currentTrack.mediaType === 'audio' ? audioRef.current?.currentTime : videoRef.current?.currentTime) || 0).toString().padStart(2, '0')}:{Math.floor(((currentTrack.mediaType === 'audio' ? audioRef.current?.currentTime : videoRef.current?.currentTime) || 0) % 60).toString().padStart(2, '0')}</span>
                                <span>{Math.floor(duration || 0).toString().padStart(2, '0')}:{Math.floor((duration || 0) % 60).toString().padStart(2, '0')}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-8">
                            <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors p-2" aria-label="Previous Track"><SkipBackIcon className="w-8 h-8" /></button>
                            <button 
                                onClick={togglePlay} 
                                className="w-16 h-16 rounded-full bg-fuchsia-600 text-white flex items-center justify-center hover:scale-110 hover:bg-fuchsia-500 transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8 ml-1" />}
                            </button>
                            <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors p-2" aria-label="Next Track"><SkipForwardIcon className="w-8 h-8" /></button>
                        </div>

                        <div className="flex items-center gap-4 px-8">
                            <VolumeIcon className="w-4 h-4 text-gray-500" />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gray-500"
                            />
                        </div>
                        </>
                    )}
                    {embedUrl && (
                        <div className="flex items-center justify-center gap-8">
                            <button onClick={prevTrack} className="px-6 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-fuchsia-500 rounded-full transition-all flex items-center gap-2">
                                <SkipBackIcon className="w-4 h-4" />
                                <span>Prev</span>
                            </button>
                            <button onClick={nextTrack} className="px-6 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-fuchsia-500 rounded-full transition-all flex items-center gap-2">
                                <span>Next</span>
                                <SkipForwardIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {currentTrack.mediaType === 'audio' && (
                    <audio 
                        ref={audioRef} 
                        src={currentTrack.mediaUrl} 
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleEnded}
                    />
                )}
            </div>

            <aside className="lg:w-96 flex flex-col bg-black/40 h-[400px] lg:h-auto">
                <header className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Studio Showcase</h4>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{playlist.length} Items</span>
                </header>
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {playlist.map((track, index) => (
                        <ShowcaseItem 
                            key={track.id}
                            track={track}
                            index={index}
                            isActive={currentIndex === index}
                            isPlaying={isPlaying}
                            onSelect={selectTrack}
                        />
                    ))}
                </div>
            </aside>
        </div>
    );
};

export const PolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <Modal isOpen={true} onClose={onClose} ariaLabelledBy="policy-title" closeButtonAriaLabel="Close policy modal">
        <div className="bg-gray-900 rounded-lg p-8 border border-fuchsia-500/30 max-w-2xl text-gray-300">
            <h3 id="policy-title" className="text-2xl font-bold text-fuchsia-400 mb-4">Terms & Cancellation Policy</h3>
            <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <p><strong>Booking & Deposit:</strong> A 50% deposit is required to secure your booking. The remaining balance is due at the start of your session.</p>
                <p><strong>Cancellations:</strong> Cancellations made more than 48 hours in advance will receive a full refund of the deposit. Cancellations made within 48 hours of the session start time forfeit the deposit.</p>
                <p><strong>Session Time:</strong> Setup and tear-down time is included in your booked hours. Please arrive on time to maximize your session. Overtime is charged at the standard hourly rate (if available).</p>
                <p><strong>Gear & Damages:</strong> Clients are responsible for any damage caused to studio equipment or facilities due to negligence or misuse. A gear check will be performed before and after the session.</p>
                <p><strong>Files & Data:</strong> We recommend bringing your own hard drive to take your files with you immediately. We retain session files for 30 days as a backup, but we are not responsible for long-term data storage.</p>
                <p><strong>Code of Conduct:</strong> We maintain a respectful and professional environment. Illegal drugs, smoking inside the studio, and aggressive behavior are strictly prohibited and will result in immediate termination of the session without refund.</p>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-6 py-2 bg-fuchsia-500 text-black font-bold rounded-full hover:bg-fuchsia-400">I Understand</button>
            </div>
        </div>
    </Modal>
);

const HeroCollageItem: React.FC<{ session: Session; index: number }> = ({ session, index }) => {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

    const handleImageLoad = (idx: number) => {
        setLoadedImages(prev => new Set(prev).add(idx));
    };

    const isFirstImageLoaded = loadedImages.has(0);

    useEffect(() => {
        if (!isFirstImageLoaded) return;
        const intervalDuration = 4000 + (index * 1500); 
        const interval = setInterval(() => {
            setCurrentImageIdx(prev => (prev + 1) % session.images.length);
        }, intervalDuration);
        return () => clearInterval(interval);
    }, [session.images.length, index, isFirstImageLoaded]);

    return (
        <article className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group shadow-2xl border border-white/10 bg-gray-900">
            {!isFirstImageLoaded && (
                <div className="absolute inset-0 animate-shimmer z-40" aria-hidden="true" />
            )}
            {session.images.map((img, idx) => (
                <img
                    key={idx}
                    src={img}
                    alt={`${session.artist} Studio View ${idx + 1}`}
                    onLoad={() => handleImageLoad(idx)}
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        idx === currentImageIdx && loadedImages.has(idx)
                        ? 'opacity-100 scale-110 z-10' 
                        : 'opacity-0 scale-100 z-0'
                    }`}
                    loading={index === 0 && idx === 0 ? "eager" : "lazy"}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 z-30 transform transition-transform duration-300 group-hover:-translate-y-2">
                <div className="border-l-4 border-fuchsia-500 pl-4">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2 leading-none" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {session.artist}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {session.description}
                    </p>
                </div>
            </div>
        </article>
    );
};

// --- MAIN COMPONENT ---

const MoesGallery: React.FC<{ onBack: () => void; onViewTeam: () => void }> = ({ onBack, onViewTeam }) => {
  const [featuredSessions] = useLocalStorage<FeaturedSession[]>('underla_featured_sessions', defaultFeaturedSessions);
  const [studioName] = useLocalStorage<string>('tag_studio_name', 'UNDR:LA Studios');
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <GalleryLayout
        onBack={onBack}
        title={studioName}
        tagline="Where Sound Meets Soul."
        brandColor="#ff00ff"
        blueprintStyle={blueprintStyleFuchsia}
    >
        <SEO 
            title="Studio Experience" 
            description={`Explore the immersive studio experience at ${studioName}. Book your session for recording, mixing, and more.`}
        />

        <section className="px-4 py-8 md:px-8 md:py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                 <header>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-2">Latest Vibes</h2>
                    <p className="text-gray-400 max-w-xl">
                        A glimpse into the creative energy of {studioName}. From live streams to late-night recording blocks, this is our visual diary.
                    </p>
                 </header>
                 <button 
                    onClick={scrollToBooking}
                    className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                 >
                    Book Your Session
                 </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {moesSessions.map((session, index) => (
                    <HeroCollageItem key={session.id} session={session} index={index} />
                ))}
            </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-gray-900 to-black border-y border-white/5 relative overflow-hidden group cursor-pointer" aria-label="Meet the Team" onClick={onViewTeam}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=1200&auto=format&fit=crop&fm=webp')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-fuchsia-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                    <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest mb-4 group-hover:text-fuchsia-400 transition-colors" style={{ textShadow: '0 0 20px rgba(217,70,239,0.5)' }}>
                    Meet The Team & Artists
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mb-8">
                    Discover the talented engineers, producers, and artists that make {studioName} the heartbeat of the city's music scene.
                </p>
                <span className="inline-block px-8 py-3 border-2 border-fuchsia-500 text-fuchsia-400 font-bold rounded-full uppercase tracking-wider group-hover:bg-fuchsia-500 group-hover:text-white transition-all">
                    View Roster
                </span>
            </div>
        </section>

        <section className="py-24 px-6 relative overflow-hidden">
             <header className="max-w-7xl mx-auto mb-12">
                <h2 className="text-4xl font-bold text-white uppercase tracking-[0.3em] mb-4 text-center">Studio Showcase</h2>
                <div className="h-1 w-24 bg-fuchsia-500 mx-auto rounded-full shadow-[0_0_15px_#ff00ff]"></div>
             </header>
             <StudioShowcasePlayer playlist={featuredSessions} />
        </section>

        <section className="py-16 bg-gray-900/30">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-center text-white uppercase tracking-widest mb-10">Frequently Asked Questions</h2>
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
    </GalleryLayout>
  );
};

export default MoesGallery;
