
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LoadingSpinnerIcon } from './components/icons';
import SEO from './components/SEO';

// ============================================================================
// Lazy Loaded Components
// ============================================================================
// Lazy loading improves initial load time by splitting code into smaller chunks
const LandingPage = lazy(() => import('./components/LandingPage'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const Footer = lazy(() => import('./components/Footer'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
const UNDRLAGallery = lazy(() => import('./components/UNDRLAGallery'));

// ============================================================================
// Loader Component
// ============================================================================
// Simple loading fallback displayed while lazy-loaded components are fetching
const Loader: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-[#111111]">
      <LoadingSpinnerIcon />
  </div>
);

// ============================================================================
// Main Application Component
// ============================================================================
const App: React.FC = () => {
  // --- State Management ---
  type View = 'landing' | 'gallery' | 'adminLogin' | 'admin';
  const [view, setView] = useState<View>('landing');
  const [showFooter, setShowFooter] = useState(false);

  // --- Navigation Handlers ---
  const navigateToAdminLogin = () => setView('adminLogin');
  const handleLoginSuccess = () => setView('admin');
  
  const handleBackToLanding = () => {
      setView('landing');
      // Clean URL hash to prevent automatic redirection on refresh
      if (window.location.hash) {
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
  };

  const handleBackToGallery = () => {
    setView('gallery');
  };

  // --- Effects ---

  // Effect: Footer visibility logic
  // Determines whether the footer should be shown based on the current view
  useEffect(() => {
    const isGalleryView = view === 'gallery';
    setShowFooter(isGalleryView);
  }, [view]);

  // Effect: Keyboard shortcut (Ctrl/Meta + Alt + A) for Admin Login
  // Provides a quick way for administrators to access the login page
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
  
  // Effect: Handle URL hash for routing (Admin + Deep Links)
  // Allows navigating to specific views using URL hashes
  useEffect(() => {
    const handleHashRouting = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
         if (view !== 'admin' && view !== 'adminLogin') navigateToAdminLogin();
      } else if (hash === '#studio') {
         if (view !== 'gallery') setView('gallery');
      }
    };
    
    handleHashRouting(); // Check on mount
    window.addEventListener('hashchange', handleHashRouting);

    return () => {
      window.removeEventListener('hashchange', handleHashRouting);
    };
  }, [view]);

  // Effect: Smooth scrolling and position reset on view change
  // Ensures the user starts at the top of the page when navigating to a new view
  useEffect(() => {
    const handleScrollPosition = () => {
      const hash = window.location.hash;
      if (hash && hash !== '#admin' && hash !== '#studio') {
        // Scroll to specific section if hash exists and isn't a view route
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

    const timer = setTimeout(handleScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [view]);


  // ============================================================================
  // Render Logic
  // ============================================================================

  // Render the landing page directly if it's the active view
  if (view === 'landing') {
    return (
      <Suspense fallback={<Loader />}>
        <SEO title="Home" />
        <LandingPage onNavigate={(newView) => setView(newView)} />
      </Suspense>
    );
  }

  // Render other views based on the current state
  const renderContent = () => {
    switch(view) {
        case 'adminLogin':
            return (
              <>
                <SEO title="Admin Login" description="Secure access to studio management." />
                <AdminLoginPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToLanding} />
              </>
            );
        case 'admin':
            return (
              <>
                <SEO title="Admin Dashboard" description="Studio management and analytics." />
                <AdminDashboard onBack={handleBackToLanding} />
              </>
            );
        case 'gallery':
            return <UNDRLAGallery onBack={handleBackToLanding} />;
        default:
            setView('landing'); // Fallback
            return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#111] overflow-hidden flex flex-col">
      <main className="flex-grow">
        <Suspense fallback={<Loader />}>
            {renderContent()}
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        {view !== 'adminLogin' && <Chatbot />}
        {showFooter && <Footer onAdminLogin={navigateToAdminLogin} />}
      </Suspense>
    </div>
  );
};

export default App;
