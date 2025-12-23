
export type Role = 'user' | 'model';

export interface Message {
  role: Role;
  content: string;
}

export interface History {
  role: Role;
  parts: { text: string }[];
}

export interface ImageRecord {
  id: number;
  name: string;
  dataUrl: string;
}

export interface DataItem {
    id: number;
    submittedAt: string;
    name?: string; // For bookings
    company?: string; // For inquiries
    email: string;
    packageTitle?: string; // For bookings
    projectType?: string; // For inquiries
    projectDetails?: string; // For bookings
    description?: string; // For inquiries
    status: string;
    [key: string]: any; // Allow other properties
  }

export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  uploadedAt: string;
}

export interface Gallery {
  id: string;
  name: string;
  page: 'av' | 'moes' | 'landing' | 'other';
  description?: string;
  images: GalleryImage[];
  createdAt: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  categories: ('Team' | 'Artist')[];
  imageUrl: string;
  bio: string;
  expertise: string[];
}

export interface FeaturedSession {
  id: number;
  artist: string;
  title: string;
  description: string;
  imageUrl: string;
  mediaUrl: string;
  mediaType: 'audio' | 'video';
}
