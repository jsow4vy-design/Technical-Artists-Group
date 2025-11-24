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
  imageUrl: string;
  description: string;
}

const moesSessions: Session[] = [
  { id: 1, artist: 'Weekly DJ Showcase', type: 'image', imageUrl: 'https://i.imgur.com/G5g2m2E.jpg', description: 'Our weekly live stream fundraiser, every Monday at 8 PM PT. Scan the code to support local artists and keep the music alive!' },
  { id: 2, artist: 'Under LA: Monday Nite Fundraiser', type: 'image', imageUrl: 'https://i.imgur.com/1B981Fb.jpg', description: 'Join us for a night of music and unity! Experience live performances, great vibes, and incredible energy every Monday night at our studio.' },
  { id: 4, artist: '"Daddy Never Loved Me" Podcast', type: 'image', imageUrl: 'https://images.unsplash.com/photo-1590602848967-a069faf395e9?q=80&w=1969&auto-format&fit-crop', description: 'Podcast recording in session. The sound-treated room is perfect for crisp dialogue.' },
];

const fixedBgStyle = {
    backgroundImage: `url(https://i.imgur.com/u14G38p.png)`,
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
};

// --- SUB-COMPONENTS ---

const HeroGallery: React.FC<{ onSessionClick: (session: Session, trigger: HTMLElement) => void }> = ({ onSessionClick }) => (
    <section className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moesSessions.map((session, index) => {
                const elRef = useRef<HTMLButtonElement>(null);
                return (
                    <button
                        key={session.id}
                        ref={elRef}
                        className={`relative group overflow-hidden rounded-lg shadow-lg cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-fuchsia-500 animate-fade-in ${index === 0 ? 'col-span-2 row-span-2' : 'aspect-w-1 aspect-h-1'}`}
                        onClick={() => elRef.current && onSessionClick(session, elRef.current)}
                    >
                        <img 
                            src={session.imageUrl} 
                            alt={session.artist} 
                            className="w-full h-full object-cover transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-100"></div>
                        <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                            <h3 className="text-xl font-bold uppercase tracking-wider transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">{session.artist}</h3>
                        </div>
                    </button>
                );
            })}
        </div>
    </section>
);

const AudioPlayer = memo<{ session: any, isPlaying: boolean, onPlayPause: () => void }>(({ session, isPlaying, onPlayPause }) => {
    const buttonBaseClasses = "p-3 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-500";
    const playingClasses = "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/50 animate-pulse";
    const pausedClasses = "bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/40";
    
    return (
        <div className={`flex items-center space-x-4 p-4 bg-black/30 rounded-lg border transition-all duration-300 ${isPlaying ? 'border-fuchsia-400 scale-[1.02]' : 'border-fuchsia-500/20'}`}>
            <img 
                src={session.imageUrl} 
                alt={session.artist} 
                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
            />
            <div className="flex-grow min-w-0">
                <p className="font-bold truncate text-white">{session.title}</p>
                <p className="text-sm text-fuchsia-300 truncate">{session.artist}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{session.description}</p>
            </div>
            <button onClick={onPlayPause} className={`${buttonBaseClasses} ${isPlaying ? playingClasses : pausedClasses}`} aria-label={isPlaying ? `Pause ${session.title}` : `Play ${session.title}`}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
        </div>
    );
});

