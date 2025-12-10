
import React, { useState, useEffect, useRef } from 'react';

const MOES_IMAGE_URL = 'https://i.imgur.com/u14G38p.png';
const LOGO_URL = 'https://i.imgur.com/x02n31a.png';

interface PanelProps {
  onEnter: () => void;
  title: string;
  tagline: string;
  buttonText: string;
  bgColor: string;
  textColor: string;
  shadowColor: string;
  imageUrl: string;
}

const Panel: React.FC<PanelProps> = ({
  onEnter,
  title,
  tagline,
  buttonText,
  bgColor,
  textColor,
  shadowColor,
  imageUrl,
}) => {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEntrance, setIsEntrance] = useState(true);
  const requestRef = useRef<number | undefined>(undefined);

  // Optimized mouse move handler using requestAnimationFrame
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (requestRef.current || isEntrance) return;

    // Capture dimensions and mouse position synchronously to avoid 'currentTarget' being null in rAF
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    requestRef.current = requestAnimationFrame(() => {
        const { width, height, left, top } = rect;
        const x = clientX - left;
        const y = clientY - top;
        // Calculate movement from -20px to 20px based on cursor position
        const moveX = ((x / width) - 0.5) * -40;
        const moveY = ((y / height) - 0.5) * -40;
        setParallax({ x: moveX, y: moveY });
        requestRef.current = undefined;
    });
  };

  useEffect(() => {
      // Trigger entrance animation on mount
      setIsVisible(true);
      
      // Disable entrance animation mode after 1.5s to allow responsive parallax
      const timer = setTimeout(() => setIsEntrance(false), 1500);

      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          clearTimeout(timer);
      };
  }, []);

  return (
    <div
      className="group relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setParallax({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      onClick={onEnter}
    >
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform ease-out"
            style={{
              backgroundImage: `url(${imageUrl})`,
              transitionDuration: isEntrance ? '1500ms' : '200ms',
              // Scale from 1.15 (entrance) to 1.05 (parallax base)
              // Parallax effect is always active after entrance
              transform: !isVisible 
                ? 'scale(1.15)' 
                : `scale(1.05) translateX(${parallax.x}px) translateY(${parallax.y}px)`,
            }}
          >
            <div className={`absolute inset-0 ${bgColor} mix-blend-multiply transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
      </div>

      <div className={`relative text-center p-8 z-10 select-none transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2
          className={`text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-widest transition-all duration-500 transform group-hover:-translate-y-2 ${isHovered ? 'text-white' : textColor}`}
          style={{ textShadow: isHovered ? `0 0 25px ${shadowColor}, 0 0 10px ${shadowColor}` : 'none' }}
        >
          {title}
        </h2>
        <p className="mt-4 text-lg lg:text-xl text-gray-200 transition-all duration-500 ease-out">{tagline}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onEnter(); }}
          className={`mt-8 px-8 py-3 font-bold text-white border-2 ${textColor.replace('text-', 'border-')} rounded-full transition-all duration-500 ease-out uppercase tracking-wider group-hover:bg-[${shadowColor}] group-hover:shadow-[0_0_20px_${shadowColor}]`}
          style={{
            backgroundColor: isHovered ? shadowColor : 'transparent',
            boxShadow: isHovered ? `0 0 20px ${shadowColor}` : 'none',
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

interface LandingPageProps {
  onNavigate: (view: 'moes') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const logoTimer = setTimeout(() => setLogoVisible(true), 500);
    return () => clearTimeout(logoTimer);
  }, []);

  // Optimized global mouse move for gradient background
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
        if (requestRef.current) return;
        // Capture coordinates synchronously
        const { clientX, clientY } = event;
        
        requestRef.current = requestAnimationFrame(() => {
            setMousePos({ x: clientX, y: clientY });
            requestRef.current = undefined;
        });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const backgroundStyle = {
    '--mouseX': `${mousePos.x}px`,
    '--mouseY': `${mousePos.y}px`,
    '--gradient-color': 'rgba(255, 0, 255, 0.15)',
    '--gradient-size': '40vw',
  } as React.CSSProperties;

  return (
    <div
      className="relative flex flex-col md:flex-row w-screen h-screen bg-black overflow-hidden landing-page-container"
      style={backgroundStyle}
    >
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 ease-out ${logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <img src={LOGO_URL} alt="Technical Artists Group Logo" className="w-48 h-auto" />
      </div>

      <Panel
        onEnter={() => onNavigate('moes')}
        title="UNDERLA.STUDIO"
        tagline="Your Sound. Your Stage. Your Story."
        buttonText="Enter the Studio →"
        bgColor="bg-fuchsia-900"
        textColor="text-[#ff00ff]"
        shadowColor="#ff00ff"
        imageUrl={MOES_IMAGE_URL}
      />
    </div>
  );
};

export default LandingPage;
