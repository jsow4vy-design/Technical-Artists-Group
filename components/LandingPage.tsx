
import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { blueprintStyleFuchsia } from '../styles/common';
import SEO from './SEO';

const MOES_IMAGE_URL = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop&fm=webp'; 
const BACKGROUND_VIDEO_URL = 'https://videos.pexels.com/video-files/5091632/5091632-uhd_2560_1440_25fps.mp4'; 
const DEFAULT_LOGO_URL = 'https://i.imgur.com/x02n31a.png';
const DEFAULT_STUDIO_NAME = 'UNDR:LA Studios';

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
        // Speed multiplier is reduced for subtler motion
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
  onNavigate: (view: 'moes') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [logoUrl] = useLocalStorage<string>('tag_logo_url', DEFAULT_LOGO_URL);
  const [studioName] = useLocalStorage<string>('tag_studio_name', DEFAULT_STUDIO_NAME);
  const mouseRequestRef = useRef<number>(0);

  useEffect(() => {
    const logoTimer = setTimeout(() => setLogoVisible(true), 500);
    return () => clearTimeout(logoTimer);
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

  // Enhanced mouse movement sensitivity for text
  const heroContentStyle = {
    transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0)`,
    transition: 'transform 0.2s ease-out'
  };

  const backgroundStyle = {
    '--mouseX': `${(mousePos.x + 1) * 50}%`,
    '--mouseY': `${(mousePos.y + 1) * 50}%`,
    '--gradient-color': 'rgba(217, 70, 239, 0.08)',
    '--gradient-size': '60vw',
  } as React.CSSProperties;

  return (
    <div
      className="relative w-full bg-black overflow-x-hidden landing-page-container"
      style={backgroundStyle}
    >
      <SEO 
        title="Welcome" 
        description={`Experience the sound of ${studioName}. Los Angeles' premier underground recording and production studio.`}
      />

      <header className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000 ease-out ${logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <img src={logoUrl} alt={`${studioName} Logo`} className="w-40 h-auto filter drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]" loading="eager" />
      </header>

      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Subtler background speed: 0.15 */}
        <ParallaxLayer speed={0.15}>
            <div className="absolute inset-0">
                <video
                    className="w-full h-full object-cover opacity-40 scale-105 will-change-transform"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={MOES_IMAGE_URL}
                    style={{ 
                        transform: `scale(1.1) translate3d(${mousePos.x * -15}px, ${mousePos.y * -10}px, 0)`,
                        transition: 'transform 0.2s ease-out'
                    }}
                >
                    <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black"></div>
            </div>
        </ParallaxLayer>

        {/* Subtler midground speed: 0.08 */}
        <ParallaxLayer speed={0.08} className="z-10">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none" style={blueprintStyleFuchsia}></div>
            <div 
              className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/5 rounded-full blur-[160px] animate-pulse transition-transform duration-200 ease-out will-change-transform"
              style={{ transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 20}px, 0)` }}
            ></div>
        </ParallaxLayer>

        {/* Using mt-32 instead of translate-y because the inline transform style overrides CSS transform property */}
        <main className="relative z-20 text-center p-8 select-none mt-32 will-change-transform" style={heroContentStyle}>
            <div className="mb-6 overflow-hidden">
                <h1
                    className="text-6xl sm:text-8xl lg:text-9xl font-bold uppercase tracking-tighter text-white drop-shadow-2xl animate-fade-in-fwd"
                    style={{ textShadow: '0 0 30px rgba(217,70,239,0.15)' }}
                >
                    {studioName}
                </h1>
            </div>
            
            <p className="mt-4 text-xl lg:text-2xl text-fuchsia-400 font-medium tracking-[0.4em] uppercase opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                Your Sound. Your Story.
            </p>

            <div className="mt-14 flex flex-col items-center gap-8 opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                <button
                    onClick={() => onNavigate('moes')}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`px-14 py-4 font-bold text-white border-2 border-fuchsia-500 rounded-full transition-all duration-500 uppercase tracking-widest text-lg group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-black`}
                >
                    <span className="relative z-10 transition-colors duration-500 group-hover:text-black">Enter the Studio →</span>
                    <div className={`absolute inset-0 bg-fuchsia-500 transition-transform duration-500 ease-in-out ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}></div>
                </button>
                
                <div className="flex flex-col items-center gap-2 opacity-0 animate-fade-in mt-16" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
                    <div className="animate-bounce flex flex-col items-center gap-2">
                        <span className="text-[9px] uppercase tracking-[0.6em] font-bold text-gray-500">Scroll Down</span>
                        <div className="w-px h-16 bg-gradient-to-b from-fuchsia-500/50 to-transparent"></div>
                    </div>
                </div>
            </div>
        </main>
      </section>

      <section className="relative min-h-screen w-full bg-[#030303] py-40 px-6 flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
        {/* Subtle scroll parallax on images */}
        <ParallaxLayer speed={-0.04} className="z-0">
            <div 
                className="absolute top-[15%] left-[8%] opacity-15 hidden xl:block transition-transform duration-200 ease-out will-change-transform"
                style={{ transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -15}px, 0)` }}
            >
                <div className="relative p-2 bg-white/5 rounded-2xl border border-white/10 rotate-12 group hover:rotate-6 transition-transform duration-1000">
                    <img 
                        src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=450&auto=format&fit=crop&fm=webp" 
                        className="w-72 h-72 rounded-xl filter grayscale" 
                        alt="Inside UNDR:LA Studio" 
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-fuchsia-500/5 rounded-xl"></div>
                </div>
            </div>
        </ParallaxLayer>
        
        <ParallaxLayer speed={-0.06} className="z-0">
            <div 
                className="absolute bottom-[15%] right-[8%] opacity-15 hidden xl:block transition-transform duration-200 ease-out will-change-transform"
                style={{ transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -20}px, 0)` }}
            >
                <div className="relative p-2 bg-white/5 rounded-2xl border border-white/10 -rotate-12 group hover:-rotate-6 transition-transform duration-1000">
                    <img 
                        src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=400&auto=format&fit=crop&fm=webp" 
                        className="w-56 h-56 rounded-xl filter grayscale" 
                        alt="Pro Recording Mic" 
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-cyan-500/5 rounded-xl"></div>
                </div>
            </div>
        </ParallaxLayer>

        <div className="max-w-5xl mx-auto relative z-10">
            <header className="mb-24 text-center">
                <p className="text-fuchsia-500 text-xs font-bold uppercase tracking-[0.5em] mb-4">Underground LA Legacy</p>
                <h3 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-widest mb-8">The Sonic Philosophy</h3>
                <div className="h-1 w-20 bg-fuchsia-500 mx-auto rounded-full shadow-[0_0_15px_rgba(217,70,239,0.5)]"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                    <article className="group p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-fuchsia-500/30 transition-all duration-700 hover:bg-white/[0.04]">
                        <div className="w-12 h-1 bg-fuchsia-500 mb-6 transition-all duration-700 group-hover:w-20"></div>
                        <h4 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Analog Warmth</h4>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            We believe in the soul of physical gear. Our signal chains are curated to breathe life, harmonic saturation, and vintage weight into your modern digital productions.
                        </p>
                    </article>
                    
                    <article className="group p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-fuchsia-500/30 transition-all duration-700 hover:bg-white/[0.04]">
                        <div className="w-12 h-1 bg-cyan-500 mb-6 transition-all duration-700 group-hover:w-20"></div>
                        <h4 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Digital Precision</h4>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            Powered by the latest technical innovations, our workflow ensures that no detail is lost. From AI-assisted mixing to ultra-low latency monitoring.
                        </p>
                    </article>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-6 bg-fuchsia-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=1000&auto=format&fit=crop&fm=webp" 
                            alt="Professional Audio Production Gear" 
                            className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                </div>
            </div>

            <div className="mt-40 text-center">
                <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.6em] mb-14">Capture the energy. Define the sound.</p>
                <button
                    onClick={() => onNavigate('moes')}
                    className="px-12 py-4 border-2 border-gray-800 text-gray-400 rounded-full hover:border-fuchsia-500 hover:text-white transition-all uppercase tracking-widest font-bold text-sm bg-black/50"
                >
                    Explore Our Packages
                </button>
            </div>
        </div>
      </section>

      <footer className="py-16 bg-black border-t border-white/5 text-center">
         <div className="flex items-center justify-center gap-4 text-gray-800 font-bold">
            <span className="h-px w-12 bg-gray-900"></span>
            <p className="text-[11px] uppercase tracking-[1.2em]">{studioName} // Underground Los Angeles</p>
            <span className="h-px w-12 bg-gray-900"></span>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