const AudioShowcase = forwardRef<HTMLDivElement>((props, ref) => {
    const [featuredSessions] = useLocalStorage('underla_featured_sessions', defaultFeaturedSessions);
    const [activeAudio, setActiveAudio] = useState<{ id: number; audio: HTMLAudioElement } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const isVisible = useAnimateOnScroll(ref as React.RefObject<HTMLDivElement>, { threshold: 0.1 });

    const handlePlayPause = (session: typeof featuredSessions[0]) => {
        // Case 1: The clicked session is the one that's currently active.
        if (activeAudio && activeAudio.id === session.id) {
            if (isPlaying) {
                activeAudio.audio.pause();
                setIsPlaying(false);
            } else {
                activeAudio.audio.play();
                setIsPlaying(true);
            }
        } 
        // Case 2: A different session is active, or no session is active.
        else {
            // Stop any currently playing audio.
            if (activeAudio) {
                activeAudio.audio.pause();
            }
            
            // Create a new audio object for the clicked session and play it.
            const newAudio = new Audio(session.audioUrl);
            newAudio.play();
            
            // When it ends, clear the state.
            newAudio.onended = () => {
                setActiveAudio(null);
                setIsPlaying(false);
            };
            
            // Update the state to the new session.
            setActiveAudio({ id: session.id, audio: newAudio });
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        // Cleanup function to pause audio on component unmount
        return () => {
          if (activeAudio) {
            activeAudio.audio.pause();
          }
        };
    }, [activeAudio]);

    return (
        <div ref={ref} className={`py-16 animate-fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}>
            <div className="max-w-6xl mx-auto px-8">
                <h2 className="text-3xl font-bold text-center uppercase tracking-widest text-fuchsia-400 mb-8" style={{ textShadow: `0 0 10px #ff00ff`}}>Hear the Sound</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredSessions.map(session => (
                        <AudioPlayer key={session.id} session={session} isPlaying={activeAudio?.id === session.id && isPlaying} onPlayPause={() => handlePlayPause(session)} />
                    ))}
                </div>
            </div>
        </div>
    );
});

const TeamMemberCard = memo<{ member: typeof studioTeam[0] }>(({ member }) => (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-fuchsia-500/20">
        <img 
            src={member.imageUrl} 
            alt={member.name} 
            className="w-full h-56 object-cover object-center"
            loading="lazy"
            decoding="async"
        />
        <div className="p-6">
            <h3 className="text-2xl font-bold text-white">{member.name}</h3>
            <p className="text-md text-fuchsia-400 font-semibold">{member.role}</p>
            <p className="text-gray-400 mt-2 text-sm">{member.bio}</p>
        </div>
    </div>
));

