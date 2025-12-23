
import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { UploadIcon, LoadingSpinnerIcon, RefreshIcon } from '../icons';
import { Input } from '../FormControls';

const DEFAULT_LOGO_URL = 'https://i.imgur.com/x02n31a.png';
const DEFAULT_STUDIO_NAME = 'UNDR:LA Studios';
const MAX_SIZE_MB = 2;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const LogoManager: React.FC<{ addToast: (message: string) => void }> = ({ addToast }) => {
    const [logoUrl, setLogoUrl] = useLocalStorage<string>('tag_logo_url', DEFAULT_LOGO_URL);
    const [studioName, setStudioName] = useLocalStorage<string>('tag_studio_name', DEFAULT_STUDIO_NAME);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`File too large. Max ${MAX_SIZE_MB}MB.`);
            return;
        }

        setIsUploading(true);
        try {
            const base64 = await fileToBase64(file);
            setLogoUrl(base64);
            addToast('Logo updated successfully.');
        } catch (e) {
            addToast('Failed to update logo.');
            console.error(e);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleResetLogo = () => {
        if (window.confirm('Reset logo to default?')) {
            setLogoUrl(DEFAULT_LOGO_URL);
            addToast('Logo reset to default.');
        }
    };

    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-6">Brand Identity</h2>
            
            {/* Studio Name Input */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-widest">Studio Name</h3>
                <div className="max-w-md">
                    <Input 
                        label="Display Name" 
                        value={studioName} 
                        onChange={(e) => setStudioName(e.target.value)}
                        placeholder="e.g. UNDR:LA Studios"
                    />
                    <p className="text-xs text-gray-500 mt-2 italic">This updates the header, footer, and landing page titles site-wide.</p>
                </div>
            </div>

            {/* Logo Manager */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-black p-4 rounded-lg border border-gray-700 flex items-center justify-center w-48 h-32">
                    <img src={logoUrl} alt="Current Site Logo" className="max-w-full max-h-full object-contain" />
                </div>
                
                <div className="flex-grow space-y-4">
                    <div>
                         <p className="text-gray-300 mb-2 font-semibold">Site Logo</p>
                         <p className="text-xs text-gray-500 mb-4">Recommended: PNG with transparent background. Max 2MB.</p>
                         
                         <div className="flex flex-wrap gap-4">
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                id="logo-upload" 
                                accept="image/png, image/jpeg, image/webp" 
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label 
                                htmlFor="logo-upload"
                                className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-full cursor-pointer hover:scale-105 transition-transform ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {isUploading ? <LoadingSpinnerIcon /> : <UploadIcon className="w-5 h-5" />}
                                <span>{isUploading ? 'Uploading...' : 'Upload New Logo'}</span>
                            </label>

                            {logoUrl !== DEFAULT_LOGO_URL && (
                                <button 
                                    onClick={handleResetLogo}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-gray-300 font-bold rounded-full hover:bg-gray-600 transition-colors"
                                >
                                    <RefreshIcon className="w-4 h-4" />
                                    <span>Reset Default</span>
                                </button>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
