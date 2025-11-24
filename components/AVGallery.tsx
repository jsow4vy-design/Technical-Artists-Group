import React, { useState, useRef, memo, useEffect } from 'react';
import { NetflixLogo, AmazonStudiosLogo, GoogleLogo, SpotifyLogo, AppleLogo as AppleMusicLogo, DolbyLogo, CrestronLogo, BarcoLogo } from './partnerLogos';
import { useAnimateOnScroll } from '../hooks/useAnimateOnScroll';
import { Modal } from './common/Modal';
import { GalleryLayout } from '../layouts/GalleryLayout';
import { InquiryForm } from './InquiryForm';
import { ShieldCheckIcon, BoltIcon, UsersIcon, ArrowUpRightIcon, ClockIcon, DownloadIcon } from './icons';
import { blueprintStyleCyan } from '../styles/common';

interface AVProject {
  id: number;
  title: string;
  imageUrl: string;
  stats: string;
  details: {
      scope: string;
      keyFeatures: string[];
      technologies: string[];
      metrics: { label: string; value: string; }[];
      testimonials: {
          quote: string;
          author: string;
      }[];
  };
}

const avProjects: AVProject[] = [
  {
    id: 1,
    title: 'Netflix',
    imageUrl: 'https://images.unsplash.com/photo-1578954363364-a03d34a415b0?q=80&w=2070&auto=format&fit=crop',
    stats: '4K Post-Production Suite | Dolby Atmos Integration | Crestron Control',
    details: {
      scope: "To design and build a state-of-the-art 4K HDR post-production suite fully certified for Dolby Atmos, enabling their sound designers to create immersive audio experiences for flagship original content.",
      keyFeatures: ["Certified Dolby Atmos 9.1.6 Mix Stage", "Seamless 12G-SDI 4K Video Routing", "Centralized AV-over-IP Control System", "Custom-Engineered Acoustic Environment"],
      technologies: ['Blackmagic Design 12G-SDI Routers', 'Dolby Atmos RMU', 'Crestron NVX AV-over-IP', 'JBL Cinema Series Monitors', 'Custom Acoustic Paneling'],
      metrics: [
        { label: 'Signal Latency', value: '< 1ms' },
        { label: 'Acoustic Compliance', value: '100% Dolby Certified' },
        { label: 'Project Delivery', value: 'On-Time & On-Budget' }
      ],
      testimonials: [
        {
            quote: "TAG's precision and expertise in building our Dolby Atmos suite were second to none. The integration was seamless, allowing our creators to work without technical friction.",
            author: 'Lead Sound Supervisor, Netflix'
        },
        {
            quote: "The reliability and performance of the system have exceeded our expectations. It's a world-class facility that empowers our creative teams.",
            author: 'Director of Post-Production, Netflix'
        }
      ]
    }
  },
  {
    id: 7,
    title: 'Amazon Studios',
    imageUrl: 'https://images.unsplash.com/photo-1604355228946-5d683733a10a?q=80&w=1974&auto=format&fit=crop',
    stats: 'AWS Broadcast Center | Global Live Streaming Infrastructure | Cloud-Based Media Workflow',
    details: {
      scope: "Architect a global broadcast center leveraging AWS cloud infrastructure for scalable, low-latency live streaming and media asset management, capable of handling multiple concurrent international broadcasts.",
      keyFeatures: ["Cloud-Native NDI Workflow", "Redundant Geo-Distributed Encoder Farms", "High-Density IP-Based Communication Matrix", "Dynamic Resource Scaling with AWS"],
      technologies: ['AWS Elemental Live Encoders', 'NewTek NDI Networking', 'Lawo mc² Audio Consoles', 'Riedel Communications Intercoms', 'Scalable Cloud Storage Solutions'],
      metrics: [
        { label: 'Broadcast Uptime', value: '99.999%' },
        { label: 'Global Latency', value: 'Sub-2-Second' },
        { label: 'Scalability', value: 'To 1M+ Viewers' }
      ],
      testimonials: [
        {
            quote: "For our global broadcast needs, we required a robust, scalable solution. TAG delivered an infrastructure that's both powerful and reliable, day in and day out.",
            author: 'Head of Broadcast Operations, AWS'
        },
        {
            quote: "The cloud-native workflow gives us unparalleled flexibility. Scaling resources for major live events is now a seamless process, not a logistical nightmare.",
            author: 'Senior Broadcast Engineer, AWS'
        }
      ]
    }
  },
  {
    id: 6,
    title: 'Google',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop',
    stats: 'Corporate Event Space | LED Video Wall | Zoned Audio System',
    details: {
      scope: "To engineer a versatile corporate event space featuring a flagship large-format LED video wall and a multi-zone audio system for presentations, all-hands meetings, and special events, with an emphasis on ease of use for non-technical staff.",
      keyFeatures: ["Seamless 32-Foot 1.2mm Pixel Pitch LED Wall", "Intelligent Beamforming Ceiling Microphones", "Automated DSP for Superior Speech Intelligibility", "One-Touch Crestron Scene Control"],
      technologies: ['Planar TVF Series LED Video Wall', 'Q-SYS Core for Audio Processing', 'Shure MXA910 Ceiling Array Mics', 'Biamp TesiraFORTE for DSP', 'Extron DTP CrossPoint Matrix'],
      metrics: [
        { label: 'Setup Time Reduction', value: '75%' },
        { label: 'Audience Capacity', value: '500 seats' },
        { label: 'System Training Time', value: '< 30 Mins' }
      ],
      testimonials: [
        {
            quote: "The new event space is a technological marvel. The audio is crystal clear in every zone, and the video wall is simply breathtaking. TAG executed our vision perfectly.",
            author: 'Events Technology Manager, Google'
        },
        {
            quote: "The one-touch control system is a game-changer. Our event staff can run a full production without needing a dedicated AV technician on standby.",
            author: 'Internal Comms Lead, Google'
        }
      ]
    }
  },
  {
    id: 3,
    title: 'Spotify',
    imageUrl: 'https://images.unsplash.com/photo-1616047532388-c89165682955?q=80&w=1964&auto-format&fit=crop',
    stats: 'Podcast Village Installation | Dante Audio Network | Custom Acoustic Treatment',
    details: {
      scope: "Create a dedicated 'Podcast Village' with multiple acoustically isolated recording studios, all interconnected via a Dante audio network for flexible routing and collaboration between rooms.",
      keyFeatures: ["Campus-Wide Dante Audio Network", "Custom Vicoustic Acoustic Treatment", "Focusrite RedNet-Powered I/O", "'On-Air' Light Integration"],
      technologies: ['Audinate Dante Networking', 'Neumann U87 Microphones', 'Focusrite RedNet Interfaces', 'Vicoustic Acoustic Panels', 'Genelec Smart Active Monitors'],
      metrics: [
        { label: 'Studio Noise Floor', value: '< -65dB' },
        { label: 'Cross-Studio Routing', value: 'Zero-Latency' },
        { label: 'Creator Output Increase', value: '40%' }
      ],
      testimonials: [
        {
            quote: "TAG transformed our space into a world-class podcasting village. The sound isolation and audio quality are exceptional, giving our creators the perfect environment.",
            author: 'Director of Studio Operations, Spotify'
        },
        {
            quote: "The Dante network is incredibly powerful. We can have a host in one room, a guest in another, and an engineer in a third, all working together seamlessly.",
            author: 'Senior Audio Engineer, Spotify'
        }
      ]
    }
  },
  {
    id: 4,
    title: 'Apple Music',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
    stats: 'Keynote Presentation Stage | Interactive Product Showrooms | Custom Spatial Audio Labs',
    details: {
      scope: "Develop a suite of high-tech spaces including a keynote presentation stage, interactive product showrooms, and dedicated labs for spatial audio content creation, reflecting Apple's commitment to premium quality and user experience.",
      keyFeatures: ["d&b Soundscape Immersive Audio System", "4K Laser Projection Mapping", "Meyer Sound Constellation Active Acoustics", "Interactive Multi-Touch Video Surfaces"],
      technologies: ['d&b audiotechnik Soundscape', 'Barco UDX-4K32 Projectors', 'Disguise gx 2c Media Servers', 'Meyer Sound Constellation System', 'Custom-built interactive touch displays'],
      metrics: [
        { label: 'Audio Immersion Index', value: '98/100' },
        { label: 'System Flexibility', value: 'Reconfigurable in hours' },
        { label: 'Audience Engagement', value: '+60%' }
      ],
      testimonials: [
        {
            quote: "TAG's attention to detail is unparalleled. They delivered an immersive and interactive experience that aligns perfectly with the Apple brand.",
            author: 'Head of Artist Relations, Apple Music'
        },
        {
            quote: "The Soundscape system is a true 'wow' factor. It creates an unforgettable audio experience for our live events that you simply can't get anywhere else.",
            author: 'Live Events Producer, Apple Music'
        }
      ]
    }
  },
];


