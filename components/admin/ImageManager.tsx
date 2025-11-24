import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { ImageRecord } from '../../types';
import { UploadIcon, CopyIcon, CloseIcon } from '../icons';

const MAX_SIZE_MB = 1;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ImageManager: React.FC<{ addToast: (message: string) => void }> = ({ addToast }) => {
    const [images, setImages] = useLocalStorage<ImageRecord[]>('tag_uploaded_images', []);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_SIZE_BYTES) {
            setError(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const dataUrl = await fileToBase64(selectedFile);
            const newImage: ImageRecord = {
                id: Date.now(),
                name: selectedFile.name,
                dataUrl: dataUrl,
            };
            setImages(prev => [...prev, newImage]);
            addToast(`Image "${selectedFile.name}" uploaded.`);
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (err) {
            setError('Failed to read file.');
            console.error(err);
        }
    };
    
    const handleDelete = (id: number) => {
        const imageToDelete = images.find(img => img.id === id);
        if (window.confirm(`Are you sure you want to delete "${imageToDelete?.name}"?`)) {
            setImages(prev => prev.filter(img => img.id !== id));
            addToast(`Image "${imageToDelete?.name}" deleted.`);
        }
    };

    const handleCopy = (dataUrl: string) => {
        navigator.clipboard.writeText(dataUrl)
            .then(() => addToast('Data URL copied to clipboard!'))
            .catch(() => addToast('Failed to copy URL.'));
    };

    return (
        <section>
            <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-6">Image Library</h2>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Upload New Image</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Select an image file (Max {MAX_SIZE_MB}MB)</label>
                        <input
                            ref={fileInputRef}
                            id="image-upload"
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                        />
                        {error && <p role="alert" className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>
                    {preview && (
                        <div className="flex flex-col items-center gap-4 animate-fade-in">
                             <img src={preview} alt="Image preview" className="max-h-32 w-auto rounded-md border border-gray-600" />
                             <button onClick={handleUpload} className="w-full flex items-center justify-center gap-2 px-6 py-2 font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full hover:scale-105">
                                 <UploadIcon className="w-5 h-5" />
                                 <span>Upload Image</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map(image => (
                    <div key={image.id} className="group relative bg-gray-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
                        <img src={image.dataUrl} alt={image.name} className="aspect-square w-full object-cover"/>
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                            <p className="text-xs font-semibold break-all">{image.name}</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleCopy(image.dataUrl)} aria-label="Copy URL" className="p-2 bg-black/50 rounded-full hover:bg-cyan-500"><CopyIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(image.id)} aria-label="Delete Image" className="p-2 bg-black/50 rounded-full hover:bg-red-500"><CloseIcon /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {images.length === 0 && (
                <p className="text-center text-gray-500 italic py-4">No images uploaded yet.</p>
            )}
        </section>
    );
};
