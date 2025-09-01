import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'SolarSurveyApp',
  storeName: 'survey_data',
  description: 'Solar Survey Offline Storage'
});

export interface StoredFormData {
  id: string;
  data: any;
  timestamp: number;
  lastModified: number;
  version: string;
  isDraft: boolean;
}

export interface StoredPhoto {
  id: string;
  original: string; // Base64
  thumbnail: string; // Compressed Base64
  metadata: {
    filename: string;
    size: number;
    timestamp: number;
    geolocation?: { lat: number; lng: number };
  };
  section: string;
  field: string;
  draftId?: string;
  isUploaded: boolean;
}

export interface StoredAudio {
  id: string;
  blob: Blob;
  transcription: string;
  metadata: {
    duration: number;
    timestamp: number;
    filename: string;
  };
  section: string;
  field: string;
  isUploaded: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  section: string;
  field: string;
  value: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await localforage.ready();
      this.isInitialized = true;
      console.log('Offline storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw error;
    }
  }

  // Form Data Methods
  async saveFormData(data: any, isDraft: boolean = true): Promise<void> {
    await this.initialize();
    
    const formData: StoredFormData = {
      id: 'current_survey',
      data,
      timestamp: Date.now(),
      lastModified: Date.now(),
      version: '1.0.0',
      isDraft
    };

    try {
      await localforage.setItem('form_data', formData);
      console.log('Form data saved locally');
    } catch (error) {
      console.error('Failed to save form data:', error);
      throw error;
    }
  }

  async getStoredFormData(): Promise<StoredFormData | null> {
    await this.initialize();
    try {
      const stored = await localforage.getItem<StoredFormData>('form_data');
      return stored || null;
    } catch (error) {
      console.error('Failed to get stored form data:', error);
      return null;
    }
  }

  async loadFormData(): Promise<any | null> {
    await this.initialize();
    
    try {
      const stored = await localforage.getItem<StoredFormData>('form_data');
      if (stored) {
        console.log('Form data loaded from local storage');
        return stored.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load form data:', error);
      return null;
    }
  }

  async updateFormDataTimestamp(): Promise<void> {
    await this.initialize();
    
    try {
      const stored = await localforage.getItem<StoredFormData>('form_data');
      if (stored) {
        stored.lastModified = Date.now();
        await localforage.setItem('form_data', stored);
      }
    } catch (error) {
      console.error('Failed to update timestamp:', error);
    }
  }

  // Photo Storage Methods
  async savePhoto(
    photoId: string,
    file: File,
    section: string,
    field: string,
    geolocation?: { lat: number; lng: number },
    draftId?: string
  ): Promise<void> {
    await this.initialize();
    
    try {
      // Convert to Base64
      const base64 = await this.fileToBase64(file);
      
      // Create thumbnail (compressed version)
      const thumbnail = await this.createThumbnail(file);
      
      const photo: StoredPhoto = {
        id: photoId,
        original: base64,
        thumbnail,
        metadata: {
          filename: file.name,
          size: file.size,
          timestamp: Date.now(),
          geolocation
        },
        section,
        field,
        draftId,
        isUploaded: false
      };

      await localforage.setItem(`photo_${photoId}`, photo);
      console.log(`Photo ${photoId} saved locally`);
    } catch (error) {
      console.error('Failed to save photo:', error);
      throw error;
    }
  }

  async getPhoto(photoId: string): Promise<StoredPhoto | null> {
    await this.initialize();
    
    try {
      return await localforage.getItem<StoredPhoto>(`photo_${photoId}`);
    } catch (error) {
      console.error('Failed to get photo:', error);
      return null;
    }
  }

  async getAllPhotos(): Promise<StoredPhoto[]> {
    await this.initialize();
    
    try {
      const photos: StoredPhoto[] = [];
      await localforage.iterate((value, key) => {
        if (key.startsWith('photo_')) {
          photos.push(value as StoredPhoto);
        }
      });
      return photos;
    } catch (error) {
      console.error('Failed to get all photos:', error);
      return [];
    }
  }

  async markPhotoAsUploaded(photoId: string): Promise<void> {
    await this.initialize();
    
    try {
      const photo = await this.getPhoto(photoId);
      if (photo) {
        photo.isUploaded = true;
        await localforage.setItem(`photo_${photoId}`, photo);
      }
    } catch (error) {
      console.error('Failed to mark photo as uploaded:', error);
    }
  }

  // Audio Storage Methods
  async saveAudio(
    audioId: string,
    blob: Blob,
    transcription: string,
    section: string,
    field: string
  ): Promise<void> {
    await this.initialize();
    
    try {
      const audio: StoredAudio = {
        id: audioId,
        blob,
        transcription,
        metadata: {
          duration: 0, // Will be calculated if needed
          timestamp: Date.now(),
          filename: `audio_${audioId}.webm`
        },
        section,
        field,
        isUploaded: false
      };

      await localforage.setItem(`audio_${audioId}`, audio);
      console.log(`Audio ${audioId} saved locally`);
    } catch (error) {
      console.error('Failed to save audio:', error);
      throw error;
    }
  }

  async getAudio(audioId: string): Promise<StoredAudio | null> {
    await this.initialize();
    
    try {
      return await localforage.getItem<StoredAudio>(`audio_${audioId}`);
    } catch (error) {
      console.error('Failed to get audio:', error);
      return null;
    }
  }

  // Sync Queue Methods
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    await this.initialize();
    
    try {
      const queue = await this.getSyncQueue();
      const syncItem: SyncQueueItem = {
        ...item,
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };
      
      queue.push(syncItem);
      await localforage.setItem('sync_queue', queue);
      console.log('Item added to sync queue');
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.initialize();
    
    try {
      const queue = await localforage.getItem<SyncQueueItem[]>('sync_queue');
      return queue || [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(itemId: string): Promise<void> {
    await this.initialize();
    
    try {
      const queue = await this.getSyncQueue();
      const filteredQueue = queue.filter(item => item.id !== itemId);
      await localforage.setItem('sync_queue', filteredQueue);
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  async updateSyncQueueItem(itemId: string, updates: Partial<SyncQueueItem>): Promise<void> {
    await this.initialize();
    
    try {
      const queue = await this.getSyncQueue();
      const itemIndex = queue.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        queue[itemIndex] = { ...queue[itemIndex], ...updates };
        await localforage.setItem('sync_queue', queue);
      }
    } catch (error) {
      console.error('Failed to update sync queue item:', error);
    }
  }

  // Utility Methods
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Create thumbnail (max 200x200)
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Cleanup Methods
  async clearDraftIfUnchanged(expectedLastModified: number): Promise<boolean> {
    await this.initialize();
    try {
      const stored = await localforage.getItem<StoredFormData>('form_data');
      if (stored && stored.lastModified === expectedLastModified) {
        await localforage.removeItem('form_data');
        console.log('Draft cleared (matched lastModified)');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to conditionally clear draft:', error);
      return false;
    }
  }
  async clearDraft(): Promise<void> {
    await this.initialize();
    
    try {
      await localforage.removeItem('form_data');
      console.log('Draft cleared');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  async clearAllData(): Promise<void> {
    await this.initialize();
    
    try {
      await localforage.clear();
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  async getStorageInfo(): Promise<{
    totalSize: number;
    itemCount: number;
    lastModified: number;
  }> {
    await this.initialize();
    
    try {
      let totalSize = 0;
      let itemCount = 0;
      let lastModified = 0;

      await localforage.iterate((value, key) => {
        itemCount++;
        if (typeof value === 'string') {
          totalSize += value.length;
        } else if (value && typeof value === 'object') {
          totalSize += JSON.stringify(value).length;
        }
        
        if (value && typeof value === 'object' && 'lastModified' in value) {
          lastModified = Math.max(lastModified, (value as any).lastModified);
        }
      });

      return { totalSize, itemCount, lastModified };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalSize: 0, itemCount: 0, lastModified: 0 };
    }
  }
}

export const offlineStorage = OfflineStorageService.getInstance();

