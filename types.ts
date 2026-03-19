
export type Role = 'user' | 'model';

export interface Message {
  role: Role;
  content: string;
  visualAid?: VisualAidData;
  generatedImageUrl?: string;
}

export interface VisualAidData {
  type: 'frequency_response' | 'eq_curve' | 'compression';
  title: string;
  points: { f: number; g: number }[]; // f: frequency (20-20000), g: gain (-18 to +18 or 0 to 1)
  labels?: { f: number; label: string }[];
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

export interface PortfolioProject {
  id: number;
  title: string;
  client: string;
  service: string;
  category: string;
  imageUrl: string;
  description: string;
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

export interface GallerySession {
  id: number;
  artist: string;
  type: 'image' | 'video';
  description: string;
  images: string[];
  rotation: number;
  widthClass: string;
  zIndex: string;
}
