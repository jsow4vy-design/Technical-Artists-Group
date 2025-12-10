
import React, { useState, useRef, forwardRef, useEffect, memo } from 'react';
import { CloseIcon, PlayIcon, PauseIcon } from './icons';
import { studioTeam, studioFaqs, featuredSessions as defaultFeaturedSessions } from '../data/studioData';
import { useAnimateOnScroll } from '../hooks/useAnimateOnScroll';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from './common/Modal';
import { GalleryLayout } from '../layouts/GalleryLayout';
import { BookingForm } from './BookingForm';
import { blueprintStyleFuchsia } from '../styles/common';

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
        'https://i.imgur.com/G5g2m2E.jpg',
        'https://images.unsplash.com/photo-1571266028243-37160d7f0e53?q=80&w=1964&auto-format&fit=crop',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto-format&fit=crop'
    ]
  },
  { 
    id: 2, 
    artist: 'Under LA: Monday Nite Fundraiser', 
    type: 'image', 
    description: 'Join us for a night of music and unity! Experience live performances, great vibes, and incredible energy every Monday night at our studio.',
    images: [
        'https://i.imgur.com/1B981Fb.jpg',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto-format&fit=crop',
        'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070&auto-format&fit=crop'
    ]
  },
  {
    id: 3,
    artist: 'Studio Sessions Vol. 1',
    type: 'image',
    description: 'A collection of raw moments and creative breakthroughs from our recent recording blocks. This is where the magic happens.',
    images: [
        'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2070&auto-format&fit=crop',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2070&auto-format&fit=crop',
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto-format&fit=crop'
    ]
  }
];

// --- SUB-COMPONENTS ---

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

const AudioPlayer: React.FC<{ url: string; title: string }> = ({ url, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-full border border-gray-700 w-full max-w-xs">
            <button
                onClick={togglePlay}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
            >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="flex-grow min-w-0">
                 <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-fuchsia-400 ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: isPlaying ? '100%' : '0%' }}></div>
                 </div>
                 <p className="text-xs text-gray-400 mt-1 truncate">{title}</p>
            </div>
            <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} />
        </div>
    );
};

const FeaturedSessionCard: React.FC<{ session: typeof defaultFeaturedSessions[0], index: number }> = ({ session, index }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isVisible = useAnimateOnScroll(cardRef, { threshold: 0.1 });

    return (
        <div
            ref={cardRef}
            className={`bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-fuchsia-500/50 transition-colors animate-fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div className="aspect-w-16 aspect-h-9 relative group">
                <img src={session.imageUrl} alt={`${session.title} by ${session.artist}`} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 right-4">
                     <p className="text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-1">{session.artist}</p>
                     <h4 className="text-white text-lg font-bold truncate">{session.title}</h4>
                </div>
            </div>
            <div className="p-4">
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{session.description}</p>
                {session.audioUrl && <AudioPlayer url={session.audioUrl} title={session.title} />}
            </div>
        </div>
    );
};

const HeroCollageItem: React.FC<{ session: Session; index: number }> = ({ session, index }) => {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // Stagger animations slightly based on index
        const intervalDuration = 4000 + (index * 1500); 
        
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentImageIdx(prev => (prev + 1) % session.images.length);
                setIsTransitioning(false);
            }, 500); // Wait for fade out
        }, intervalDuration);

        return () => clearInterval(interval);
    }, [session.images.length, index]);

    return (
        <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group shadow-2xl border border-white/10">
            {/* Background Images Cycling */}
            {session.images.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                        idx === currentImageIdx 
                        ? 'opacity-100 scale-110 z-10' 
                        : 'opacity-0 scale-100 z-0'
                    }`}
                    style={{ backgroundImage: `url(${img})` }}
                />
            ))}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20"></div>

            {/* Content */}
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
        </div>
    );
};

// --- MAIN COMPONENT ---

const MoesGallery: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [featuredSessions] = useLocalStorage('underla_featured_sessions', defaultFeaturedSessions);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <GalleryLayout
        onBack={onBack}
        title="UNDERLA.STUDIO"
        tagline="Where Sound Meets Soul."
        brandColor="#ff00ff"
        blueprintStyle={blueprintStyleFuchsia}
    >
        {/* Hero Section */}
        <section className="px-4 py-8 md:px-8 md:py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                 <div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-2">Latest Vibes</h2>
                    <p className="text-gray-400 max-w-xl">
                        A glimpse into the creative energy of UNDERLA. From live streams to late-night recording blocks, this is our visual diary.
                    </p>
                 </div>
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

        {/* Meet the Team */}
        <section className="py-16 bg-black/30 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center text-fuchsia-400 uppercase tracking-widest mb-12" style={{ textShadow: '0 0 10px #d946ef' }}>Meet The Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {studioTeam.map((member, i) => (
                        <div key={member.id} className="text-center group">
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-fuchsia-500 transition-colors duration-300">
                                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                            <p className="text-fuchsia-400 text-sm font-bold uppercase tracking-wide mb-3">{member.role}</p>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">{member.bio}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {member.expertise.map((skill, idx) => (
                                    <span key={idx} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">{skill}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Featured Audio */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-fuchsia-500 pl-4">Featured Sessions</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSessions.map((session, index) => (
                    <FeaturedSessionCard key={session.id} session={session} index={index} />
                ))}
             </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-900/30">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-center text-white uppercase tracking-widest mb-10">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    {studioFaqs.map(faq => (
                        <div key={faq.id} className="bg-gray-800/40 rounded-lg p-6 border border-gray-700 hover:border-fuchsia-500/30 transition-colors">
                            <h4 className="font-bold text-lg text-fuchsia-300 mb-2">{faq.question}</h4>
                            <p className="text-gray-400">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Booking Form */}
        <div ref={bookingFormRef} className="py-16">
            <BookingForm />
        </div>
    </GalleryLayout>
  );
};

export default MoesGallery;
