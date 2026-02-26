import React, { useState, useEffect } from 'react';
import { UploadIcon, TrashIcon, CopyIcon, CheckIcon, CloseIcon } from '../icons';

interface MediaFile {
  url: string;
  filename: string;
  uploadedAt: string;
}

interface MediaManagerProps {
    addToast: (message: string) => void;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ addToast }) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a: MediaFile, b: MediaFile) => 
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        setMediaFiles(sortedData);
      } else {
        setError('Failed to fetch media');
      }
    } catch (err) {
      setError('Error fetching media');
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchMedia();
        addToast('File uploaded successfully');
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/media/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMediaFiles(prev => prev.filter(f => f.filename !== filename));
        addToast('File deleted');
      } else {
        setError('Delete failed');
      }
    } catch (err) {
      setError('Error deleting file');
    }
  };

  const handleCopyUrl = (url: string, filename: string) => {
      const fullUrl = window.location.origin + url;
      navigator.clipboard.writeText(fullUrl).then(() => {
          setCopiedFile(filename);
          addToast('URL copied to clipboard');
          setTimeout(() => setCopiedFile(null), 2000);
      });
  };

  return (
    <div className="bg-black text-white p-2 md:p-4">
      <header className="mb-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-bold uppercase tracking-widest text-white">Media Library</h2>
        <p className="text-gray-400 mt-0.5 text-[10px]">Manage all uploaded assets for your site.</p>
        
        <div className="mt-4">
          <label className={`cursor-pointer bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors flex items-center gap-2 text-[10px] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <UploadIcon className="w-3 h-3" />
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleUpload} 
              accept="image/*,video/*,audio/*"
              disabled={uploading}
            />
          </label>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-2 rounded-lg mb-4 animate-fade-in text-center text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
        {mediaFiles.map((file) => (
          <div key={file.filename} className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-fuchsia-500 transition-colors">
            <div className="aspect-square relative bg-gray-800">
              {file.filename.match(/\.(mp4|webm)$/i) ? (
                <video src={file.url} className="w-full h-full object-cover" />
              ) : (
                <img src={file.url} alt={file.filename} className="w-full h-full object-cover" loading="lazy" />
              )}
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-1">
                    <button 
                    onClick={() => handleDelete(file.filename)}
                    className="p-1.5 bg-red-600 rounded-full hover:bg-red-500 text-white transition-colors"
                    title="Delete"
                    >
                    <TrashIcon className="w-3 h-3" />
                    </button>
                    <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 text-white transition-colors"
                    title="View Full Size"
                    >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    </a>
                </div>
                <button
                    onClick={() => handleCopyUrl(file.url, file.filename)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-[9px] font-bold uppercase tracking-wider"
                >
                    {copiedFile === file.filename ? (
                        <>
                            <CheckIcon className="w-2 h-2 text-green-400" />
                            <span className="text-green-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-2 h-2" />
                            <span>Copy URL</span>
                        </>
                    )}
                </button>
              </div>
            </div>
            <div className="p-1.5">
              <p className="text-[9px] text-gray-400 truncate font-mono" title={file.filename}>{file.filename}</p>
              <p className="text-[8px] text-gray-600 mt-0.5">{new Date(file.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {mediaFiles.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
          <UploadIcon className="w-16 h-16 mb-6 opacity-20" />
          <p className="text-xl font-bold uppercase tracking-widest mb-2 text-gray-500">No Media Found</p>
          <p className="text-sm max-w-md text-center">Upload images or videos to manage your studio assets. Supported formats: JPG, PNG, MP4, WEBM.</p>
        </div>
      )}
    </div>
  );
};
