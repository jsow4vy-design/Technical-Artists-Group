
import React from 'react';
import { TwitterIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './icons';

interface FooterProps {
  onAdminLogin: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminLogin }) => {
  return (
    <footer className="bg-black/50 border-t border-white/10 text-gray-400">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onAdminLogin}
              className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
            >
              Admin Login
            </button>
            <p className="text-sm">&copy; {new Date().getFullYear()} Technical Artists Group. All Rights Reserved.</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <TwitterIcon className="h-6 w-6" />
            </a>
            <a href="https://www.instagram.com/technicalartistsgroup" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <InstagramIcon className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
              <LinkedInIcon className="h-6 w-6" />
            </a>
            <a href="https://www.youtube.com/technicalartistsgroup" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                <YouTubeIcon className="h-6 w-6" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;