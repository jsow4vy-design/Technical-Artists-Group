import React, { useState, useRef, useEffect } from 'react';
import { BackIcon, CheckIcon, CloseIcon } from './icons';
import { featuredSessions as defaultFeaturedSessions } from '../data/studioData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FeaturedSessionsManager } from './admin/FeaturedSessionsManager';
import { DataTable } from './admin/DataTable';
import { ImageManager } from './admin/ImageManager';
import { blueprintStyleAdmin } from '../styles/common';
import type { DataItem } from '../types';

type BookingStatus = 'Pending' | 'Contacted' | 'Paid';
type InquiryStatus = 'New' | 'Contacted' | 'Proposal Sent';
type AdminTab = 'submissions' | 'content';

interface Toast {
  id: number;
  message: string;
  isExiting?: boolean;
}

const Toast: React.FC<{ message: string; isExiting?: boolean; onClose: () => void; }> = ({ message, isExiting, onClose }) => {
  return (
    <div role="status" className={`flex items-center gap-4 w-full max-w-sm p-4 text-white bg-green-600/50 backdrop-blur-lg border border-green-500/30 rounded-lg shadow-lg ${isExiting ? 'animate-toast-out-right' : 'animate-toast-in-right'}`}>
      <CheckIcon className="w-6 h-6 flex-shrink-0" />
      <div className="flex-grow text-sm font-semibold">{message}</div>
      <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-white/20"><CloseIcon /></button>
    </div>
  );
};

const bookingStatusStyles: { [key in BookingStatus]: string } = {
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Contacted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Paid: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const inquiryStatusStyles: { [key in InquiryStatus]: string } = {
    New: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Contacted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Proposal Sent': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [inquiries, setInquiries] = useLocalStorage<DataItem[]>('av_inquiries', []);
  const [bookings, setBookings] = useLocalStorage<DataItem[]>('underla_bookings', []);
  const [featuredSessions, setFeaturedSessions] = useLocalStorage('underla_featured_sessions', defaultFeaturedSessions);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isExiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 500);
  };

  const handleBookingStatusChange = (bookingId: number, newStatus: BookingStatus) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    addToast(`Booking status updated to ${newStatus}.`);
  };
  
  const handleInquiryStatusChange = (inquiryId: number, newStatus: InquiryStatus) => {
    setInquiries(inquiries.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i));
    addToast(`Inquiry status updated to ${newStatus}.`);
  };

  const TabButton: React.FC<{ tabId: AdminTab; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      role="tab"
      aria-selected={activeTab === tabId}
      className={`px-6 py-3 font-semibold uppercase tracking-wider text-sm transition-colors border-b-2 ${
        activeTab === tabId
          ? 'border-cyan-400 text-cyan-400'
          : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#111] text-white animate-fade-in" style={blueprintStyleAdmin}>
      <div className="fixed top-24 right-8 z-50 w-full max-w-sm space-y-2">
        {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />)}
      </div>
      <header ref={headerRef} className="p-8 flex items-center justify-between fixed top-0 left-0 right-0 bg-[#111]/80 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-widest text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Booking & Inquiry Overview</p>
        </div>
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-300 hover:text-[#00ffff] transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <BackIcon />
          <span>Back to Site</span>
        </button>
      </header>

      <main className="p-8" style={{ paddingTop: `${headerHeight}px` }}>
        <div role="tablist" className="flex justify-center border-b border-gray-700/50 mb-12">
            <TabButton tabId="submissions">Submissions</TabButton>
            <TabButton tabId="content">Content</TabButton>
        </div>
        
        <div className="animate-fade-in">
          {activeTab === 'submissions' && (
            <div role="tabpanel" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <DataTable
                  title="UNDERLA.STUDIO Bookings"
                  items={bookings}
                  setItems={setBookings}
                  statusOptions={['Pending', 'Contacted', 'Paid']}
                  statusStyles={bookingStatusStyles}
                  brandColorClass="fuchsia"
                  onStatusChange={(id, status) => handleBookingStatusChange(id, status as BookingStatus)}
              />
              <DataTable
                  title="AV & Broadcasting Inquiries"
                  items={inquiries}
                  setItems={setInquiries}
                  statusOptions={['New', 'Contacted', 'Proposal Sent']}
                  statusStyles={inquiryStatusStyles}
                  brandColorClass="cyan"
                  onStatusChange={(id, status) => handleInquiryStatusChange(id, status as InquiryStatus)}
              />
            </div>
          )}
          {activeTab === 'content' && (
             <div role="tabpanel" className="space-y-12">
                <FeaturedSessionsManager sessions={featuredSessions} setSessions={setFeaturedSessions} addToast={addToast} />
                <ImageManager addToast={addToast} />
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
