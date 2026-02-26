import React, { useState } from 'react';
import { CloseIcon } from './icons';
import { MediaManager } from './admin/MediaManager';
import { GalleryManager } from './admin/GalleryManager';
import { TeamManager } from './admin/TeamManager';
import { FeaturedSessionsManager } from './admin/FeaturedSessionsManager';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminTab = 'media' | 'gallery' | 'team' | 'featured';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Admin Dashboard Component.
 * Central hub for managing all aspects of the studio website.
 */
const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('media');
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  
  /**
   * Adds a temporary toast message to the screen.
   */
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'media':
        return <MediaManager addToast={addToast} />;
      case 'gallery':
        return <GalleryManager addToast={addToast} />;
      case 'team':
        return <TeamManager addToast={addToast} />;
      case 'featured':
        return <FeaturedSessionsManager addToast={addToast} />;
      default:
        return <MediaManager addToast={addToast} />;
    }
  };

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'media', label: 'Media Library' },
    { id: 'gallery', label: 'Galleries' },
    { id: 'team', label: 'Team & Artists' },
    { id: 'featured', label: 'Studio Showcase' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-fuchsia-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in-up font-bold tracking-wide pointer-events-auto">
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header & Navigation */}
      <header className="bg-[#050505] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button 
                    onClick={onBack}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5"
                    title="Back to Site"
                >
                    <CloseIcon className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="text-center">
                <h1 className="text-lg font-black uppercase tracking-[0.2em] text-white">
                    Command Center
                </h1>
                <p className="text-[9px] font-mono text-fuchsia-500 uppercase tracking-widest">
                    Admin Access Granted
                </p>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                            activeTab === tab.id 
                                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            
            {/* Mobile Menu Placeholder (if needed) */}
            <div className="md:hidden">
                <select 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                    className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm uppercase font-bold focus:outline-none focus:border-fuchsia-500"
                >
                    {tabs.map(tab => (
                        <option key={tab.id} value={tab.id}>{tab.label}</option>
                    ))}
                </select>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bg-[#0a0a0a] p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
