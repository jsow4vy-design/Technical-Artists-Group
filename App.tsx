
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LoadingSpinnerIcon } from './components/icons';

// Lazy load components to improve initial load time
const LandingPage = lazy(() => import('./components/LandingPage'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const Footer = lazy(() => import('./components/Footer'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
const MoesGallery = lazy(() => import('./components/MoesGallery'));

// Simple loading fallback
const Loader: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-[#111111]">
      <LoadingSpinnerIcon />
  </div>
);

const App: React.FC = () => {
  // Define available views
  type View = 'landing' | 'moes' | 'adminLogin' | 'admin';
  const [view, setView] = useState<View>('landing');
  const [showFooter, setShowFooter] = useState(false);

  // Navigation handlers
  const navigateToAdminLogin = () => setView('adminLogin');
  const handleLoginSuccess = () => setView('admin');
  
  const handleBackToLanding = () => {
      setView('landing');
      // Clean URL hash to prevent automatic redirection on refresh
      if (window.location.hash === '#admin') {
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
  };

  // Effect: Footer visibility logic
  useEffect(() => {
    const isGalleryView = view === 'moes';
    setShowFooter(isGalleryView);
  }, [view]);

  // Effect: Keyboard shortcut (Ctrl/Meta + Alt + A) for Admin Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigateToAdminLogin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Effect: Handle URL hash for direct admin access
  useEffect(() => {
    const checkHashForAdmin = () => {
      if (window.location.hash === '#admin' && view !== 'admin' && view !== 'adminLogin') {
        navigateToAdminLogin();
      }
    };
    
    checkHashForAdmin(); // Check on mount
    window.addEventListener('hashchange', checkHashForAdmin);

    return () => {
      window.removeEventListener('hashchange', checkHashForAdmin);
    };
  }, [view]);

  // Effect: Smooth scrolling and position reset on view change
  useEffect(() => {
    const handleScrollPosition = () => {
      const hash = window.location.hash;
      if (hash && hash !== '#admin') {
        // Scroll to specific section if hash exists
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Reset to top for new pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Small delay ensures DOM is ready after lazy load suspension
    const timer = setTimeout(handleScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [view]);


  // --- Render Logic ---

  // Landing Page is distinct and full-screen
  if (view === 'landing') {
    return (
      <Suspense fallback={<Loader />}>
        <LandingPage onNavigate={(newView) => setView(newView)} />
      </Suspense>
    );
  }

  // Dynamic content rendering based on view state
  const renderContent = () => {
    switch(view) {
        case 'adminLogin':
            return <AdminLoginPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToLanding} />;
        case 'admin':
            return <AdminDashboard onBack={handleBackToLanding} />;
        case 'moes':
            return <MoesGallery onBack={handleBackToLanding} />;
        default:
            setView('landing'); // Fallback
            return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#111111] overflow-hidden flex flex-col">
      <main className="flex-grow">
        <Suspense fallback={<Loader />}>
            {renderContent()}
        </Suspense>
      </main>
      
      {/* Global Elements: Chatbot & Footer */}
      <Suspense fallback={null}>
        {/* Chatbot available everywhere except login screen */}
        {view !== 'adminLogin' && <Chatbot />}
        {showFooter && <Footer onAdminLogin={navigateToAdminLogin} />}
      </Suspense>
    </div>
  );
};

export default App;