const TeamSection = forwardRef<HTMLDivElement>((_props, ref) => {
    const isVisible = useAnimateOnScroll(ref as React.RefObject<HTMLDivElement>, { threshold: 0.1 });
    return (
        <div ref={ref} className={`py-16 animate-fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}>
            <div className="max-w-6xl mx-auto px-8">
                <h2 className="text-3xl font-bold text-center uppercase tracking-widest text-fuchsia-400 mb-8" style={{ textShadow: `0 0 10px #ff00ff`}}>Meet the Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {studioTeam.map(member => <TeamMemberCard key={member.id} member={member} />)}
                </div>
            </div>
        </div>
    );
});

const FaqItem = memo<{ faq: { id: number; question: string; answer: string }, isOpen: boolean, onToggle: () => void }>(({ faq, isOpen, onToggle }) => (
    <div className="border-b border-fuchsia-500/20">
        <button onClick={onToggle} aria-expanded={isOpen} className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-fuchsia-500/10">
            <span className="text-lg font-semibold text-gray-200">{faq.question}</span>
            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                <svg className="w-6 h-6 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </span>
        </button>
        <div className="grid transition-all duration-500" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
            <div className="overflow-hidden"><div className="px-2 pb-4 text-gray-400">{faq.answer}</div></div>
        </div>
    </div>
));

const FaqSection = forwardRef<HTMLDivElement>((_props, ref) => {
    const isVisible = useAnimateOnScroll(ref as React.RefObject<HTMLDivElement>, { threshold: 0.1 });
    const [openFaqId, setOpenFaqId] = useState<number | null>(1);
    return (
        <div ref={ref} className={`py-16 animate-fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}>
            <div className="max-w-4xl mx-auto px-8">
                <h2 className="text-3xl font-bold text-center uppercase tracking-widest text-fuchsia-400 mb-8" style={{ textShadow: `0 0 10px #ff00ff`}}>FAQ</h2>
                <div className="bg-gray-800/50 border border-fuchsia-500/20 rounded-lg p-4">
                    {studioFaqs.map(faq => (
                        <FaqItem key={faq.id} faq={faq} isOpen={openFaqId === faq.id} onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
});

export const PolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} ariaLabelledBy="policy-title" closeButtonAriaLabel="Close policy">
             <div className="max-w-2xl bg-gray-900 rounded-lg shadow-2xl w-full border border-fuchsia-500/30 p-8" style={blueprintStyleFuchsia}>
                <h3 id="policy-title" className="text-2xl font-bold uppercase tracking-wider text-fuchsia-400 mb-4">Terms & Cancellation Policy</h3>
                <div className="space-y-4 text-gray-300">
                    <div><h4 className="font-bold text-white">Booking & Payment</h4><p>A 50% deposit is required to confirm all booking sessions. The remaining balance is due on the day of your session.</p></div>
                    <div><h4 className="font-bold text-white">Cancellation Policy</h4><p>We require a minimum of 48 hours' notice for any cancellations. Cancellations made with less than 48 hours' notice will result in the forfeiture of your 50% deposit.</p></div>
                </div>
                <div className="text-right mt-6"><button onClick={onClose} className="px-6 py-2 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full hover:scale-105">I Understand</button></div>
            </div>
        </Modal>
    );
};

const SessionDetailModalContent: React.FC<{ session: Session }> = ({ session }) => (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden w-full border border-fuchsia-500/30" style={blueprintStyleFuchsia}>
        <img src={session.imageUrl} alt={`${session.artist} session image`} className="w-full h-64 object-cover" />
        <div className="p-8">
            <h3 id="session-modal-title" className="text-3xl font-bold uppercase tracking-wider text-fuchsia-400" style={{ textShadow: `0 0 10px #ff00ff`}}>{session.artist}</h3>
            <p className="mt-2 text-gray-300">{session.description}</p>
        </div>
    </div>
);


// --- MAIN COMPONENT ---

const MoesGallery: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  
  const formSectionRef = useRef<HTMLDivElement>(null);
  const audioShowcaseRef = useRef<HTMLDivElement>(null);
  const teamSectionRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);

  const handleSessionClick = (session: Session, trigger: HTMLElement) => {
    setTriggerElement(trigger);
    setSelectedSession(session);
  };
  
  const handleCloseModal = () => {
    setSelectedSession(null);
    triggerElement?.focus();
  };

  const handleBookNowClick = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <GalleryLayout
        onBack={onBack}
        title="UNDERLA.STUDIO"
        tagline="Your Sound. Your Stage. Your Story."
        brandColor="#ff00ff"
        blueprintStyle={blueprintStyleFuchsia}
    >
        <div className="absolute top-0 right-8" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
             <button onClick={handleBookNowClick} className="hidden sm:block px-6 py-2 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all hover:scale-105 text-sm uppercase tracking-wider">Book a Session</button>
        </div>
        
        <HeroGallery onSessionClick={handleSessionClick} />
        
        <section className="py-16 text-center max-w-4xl mx-auto px-8">
            <p className="text-lg text-gray-300">
                From intimate singer-songwriter demos to full-band productions and pristine podcast recordings, UNDERLA.STUDIO is a creative sanctuary built for artists. Our curated gear, acoustically treated rooms, and passionate team are here to help you capture the magic.
            </p>
        </section>
        
        <AudioShowcase ref={audioShowcaseRef} />
        <TeamSection ref={teamSectionRef} />
        <FaqSection ref={faqSectionRef} />

        <div ref={formSectionRef} className="py-16 bg-gray-900/50" style={fixedBgStyle}>
            <div className="relative z-10 bg-black/70 py-16">
                 <BookingForm />
            </div>
        </div>
      
        <Modal
            isOpen={!!selectedSession}
            onClose={handleCloseModal}
            ariaLabelledBy="session-modal-title"
        >
          {selectedSession && <SessionDetailModalContent session={selectedSession} />}
        </Modal>
    </GalleryLayout>
  );
};

export default MoesGallery;
