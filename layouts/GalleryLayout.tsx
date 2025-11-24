import React, { useRef, useEffect, useState } from 'react';
import { BackIcon } from '../components/icons';

interface GalleryLayoutProps {
  onBack: () => void;
  title: string;
  tagline: string;
  brandColor: string; // e.g., '#00ffff'
  children: React.ReactNode;
  blueprintStyle: React.CSSProperties;
}

export const GalleryLayout: React.FC<GalleryLayoutProps> = ({ onBack, title, tagline, brandColor, children, blueprintStyle }) => {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#111] text-white animate-fade-in" style={blueprintStyle}>
      <header
        ref={headerRef}
        className="p-8 flex items-center justify-between fixed top-0 left-0 right-0 bg-[#111]/80 backdrop-blur-sm z-40"
      >
        <div>
          <h1
            className="text-4xl font-bold uppercase tracking-widest"
            style={{ color: brandColor, textShadow: `0 0 20px ${brandColor}` }}
          >
            {title}
          </h1>
          <p className="text-gray-400">{tagline}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 transition-colors p-2 rounded-md focus:outline-none focus:ring-2"
          style={{
            color: 'rgb(209 213 229 / 1)',
            '--hover-color': brandColor
          } as React.CSSProperties}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--hover-color)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(209 213 229 / 1)'}
        >
          <BackIcon />
          <span>Back</span>
        </button>
      </header>
      <main style={{ paddingTop: `${headerHeight}px` }}>
        {children}
      </main>
    </div>
  );
};