const partners = [
    { name: 'Netflix', Component: NetflixLogo },
    { name: 'Amazon Studios', Component: AmazonStudiosLogo },
    { name: 'Google', Component: GoogleLogo },
    { name: 'Spotify', Component: SpotifyLogo },
    { name: 'Apple Music', Component: AppleMusicLogo },
    { name: 'Dolby', Component: DolbyLogo },
    { name: 'Crestron', Component: CrestronLogo },
    { name: 'Barco', Component: BarcoLogo },
];

// --- SUB-COMPONENTS ---

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);


const ProjectCard = memo<{ project: AVProject; index: number; onDetailsClick: (trigger: HTMLElement) => void; }>(({ project, index, onDetailsClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isVisible = useAnimateOnScroll(cardRef, { threshold: 0.1 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const imageClasses = `w-full h-full object-cover transition-all duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0 transition-opacity ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div
      ref={cardRef}
      role="article"
      aria-labelledby={`project-title-${project.id}`}
      className={`relative group aspect-w-16 aspect-h-9 overflow-hidden rounded-lg shadow-lg animate-fade-in-on-scroll bg-gray-800 ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {!isImageLoaded && (
        <div className="absolute inset-0 animate-shimmer"></div>
      )}
      <img
        src={project.imageUrl}
        alt={`${project.title} project showcase`}
        className={imageClasses}
        onLoad={() => setIsImageLoaded(true)}
        loading="lazy"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-blue-900/70 backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-500 pointer-events-none"
        style={blueprintStyleCyan}
      ></div>
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors duration-500 flex flex-col justify-end">
        <div className="p-6 text-white">
          <h3 id={`project-title-${project.id}`} className="text-2xl font-bold uppercase tracking-wider">{project.title}</h3>
          <p className="text-sm text-[#00ffff] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 mt-1">{project.stats}</p>
          <button 
            ref={buttonRef}
            onClick={() => buttonRef.current && onDetailsClick(buttonRef.current)} 
            className="mt-4 px-4 py-2 text-xs font-bold text-black bg-cyan-400 rounded-full uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});

const ProjectGrid: React.FC<{ onDetailsClick: (trigger: HTMLElement) => void; }> = ({ onDetailsClick }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {avProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onDetailsClick={onDetailsClick} />
        ))}
    </div>
);

const PartnersSection: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useAnimateOnScroll(sectionRef, { threshold: 0.1 });

    return (
        <div ref={sectionRef} className={`py-16 animate-fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}>
            <div className="max-w-4xl mx-auto px-8">
                <h2 className="text-center text-gray-500 text-sm font-bold uppercase tracking-widest mb-12">Trusted by industry leaders & technology partners</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8 items-center justify-items-center">
                    {partners.map(({ name, Component }) => (
                        <div key={name} className="flex justify-center" aria-label={name}>
                            <Component className="h-8 w-auto text-gray-500 hover:text-cyan-400 hover:scale-110 transition-all duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getMetricIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('latency')) return <BoltIcon className="w-6 h-6 text-cyan-400" />;
    if (lowerLabel.includes('uptime') || lowerLabel.includes('compliance') || lowerLabel.includes('noise')) return <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />;
    if (lowerLabel.includes('delivery') || lowerLabel.includes('time')) return <ClockIcon className="w-6 h-6 text-cyan-400" />;
    if (lowerLabel.includes('capacity') || lowerLabel.includes('scalability')) return <UsersIcon className="w-6 h-6 text-cyan-400" />;
    if (lowerLabel.includes('increase') || lowerLabel.includes('engagement') || lowerLabel.includes('index')) return <ArrowUpRightIcon className="w-6 h-6 text-cyan-400" />;
    return <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />;
};

const AnimatedSection: React.FC<{ title: string; delay: number; children: React.ReactNode; }> = ({ title, delay, children }) => (
    <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
        <h4 className="font-bold text-lg text-white uppercase tracking-wider mb-2">{title}</h4>
        {children}
    </div>
);

const TestimonialCarousel: React.FC<{ testimonials: { quote: string; author: string }[] }> = ({ testimonials }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    // FIX: Replace NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
    const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const advanceSlide = (direction: 'next' | 'prev') => {
        setIsFading(true);
        setTimeout(() => {
            if (direction === 'next') {
                setCurrentIndex(prev => (prev + 1) % testimonials.length);
            } else {
                setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
            }
            setIsFading(false);
        }, 300); // Must match CSS transition duration
    };

    const resetAutoplay = () => {
        if (autoplayRef.current) clearTimeout(autoplayRef.current);
        autoplayRef.current = setTimeout(() => advanceSlide('next'), 7000); // 7 seconds per slide
    };

    useEffect(() => {
        resetAutoplay();
        return () => {
            if (autoplayRef.current) clearTimeout(autoplayRef.current);
        };
    }, [currentIndex]);
    
    if (!testimonials || testimonials.length === 0) return null;
    const currentTestimonial = testimonials[currentIndex];

    return (
        <div 
            className="relative"
            onMouseEnter={() => autoplayRef.current && clearTimeout(autoplayRef.current)}
            onMouseLeave={resetAutoplay}
        >
            <div className="min-h-[150px] flex items-center pr-12">
                 <blockquote className={`border-l-4 border-cyan-500 pl-4 italic text-gray-300 transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                    <p>"{currentTestimonial.quote}"</p>
                    <cite className="block text-right mt-2 not-italic text-sm text-gray-400">- {currentTestimonial.author}</cite>
                </blockquote>
            </div>

            {testimonials.length > 1 && (
                <div className="absolute right-0 bottom-0 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {testimonials.map((_, index) => (
                             <button
                                key={index}
                                onClick={() => {
                                    if (currentIndex === index) return;
                                    setIsFading(true);
                                    setTimeout(() => {
                                        setCurrentIndex(index);
                                        setIsFading(false);
                                    }, 300);
                                }}
                                className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? 'bg-cyan-400' : 'bg-gray-600 hover:bg-gray-400'}`}
                                aria-label={`Go to testimonial ${index + 1}`}
                             />
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => advanceSlide('prev')} className="p-1 rounded-full text-gray-500 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors" aria-label="Previous testimonial">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => advanceSlide('next')} className="p-1 rounded-full text-gray-500 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors" aria-label="Next testimonial">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const ProjectDetailModalContent: React.FC<{ project: AVProject; onDownload: (project: AVProject) => void; }> = ({ project, onDownload }) => (
    <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden w-full border border-cyan-500/30 max-h-[90vh]" style={blueprintStyleCyan}>
        <div className="flex flex-col md:flex-row">
            <img src={project.imageUrl} alt={`${project.title} project image`} className="w-full md:w-5/12 h-64 md:h-auto object-cover" />
            <div className="w-full md:w-7/12 p-8 overflow-y-auto">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                        <h3 id="modal-title" className="text-3xl font-bold uppercase tracking-wider text-cyan-400 animate-fade-in" style={{ textShadow: `0 0 10px #00ffff`, animationDelay: '100ms' }}>{project.title}</h3>
                        <p className="mt-2 text-gray-400 border-b border-gray-700 pb-4 mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>{project.stats}</p>
                    </div>
                    <button 
                        onClick={() => onDownload(project)}
                        aria-label="Download case study as PDF"
                        className="flex-shrink-0 flex items-center gap-2 mt-1 px-4 py-2 text-xs font-bold text-cyan-400 border border-cyan-400 rounded-full uppercase tracking-wider hover:bg-cyan-400 hover:text-black transition-colors animate-fade-in"
                        style={{ animationDelay: '200ms' }}
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download PDF</span>
                    </button>
                </div>

                <div className="space-y-6">
                    <AnimatedSection title="Project Scope" delay={300}>
                        <p className="text-gray-300">{project.details.scope}</p>
                    </AnimatedSection>

                    <AnimatedSection title="Performance Metrics" delay={400}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                            {project.details.metrics.map((metric, i) => (
                                <div key={i} className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/20">
                                    <div className="flex justify-center mb-1">{getMetricIcon(metric.label)}</div>
                                    <p className="font-bold text-xl text-white">{metric.value}</p>
                                    <p className="text-xs text-cyan-300">{metric.label}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                    
                    <AnimatedSection title="Key Features" delay={500}>
                        <ul className="space-y-1 list-disc list-inside text-gray-300">
                            {project.details.keyFeatures.map((feature, i) => <li key={i}>{feature}</li>)}
                        </ul>
                    </AnimatedSection>

                    <AnimatedSection title="Key Technologies" delay={600}>
                        <div className="flex flex-wrap gap-2">
                            {project.details.technologies.map((tech, i) => (
                                <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{tech}</span>
                            ))}
                        </div>
                    </AnimatedSection>

                    <AnimatedSection title="Client Feedback" delay={700}>
                        <TestimonialCarousel testimonials={project.details.testimonials} />
                    </AnimatedSection>
                </div>
            </div>
        </div>
    </div>
);


// --- MAIN COMPONENT ---

const AVGallery: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedProject, setSelectedProject] = useState<AVProject | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const handleDownloadCaseStudy = (project: AVProject) => {
    const styles = `
        body { font-family: 'Rajdhani', sans-serif; background-color: #111111; color: #e5e7eb; margin: 2rem; }
        h1, h2, h3 { font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 0.1em; }
        h1 { font-size: 2.5rem; color: #00ffff; text-shadow: 0 0 10px #00ffff; border-bottom: 2px solid #00ffff; padding-bottom: 0.5rem; }
        p { line-height: 1.6; color: #d1d5db; }
        .tagline { color: #00ffff; font-style: italic; }
        h2 { font-size: 1.5rem; color: #fff; border-bottom: 1px solid #4b5563; padding-bottom: 0.3rem; margin-top: 2.5rem; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .metric-card { background-color: #1f2937; border: 1px solid #00ffff33; border-radius: 0.5rem; padding: 1rem; text-align: center; }
        .metric-value { font-size: 1.75rem; font-weight: bold; color: #fff; }
        .metric-label { font-size: 0.8rem; color: #00ffff; }
        ul { list-style-position: inside; padding-left: 0; }
        li { margin-bottom: 0.5rem; }
        .tech-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
        .tech-tag { background-color: #374151; color: #d1d5db; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; }
        blockquote { border-left: 4px solid #00ffff; margin: 1rem 0; padding-left: 1rem; font-style: italic; color: #d1d5db; }
        cite { display: block; text-align: right; margin-top: 0.5rem; color: #9ca3af; }
        @media print {
            body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
    `;

    const metricsHtml = project.details.metrics.map(metric => `
        <div class="metric-card">
            <div class="metric-value">${metric.value}</div>
            <div class="metric-label">${metric.label}</div>
        </div>
    `).join('');

    const featuresHtml = project.details.keyFeatures.map(feature => `<li>${feature}</li>`).join('');
    const techHtml = project.details.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
    const testimonialsHtml = project.details.testimonials.map(t => `
        <blockquote>
            <p>"${t.quote}"</p>
            <cite>- ${t.author}</cite>
        </blockquote>
    `).join('');

    const content = `
        <html>
            <head>
                <title>Case Study: ${project.title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;700&display=swap" rel="stylesheet">
                <style>${styles}</style>
            </head>
            <body>
                <h1>Case Study: ${project.title}</h1>
                <p class="tagline">${project.stats}</p>

                <h2>Project Scope</h2>
                <p>${project.details.scope}</p>

                <h2>Performance Metrics</h2>
                <div class="metrics-grid">${metricsHtml}</div>
                
                <h2>Key Features</h2>
                <ul>${featuresHtml}</ul>

                <h2>Key Technologies</h2>
                <div class="tech-tags">${techHtml}</div>

                <h2>Client Feedback</h2>
                ${testimonialsHtml}
            </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
  };


  const handleDetailsClick = (trigger: HTMLElement) => {
    setTriggerElement(trigger);
    const projectTitle = trigger.closest('[role="article"]')?.querySelector('h3')?.textContent;
    setSelectedProject(avProjects.find(p => p.title === projectTitle) || null);
  };
  
  const handleCloseModal = () => {
    setSelectedProject(null);
    triggerElement?.focus();
  };

  return (
    <GalleryLayout
        onBack={onBack}
        title="AV & Broadcasting Integrations"
        tagline="The Art of Audio Visual. The Science of Sound."
        brandColor="#00ffff"
        blueprintStyle={blueprintStyleCyan}
    >
        <section className="p-8">
            <p className="max-w-4xl mb-8 text-lg text-gray-300">
                From world-class broadcast control rooms to immersive corporate event spaces, we architect and execute robust, future-proof A/V systems. Our meticulous approach to design, engineering, and integration ensures flawless performance and intuitive control.
            </p>
            <ProjectGrid onDetailsClick={handleDetailsClick} />
        </section>
        <PartnersSection />
        <InquiryForm />
      
        <Modal
            isOpen={!!selectedProject}
            onClose={handleCloseModal}
            ariaLabelledBy="modal-title"
            closeButtonAriaLabel="Close project details"
        >
            {selectedProject && <ProjectDetailModalContent project={selectedProject} onDownload={handleDownloadCaseStudy} />}
        </Modal>
    </GalleryLayout>
  );
};

export default AVGallery;
