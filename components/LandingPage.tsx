import React, { useState, useEffect, useRef } from 'react';

const AV_IMAGE_URL = 'https://i.imgur.com/v2V8olH.jpg';
const MOES_IMAGE_URL = 'https://i.imgur.com/u14G38p.png';
const LOGO_URL = 'https://i.imgur.com/x02n31a.png';

interface PanelProps {
  side: 'left' | 'right';
  isHovered: boolean;
  onHover: (side: 'left' | 'right' | null) => void;
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
  side,
  isHovered,
  onHover,
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: el } = e;
    const { width, height, left, top } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    // Calculate movement from -20px to 20px based on cursor position
    const moveX = ((x / width) - 0.5) * -40;
    const moveY = ((y / height) - 0.5) * -40;
    setParallax({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    onHover(null);
    setParallax({ x: 0, y: 0 });
  };
  
  return (
    <div
      className={`group relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center overflow-hidden transition-all duration-500 ease-in-out cursor-pointer ${isHovered ? 'w-full md:w-[60%]' : 'w-full md:w-1/2'}`}
      onMouseEnter={() => onHover(side)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out"
        style={{
          backgroundImage: `url(${imageUrl})`,
          transform: isHovered
            ? `scale(1.1) translateX(${parallax.x}px) translateY(${parallax.y}px)`
            : 'scale(1) translateX(0) translateY(0)',
        }}
      >
        <div className={`absolute inset-0 ${bgColor} mix-blend-multiply`}></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative text-center p-8 z-10 select-none">
        <h2
          className={`text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-widest transition-all duration-500 transform group-hover:-translate-y-2 ${isHovered ? 'text-white' : textColor}`}
          style={{ textShadow: isHovered ? `0 0 25px ${shadowColor}, 0 0 10px ${shadowColor}` : 'none' }}
        >
          {title}
        </h2>
        <p className="mt-4 text-lg lg:text-xl text-gray-200 transition-all duration-500 ease-out delay-100 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">{tagline}</p>
        <button
          onClick={onEnter}
          className={`mt-8 px-8 py-3 font-bold text-white border-2 ${textColor.replace('text-', 'border-')} rounded-full transition-all duration-500 ease-out delay-200 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 uppercase tracking-wider`}
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
  onNavigate: (view: 'av' | 'moes') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [hoveredPanel, setHoveredPanel] = useState<'left' | 'right' | null>(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const logoTimer = setTimeout(() => setLogoVisible(true), 500);
    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const backgroundStyle = {
    '--mouseX': `${mousePos.x}px`,
    '--mouseY': `${mousePos.y}px`,
    '--gradient-color':
      hoveredPanel === 'left'
        ? 'rgba(0, 255, 255, 0.15)'
        : hoveredPanel === 'right'
        ? 'rgba(255, 0, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.05)',
    '--gradient-size': hoveredPanel ? '40vw' : '25vw',
  } as React.CSSProperties;

  return (
    <div
      className="relative flex flex-col md:flex-row w-screen h-screen bg-black overflow-hidden landing-page-container"
      style={backgroundStyle}
    >
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 ease-out ${logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <img src={LOGO_URL} alt="Technical Artists Group Logo" className="w-48 h-auto" />
      </div>

      <div className={`absolute top-36 left-1/2 -translate-x-1/2 z-20 text-center px-4 w-full max-w-3xl transition-all duration-1000 ease-out delay-200 ${logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-lg text-gray-200 font-medium" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.3)' }}>
            "Where technical precision meets creative passion."
        </p>
      </div>

      <Panel
        side="left"
        isHovered={hoveredPanel === 'left'}
        onHover={setHoveredPanel}
        onEnter={() => onNavigate('av')}
        title="AV & Broadcasting Integrations"
        tagline="The Art of Audio Visual. The Science of Sound."
        buttonText="Explore Solutions"
        bgColor="bg-blue-900"
        textColor="text-[#00ffff]"
        shadowColor="#00ffff"
        imageUrl={AV_IMAGE_URL}
      />

      <Panel
        side="right"
        isHovered={hoveredPanel === 'right'}
        onHover={setHoveredPanel}
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