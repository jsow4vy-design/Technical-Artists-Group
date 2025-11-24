
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LoadingSpinnerIcon } from './components/icons';

const LandingPage = lazy(() => import('./components/LandingPage'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const Footer = lazy(() => import('./components/Footer'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));
const AVGallery = lazy(() => import('./components/AVGallery'));
const MoesGallery = lazy(() => import('./components/MoesGallery'));

const Loader: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-[#111111]">
      <LoadingSpinnerIcon />
  </div>
);

const App: React.FC = () => {
  type View = 'landing' | 'av' | 'moes' | 'adminLogin' | 'admin';
  const [view, setView] = useState<View>('landing');
  const [showFooter, setShowFooter] = useState(false);

  const navigateToAdminLogin = () => {
      setView('adminLogin');
  };

  const handleLoginSuccess = () => {
      setView('admin');
  };

  const handleBackToLanding = () => {
      setView('landing');
      // Clear the hash to prevent re-triggering login on refresh or back navigation
      if (window.location.hash === '#admin') {
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
  };

  // Manage footer visibility based on current view
  useEffect(() => {
    const isGalleryView = view === 'av' || view === 'moes';
    setShowFooter(isGalleryView);
  }, [view]);

  // Add a keyboard shortcut to go to the admin login page
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
  
  // Add access via URL hash to go to the admin login page
  useEffect(() => {
    const checkHashForAdmin = () => {
      if (window.location.hash === '#admin' && view !== 'admin' && view !== 'adminLogin') {
        navigateToAdminLogin();
      }
    };
    
    checkHashForAdmin(); // Check on initial load
    window.addEventListener('hashchange', checkHashForAdmin);

    return () => {
      window.removeEventListener('hashchange', checkHashForAdmin);
    };
  }, [view]);


  // The landing page is a special case that takes over the full screen
  // and does not use the standard app layout with footer/chatbot.
  if (view === 'landing') {
    return (
      <Suspense fallback={<Loader />}>
        <LandingPage onNavigate={(newView) => setView(newView)} />
      </Suspense>
    );
  }

  // All other views use the standard layout.
  const renderContent = () => {
    switch(view) {
        case 'adminLogin':
            return <AdminLoginPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToLanding} />;
        case 'admin':
            return <AdminDashboard onBack={handleBackToLanding} />;
        case 'av':
            return <AVGallery onBack={handleBackToLanding} />;
        case 'moes':
            return <MoesGallery onBack={handleBackToLanding} />;
        default:
            // This is a failsafe. If an unknown view is set, go back to landing.
            setView('landing');
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
      {/* Show chatbot on gallery and admin pages, but not on login */}
      <Suspense fallback={null}>
        {view !== 'adminLogin' && <Chatbot />}
        {showFooter && <Footer onAdminLogin={navigateToAdminLogin} />}
      </Suspense>
    </div>
  );
};

export default App;
