
import React from 'react';
import { TwitterIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './icons';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FooterProps {
  onAdminLogin: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminLogin }) => {
  const currentYear = new Date().getFullYear();
  const [studioName] = useLocalStorage<string>('tag_studio_name', 'UNDR:LA Studios');

  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-white/10 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
          
          {/* Copyright and Admin Links */}
          <div className="flex flex-col items-center md:items-start gap-2 order-2 md:order-1">
            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
              <p>&copy; {currentYear} {studioName}</p>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <p>All Rights Reserved</p>
            </div>
            <button 
              onClick={onAdminLogin}
              className="text-xs text-gray-600 hover:text-fuchsia-400 transition-colors duration-300 flex items-center gap-1 group"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">/</span>
              ADMIN PORTAL
            </button>
          </div>
          
          {/* Social Links Container */}
          <nav className="flex items-center justify-center gap-6 order-1 md:order-2" aria-label="Social Media">
            <a 
              href="#" 
              className="p-2 text-gray-500 hover:text-white hover:scale-125 transition-all duration-300 ease-out" 
              aria-label="Follow us on Twitter"
            >
              <TwitterIcon className="h-5 w-5" />
            </a>
            <a 
              href="https://www.instagram.com/technicalartistsgroup" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-gray-500 hover:text-fuchsia-400 hover:scale-125 transition-all duration-300 ease-out" 
              aria-label="Follow us on Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="p-2 text-gray-500 hover:text-blue-400 hover:scale-125 transition-all duration-300 ease-out" 
              aria-label="Connect with us on LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            <a 
              href="https://www.youtube.com/technicalartistsgroup" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-gray-500 hover:text-red-500 hover:scale-125 transition-all duration-300 ease-out" 
              aria-label="Subscribe to our YouTube channel"
            >
              <YouTubeIcon className="h-5 w-5" />
            </a>
          </nav>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
