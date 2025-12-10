
import React, { useState, useEffect, useRef } from 'react';
import { getGalleries, createGallery, deleteGallery, uploadImageToGallery, deleteImageFromGallery } from '../../services/galleryService';
import type { Gallery, GalleryImage } from '../../types';
import { UploadIcon, CloseIcon, CheckIcon, LoadingSpinnerIcon, DragHandleIcon, EditIcon } from '../icons';
import { Input, Select, Textarea } from '../FormControls';
import { Modal } from '../common/Modal';

interface GalleryManagerProps {
    addToast: (message: string) => void;
}

const GalleryCard: React.FC<{ gallery: Gallery; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ gallery, onClick, onDelete }) => (
    <div 
        onClick={onClick}
        className="group relative bg-gray-800/50 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-cyan-400 transition-all duration-300"
    >
        <div className="flex justify-between items-start mb-2">
            <div>
                <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{gallery.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                    gallery.page === 'moes' ? 'bg-fuchsia-900 text-fuchsia-200' :
                    'bg-gray-700 text-gray-300'
                }`}>
                    {gallery.page === 'moes' ? 'UnderLA' : 
                     gallery.page === 'landing' ? 'Landing Page' : 'Other'}
                </span>
            </div>
            <button 
                onClick={onDelete} 
                className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
                title="Delete Gallery"
            >
                <CloseIcon />
            </button>
        </div>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">{gallery.description || 'No description provided.'}</p>
        
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
                {gallery.images.slice(0, 3).map((img) => (
                    <img key={img.id} src={img.url} alt="Preview" className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800 object-cover" />
                ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">{gallery.images.length} images</span>
        </div>
    </div>
);

const CreateGalleryModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreate: (name: string, page: Gallery['page'], description: string) => void }> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [page, setPage] = useState<Gallery['page']>('moes');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onCreate(name, page, description);
        setIsSubmitting(false);
        onClose();
        setName('');
        setDescription('');
        setPage('moes');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="create-gallery-title">
            <div className="bg-gray-900 rounded-lg p-6 border border-cyan-500/30 w-full max-w-lg">
                <h3 id="create-gallery-title" className="text-2xl font-bold text-cyan-400 mb-6">Create New Gallery</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Gallery Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Session Showcase" />
                    <Select label="Designated Page" value={page} onChange={e => setPage(e.target.value as Gallery['page'])} required>
                        <option value="moes">UnderLA.Studio</option>
                        <option value="landing">Landing Page</option>
                        <option value="other">Other</option>
                    </Select>
                    <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this gallery for?" />
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-gray-300 hover:bg-gray-800">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-full hover:bg-cyan-400 disabled:opacity-50">
                            {isSubmitting ? 'Creating...' : 'Create Gallery'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const GalleryDetailModal: React.FC<{ 
    gallery: Gallery; 
    onClose: () => void; 
    onUpload: (file: File) => Promise<void>; 
    onDeleteImage: (imageId: string) => Promise<void>;
}> = ({ gallery, onClose, onUpload, onDeleteImage }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsUploading(true);
        try {
            await onUpload(file);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} ariaLabelledBy="gallery-detail-title">
            <div className="bg-gray-900 rounded-lg border border-cyan-500/30 w-full max-w-5xl h-[85vh] flex flex-col">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 id="gallery-detail-title" className="text-2xl font-bold text-white">{gallery.name}</h3>
                        <p className="text-cyan-400 text-sm">{gallery.page === 'moes' ? 'UnderLA' : gallery.page}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                            id="gallery-upload"
                        />
                        <label 
                            htmlFor="gallery-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-full cursor-pointer hover:bg-cyan-400 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isUploading ? <LoadingSpinnerIcon /> : <UploadIcon className="w-5 h-5" />}
                            <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                        </label>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    {gallery.images.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <UploadIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p>No images in this gallery yet.</p>
                            <p className="text-sm">Upload some images to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {gallery.images.map(img => (
                                <div key={img.id} className="group relative aspect-square bg-gray-800 rounded-md overflow-hidden border border-gray-700">
                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => onDeleteImage(img.id)}
                                            className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                                            title="Delete Image"
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                        <p className="text-xs text-white truncate">{img.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export const GalleryManager: React.FC<GalleryManagerProps> = ({ addToast }) => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

    useEffect(() => {
        loadGalleries();
    }, []);

    const loadGalleries = async () => {
        setIsLoading(true);
        const data = await getGalleries();
        setGalleries(data);
        setIsLoading(false);
    };

    const handleCreateGallery = async (name: string, page: Gallery['page'], description: string) => {
        try {
            const newGallery = await createGallery(name, page, description);
            setGalleries(prev => [...prev, newGallery]);
            addToast(`Gallery "${name}" created successfully.`);
        } catch (e) {
            addToast('Failed to create gallery.');
        }
    };

    const handleDeleteGallery = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
            try {
                await deleteGallery(id);
                setGalleries(prev => prev.filter(g => g.id !== id));
                addToast('Gallery deleted.');
            } catch (e) {
                addToast('Failed to delete gallery.');
            }
        }
    };

    const handleUploadImage = async (file: File) => {
        if (!selectedGallery) return;
        try {
            const newImage = await uploadImageToGallery(selectedGallery.id, file);
            // Update local state to reflect change immediately
            const updatedGallery = { ...selectedGallery, images: [...selectedGallery.images, newImage] };
            setSelectedGallery(updatedGallery);
            setGalleries(prev => prev.map(g => g.id === updatedGallery.id ? updatedGallery : g));
            addToast('Image uploaded successfully.');
        } catch (e) {
            addToast('Failed to upload image.');
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!selectedGallery) return;
        if (!window.confirm('Delete this image?')) return;
        
        try {
            await deleteImageFromGallery(selectedGallery.id, imageId);
            const updatedGallery = { ...selectedGallery, images: selectedGallery.images.filter(img => img.id !== imageId) };
            setSelectedGallery(updatedGallery);
            setGalleries(prev => prev.map(g => g.id === updatedGallery.id ? updatedGallery : g));
            addToast('Image deleted.');
        } catch (e) {
            addToast('Failed to delete image.');
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinnerIcon /></div>;

    return (
        <section>
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-white">Gallery Management</h2>
                    <p className="text-gray-400 mt-1">Organize and manage image collections per page.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <span>+ Create Gallery</span>
                </button>
            </div>

            {galleries.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
                    <p className="text-gray-400 mb-4">No galleries found.</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className="text-cyan-400 hover:underline">Create your first gallery</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map(gallery => (
                        <GalleryCard 
                            key={gallery.id} 
                            gallery={gallery} 
                            onClick={() => setSelectedGallery(gallery)}
                            onDelete={(e) => handleDeleteGallery(e, gallery.id)}
                        />
                    ))}
                </div>
            )}

            <CreateGalleryModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateGallery} 
            />

            {selectedGallery && (
                <GalleryDetailModal 
                    gallery={selectedGallery}
                    onClose={() => setSelectedGallery(null)}
                    onUpload={handleUploadImage}
                    onDeleteImage={handleDeleteImage}
                />
            )}
        </section>
    );
};
