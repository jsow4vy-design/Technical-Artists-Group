
import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { blueprintStyleFuchsia } from '../styles/common';
import SEO from './SEO';

const MOES_IMAGE_URL = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop&fm=webp&q=80'; 
const BACKGROUND_VIDEO_URL = 'https://videos.pexels.com/video-files/5091632/5091632-uhd_2560_1440_25fps.mp4'; 
const DEFAULT_LOGO_URL = 'https://i.imgur.com/mlJHumZ.png';
const DEFAULT_STUDIO_NAME = 'UNDR:LA Studios';

// Decorative hero images for the "Living Blueprint" feel
const GEAR_IMAGES = [
  { 
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop&fm=webp', 
    label: 'Mic', 
    speed: 0.015, 
    initialPos: { top: '15%', left: '10%' } 
  },
  { 
    url: 'https://images.unsplash.com/photo-1520529277867-dbf8c5e0b33a?q=80&w=400&auto=format&fit=crop&fm=webp', 
    label: 'Tape', 
    speed: 0.01, 
    initialPos: { bottom: '20%', right: '10%' } 
  },
  { 
    url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400&auto=format&fit=crop&fm=webp', 
    label: 'Monitor', 
    speed: 0.008, 
    initialPos: { top: '40%', right: '15%' } 
  }
];

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed: number; 
  className?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
}

const ParallaxLayer: React.FC<ParallaxLayerProps> = ({ children, speed, className = '', style = {}, horizontal = false }) => {
  const [offset, setOffset] = useState(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        setOffset(window.pageYOffset * speed);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(requestRef.current);
    };
  }, [speed]);

  const transform = horizontal 
    ? `translate3d(${offset}px, 0, 0)` 
    : `translate3d(0, ${offset}px, 0)`;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none will-change-transform ${className}`} 
      style={{ ...style, transform }}
    >
      {children}
    </div>
  );
};

interface LandingPageProps {
  onNavigate: (view: 'gallery') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [elementsVisible, setElementsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [logoUrl] = useLocalStorage<string>('tag_logo_url', DEFAULT_LOGO_URL);
  const [studioName] = useLocalStorage<string>('tag_studio_name', DEFAULT_STUDIO_NAME);
  const mouseRequestRef = useRef<number>(0);

  useEffect(() => {
    // Reduced delay for faster "first glance" visibility
    const timer = setTimeout(() => setElementsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
        cancelAnimationFrame(mouseRequestRef.current);
        mouseRequestRef.current = requestAnimationFrame(() => {
            const { clientX, clientY } = event;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            setMousePos({ 
                x: (clientX - centerX) / centerX, 
                y: (clientY - centerY) / centerY 
            });
        });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(mouseRequestRef.current);
    };
  }, []);

  const heroContentStyle = {
    transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 8}px, 0)`,
    transition: 'transform 0.4s cubic-bezier(0.1, 0.5, 0.5, 1)'
  };

  const backgroundStyle = {
    '--mouseX': `${(mousePos.x + 1) * 50}%`,
    '--mouseY': `${(mousePos.y + 1) * 50}%`,
    '--gradient-color': 'rgba(217, 70, 239, 0.12)',
    '--gradient-size': '50vw',
  } as React.CSSProperties;

  return (
    <div
      className="relative w-full h-screen bg-[#050505] overflow-hidden landing-page-container"
      style={backgroundStyle}
    >
      <SEO 
        title="Welcome" 
        description={`Experience the sound of ${studioName}. Los Angeles' premier underground recording and production studio.`}
      />

      <section className="relative h-full w-full flex items-center justify-center overflow-hidden">
        
        {/* BACKGROUND LAYER 0: Video & Grid */}
        <ParallaxLayer speed={0.02}>
            <div className="absolute inset-0">
                <video
                    className="w-full h-full object-cover opacity-30 scale-105 transition-opacity duration-1000"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={MOES_IMAGE_URL}
                    style={{ 
                        transform: `scale(1.1) translate3d(${mousePos.x * -12}px, ${mousePos.y * -8}px, 0)`,
                    }}
                >
                    <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
                {/* Film Grain/Noise Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
            </div>
        </ParallaxLayer>

        {/* BLUEPRINT GRID LAYER */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none" style={blueprintStyleFuchsia}></div>

        {/* MAIN HERO CONTENT */}
        <main 
          className={`relative z-20 text-center p-4 select-none transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1) flex flex-col items-center justify-center ${elementsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`} 
          style={heroContentStyle}
        >
            <div className="mb-4 relative inline-block group">
                <div className="absolute -inset-10 bg-fuchsia-600/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                {/* Compacted Logo */}
                <img 
                    src={logoUrl} 
                    alt={studioName} 
                    className="w-[50vw] max-w-[180px] md:max-w-[260px] h-auto relative z-10 drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] filter transition-all duration-500"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(217,70,239,0.2))' }}
                />
            </div>
            
            <div className={`space-y-2 transition-all duration-700 delay-[200ms] ${elementsVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <p className="text-sm lg:text-lg text-fuchsia-400 font-medium tracking-[0.4em] uppercase">
                  Sonic Architectures.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                 <div className="h-px w-6 bg-white/20"></div>
                 <p className="text-gray-500 font-mono text-[8px] lg:text-[10px] uppercase tracking-[0.8em]">
                    Est. 2021 // Los Angeles
                 </p>
                 <div className="h-px w-6 bg-white/20"></div>
              </div>
            </div>

            <div className={`mt-6 flex flex-col items-center gap-6 transition-all duration-700 delay-[300ms] ${elementsVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <button
                    onClick={() => onNavigate('gallery')}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="px-8 py-3 font-bold text-white border-2 border-fuchsia-500 rounded-full transition-all duration-500 uppercase tracking-[0.25em] text-[10px] lg:text-xs group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                >
                    <span className="relative z-10 transition-colors duration-500 group-hover:text-black">Enter The Control Room</span>
                    <div className={`absolute inset-0 bg-fuchsia-500 transition-transform duration-500 ease-in-out ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}></div>
                </button>
            </div>
        </main>
      </section>

      {/* FOOTER STRIP - Compacted */}
      <footer className="fixed bottom-0 left-0 w-full py-4 bg-gradient-to-t from-black via-black/80 to-transparent text-center z-30 pointer-events-none transition-opacity duration-1000 delay-500" style={{ opacity: elementsVisible ? 1 : 0 }}>
         <div className="flex items-center justify-center gap-4 text-gray-800 font-bold">
            <span className="h-px w-8 bg-gray-900/50"></span>
            <p className="text-[8px] uppercase tracking-[0.8em] text-white/30">
                © 2026 UNDR:LA STUDIOS
            </p>
            <span className="h-px w-8 bg-gray-900/50"></span>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
