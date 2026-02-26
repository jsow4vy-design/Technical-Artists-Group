import React, { useState, useEffect, useRef } from 'react';
import { GallerySession } from '../../types';
import { getGalleries, createGallery, deleteGallery, uploadImageToGallery, deleteImageFromGallery } from '../../services/galleryService';
import { TrashIcon, UploadIcon, CloseIcon, LoadingSpinnerIcon } from '../icons';
import { Modal } from '../common/Modal';

// ============================================================================
// Sub-Components
// ============================================================================

const GalleryDetailModal: React.FC<{
    gallery: GallerySession;
    onClose: () => void;
    onUpdate: () => void;
    addToast: (msg: string) => void;
}> = ({ gallery, onClose, onUpdate, addToast }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState<string[]>(gallery.images);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImageToGallery(gallery.id, file);
            setImages(prev => [...prev, url]);
            addToast('Image uploaded successfully');
            onUpdate();
        } catch (error) {
            console.error(error);
            addToast('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (imageUrl: string) => {
        if (!confirm('Delete this image?')) return;
        try {
            await deleteImageFromGallery(gallery.id, imageUrl);
            setImages(prev => prev.filter(img => img !== imageUrl));
            addToast('Image deleted');
            onUpdate();
        } catch (error) {
            console.error(error);
            addToast('Failed to delete image');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} ariaLabelledBy="gallery-detail-title">
            <div className="bg-gray-900 rounded-lg w-full max-w-3xl h-[70vh] flex flex-col border border-gray-800">
                <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 id="gallery-detail-title" className="text-lg font-bold text-white uppercase tracking-wider">{gallery.artist}</h3>
                        <p className="text-gray-400 text-[10px] mt-1">{gallery.description}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[4/3] bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-500 hover:bg-gray-800 transition-all group"
                        >
                            {isUploading ? (
                                <LoadingSpinnerIcon />
                            ) : (
                                <>
                                    <UploadIcon className="w-6 h-6 text-gray-500 group-hover:text-fuchsia-500 mb-2" />
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-wider">Add Photo</span>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
                        </div>

                        {images.map((img, idx) => (
                            <div key={idx} className="group relative aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleDeleteImage(img)}
                                        className="p-1.5 bg-red-600 rounded-full hover:bg-red-500 text-white transition-transform hover:scale-110"
                                        title="Delete Image"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const CreateGalleryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<GallerySession, 'id'>) => Promise<void>;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        artist: '',
        description: '',
        rotation: 0,
        widthClass: 'w-72',
        zIndex: 'z-10'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...formData,
                type: 'image',
                images: []
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="create-gallery-title">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 w-full max-w-md">
                <h3 id="create-gallery-title" className="text-base font-bold text-white mb-4 uppercase tracking-wider text-center">New Gallery Session</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Artist / Session Name</label>
                        <input 
                            type="text"
                            value={formData.artist} 
                            onChange={e => setFormData(prev => ({ ...prev, artist: e.target.value }))} 
                            required 
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-white text-sm focus:outline-none focus:border-fuchsia-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                            required 
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-white text-sm focus:outline-none focus:border-fuchsia-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">Rotation (deg)</label>
                            <input 
                                type="number"
                                value={formData.rotation} 
                                onChange={e => setFormData(prev => ({ ...prev, rotation: parseInt(e.target.value) }))} 
                                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-white text-sm focus:outline-none focus:border-fuchsia-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">Z-Index Class</label>
                            <input 
                                type="text"
                                value={formData.zIndex} 
                                onChange={e => setFormData(prev => ({ ...prev, zIndex: e.target.value }))} 
                                placeholder="z-10"
                                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-white text-sm focus:outline-none focus:border-fuchsia-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                        <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-full text-xs text-gray-400 hover:text-white hover:bg-gray-800">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-1.5 bg-fuchsia-600 text-white text-xs font-bold rounded-full hover:bg-fuchsia-500 disabled:opacity-50">
                            {isSaving ? <LoadingSpinnerIcon className="w-3 h-3" /> : 'Create Session'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export const GalleryManager: React.FC<{ addToast: (msg: string) => void }> = ({ addToast }) => {
    const [galleries, setGalleries] = useState<GallerySession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<GallerySession | null>(null);

    const loadGalleries = async () => {
        try {
            const data = await getGalleries();
            setGalleries(data);
        } catch (error) {
            addToast('Failed to load galleries');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGalleries();
    }, []);

    const handleCreate = async (data: Omit<GallerySession, 'id'>) => {
        try {
            await createGallery(data);
            addToast('Gallery session created');
            setIsCreateModalOpen(false);
            loadGalleries();
        } catch (error) {
            addToast('Failed to create gallery');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this gallery session?')) return;
        try {
            await deleteGallery(id);
            setGalleries(prev => prev.filter(g => g.id !== id));
            addToast('Gallery session deleted');
        } catch (error) {
            addToast('Failed to delete gallery');
        }
    };

    return (
        <section>
            <header className="flex flex-col items-center justify-center text-center mb-6">
                <h2 className="text-lg font-bold uppercase tracking-widest text-white">Gallery Sessions</h2>
                <p className="text-gray-400 mt-0.5 text-[10px]">Manage the visual journal entries displayed on the main gallery page.</p>
                
                <div className="mt-4">
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-full font-bold uppercase tracking-wider transition-all shadow-lg shadow-fuchsia-500/20 text-[10px]"
                    >
                        <UploadIcon className="w-3 h-3" />
                        <span>New Session</span>
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinnerIcon className="w-10 h-10 text-fuchsia-500" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {galleries.map((gallery) => (
                        <div key={gallery.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-fuchsia-500/50 transition-all group">
                            <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                {gallery.images.length > 0 ? (
                                    <img src={gallery.images[0]} alt={gallery.artist} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600 bg-gray-800/50">
                                        <span className="text-[9px] uppercase tracking-widest font-bold">No Images</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => setSelectedGallery(gallery)}
                                        className="px-3 py-1 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform text-[9px] uppercase tracking-wider"
                                    >
                                        Manage Images
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-tight">{gallery.artist}</h3>
                                    <button 
                                        onClick={() => handleDelete(gallery.id)}
                                        className="text-gray-500 hover:text-red-500 transition-colors p-0.5"
                                        title="Delete Session"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 line-clamp-2 mb-2 h-7">{gallery.description}</p>
                                <div className="flex items-center gap-3 text-[8px] font-mono text-gray-500 uppercase tracking-wider border-t border-gray-800 pt-1.5">
                                    <span>{gallery.images.length} Images</span>
                                    <span>Rotation: {gallery.rotation}°</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateGalleryModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSave={handleCreate} 
                />
            )}

            {selectedGallery && (
                <GalleryDetailModal 
                    gallery={selectedGallery} 
                    onClose={() => setSelectedGallery(null)} 
                    onUpdate={loadGalleries}
                    addToast={addToast}
                />
            )}
        </section>
    );
};
