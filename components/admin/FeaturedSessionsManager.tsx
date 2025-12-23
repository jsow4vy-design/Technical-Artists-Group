
import React, { useState, useRef, useEffect } from 'react';
import { featuredSessions as defaultFeaturedSessions } from '../../data/studioData';
import { Input, Textarea, Select } from '../FormControls';
import { Modal } from '../common/Modal';
import { CloseIcon, EditIcon, DragHandleIcon, UploadIcon, BoltIcon, LoadingSpinnerIcon } from '../icons';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateStudioImage } from '../../services/geminiService';
import type { ImageRecord, FeaturedSession } from '../../types';

const MAX_SESSIONS = 16; 
const MAX_SIZE_MB = 100; // Increased for video

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- Sub-Component: Image Picker ---

const ImagePickerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onImageSelect: (dataUrl: string) => void;
    addToast: (message: string) => void;
}> = ({ isOpen, onClose, onImageSelect, addToast }) => {
    const [images, setImages] = useLocalStorage<ImageRecord[]>('tag_uploaded_images', []);
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
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

        if (!file.type.startsWith('image/')) {
            setError('Invalid file type. Please select an image file.');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit for images
            setError(`File size exceeds 5MB limit.`);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            const dataUrl = await fileToBase64(selectedFile);
            const newImage: ImageRecord = { id: Date.now(), name: selectedFile.name, dataUrl };
            setImages(prev => [...prev, newImage]);
            addToast(`Image "${selectedFile.name}" uploaded.`);
            setSelectedImage(dataUrl);
            setActiveTab('library');
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setError('Failed to read file.');
        }
    };

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const generatedDataUrl = await generateStudioImage('modern music studio album art, cinematic');
            const newImage: ImageRecord = { 
                id: Date.now(), 
                name: `AI_Generated_${Date.now()}`, 
                dataUrl: generatedDataUrl 
            };
            setImages(prev => [...prev, newImage]);
            addToast('AI Image generated successfully.');
            setSelectedImage(generatedDataUrl);
            setActiveTab('library');
        } catch (e) {
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleConfirm = () => {
        if (selectedImage) {
            onImageSelect(selectedImage);
        }
    };

    const TabButton: React.FC<{ tab: 'library' | 'upload', children: React.ReactNode }> = ({ tab, children }) => (
        <button role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-gray-400 border-transparent hover:text-white'}`}>
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="image-picker-title">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-full border border-cyan-500/30 max-h-[80vh] flex flex-col">
                <header className="p-4 border-b border-gray-700">
                    <h3 id="image-picker-title" className="text-xl font-bold text-cyan-400">Select Thumbnail / Art</h3>
                </header>
                <div className="border-b border-gray-700 px-4">
                    <div role="tablist" className="flex items-center">
                        <TabButton tab="library">Library</TabButton>
                        <TabButton tab="upload">Upload / AI Gen</TabButton>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-grow">
                    {activeTab === 'library' && (
                        <div role="tabpanel">
                            {images.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {images.map(image => (
                                        <button key={image.id} onClick={() => setSelectedImage(image.dataUrl)} className={`relative aspect-square rounded-lg overflow-hidden focus:outline-none ring-offset-2 ring-offset-gray-900 focus:ring-2 ${selectedImage === image.dataUrl ? 'ring-2 ring-cyan-400' : 'ring-0'}`}>
                                            <img src={image.dataUrl} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
                                            {selectedImage === image.dataUrl && <div className="absolute inset-0 bg-cyan-500/50" />}
                                        </button>
                                    ))}
                                </div>
                            ) : <p className="text-center text-gray-500 italic py-4">Library is empty.</p>}
                        </div>
                    )}
                    {activeTab === 'upload' && (
                         <div role="tabpanel" className="max-w-md mx-auto space-y-8">
                            <div>
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Upload Custom Image</h4>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-cyan-500/20 file:text-cyan-300" />
                                {preview && (
                                    <div className="flex flex-col items-center gap-4 mt-4 animate-fade-in">
                                        <img src={preview} alt="Preview" className="max-h-32 w-auto rounded-md border border-gray-600" />
                                        <button onClick={handleUpload} className="w-full px-6 py-2 font-bold text-black bg-cyan-400 rounded-full hover:scale-105">Upload & Select</button>
                                    </div>
                                )}
                            </div>
                            <div className="text-center text-gray-600">OR</div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">AI Generate Thumbnail</h4>
                                <button 
                                    onClick={handleGenerateAI} 
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 font-bold text-black bg-fuchsia-500 rounded-full hover:scale-105 disabled:opacity-50"
                                >
                                    {isGenerating ? <LoadingSpinnerIcon /> : <BoltIcon className="w-5 h-5" />}
                                    <span>{isGenerating ? 'Synthesizing...' : 'Generate with AI'}</span>
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-4">
                     <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-300 bg-gray-700/50 rounded-full hover:bg-gray-700">Cancel</button>
                     <button type="button" onClick={handleConfirm} disabled={!selectedImage} className="px-6 py-2 font-bold text-black bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:scale-105 disabled:opacity-50">Confirm</button>
                </footer>
            </div>
        </Modal>
    );
};

// --- Sub-Component: Edit Modal ---

const EditSessionModal: React.FC<{ 
    session: FeaturedSession; 
    onClose: () => void; 
    onSave: (updatedSession: FeaturedSession) => void; 
}> = ({ session, onClose, onSave }) => {
  const [formData, setFormData] = useState(session);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) setMediaFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
        if (mediaFile) {
            const base64 = await fileToBase64(mediaFile);
            onSave({ ...formData, mediaUrl: base64 });
        } else {
            onSave(formData);
        }
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} ariaLabelledBy="edit-modal-title">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full border border-fuchsia-500/30 p-8">
        <h3 id="edit-modal-title" className="text-2xl font-bold text-fuchsia-400 mb-6 text-center uppercase tracking-widest">Edit Studio Showcase Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Artist / Performer" name="artist" value={formData.artist} onChange={handleChange} required />
                <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select label="Media Type" name="mediaType" value={formData.mediaType} onChange={handleChange}>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                </Select>
                <Input label="External Link (Optional)" name="mediaUrl" value={formData.mediaUrl.startsWith('data:') ? '' : formData.mediaUrl} onChange={handleChange} placeholder="YouTube, Vimeo, or MP4 link" />
            </div>
            <Textarea label="Description / Liner Notes" name="description" value={formData.description} onChange={handleChange} required />
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Replace Media File</label>
                <input type="file" onChange={handleFileChange} accept={formData.mediaType === 'audio' ? 'audio/*' : 'video/*'} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-fuchsia-500/20 file:text-fuchsia-300" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-300 bg-gray-700/50 rounded-full hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-6 py-2 font-bold text-black bg-fuchsia-500 rounded-full hover:scale-105 min-w-[120px]">
                    {isUploading ? <LoadingSpinnerIcon /> : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

// --- Main Component ---

interface FeaturedSessionsManagerProps {
  sessions: FeaturedSession[];
  setSessions: (sessions: FeaturedSession[]) => void;
  addToast: (message: string) => void;
}

export const FeaturedSessionsManager: React.FC<FeaturedSessionsManagerProps> = ({ sessions, setSessions, addToast }) => {
  const [newSession, setNewSession] = useState<Omit<FeaturedSession, 'id'>>({ 
    artist: '', 
    title: '', 
    description: '', 
    imageUrl: '', 
    mediaUrl: '', 
    mediaType: 'audio' 
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingSession, setEditingSession] = useState<FeaturedSession | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [sessionToUpdateImage, setSessionToUpdateImage] = useState<FeaturedSession['id'] | 'new' | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewSessionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setNewSession(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files?.[0]) setMediaFile(e.target.files[0]); 
  };

  const handleAddNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.mediaUrl && !mediaFile) { alert('Media link or file required.'); return; }
    if (!newSession.imageUrl) { alert('Thumbnail art required.'); return; }

    setIsUploading(true);
    try {
        let finalMediaUrl = newSession.mediaUrl;
        
        if (mediaFile) {
            finalMediaUrl = await fileToBase64(mediaFile);
        }

        const newSessionData: FeaturedSession = {
            ...newSession,
            id: Date.now(),
            mediaUrl: finalMediaUrl,
        };

        setSessions([...sessions, newSessionData]);
        addToast(`${newSession.mediaType === 'audio' ? 'Track' : 'Video'} added to studio showcase.`);
        setNewSession({ artist: '', title: '', description: '', imageUrl: '', mediaUrl: '', mediaType: 'audio' });
        setMediaFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
        addToast('Failed to add studio showcase item.');
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteSession = (id: number) => {
    if (window.confirm('Remove from studio showcase?')) {
      setSessions(sessions.filter(s => s.id !== id));
      addToast(`Item removed.`);
      headingRef.current?.focus();
    }
  };

  const handleSaveEditedSession = (updatedSession: FeaturedSession) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    addToast(`Item updated.`);
    setEditingSession(null);
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        const newSessions = [...sessions];
        const draggedItemContent = newSessions.splice(dragItem.current, 1)[0];
        newSessions.splice(dragOverItem.current, 0, draggedItemContent);
        setSessions(newSessions);
        addToast('Studio showcase order updated.');
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
    setDraggingIndex(null);
  };
  
  const handleImageSelect = (dataUrl: string) => {
    if (sessionToUpdateImage === 'new') {
        setNewSession(prev => ({ ...prev, imageUrl: dataUrl }));
    } else if (sessionToUpdateImage) {
        setSessions(sessions.map(s => s.id === sessionToUpdateImage ? { ...s, imageUrl: dataUrl } : s));
        addToast("Artwork updated.");
    }
    setIsImagePickerOpen(false);
  };

  const isAddSessionDisabled = sessions.length >= MAX_SESSIONS;

  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold uppercase tracking-widest text-white mb-6 outline-none">Studio Showcase Curator ({sessions.length}/{MAX_SESSIONS})</h2>
      
      <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 ${isAddSessionDisabled ? 'opacity-50' : ''}`}>
        <h3 className="text-xl font-bold text-fuchsia-400 mb-4 uppercase tracking-widest">Add New Item</h3>
        <fieldset disabled={isAddSessionDisabled || isUploading}>
          <form onSubmit={handleAddNewSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Artist / Project Name" name="artist" value={newSession.artist} onChange={handleNewSessionChange} required />
                  <Input label="Title" name="title" value={newSession.title} onChange={handleNewSessionChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Media Type" name="mediaType" value={newSession.mediaType} onChange={handleNewSessionChange}>
                      <option value="audio">Audio Track</option>
                      <option value="video">Video Project</option>
                  </Select>
                  <Input label="External Link (Optional)" name="mediaUrl" value={newSession.mediaUrl} onChange={handleNewSessionChange} placeholder="Paste YouTube, Vimeo, or MP4/WAV link" />
              </div>
              <Textarea label="Liner Notes / Description" name="description" value={newSession.description} onChange={handleNewSessionChange} required />
              
              <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail / Art</label>
                    <div className="w-32 h-32 bg-gray-900 rounded-md flex items-center justify-center border border-gray-700 overflow-hidden group relative">
                        {newSession.imageUrl ? <img src={newSession.imageUrl} alt="" className="w-full h-full object-cover" /> : <UploadIcon className="w-8 h-8 text-gray-700" />}
                        <button type="button" onClick={() => { setSessionToUpdateImage('new'); setIsImagePickerOpen(true); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{newSession.imageUrl ? 'Change' : 'Select'}</span>
                        </button>
                    </div>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400">Direct File Upload (Max {MAX_SIZE_MB}MB)</label>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            onChange={handleFileChange} 
                            accept={newSession.mediaType === 'audio' ? 'audio/*' : 'video/*'} 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-fuchsia-500/20 file:text-fuchsia-300" 
                        />
                        <p className="text-[10px] text-gray-500 italic">Recommended: Use external links for large videos to preserve bandwidth.</p>
                      </div>
                      <div className="text-right">
                          <button type="submit" disabled={isUploading} className="px-10 py-3 font-bold text-black bg-fuchsia-500 rounded-full hover:scale-105 shadow-[0_0_15px_#ff00ff] min-w-[180px]">
                              {isUploading ? <LoadingSpinnerIcon /> : 'Add to Studio Showcase'}
                          </button>
                      </div>
                  </div>
              </div>
          </form>
        </fieldset>
      </div>

      <div className="space-y-2">
        <div className="px-4 py-2 text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] flex justify-between">
            <span>Drag to Reorder</span>
            <span>Showcase Sequence</span>
        </div>
        {sessions.length > 0 ? (
            <ul className="space-y-3">
            {sessions.map((session, index) => (
                <li 
                key={session.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`bg-gray-800/50 border rounded-xl p-3 flex items-center gap-4 transition-all duration-300 ${
                    dragOverIndex === index 
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.03] shadow-[0_0_20px_rgba(217,70,239,0.2)] ring-2 ring-fuchsia-500/20' 
                        : 'border-gray-800 hover:border-fuchsia-500/30'
                } ${draggingIndex === index ? 'opacity-20 scale-95 grayscale' : 'opacity-100'}`}
                >
                <div className="p-2 text-gray-600 hover:text-white cursor-grab active:cursor-grabbing"><DragHandleIcon className="w-5 h-5" /></div>
                <div className="relative flex-shrink-0 group">
                    <img src={session.imageUrl} alt="" className="w-12 h-12 rounded object-cover border border-gray-700 drag-none pointer-events-none" />
                    <button onClick={() => { setSessionToUpdateImage(session.id); setIsImagePickerOpen(true); }} className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-[10px] font-bold">Swap</span>
                    </button>
                    <div className="absolute -top-1 -right-1 bg-black/80 px-1 rounded border border-gray-700">
                         <span className="text-[8px] text-fuchsia-400 font-bold uppercase">{session.mediaType}</span>
                    </div>
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-white truncate text-sm">{session.title}</p>
                    <p className="text-xs text-gray-500 truncate">{session.artist}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button onClick={() => setEditingSession(session)} className="p-2 text-gray-500 hover:text-cyan-400" title="Edit"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteSession(session.id)} className="p-2 text-gray-500 hover:text-red-500" title="Remove"><CloseIcon className="w-4 h-4" /></button>
                </div>
                </li>
            ))}
            </ul>
        ) : <p className="text-center text-gray-600 italic py-8 border border-dashed border-gray-800 rounded-xl">Studio Showcase is empty.</p>}
      </div>
      
      {editingSession && <EditSessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={handleSaveEditedSession} />}
      {isImagePickerOpen && <ImagePickerModal isOpen={isImagePickerOpen} onClose={() => setIsImagePickerOpen(false)} onImageSelect={handleImageSelect} addToast={addToast} />}
    </section>
  );
};
