/**
 * Sovereign Digital Vault API Client
 * Clean architectural abstraction layer isolating UI components from network transport.
 * Supports swappable remote endpoints or persistent client-side storage engine.
 */

import { AuthResponse, FileCategory, FilterOptions, StorageBreakdown, User, VaultFile } from '../types';
import { formatBytes, generateId, getFileCategory } from '../utils/fileHelpers';
import { INITIAL_SAMPLE_FILES } from './seedData';

// Storage keys
const STORAGE_KEYS = {
  USER: 'velum_vault_active_user',
  TOKEN: 'velum_vault_auth_token',
  ACCOUNTS: 'velum_vault_accounts',
  FILES: 'velum_vault_files_db',
  CUSTOM_ID_INDEX: 'velum_vault_custom_ids',
};

// Default storage allocation: 50 GB
const DEFAULT_STORAGE_LIMIT = 53687091200;

class VaultApiService {
  private activeToken: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.hydrateSession();
  }

  private hydrateSession() {
    try {
      this.activeToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch {
      this.activeToken = null;
      this.currentUser = null;
    }
  }

  private getStoredAccounts(): Record<string, { passwordHash: string; user: User }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveStoredAccounts(accounts: Record<string, { passwordHash: string; user: User }>) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  private getStoredFiles(): VaultFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FILES);
      if (!data) {
        // Seed with high quality initial vault files
        localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(INITIAL_SAMPLE_FILES));
        return INITIAL_SAMPLE_FILES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAMPLE_FILES;
    }
  }

  private saveStoredFiles(files: VaultFile[]) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    this.updateUserStorageUsage(files);
  }

  private updateUserStorageUsage(files: VaultFile[]) {
    if (!this.currentUser) return;
    const nonTrashFiles = files.filter(f => !f.isTrash);
    const totalBytes = nonTrashFiles.reduce((acc, f) => acc + f.size, 0);
    this.currentUser.usedStorage = totalBytes;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
  }

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  /**
   * POST /auth/register
   * Creates a new user account with username, password, and optional phone number.
   * Immediately authenticates upon success without email verification.
   */
  async register(payload: {
    username: string;
    password: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> {
    await this.simulatedNetworkLatency(220);

    const cleanUsername = payload.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }
    if (!payload.password || payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const accounts = this.getStoredAccounts();
    if (accounts[cleanUsername]) {
      throw new Error('Username is already registered in this vault node.');
    }

    const newUser: User = {
      id: generateId('usr'),
      username: payload.username.trim(),
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      createdAt: new Date().toISOString(),
      storageLimit: DEFAULT_STORAGE_LIMIT,
      usedStorage: 0,
    };

    // Store account
    accounts[cleanUsername] = {
      passwordHash: btoa(payload.password), // simple client-side representation
      user: newUser,
    };
    this.saveStoredAccounts(accounts);

    // Auto-login session
    const token = `vault_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    this.activeToken = token;
    this.currentUser = newUser;

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

    return { user: newUser, token };
  }

  /**
   * POST /auth/login
   * Authenticates existing user with username and password.
   */
  async login(payload: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    await this.simulatedNetworkLatency(200);

    const cleanUsername = payload.username.trim().toLowerCase();
    const accounts = this.getStoredAccounts();
    const account = accounts[cleanUsername];

    // If demo login is attempted with standard demo credentials or empty store, allow quick demo setup
    if (!account && (cleanUsername === 'demo' || cleanUsername === 'sovereign')) {
      const demoUser: User = {
        id: 'usr_demo_vault_master',
        username: payload.username.trim(),
        createdAt: new Date().toISOString(),
        storageLimit: DEFAULT_STORAGE_LIMIT,
        usedStorage: INITIAL_SAMPLE_FILES.reduce((a, b) => a + (b.isTrash ? 0 : b.size), 0),
      };
      accounts[cleanUsername] = {
        passwordHash: btoa(payload.password),
        user: demoUser,
      };
      this.saveStoredAccounts(accounts);
      return this.login(payload);
    }

    if (!account || account.passwordHash !== btoa(payload.password)) {
      throw new Error('Invalid username or vault passphrase.');
    }

    const token = `vault_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    this.activeToken = token;
    this.currentUser = account.user;

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(account.user));

    return { user: account.user, token };
  }

  /**
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    await this.simulatedNetworkLatency(80);
    this.activeToken = null;
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * GET /auth/me
   */
  async getMe(): Promise<User | null> {
    this.hydrateSession();
    if (!this.activeToken || !this.currentUser) {
      return null;
    }
    return this.currentUser;
  }

  // ==========================================
  // FILE STORAGE ENDPOINTS
  // ==========================================

  /**
   * GET /files
   * Retrieves files with optional category, search, and sorting.
   */
  async getFiles(filters?: Partial<FilterOptions>): Promise<VaultFile[]> {
    await this.simulatedNetworkLatency(90);
    const allFiles = this.getStoredFiles();

    let result = [...allFiles];

    if (!filters) return result.filter(f => !f.isTrash);

    // Category / Section routing
    if (filters.category === 'trash') {
      result = result.filter(f => f.isTrash);
    } else if (filters.category === 'favorites') {
      result = result.filter(f => !f.isTrash && f.isFavorite);
    } else if (filters.category && filters.category !== 'all') {
      result = result.filter(f => !f.isTrash && f.category === filters.category);
    } else {
      // Default: exclude trash
      result = result.filter(f => !f.isTrash);
    }

    // Text & Custom ID search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(f => {
        return (
          f.name.toLowerCase().includes(q) ||
          (f.customId && f.customId.toLowerCase().includes(q)) ||
          f.extension.toLowerCase().includes(q) ||
          f.tags.some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // Dedicated customId filter if specified
    if (filters.customIdQuery) {
      const cid = filters.customIdQuery.toLowerCase().trim();
      result = result.filter(f => f.customId && f.customId.toLowerCase().includes(cid));
    }

    // Specific file extension filter
    if (filters.extension && filters.extension !== 'all') {
      result = result.filter(f => f.extension.toLowerCase() === filters.extension?.toLowerCase());
    }

    // Sorting
    const sort = filters.sortBy || 'date_desc';
    result.sort((a, b) => {
      switch (sort) {
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'size_desc':
          return b.size - a.size;
        case 'size_asc':
          return a.size - b.size;
        default:
          return 0;
      }
    });

    return result;
  }

  /**
   * GET /files/:id
   */
  async getFile(id: string): Promise<VaultFile> {
    await this.simulatedNetworkLatency(60);
    const files = this.getStoredFiles();
    const file = files.find(f => f.id === id);
    if (!file) throw new Error(`Vault asset not found: ${id}`);
    return file;
  }

  /**
   * POST /files
   * Preserves exact original file bytes, MIME type, and metadata without compression or conversion.
   */
  async uploadFile(
    file: File,
    options?: {
      customId?: string;
      tags?: string[];
    },
    onProgress?: (percent: number) => void
  ): Promise<VaultFile> {
    // Check storage limits
    const files = this.getStoredFiles();
    const currentUsage = files.filter(f => !f.isTrash).reduce((acc, f) => acc + f.size, 0);
    const limit = this.currentUser?.storageLimit || DEFAULT_STORAGE_LIMIT;
    if (currentUsage + file.size > limit) {
      throw new Error(`Insufficient vault capacity. Needed: ${formatBytes(file.size)}, Available: ${formatBytes(limit - currentUsage)}`);
    }

    // Check custom ID uniqueness if provided
    if (options?.customId?.trim()) {
      const cleanCustomId = options.customId.trim();
      const existing = files.find(f => f.customId?.toLowerCase() === cleanCustomId.toLowerCase());
      if (existing) {
        throw new Error(`Custom ID "${cleanCustomId}" is already assigned to ${existing.name}.`);
      }
    }

    // Simulate progressive network upload without freezing UI
    for (let progress = 10; progress <= 90; progress += 20) {
      if (onProgress) onProgress(progress);
      await this.simulatedNetworkLatency(40);
    }

    const { category, extension } = getFileCategory(file.name, file.type);
    
    // Create persistent object URL
    const fileUrl = URL.createObjectURL(file);

    // Read preview text if it's text/code/json
    let textPreview: string | undefined = undefined;
    if (category === 'code' || category === 'document' || file.type.startsWith('text/') || file.size < 500000) {
      try {
        if (file.size < 1000000) {
          textPreview = await file.text();
        }
      } catch {
        // ignore preview extraction errors
      }
    }

    const newVaultFile: VaultFile = {
      id: generateId('f'),
      customId: options?.customId?.trim() || undefined,
      name: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      category,
      extension: extension || 'bin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      isFavorite: false,
      isTrash: false,
      tags: options?.tags || [],
      url: fileUrl,
      thumbnailUrl: category === 'image' ? fileUrl : undefined,
      textContent: textPreview,
      metadata: {
        lines: textPreview ? textPreview.split('\n').length : undefined,
      },
    };

    files.unshift(newVaultFile);
    this.saveStoredFiles(files);

    if (onProgress) onProgress(100);
    return newVaultFile;
  }

  /**
   * PATCH /files/:id
   * Update metadata (rename, custom ID, tags)
   */
  async updateFile(
    id: string,
    updates: {
      name?: string;
      customId?: string;
      tags?: string[];
      isFavorite?: boolean;
    }
  ): Promise<VaultFile> {
    await this.simulatedNetworkLatency(70);
    const files = this.getStoredFiles();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found');

    const target = files[index];

    if (updates.customId !== undefined) {
      const cleanCustomId = updates.customId.trim();
      if (cleanCustomId) {
        const clash = files.find(f => f.id !== id && f.customId?.toLowerCase() === cleanCustomId.toLowerCase());
        if (clash) {
          throw new Error(`Custom ID "${cleanCustomId}" is already assigned to "${clash.name}".`);
        }
        target.customId = cleanCustomId;
      } else {
        target.customId = undefined;
      }
    }

    if (updates.name && updates.name.trim()) {
      target.name = updates.name.trim();
      const { category, extension } = getFileCategory(target.name, target.mimeType);
      target.category = category;
      target.extension = extension;
    }

    if (updates.tags) {
      target.tags = updates.tags;
    }

    if (updates.isFavorite !== undefined) {
      target.isFavorite = updates.isFavorite;
    }

    target.updatedAt = new Date().toISOString();
    files[index] = target;
    this.saveStoredFiles(files);

    return target;
  }

  /**
   * POST /files/:id/favorite
   */
  async toggleFavorite(id: string): Promise<VaultFile> {
    const file = await this.getFile(id);
    return this.updateFile(id, { isFavorite: !file.isFavorite });
  }

  /**
   * DELETE /files/:id
   * Soft delete: moves file into Trash
   */
  async moveToTrash(id: string): Promise<void> {
    await this.simulatedNetworkLatency(60);
    const files = this.getStoredFiles();
    const target = files.find(f => f.id === id);
    if (!target) throw new Error('File not found');

    target.isTrash = true;
    target.deletedAt = new Date().toISOString();
    this.saveStoredFiles(files);
  }

  /**
   * POST /files/:id/restore
   * Restores file from Trash
   */
  async restoreFile(id: string): Promise<void> {
    await this.simulatedNetworkLatency(60);
    const files = this.getStoredFiles();
    const target = files.find(f => f.id === id);
    if (!target) throw new Error('File not found');

    target.isTrash = false;
    target.deletedAt = null;
    this.saveStoredFiles(files);
  }

  /**
   * DELETE /files/:id/permanent
   * Permanent erasure
   */
  async deletePermanent(id: string): Promise<void> {
    await this.simulatedNetworkLatency(90);
    let files = this.getStoredFiles();
    files = files.filter(f => f.id !== id);
    this.saveStoredFiles(files);
  }

  /**
   * DELETE /trash/empty
   */
  async emptyTrash(): Promise<void> {
    await this.simulatedNetworkLatency(120);
    let files = this.getStoredFiles();
    files = files.filter(f => !f.isTrash);
    this.saveStoredFiles(files);
  }

  /**
   * GET /storage/overview
   */
  async getStorageOverview(): Promise<StorageBreakdown> {
    const files = this.getStoredFiles().filter(f => !f.isTrash);
    const byCategory: Record<FileCategory, number> = {
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      archive: 0,
      code: 0,
      other: 0,
    };

    let totalUsed = 0;
    for (const f of files) {
      byCategory[f.category] = (byCategory[f.category] || 0) + f.size;
      totalUsed += f.size;
    }

    return {
      totalLimit: this.currentUser?.storageLimit || DEFAULT_STORAGE_LIMIT,
      totalUsed,
      byCategory,
      fileCount: files.length,
    };
  }

  // Internal helper for natural fluid response latency
  private simulatedNetworkLatency(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const api = new VaultApiService();
