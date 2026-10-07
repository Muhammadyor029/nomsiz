export type FileCategory = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'archive' 
  | 'code' 
  | 'other';

export interface VaultFile {
  id: string;
  customId?: string; // Optional user-assigned custom identifier (e.g., 'project-2026')
  name: string;
  originalName: string;
  size: number; // in bytes
  mimeType: string;
  category: FileCategory;
  extension: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt?: string | null; // ISO string if in trash
  isFavorite: boolean;
  isTrash: boolean;
  tags: string[];
  url: string; // Blob URL or base64 or source
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // in seconds (for audio/video)
    lines?: number; // for code/text
    checksum?: string;
  };
  textContent?: string; // for text and code previews
}

export interface User {
  id: string;
  username: string;
  phoneNumber?: string;
  createdAt: string;
  storageLimit: number; // e.g. 53687091200 (50GB)
  usedStorage: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type SortOption = 
  | 'date_desc' 
  | 'date_asc' 
  | 'name_asc' 
  | 'name_desc' 
  | 'size_desc' 
  | 'size_asc';

export interface FilterOptions {
  category: string; // 'all' | 'favorites' | 'trash' | FileCategory
  searchQuery: string;
  customIdQuery?: string;
  extension?: string;
  sortBy: SortOption;
  sizeFilter?: 'all' | 'under10mb' | '10mb_to_100mb' | 'over100mb';
}

export interface StorageBreakdown {
  totalLimit: number;
  totalUsed: number;
  byCategory: Record<FileCategory, number>;
  fileCount: number;
}
