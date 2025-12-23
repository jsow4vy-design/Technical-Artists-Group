import React, { useState, useEffect, useRef } from 'react';
import { getTeamMembers, saveTeamMembers } from '../../services/teamService';
import type { TeamMember } from '../../types';
import { Input, Textarea } from '../FormControls';
import { UploadIcon, CloseIcon, EditIcon, DragHandleIcon, LoadingSpinnerIcon } from '../icons';
import { Modal } from '../common/Modal';

interface TeamManagerProps {
    addToast: (message: string) => void;
}

const MAX_SIZE_MB = 5;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const MemberFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    member?: TeamMember; // If provided, we are editing
    onSave: (member: Omit<TeamMember, 'id'> | TeamMember) => Promise<void>;
}> = ({ isOpen, onClose, member, onSave }) => {
    const [formData, setFormData] = useState<Omit<TeamMember, 'id'>>({
        name: '',
        role: '',
        categories: ['Team'],
        imageUrl: '',
        bio: '',
        expertise: []
    });
    const [expertiseInput, setExpertiseInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (member) {
            setFormData(member);
            setExpertiseInput(member.expertise.join(', '));
        } else {
            setFormData({ name: '', role: '', categories: ['Team'], imageUrl: '', bio: '', expertise: [] });
            setExpertiseInput('');
        }
    }, [member, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCategoryChange = (cat: 'Team' | 'Artist') => {
        setFormData(prev => {
            const categories = [...prev.categories];
            if (categories.includes(cat)) {
                if (categories.length > 1) { // Ensure at least one category
                    return { ...prev, categories: categories.filter(c => c !== cat) };
                }
                return prev;
            } else {
                return { ...prev, categories: [...categories, cat] };
            }
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`File too large. Max ${MAX_SIZE_MB}MB.`);
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, imageUrl: base64 }));
        } catch (e) {
            alert("Failed to read file.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const expertiseArray = expertiseInput.split(',').map(s => s.trim()).filter(Boolean);
        await onSave({ ...formData, expertise: expertiseArray, id: member?.id || 0 }); 
        setIsSaving(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="member-modal-title">
            <div className="bg-gray-900 rounded-lg p-8 border border-cyan-500/30 w-full max-w-2xl">
                <h3 id="member-modal-title" className="text-2xl font-bold text-cyan-400 mb-6">{member ? 'Edit Member' : 'Add New Member'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-6 flex-col sm:flex-row">
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                            <div 
                                className="w-32 h-32 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan-500 transition-colors relative group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UploadIcon className="w-8 h-8 text-gray-500" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-xs font-bold text-white">Change</span>
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                        <div className="flex-grow space-y-4">
                            <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                            <Input label="Role / Title" name="role" value={formData.role} onChange={handleChange} required placeholder="e.g. Lead Engineer" />
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Member Categories</label>
                                <div className="flex gap-4">
                                    {['Team', 'Artist'].map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.categories.includes(cat as any)} 
                                                onChange={() => handleCategoryChange(cat as any)}
                                                className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-cyan-500 focus:ring-cyan-500"
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Textarea label="Bio" name="bio" value={formData.bio} onChange={handleChange} required rows={4} />
                    <Input label="Expertise / Genres (Comma separated)" name="expertiseInput" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} placeholder="Mixing, Hip-Hop, Sound Design" />

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-gray-300 hover:bg-gray-800">Cancel</button>
                        <button type="submit" disabled={isSaving || !formData.imageUrl} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-full hover:scale-105 disabled:opacity-50">
                            {isSaving ? <LoadingSpinnerIcon /> : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export const TeamManager: React.FC<TeamManagerProps> = ({ addToast }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | undefined>(undefined);
    const [filter, setFilter] = useState<'All' | 'Team' | 'Artist'>('All');

    // Drag and drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getTeamMembers();
        setMembers(data);
        setIsLoading(false);
    };

    const handleSave = async (memberData: Omit<TeamMember, 'id'> | TeamMember) => {
        if ('id' in memberData && memberData.id !== 0) {
            // Edit
            const updatedList = members.map(m => m.id === memberData.id ? memberData as TeamMember : m);
            setMembers(updatedList);
            await saveTeamMembers(updatedList);
            addToast("Member updated.");
        } else {
            // Add
            const newId = Date.now();
            const newMember = { ...memberData, id: newId } as TeamMember;
            const updatedList = [...members, newMember];
            setMembers(updatedList);
            await saveTeamMembers(updatedList);
            addToast("Member added.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Remove this member?")) {
            const updatedList = members.filter(m => m.id !== id);
            setMembers(updatedList);
            await saveTeamMembers(updatedList);
            addToast("Member removed.");
        }
    };

    // --- Drag and Drop Logic ---

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (filter !== 'All') return; // Disable drag if filtered
        dragItem.current = index;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (filter !== 'All') return;
        e.preventDefault();
        dragOverItem.current = index;
        setDragOverIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (filter !== 'All') return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnd = async () => {
        if (filter !== 'All') return;
        const startIndex = dragItem.current;
        const endIndex = dragOverItem.current;

        if (startIndex !== null && endIndex !== null && startIndex !== endIndex) {
            const copy = [...members];
            const draggedItemContent = copy.splice(startIndex, 1)[0];
            copy.splice(endIndex, 0, draggedItemContent);
            
            setMembers(copy);
            await saveTeamMembers(copy);
            addToast("Order updated.");
        }

        // Reset refs and state
        dragItem.current = null;
        dragOverItem.current = null;
        setDragOverIndex(null);
        setDraggingIndex(null);
    };

    const filteredMembers = members.filter(m => filter === 'All' || m.categories.includes(filter as any));

    if (isLoading) return <div className="py-12 flex justify-center"><LoadingSpinnerIcon /></div>;

    return (
        <section>
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-white">Team & Artists</h2>
                    <p className="text-gray-400 mt-1">Manage bios, photos, and roster for the Team page.</p>
                </div>
                <div className="flex gap-4">
                     <div className="flex bg-gray-800 rounded-full p-1 border border-gray-700">
                        {(['All', 'Team', 'Artist'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                                    filter === f 
                                    ? 'bg-fuchsia-600 text-white' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => { setEditingMember(undefined); setIsModalOpen(true); }}
                        className="px-6 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-black font-bold rounded-full hover:scale-105 whitespace-nowrap"
                    >
                        + Add Member
                    </button>
                </div>
            </div>

            {filter !== 'All' && (
                <div className="mb-4 text-center">
                    <p className="text-xs text-yellow-500 bg-yellow-900/20 border border-yellow-500/20 inline-block px-3 py-1 rounded">
                        Note: Drag-and-drop reordering is disabled while list is filtered. Switch to 'All' to reorder.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {filteredMembers.map((member, index) => (
                    <div 
                        key={member.id}
                        draggable={filter === 'All'}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        className={`bg-gray-800/50 border rounded-lg p-4 flex gap-4 transition-all duration-300 group relative
                            ${dragOverIndex === index ? 'border-fuchsia-400 bg-gray-800 scale-[1.01]' : 'border-gray-700 hover:border-cyan-500/50'}
                            ${draggingIndex === index ? 'opacity-40' : 'opacity-100'}
                            ${filter !== 'All' ? 'cursor-default' : 'cursor-move'}
                        `}
                    >
                        {filter === 'All' && (
                            <div className="text-gray-500 hover:text-white self-center p-2 cursor-grab active:cursor-grabbing">
                                <DragHandleIcon className="w-5 h-5" />
                            </div>
                        )}
                        <img src={member.imageUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-600 flex-shrink-0" loading="lazy" />
                        <div className="flex-grow min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-white truncate">{member.name}</h4>
                            <div className="flex items-center gap-2 text-xs mb-1">
                                <div className="flex gap-1">
                                    {member.categories.map(cat => (
                                        <span key={cat} className={`px-2 py-0.5 rounded-full ${cat === 'Team' ? 'bg-cyan-900 text-cyan-200' : 'bg-fuchsia-900 text-fuchsia-200'}`}>{cat}</span>
                                    ))}
                                </div>
                                <span className="text-gray-400 truncate">• {member.role}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{member.expertise.slice(0, 3).join(', ')}</p>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-center ml-auto">
                            <button onClick={() => { setEditingMember(member); setIsModalOpen(true); }} className="text-gray-400 hover:text-cyan-400 p-2" title="Edit"><EditIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleDelete(member.id)} className="text-gray-400 hover:text-red-400 p-2" title="Delete"><CloseIcon /></button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                    <p className="text-gray-500">No members found in this category.</p>
                </div>
            )}

            <MemberFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                member={editingMember} 
                onSave={handleSave} 
            />
        </section>
    );
};