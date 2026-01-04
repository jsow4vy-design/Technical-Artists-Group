
import React, { useMemo } from 'react';
import type { VisualAidData } from '../types';

const freqToX = (f: number) => {
  const min = Math.log10(20);
  const max = Math.log10(20000);
  const val = Math.log10(Math.max(20, Math.min(20000, f)));
  return ((val - min) / (max - min)) * 100;
};

const gainToY = (g: number) => {
  const min = -18;
  const max = 18;
  const range = max - min;
  const normalized = (Math.max(min, Math.min(max, g)) - min) / range;
  return 100 - (normalized * 100); 
};

const levelToCoord = (l: number) => Math.max(0, Math.min(100, l));

export const VisualAid: React.FC<{ data: VisualAidData }> = ({ data }) => {
  const { points, title, labels, type = 'frequency_response' } = data;
  const isCompression = type === 'compression';

  const pathData = useMemo(() => {
    if (!points || points.length < 2) return '';
    const sortedPoints = [...points].sort((a, b) => a.f - b.f);
    
    return sortedPoints.reduce((acc, pt, i) => {
      const x = isCompression ? levelToCoord(pt.f) : freqToX(pt.f);
      const y = isCompression ? 100 - levelToCoord(pt.g) : gainToY(pt.g);
      return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, '');
  }, [points, isCompression]);

  const gridLines = isCompression ? [25, 50, 75] : [100, 1000, 10000];

  return (
    <div className="mt-4 w-full p-4 bg-[#050505] border border-fuchsia-500/20 rounded-2xl overflow-hidden animate-fade-in backdrop-blur-xl group relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ff00ff 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-fuchsia-400">{title}</h4>
          <p className="text-[8px] text-gray-600 font-mono uppercase mt-0.5 tracking-widest">Type: {type.replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_8px_#ff00ff]"></div>
            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Live Analysis</span>
        </div>
      </div>

      <div className="relative aspect-[2.4/1] w-full bg-[#080808] rounded-xl border border-white/5 overflow-hidden shadow-inner">
        {/* Animated Scanline */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-fuchsia-500/20 shadow-[0_0_15px_#ff00ff] z-20 animate-sweep"></div>
        
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Vertical Grid Lines */}
          {gridLines.map(v => (
            <line 
              key={v} 
              x1={isCompression ? levelToCoord(v) : freqToX(v)} y1="0" 
              x2={isCompression ? levelToCoord(v) : freqToX(v)} y2="100" 
              stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" 
            />
          ))}
          {/* Horizontal Grid Lines */}
          {[25, 50, 75].map(v => (
            <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
          ))}
          
          {/* Center Zero Line (for EQ) */}
          {!isCompression && (
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="1,1" />
          )}

          {/* Data Path */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="url(#dataGradient)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_rgba(217,70,239,0.8)]"
          />

          <defs>
            <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels Overlay */}
        <div className="absolute inset-0 pointer-events-none px-2 py-1 flex flex-col justify-between">
           <div className="flex justify-between text-[7px] text-gray-700 font-bold uppercase tracking-widest">
              {isCompression ? (
                <><span>Threshold</span><span>Ratio</span></>
              ) : (
                <><span>-18dB</span><span>+18dB</span></>
              )}
           </div>
           <div className="flex justify-between text-[7px] text-gray-700 font-bold uppercase tracking-widest">
              {isCompression ? (
                <><span>In: 0%</span><span>100%</span></>
              ) : (
                <><span>20Hz</span><span>1kHz</span><span>20kHz</span></>
              )}
           </div>
        </div>
      </div>
      
      {labels && labels.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {labels.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] rounded border border-white/5 transition-colors hover:border-fuchsia-500/30">
              <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{l.label}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes sweep {
            0% { transform: translateX(-10px); opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { transform: translateX(380px); opacity: 0; }
        }
        .animate-sweep {
            animation: sweep 4s linear infinite;
        }
      `}</style>
    </div>
  );
};
