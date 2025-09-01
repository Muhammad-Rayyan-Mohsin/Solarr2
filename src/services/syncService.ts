import { offlineStorage, SyncQueueItem, StoredPhoto, StoredAudio } from './offlineStorage';
import { SupabaseService } from './supabaseService';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
}

export interface SyncResult {
  success: boolean;
  uploaded: number;
  failed: number;
  errors: string[];
}

class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private lastCreatedSurveyId: string | null = null;
  private syncProgress: SyncProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    current: ''
  };

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Check if we're currently syncing
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  // Get current sync progress
  getSyncProgress(): SyncProgress {
    return { ...this.syncProgress };
  }

  // Main sync method
  async syncAllData(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: false,
      uploaded: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get sync queue
      const queue = await offlineStorage.getSyncQueue();
      this.syncProgress.total = queue.length;
      this.syncProgress.completed = 0;
      this.syncProgress.failed = 0;

      if (queue.length === 0) {
        result.success = true;
        return result;
      }

      // Process each item in the queue
      for (const item of queue) {
        this.syncProgress.current = `Syncing ${item.type} for ${item.section}`;
        
        try {
          await this.processSyncItem(item);
          result.uploaded++;
          this.syncProgress.completed++;
          
          // Remove from queue on success
          await offlineStorage.removeFromSyncQueue(item.id);
          
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          result.failed++;
          this.syncProgress.failed++;
          result.errors.push(`Failed to sync ${item.section}: ${error}`);
          
          // Update retry count
          await this.handleSyncFailure(item);
        }

        // Small delay to prevent overwhelming the server
        await this.delay(100);
      }

      // Sync photos (attach to last created survey if available)
      await this.syncPhotos(this.lastCreatedSurveyId || undefined);
      
      // Sync audio files
      await this.syncAudioFiles();

      result.success = result.failed === 0;
      
    } catch (error) {
      console.error('Sync failed:', error);
      result.errors.push(`Sync failed: ${error}`);
    } finally {
      this.isSyncing = false;
      this.syncProgress.current = '';
    }

    return result;
  }

  // Public method: sync photos for a specific draft to a survey
  async syncPhotosForDraft(draftId: string, surveyId: string): Promise<void> {
    const photos = await offlineStorage.getAllPhotos();
    const pending = photos.filter(p => !p.isUploaded && p.draftId === draftId);
    for (const photo of pending) {
      try {
        await this.uploadPhotoToSupabase(surveyId, photo);
        await offlineStorage.markPhotoAsUploaded(photo.id);
      } catch (e) {
        console.error(`Failed to upload photo ${photo.id} for draft ${draftId}:`, e);
      }
    }
  }

  // Process individual sync item from offlineStorage queue
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    try {
      // Photos and audio are handled by dedicated sync steps; clear their queue entries
      if (item.section === 'photos' || item.section === 'audio') {
        return;
      }

      if (item.section === 'surveys') {
        if (item.type === 'CREATE') {
          const payload = item.value?.payload ?? item.value;
          const draftLastModified: number | null = item.value?.draftLastModified ?? null;
          const draftId: string | undefined = item.value?.draftId ?? undefined;
          try {
            const created = await SupabaseService.createSurvey(payload);
            this.lastCreatedSurveyId = created.id || null;
            // If we have draftId, immediately attach photos for this draft
            if (draftId && created.id) {
              await this.syncPhotosForDraft(draftId, created.id);
            }
          } catch (e: any) {
            console.error('Sync createSurvey error:', e?.message || e, e);
            throw e;
          }
          // Clear draft only if unchanged since queued
          if (typeof draftLastModified === 'number') {
            await offlineStorage.clearDraftIfUnchanged(draftLastModified);
          }
          return;
        }
        if (item.type === 'UPDATE') {
          const payload = item.value?.payload ?? item.value;
          const surveyId: string | undefined = payload?.id || payload?.survey_id;
          if (!surveyId) throw new Error('Missing survey id for UPDATE');
          await SupabaseService.updateSurvey(surveyId, payload);
          return;
        }
        // DELETE not supported for now; ignore
        return;
      }

      // Unknown section; ignore to avoid blocking sync
      console.warn('Unknown sync queue section:', item.section);
    } catch (error) {
      console.error(`Failed to sync item in section ${item.section}:`, error);
      throw error;
    }
  }

  // Handle sync failure with retry logic
  private async handleSyncFailure(item: SyncQueueItem): Promise<void> {
    const newRetryCount = item.retryCount + 1;
    
    if (newRetryCount >= item.maxRetries) {
      // Max retries reached, keep in queue but mark as failed
      await offlineStorage.updateSyncQueueItem(item.id, {
        retryCount: newRetryCount
      });
    } else {
      // Update retry count and add exponential backoff
      const backoffDelay = Math.pow(2, newRetryCount) * 1000; // 2s, 4s, 8s
      
      await offlineStorage.updateSyncQueueItem(item.id, {
        retryCount: newRetryCount
      });
      
      // Schedule retry
      setTimeout(() => {
        this.syncAllData().catch(console.error);
      }, backoffDelay);
    }
  }

  // Sync photos to server
  private async syncPhotos(surveyId?: string): Promise<void> {
    const photos = await offlineStorage.getAllPhotos();
    const unuploadedPhotos = photos.filter(photo => !photo.isUploaded);

    if (!surveyId) {
      if (unuploadedPhotos.length > 0) {
        console.warn('Photos pending but no surveyId available yet; skipping this pass');
      }
      return;
    }

    for (const photo of unuploadedPhotos) {
      try {
        await this.uploadPhotoToSupabase(surveyId, photo);
        await offlineStorage.markPhotoAsUploaded(photo.id);
      } catch (error) {
        console.error(`Failed to upload photo ${photo.id}:`, error);
      }
    }
  }

  // Sync audio files to server
  private async syncAudioFiles(): Promise<void> {
    // Implementation for audio sync
    // Similar to photo sync but for audio files
  }

  // Upload photo to Supabase Storage and DB
  private async uploadPhotoToSupabase(surveyId: string, photo: StoredPhoto): Promise<void> {
    const file = await this.base64ToFile(photo.original, photo.metadata.filename);
    await SupabaseService.uploadPhoto(
      surveyId,
      file,
      photo.section,
      photo.field,
      photo.metadata
    );
  }

  // Utility methods for file conversion
  private async base64ToFile(base64: string, filename: string): Promise<File> {
    const response = await fetch(base64);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  private async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return await response.blob();
  }

  // Utility method for delays
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check for conflicts between local and server data
  async checkConflicts(localData: any, serverData: any): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      field: string;
      localValue: any;
      serverValue: any;
      resolution: 'local' | 'server' | 'manual';
    }>;
  }> {
    const conflicts: Array<{
      field: string;
      localValue: any;
      serverValue: any;
      resolution: 'local' | 'server' | 'manual';
    }> = [];

    // Simple conflict detection - compare timestamps
    // In a real app, you'd have more sophisticated conflict detection
    if (localData.lastModified && serverData.lastModified) {
      if (localData.lastModified > serverData.lastModified) {
        // Local is newer, use local
        conflicts.push({
          field: 'lastModified',
          localValue: localData.lastModified,
          serverValue: serverData.lastModified,
          resolution: 'local'
        });
      } else if (serverData.lastModified > localData.lastModified) {
        // Server is newer, use server
        conflicts.push({
          field: 'lastModified',
          localValue: localData.lastModified,
          serverValue: serverData.lastModified,
          resolution: 'server'
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  // Resolve conflicts automatically
  async resolveConflicts(localData: any, serverData: any): Promise<any> {
    const { conflicts } = await this.checkConflicts(localData, serverData);
    
    let resolvedData = { ...localData };
    
    for (const conflict of conflicts) {
      if (conflict.resolution === 'server') {
        resolvedData[conflict.field] = conflict.serverValue;
      }
      // For 'local' resolution, keep local value
      // For 'manual' resolution, would need user input
    }
    
    return resolvedData;
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    pendingItems: number;
    failedItems: number;
    lastSyncAttempt: number;
    storageInfo: {
      totalSize: number;
      itemCount: number;
      lastModified: number;
    };
  }> {
    const queue = await offlineStorage.getSyncQueue();
    const storageInfo = await offlineStorage.getStorageInfo();
    
    const failedItems = queue.filter(item => item.retryCount >= item.maxRetries).length;
    
    return {
      pendingItems: queue.length,
      failedItems,
      lastSyncAttempt: Date.now(), // In real app, track this
      storageInfo
    };
  }

  // Force retry of failed items
  async retryFailedItems(): Promise<void> {
    const queue = await offlineStorage.getSyncQueue();
    const failedItems = queue.filter(item => item.retryCount >= item.maxRetries);
    
    for (const item of failedItems) {
      // Reset retry count
      await offlineStorage.updateSyncQueueItem(item.id, {
        retryCount: 0
      });
    }
    
    // Trigger sync
    await this.syncAllData();
  }

  // Clear all sync data (for testing/reset)
  async clearSyncData(): Promise<void> {
    await offlineStorage.clearAllData();
  }
}

export const syncService = SyncService.getInstance();

export async function syncPhotosForDraft(draftId: string, surveyId: string): Promise<void> {
  return syncService.syncPhotosForDraft(draftId, surveyId);
}

