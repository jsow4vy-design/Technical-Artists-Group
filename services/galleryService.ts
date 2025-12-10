
import { Gallery, GalleryImage } from '../types';

const STORAGE_KEY = 'tag_galleries';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_GALLERIES: Gallery[] = [
    {
        id: 'gallery_weekly_showcase',
        name: 'WEEKLY SHOWCASE',
        page: 'moes',
        description: 'Highlights from our weekly DJ live streams and showcase events.',
        images: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 'gallery_under_la',
        name: 'UNDER LA',
        page: 'moes',
        description: 'Capturing the energy of our Monday Night Fundraiser community events.',
        images: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 'gallery_studio_sessions',
        name: 'STUDIO SESSIONS',
        page: 'moes',
        description: 'Raw, unfiltered moments from recording and production blocks.',
        images: [],
        createdAt: new Date().toISOString()
    }
];

export const getGalleries = async (): Promise<Gallery[]> => {
    await delay(300); // Simulate network latency
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        let galleries: Gallery[] = data ? JSON.parse(data) : [];
        
        // Ensure default galleries exist by merging them if missing
        let hasChanges = false;
        DEFAULT_GALLERIES.forEach(defaultGallery => {
            if (!galleries.find(g => g.id === defaultGallery.id)) {
                galleries.push(defaultGallery);
                hasChanges = true;
            }
        });

        // If storage was empty or defaults were added, save back to localStorage
        if (hasChanges || !data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
        }
        
        return galleries;
    } catch (e) {
        console.error("Failed to load galleries", e);
        // Fallback to defaults on error
        return DEFAULT_GALLERIES;
    }
};

export const createGallery = async (name: string, page: Gallery['page'], description?: string): Promise<Gallery> => {
    await delay(300);
    const galleries = await getGalleries();
    const newGallery: Gallery = {
        id: Date.now().toString(),
        name,
        page,
        description,
        images: [],
        createdAt: new Date().toISOString()
    };
    galleries.push(newGallery);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
    return newGallery;
};

export const deleteGallery = async (id: string): Promise<void> => {
    await delay(300);
    let galleries = await getGalleries();
    galleries = galleries.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
};

export const uploadImageToGallery = async (galleryId: string, file: File): Promise<GalleryImage> => {
    // Basic base64 conversion - in a real backend this would upload to S3/Cloudinary/GCS
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const url = await toBase64(file);
    const newImage: GalleryImage = {
        id: Date.now().toString(),
        url,
        title: file.name,
        uploadedAt: new Date().toISOString()
    };

    // Simulate upload delay
    await delay(500);

    const galleries = await getGalleries();
    const galleryIndex = galleries.findIndex(g => g.id === galleryId);
    
    if (galleryIndex === -1) throw new Error("Gallery not found");

    galleries[galleryIndex].images.push(newImage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
    
    return newImage;
};

export const deleteImageFromGallery = async (galleryId: string, imageId: string): Promise<void> => {
    await delay(300);
    const galleries = await getGalleries();
    const galleryIndex = galleries.findIndex(g => g.id === galleryId);
    
    if (galleryIndex === -1) throw new Error("Gallery not found");

    galleries[galleryIndex].images = galleries[galleryIndex].images.filter(img => img.id !== imageId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
};
