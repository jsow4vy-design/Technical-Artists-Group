
import { GallerySession } from '../types';

const API_URL = '/api/gallery';

export const getGalleries = async (): Promise<GallerySession[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch galleries');
        return await response.json();
    } catch (error) {
        console.error("Error fetching galleries:", error);
        return [];
    }
};

export const createGallery = async (session: Omit<GallerySession, 'id'>): Promise<GallerySession> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
    });
    if (!response.ok) throw new Error('Failed to create gallery session');
    return await response.json();
};

export const updateGallery = async (id: number, session: Partial<GallerySession>): Promise<GallerySession> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
    });
    if (!response.ok) throw new Error('Failed to update gallery session');
    return await response.json();
};

export const deleteGallery = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete gallery session');
};

export const uploadImageToGallery = async (galleryId: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!uploadResponse.ok) throw new Error('Failed to upload image');
    
    const { url } = await uploadResponse.json();
    
    // Fetch current gallery to append image
    const galleries = await getGalleries();
    const gallery = galleries.find(g => g.id === galleryId);
    
    if (!gallery) throw new Error('Gallery not found');
    
    const updatedImages = [...gallery.images, url];
    await updateGallery(galleryId, { images: updatedImages });
    
    return url;
};

export const deleteImageFromGallery = async (galleryId: number, imageUrl: string): Promise<void> => {
    const galleries = await getGalleries();
    const gallery = galleries.find(g => g.id === galleryId);
    
    if (!gallery) throw new Error('Gallery not found');
    
    const updatedImages = gallery.images.filter(img => img !== imageUrl);
    await updateGallery(galleryId, { images: updatedImages });
};
