
import React, { useState, useEffect, useRef } from 'react';
import type { FeaturedSession } from '../../types';
import { Input, Textarea, Select } from '../FormControls';
import { UploadIcon, CloseIcon, EditIcon, DragHandleIcon, LoadingSpinnerIcon, BoltIcon } from '../icons';
import { Modal } from '../common/Modal';

// --- Utility: File Upload ---
const MAX_SIZE_MB = 100; // Increased for video

const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
};

const MAX_SESSIONS = 5;

// --- Sub-Component: Tab Button ---
const TabButton: React.FC<{ tab: string; children: React.ReactNode }> = ({ tab, children }) => (
    <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white border-b-2 border-transparent hover:border-cyan-500 transition-colors">
        {children}
    </button>
);

// --- Sub-Component: Image Picker Modal ---

const ImagePickerModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onImageSelect: (url: string) => void;
    addToast: (msg: string) => void;
}> = ({ isOpen, onClose, onImageSelect, addToast }) => {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [images, setImages] = useState<{id: string, name: string, dataUrl: string}[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/media')
                .then(res => res.json())
                .then(data => {
                    const imgs = data.filter((f: any) => f.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                                     .map((f: any) => ({ id: f.filename, name: f.filename, dataUrl: f.url }));
                    setImages(imgs);
                })
                .catch(() => setError("Failed to load library"));
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setSelectedImage(null);
        }
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files?.[0]) return;
        setIsUploading(true);
        try {
            const url = await uploadFile(fileInputRef.current.files[0]);
            onImageSelect(url);
        } catch (e) {
            setError("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setIsGenerating(false);
            setError("AI Generation is currently disabled in this demo.");
        }, 1500);
    };

    const handleConfirm = () => {
        if (selectedImage) onImageSelect(selectedImage);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="image-picker-title">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-full border border-cyan-500/30 max-h-[70vh] max-w-2xl flex flex-col">
                <header className="p-3 border-b border-gray-700">
                    <h3 id="image-picker-title" className="text-base font-bold text-cyan-400 text-center uppercase tracking-wider">Select Thumbnail / Art</h3>
                </header>
                <div className="border-b border-gray-700 px-3">
                    <div role="tablist" className="flex items-center justify-center gap-4">
                        <button onClick={() => setActiveTab('library')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'library' ? 'text-white border-cyan-500' : 'text-gray-400 border-transparent hover:text-white'}`}>Library</button>
                        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'upload' ? 'text-white border-cyan-500' : 'text-gray-400 border-transparent hover:text-white'}`}>Upload / AI Gen</button>
                    </div>
                </div>
                <div className="p-3 overflow-y-auto flex-grow custom-scrollbar">
                    {activeTab === 'library' && (
                        <div role="tabpanel">
                            {images.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                    {images.map(image => (
                                        <button key={image.id} onClick={() => setSelectedImage(image.dataUrl)} className={`relative aspect-square rounded overflow-hidden focus:outline-none ring-offset-1 ring-offset-gray-900 focus:ring-2 ${selectedImage === image.dataUrl ? 'ring-2 ring-cyan-400' : 'ring-0'}`}>
                                            <img src={image.dataUrl} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
                                            {selectedImage === image.dataUrl && <div className="absolute inset-0 bg-cyan-500/50" />}
                                        </button>
                                    ))}
                                </div>
                            ) : <p className="text-center text-gray-500 italic py-4 text-xs">Library is empty.</p>}
                        </div>
                    )}
                    {activeTab === 'upload' && (
                         <div role="tabpanel" className="max-w-sm mx-auto space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wide text-center">Upload Custom Image</h4>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-cyan-500/20 file:text-cyan-300" />
                                {preview && (
                                    <div className="flex flex-col items-center gap-2 mt-2 animate-fade-in">
                                        <img src={preview} alt="Preview" className="max-h-24 w-auto rounded border border-gray-600" />
                                        <button onClick={handleUpload} disabled={isUploading} className="w-full px-4 py-1.5 font-bold text-black text-xs bg-cyan-400 rounded-full hover:scale-105 disabled:opacity-50">
                                            {isUploading ? <LoadingSpinnerIcon className="w-3 h-3" /> : 'Upload & Select'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-center text-gray-600 text-xs">OR</div>
                            <div>
                                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wide text-center">AI Generate Thumbnail</h4>
                                <button 
                                    onClick={handleGenerateAI} 
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold text-black text-xs bg-fuchsia-500 rounded-full hover:scale-105 disabled:opacity-50"
                                >
                                    {isGenerating ? <LoadingSpinnerIcon className="w-3 h-3" /> : <BoltIcon className="w-4 h-4" />}
                                    <span>{isGenerating ? 'Synthesizing...' : 'Generate with AI'}</span>
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
                        </div>
                    )}
                </div>
                <footer className="p-3 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-2">
                     <button type="button" onClick={onClose} className="px-4 py-1.5 font-bold text-xs text-gray-300 bg-gray-700/50 rounded-full hover:bg-gray-700">Cancel</button>
                     <button type="button" onClick={handleConfirm} disabled={!selectedImage} className="px-4 py-1.5 font-bold text-xs text-black bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:scale-105 disabled:opacity-50">Confirm</button>
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
            const url = await uploadFile(mediaFile);
            onSave({ ...formData, mediaUrl: url });
        } else {
            onSave(formData);
        }
    } catch (e) {
        alert("Failed to upload media file.");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} ariaLabelledBy="edit-modal-title">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full border border-fuchsia-500/30 p-6 max-w-xl">
        <h3 id="edit-modal-title" className="text-lg font-bold text-fuchsia-400 mb-4 text-center uppercase tracking-widest">Edit Studio Showcase Item</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Artist / Performer" name="artist" value={formData.artist} onChange={handleChange} required />
                <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <Select label="Media Type" name="mediaType" value={formData.mediaType} onChange={handleChange}>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                </Select>
                <Input label="External Link (Optional)" name="mediaUrl" value={formData.mediaUrl.startsWith('/uploads') ? '' : formData.mediaUrl} onChange={handleChange} placeholder="YouTube, Vimeo, or MP4 link" />
            </div>
            <Textarea label="Description / Liner Notes" name="description" value={formData.description} onChange={handleChange} required rows={3} />
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Replace Media File</label>
                <input type="file" onChange={handleFileChange} accept={formData.mediaType === 'audio' ? 'audio/*' : 'video/*'} className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-fuchsia-500/20 file:text-fuchsia-300" />
            </div>
            <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={onClose} className="px-4 py-1.5 font-bold text-xs text-gray-300 bg-gray-700/50 rounded-full hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-1.5 font-bold text-xs text-black bg-fuchsia-500 rounded-full hover:scale-105 min-w-[100px]">
                    {isUploading ? <LoadingSpinnerIcon className="w-3 h-3" /> : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

// --- Main Component ---

interface FeaturedSessionsManagerProps {
  addToast: (message: string) => void;
}

export const FeaturedSessionsManager: React.FC<FeaturedSessionsManagerProps> = ({ addToast }) => {
  const [sessions, setSessions] = useState<FeaturedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
        const res = await fetch('/api/featured-sessions');
        if (res.ok) {
            const data = await res.json();
            setSessions(data);
        }
    } catch (e) {
        console.error("Failed to fetch sessions", e);
    } finally {
        setIsLoading(false);
    }
  };

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
            finalMediaUrl = await uploadFile(mediaFile);
        }

        const sessionData = { ...newSession, mediaUrl: finalMediaUrl };

        const res = await fetch('/api/featured-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        });

        if (res.ok) {
            const createdSession = await res.json();
            setSessions([...sessions, createdSession]);
            addToast(`${newSession.mediaType === 'audio' ? 'Track' : 'Video'} added to studio showcase.`);
            setNewSession({ artist: '', title: '', description: '', imageUrl: '', mediaUrl: '', mediaType: 'audio' });
            setMediaFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            throw new Error('Failed to create session');
        }
    } catch (err) {
        addToast('Failed to add studio showcase item.');
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (window.confirm('Remove from studio showcase?')) {
      try {
          const res = await fetch(`/api/featured-sessions/${id}`, { method: 'DELETE' });
          if (res.ok) {
              setSessions(sessions.filter(s => s.id !== id));
              addToast(`Item removed.`);
              headingRef.current?.focus();
          }
      } catch (e) {
          addToast("Failed to remove item.");
      }
    }
  };

  const handleSaveEditedSession = async (updatedSession: FeaturedSession) => {
    try {
        const res = await fetch(`/api/featured-sessions/${updatedSession.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSession)
        });
        if (res.ok) {
            setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
            addToast(`Item updated.`);
            setEditingSession(null);
        }
    } catch (e) {
        addToast("Failed to update item.");
    }
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

  const handleDragEnd = async () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        const newSessions = [...sessions];
        const draggedItemContent = newSessions.splice(dragItem.current, 1)[0];
        newSessions.splice(dragOverItem.current, 0, draggedItemContent);
        setSessions(newSessions);
        
        // Save order
        try {
            await fetch('/api/featured-sessions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSessions)
            });
            addToast('Studio showcase order updated.');
        } catch (e) {
            addToast("Failed to save order.");
        }
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
    setDraggingIndex(null);
  };
  
  const handleImageSelect = async (dataUrl: string) => {
    if (sessionToUpdateImage === 'new') {
        setNewSession(prev => ({ ...prev, imageUrl: dataUrl }));
    } else if (sessionToUpdateImage) {
        const session = sessions.find(s => s.id === sessionToUpdateImage);
        if (session) {
            const updatedSession = { ...session, imageUrl: dataUrl };
            await handleSaveEditedSession(updatedSession);
            addToast("Artwork updated.");
        }
    }
    setIsImagePickerOpen(false);
  };

  const isAddSessionDisabled = sessions.length >= MAX_SESSIONS;

  if (isLoading) return <div className="py-12 flex justify-center"><LoadingSpinnerIcon /></div>;

  return (
    <section>
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold uppercase tracking-widest text-white outline-none">Studio Showcase Curator ({sessions.length}/{MAX_SESSIONS})</h2>
        <p className="text-gray-400 mt-0.5 text-[10px]">Manage the featured tracks and videos on the main page.</p>
      </div>
      
      <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6 ${isAddSessionDisabled ? 'opacity-50' : ''}`}>
        <h3 className="text-xs font-bold text-fuchsia-400 mb-3 uppercase tracking-widest text-center">Add New Item</h3>
        <fieldset disabled={isAddSessionDisabled || isUploading}>
          <form onSubmit={handleAddNewSession} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Artist / Project Name" name="artist" value={newSession.artist} onChange={handleNewSessionChange} required />
                  <Input label="Title" name="title" value={newSession.title} onChange={handleNewSessionChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select label="Media Type" name="mediaType" value={newSession.mediaType} onChange={handleNewSessionChange}>
                      <option value="audio">Audio Track</option>
                      <option value="video">Video Project</option>
                  </Select>
                  <Input label="External Link (Optional)" name="mediaUrl" value={newSession.mediaUrl} onChange={handleNewSessionChange} placeholder="Paste YouTube, Vimeo, or MP4/WAV link" />
              </div>
              <Textarea label="Liner Notes / Description" name="description" value={newSession.description} onChange={handleNewSessionChange} required rows={2} />
              
              <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-300 mb-1">Thumbnail / Art</label>
                    <div className="w-20 h-20 bg-gray-900 rounded-md flex items-center justify-center border border-gray-700 overflow-hidden group relative">
                        {newSession.imageUrl ? <img src={newSession.imageUrl} alt="" className="w-full h-full object-cover" /> : <UploadIcon className="w-6 h-6 text-gray-700" />}
                        <button type="button" onClick={() => { setSessionToUpdateImage('new'); setIsImagePickerOpen(true); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">Change</span>
                        </button>
                    </div>
                  </div>
                  
                  <div className="flex-grow space-y-2 w-full">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-400">Direct File Upload (Max {MAX_SIZE_MB}MB)</label>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            onChange={handleFileChange} 
                            accept={newSession.mediaType === 'audio' ? 'audio/*' : 'video/*'} 
                            className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-fuchsia-500/20 file:text-fuchsia-300" 
                        />
                        <p className="text-[9px] text-gray-500 italic">Recommended: Use external links for large videos to preserve bandwidth.</p>
                      </div>
                      <div className="text-right pt-1">
                          <button type="submit" disabled={isUploading} className="px-6 py-2 font-bold text-black text-xs bg-fuchsia-500 rounded-full hover:scale-105 shadow-[0_0_10px_#ff00ff] min-w-[140px]">
                              {isUploading ? <LoadingSpinnerIcon className="w-3 h-3" /> : 'Add to Studio Showcase'}
                          </button>
                      </div>
                  </div>
              </div>
          </form>
        </fieldset>
      </div>

      <div className="space-y-2">
        <div className="px-2 py-1 text-[9px] text-gray-500 font-mono uppercase tracking-[0.2em] flex justify-between">
            <span>Drag to Reorder</span>
            <span>Showcase Sequence</span>
        </div>
        {sessions.length > 0 ? (
            <ul className="space-y-2">
            {sessions.map((session, index) => (
                <li 
                key={session.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`group bg-gray-800/50 border rounded-lg p-2 flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${
                    dragOverIndex === index && draggingIndex !== index
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 -translate-y-1 shadow-[0_10px_30px_rgba(217,70,239,0.3)] z-10' 
                        : 'border-gray-800'
                } ${draggingIndex === index ? 'opacity-10 scale-95 grayscale' : 'opacity-100'}`}
                >
                {/* Active Drop Target Highlight */}
                {dragOverIndex === index && draggingIndex !== index && (
                    <div className="absolute inset-0 border-2 border-fuchsia-400/50 rounded-lg animate-pulse pointer-events-none" />
                )}
                
                <div className="p-1 text-gray-600 hover:text-white cursor-grab active:cursor-grabbing transition-colors"><DragHandleIcon className="w-4 h-4" /></div>
                <div className="relative flex-shrink-0 group/img">
                    <img src={session.imageUrl} alt="" className="w-10 h-10 rounded object-cover border border-gray-700 drag-none pointer-events-none" />
                    <button onClick={() => { setSessionToUpdateImage(session.id); setIsImagePickerOpen(true); }} className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded">
                        <span className="text-white text-[8px] font-bold">Swap</span>
                    </button>
                    <div className="absolute -top-1 -right-1 bg-black/80 px-1 rounded border border-gray-700">
                         <span className="text-[7px] text-fuchsia-400 font-bold uppercase">{session.mediaType}</span>
                    </div>
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-white truncate text-xs transition-colors group-hover:text-fuchsia-300">{session.title}</p>
                    <p className="text-[10px] text-gray-500 truncate">{session.artist}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button onClick={() => setEditingSession(session)} className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors" title="Edit"><EditIcon className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteSession(session.id)} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors" title="Remove"><CloseIcon className="w-3 h-3" /></button>
                </div>
                </li>
            ))}
            </ul>
        ) : <p className="text-center text-gray-600 italic py-6 border border-dashed border-gray-800 rounded-lg text-xs">Studio Showcase is empty.</p>}
      </div>
      
      {editingSession && <EditSessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={handleSaveEditedSession} />}
      {isImagePickerOpen && <ImagePickerModal isOpen={isImagePickerOpen} onClose={() => setIsImagePickerOpen(false)} onImageSelect={handleImageSelect} addToast={addToast} />}
    </section>
  );
};
