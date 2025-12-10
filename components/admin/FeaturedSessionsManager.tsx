
import React, { useState, useRef, useEffect } from 'react';
import { featuredSessions as defaultFeaturedSessions } from '../../data/studioData';
import { Input, Textarea } from '../FormControls';
import { Modal } from '../common/Modal';
import { CloseIcon, EditIcon, DragHandleIcon, UploadIcon, BoltIcon, LoadingSpinnerIcon } from '../icons';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateStudioImage } from '../../services/geminiService';
import type { ImageRecord } from '../../types';

type FeaturedSession = typeof defaultFeaturedSessions[0];

const MAX_SESSIONS = 4;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Utility to convert file to Base64 string for localStorage persistence.
 */
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

    // Effect: Create preview URL when file is selected
    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    // Validation handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: File Type
        if (!file.type.startsWith('image/')) {
            setError('Invalid file type. Please select an image file.');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validation: File Size
        if (file.size > MAX_SIZE_BYTES) {
            setError(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
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
            setSelectedImage(dataUrl); // Auto-select the newly uploaded image
            setActiveTab('library'); // Switch back to library view
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
            const generatedDataUrl = await generateStudioImage('modern recording music studio, cinematic lighting');
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
                    <h3 id="image-picker-title" className="text-xl font-bold text-cyan-400">Select an Image</h3>
                </header>
                <div className="border-b border-gray-700 px-4">
                    <div role="tablist" className="flex items-center">
                        <TabButton tab="library">Library</TabButton>
                        <TabButton tab="upload">Upload / Generate</TabButton>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-grow">
                    {activeTab === 'library' && (
                        <div role="tabpanel">
                            {images.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {images.map(image => (
                                        <button key={image.id} onClick={() => setSelectedImage(image.dataUrl)} className={`relative aspect-square rounded-lg overflow-hidden focus:outline-none ring-offset-2 ring-offset-gray-900 focus:ring-2 ${selectedImage === image.dataUrl ? 'ring-2 ring-cyan-400' : 'ring-0'}`}>
                                            <img src={image.dataUrl} alt={image.name} className="w-full h-full object-cover" />
                                            {selectedImage === image.dataUrl && <div className="absolute inset-0 bg-cyan-500/50" />}
                                        </button>
                                    ))}
                                </div>
                            ) : <p className="text-center text-gray-500 italic py-4">No images in library. Upload one!</p>}
                        </div>
                    )}
                    {activeTab === 'upload' && (
                         <div role="tabpanel" className="max-w-md mx-auto space-y-8">
                            <div>
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Option 1: Upload File</h4>
                                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Select an image file (Max {MAX_SIZE_MB}MB)</label>
                                <input ref={fileInputRef} id="image-upload" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30" />
                                {preview && (
                                    <div className="flex flex-col items-center gap-4 mt-4 animate-fade-in">
                                        <img src={preview} alt="Image preview" className="max-h-32 w-auto rounded-md border border-gray-600" />
                                        <button onClick={handleUpload} className="w-full flex items-center justify-center gap-2 px-6 py-2 font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full hover:scale-105">
                                            <UploadIcon className="w-5 h-5" />
                                            <span>Upload and Select</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-gray-900 text-sm text-gray-400">OR</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Option 2: Generate with AI</h4>
                                <p className="text-xs text-gray-400 mb-3">Generates a placeholder using "modern recording music studio"</p>
                                <button 
                                    onClick={handleGenerateAI} 
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isGenerating ? <LoadingSpinnerIcon /> : <BoltIcon className="w-5 h-5" />}
                                    <span>{isGenerating ? 'Generating...' : 'Generate Placeholder'}</span>
                                </button>
                            </div>

                            {error && <p role="alert" className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-4">
                     <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-300 bg-gray-700/50 rounded-full hover:bg-gray-700">Cancel</button>
                     <button type="button" onClick={handleConfirm} disabled={!selectedImage} className="px-6 py-2 font-bold text-black bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">Confirm Selection</button>
                </footer>
            </div>
        </Modal>
    );
};

// --- Sub-Component: Edit Modal ---

const EditSessionModal: React.FC<{ session: FeaturedSession; onClose: () => void; onSave: (updatedSession: FeaturedSession) => void; }> = ({ session, onClose, onSave }) => {
  const [formData, setFormData] = useState(session);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setAudioFile(e.target.files[0]); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioFile) {
      const reader = new FileReader();
      reader.onload = () => onSave({ ...formData, audioUrl: reader.result as string });
      reader.readAsDataURL(audioFile);
    } else {
      onSave(formData);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} ariaLabelledBy="edit-modal-title" closeButtonAriaLabel="Close edit session modal">
      <div className="relative bg-gray-900 rounded-lg shadow-2xl w-full border border-fuchsia-500/30 p-8">
        <h3 id="edit-modal-title" className="text-2xl font-bold text-fuchsia-400 mb-6">Edit Session Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Artist" name="artist" value={formData.artist} onChange={handleChange} required />
                <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} required />
            <div>
                <label htmlFor="editAudioFile" className="block text-sm font-medium text-gray-300 mb-1">Replace Audio File</label>
                <input id="editAudioFile" type="file" name="audioFile" onChange={handleFileChange} accept="audio/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500/20 file:text-fuchsia-300 hover:file:bg-fuchsia-500/30" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-300 bg-gray-700/50 rounded-full hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-6 py-2 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full hover:scale-105">Save</button>
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
  const [newSession, setNewSession] = useState({ artist: '', title: '', description: '', imageUrl: '' });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [editingSession, setEditingSession] = useState<FeaturedSession | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [sessionToUpdateImage, setSessionToUpdateImage] = useState<FeaturedSession['id'] | 'new' | null>(null);

  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleNewSessionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewSession(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setAudioFile(e.target.files[0]); };

  const handleAddNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) { alert('Please select an audio file.'); return; }
    if (!newSession.imageUrl) { alert('Please select a session image.'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const newSessionData: FeaturedSession = {
        ...newSession,
        id: Date.now(),
        audioUrl: reader.result as string,
      };
      setSessions([...sessions, newSessionData]);
      addToast('New session added.');
      setNewSession({ artist: '', title: '', description: '', imageUrl: '' });
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(audioFile);
  };

  const handleDeleteSession = (id: number) => {
    if (window.confirm('Delete this session?')) {
      const deletedSession = sessions.find(s => s.id === id);
      setSessions(sessions.filter(s => s.id !== id));
      addToast(`Session "${deletedSession?.title}" deleted.`);
      headingRef.current?.focus();
    }
  };

  const handleSaveEditedSession = (updatedSession: FeaturedSession) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    addToast(`Session "${updatedSession.title}" updated.`);
    setEditingSession(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        const newSessions = [...sessions];
        // Remove item from old pos
        const draggedItemContent = newSessions.splice(dragItem.current, 1)[0];
        // Insert into new pos
        newSessions.splice(dragOverItem.current, 0, draggedItemContent);
        setSessions(newSessions);
        addToast('Session order updated.');
    }
    // Reset state
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
  };
  
  const handleImageSelect = (dataUrl: string) => {
    if (sessionToUpdateImage === 'new') {
        setNewSession(prev => ({ ...prev, imageUrl: dataUrl }));
    } else if (sessionToUpdateImage) {
        setSessions(sessions.map(s => s.id === sessionToUpdateImage ? { ...s, imageUrl: dataUrl } : s));
        addToast("Session image updated.");
    }
    setIsImagePickerOpen(false);
  };

  const isAddSessionDisabled = sessions.length >= MAX_SESSIONS;

  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold uppercase tracking-widest text-white mb-6 outline-none">Manage Featured Audio ({sessions.length}/{MAX_SESSIONS})</h2>
      
      {/* Add New Session Form */}
      <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 transition-opacity ${isAddSessionDisabled ? 'opacity-50' : ''}`}>
        <h3 className="text-xl font-bold text-fuchsia-400 mb-4">Add New Session</h3>
        {isAddSessionDisabled && <p role="alert" className="mb-4 p-3 text-sm text-yellow-200 bg-yellow-800/40 border-yellow-600/50 rounded-md">Maximum of {MAX_SESSIONS} sessions reached.</p>}
        <fieldset disabled={isAddSessionDisabled}>
          <form onSubmit={handleAddNewSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Artist" name="artist" value={newSession.artist} onChange={handleNewSessionChange} required /><Input label="Title" name="title" value={newSession.title} onChange={handleNewSessionChange} required /></div>
              <Textarea label="Description" name="description" value={newSession.description} onChange={handleNewSessionChange} required />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Session Image</label>
                    <div className="w-24 h-24 bg-gray-700/50 rounded-md flex items-center justify-center">
                        {newSession.imageUrl ? <img src={newSession.imageUrl} alt="New session preview" className="w-full h-full object-cover rounded-md"/> : <span className="text-xs text-gray-400 text-center p-1">No Image Selected</span>}
                    </div>
                </div>
                <div className="flex-grow pt-7">
                    <button type="button" onClick={() => { setSessionToUpdateImage('new'); setIsImagePickerOpen(true); }} className="px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-500/20 rounded-full hover:bg-cyan-500/30">
                        {newSession.imageUrl ? 'Change Image' : 'Select Image'}
                    </button>
                </div>
              </div>
              <input ref={fileInputRef} id="audioFile" type="file" name="audioFile" onChange={handleFileChange} accept="audio/*" required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-fuchsia-500/20 file:text-fuchsia-300" />
              <div className="text-right"><button type="submit" className="px-6 py-2 font-bold text-black bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">Add</button></div>
          </form>
        </fieldset>
      </div>

      {/* List of Sessions */}
      {sessions.length > 0 ? (
        <ul className="space-y-2">
          {sessions.map((session, index) => (
            <li 
              key={session.id} 
              draggable 
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`bg-gray-800/50 border rounded-lg p-2 flex items-center gap-4 transition-all duration-300 ${
                dragOverIndex === index ? 'border-fuchsia-400 bg-gray-800' : 'border-fuchsia-500/20'
              }`}
            >
              <button className="p-2 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing"><DragHandleIcon className="w-6 h-6" /></button>
              <div className="relative flex-shrink-0 group">
                  <img src={session.imageUrl} alt="" className="w-14 h-14 rounded-md object-cover" />
                  <button onClick={() => { setSessionToUpdateImage(session.id); setIsImagePickerOpen(true); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <span className="text-white text-xs font-bold">Change</span>
                  </button>
              </div>
              <div className="flex-grow min-w-0"><p className="font-bold truncate">{session.artist} - <span className="text-fuchsia-300">{session.title}</span></p><p className="text-sm text-gray-400 truncate">{session.description}</p></div>
              <div className="flex-shrink-0 flex items-center gap-2"><button onClick={() => setEditingSession(session)} className="p-2 text-gray-400 hover:text-cyan-400"><EditIcon className="w-5 h-5" /></button><button onClick={() => handleDeleteSession(session.id)} className="p-2 text-gray-400 hover:text-red-500"><CloseIcon /></button></div>
            </li>
          ))}
        </ul>
      ) : <p className="text-center text-gray-500 italic py-4">No featured sessions.</p>}
      
      {/* Modals */}
      {editingSession && <EditSessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={handleSaveEditedSession} />}
      {isImagePickerOpen && <ImagePickerModal isOpen={isImagePickerOpen} onClose={() => setIsImagePickerOpen(false)} onImageSelect={handleImageSelect} addToast={addToast} />}
    </section>
  );
};
