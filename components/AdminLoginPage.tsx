import React, { useState, useEffect, useRef } from 'react';
import { BackIcon } from './icons';
import { blueprintStyleAdminLogin } from '../styles/common';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const LOGO_URL = 'https://i.imgur.com/x02n31a.png';

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate network delay for effect
    setTimeout(() => {
      if (password === 'tagyoureit') {
        onLoginSuccess();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword(''); // Clear the input on error
        passwordInputRef.current?.focus();
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#111] text-white p-4 animate-fade-in" style={blueprintStyleAdminLogin}>
        <div className="absolute top-8 left-8">
            <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-[#00ffff] transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
            <BackIcon />
            <span>Back to Site</span>
            </button>
        </div>
        <div className="w-full max-w-sm text-center">
            <img src={LOGO_URL} alt="Technical Artists Group Logo" className="w-48 h-auto mx-auto mb-8" />
            <h1 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Admin Access</h1>
            <p className="text-gray-400 mb-8">Enter the password to manage the dashboard.</p>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <label htmlFor="password-input" className="sr-only">Password</label>
                    <input
                        ref={passwordInputRef}
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className={`w-full bg-gray-800 border rounded-md py-3 px-4 focus:outline-none text-white text-center tracking-widest ${error ? 'border-red-500 ring-2 ring-red-500/50' : 'border-gray-600 focus:ring-2 focus:ring-cyan-500'}`}
                        disabled={isSubmitting}
                    />
                </div>
                {error && <p role="alert" className="text-red-400 text-sm mt-3 animate-fade-in">{error}</p>}
                <button
                    type="submit"
                    className="mt-6 w-full px-10 py-3 font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 uppercase tracking-wider hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-wait"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Authenticating...' : 'Enter'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default AdminLoginPage;
