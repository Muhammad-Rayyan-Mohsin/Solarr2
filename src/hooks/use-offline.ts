import { useState, useEffect, useCallback } from 'react';
import { syncService } from '@/services/syncService';
import { offlineStorage } from '@/services/offlineStorage';
import { useToast } from '@/hooks/use-toast';

export interface OfflineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSync: number;
  lastSyncAttempt: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

export function useOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingSync: 0,
    lastSyncAttempt: 0,
    connectionQuality: navigator.onLine ? 'good' : 'offline'
  });

  const { toast } = useToast();

  // Check sync queue and update pending count
  const updatePendingSync = useCallback(async () => {
    try {
      const queue = await offlineStorage.getSyncQueue();
      setStatus(prev => ({
        ...prev,
        pendingSync: queue.length
      }));
    } catch (error) {
      console.error('Failed to update pending sync count:', error);
    }
  }, []);

  // Handle online event
  const handleOnline = useCallback(async () => {
    console.log('Connection restored');
    
    setStatus(prev => ({
      ...prev,
      isOnline: true,
      connectionQuality: 'good'
    }));

    // Show online notification
    toast({
      title: "Connection Restored",
      description: "Syncing your data...",
    });

    // Trigger sync after a short delay
    setTimeout(async () => {
      try {
        setStatus(prev => ({ ...prev, isSyncing: true }));
        
        const result = await syncService.syncAllData();
        
        if (result.success) {
          toast({
            title: "Sync Complete",
            description: `Successfully synced ${result.uploaded} items`,
          });
        } else {
          toast({
            title: "Sync Issues",
            description: `${result.failed} items failed to sync. Will retry later.`,
            variant: "destructive",
          });
        }
        
        // Update pending count
        await updatePendingSync();
        
      } catch (error) {
        console.error('Sync failed:', error);
        toast({
          title: "Sync Failed",
          description: "Will retry when connection is stable",
          variant: "destructive",
        });
      } finally {
        setStatus(prev => ({ 
          ...prev, 
          isSyncing: false,
          lastSyncAttempt: Date.now()
        }));
      }
    }, 1000);
  }, [toast, updatePendingSync]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    console.log('Connection lost');
    
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      connectionQuality: 'offline'
    }));

    toast({
      title: "Connection Lost",
      description: "Working offline. Data will sync when connected.",
      variant: "destructive",
    });
  }, [toast]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!status.isOnline) {
      toast({
        title: "Cannot Sync",
        description: "No internet connection available",
        variant: "destructive",
      });
      return;
    }

    if (status.isSyncing) {
      toast({
        title: "Sync in Progress",
        description: "Please wait for current sync to complete",
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isSyncing: true }));
      
      const result = await syncService.syncAllData();
      
      if (result.success) {
        toast({
          title: "Manual Sync Complete",
          description: `Successfully synced ${result.uploaded} items`,
        });
      } else {
        toast({
          title: "Manual Sync Issues",
          description: `${result.failed} items failed to sync`,
          variant: "destructive",
        });
      }
      
      await updatePendingSync();
      
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast({
        title: "Manual Sync Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSyncAttempt: Date.now()
      }));
    }
  }, [status.isOnline, status.isSyncing, toast, updatePendingSync]);

  // Check connection quality
  const checkConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus(prev => ({ ...prev, connectionQuality: 'offline' }));
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = Date.now();
      const latency = endTime - startTime;

      let quality: 'excellent' | 'good' | 'poor';
      if (latency < 100) quality = 'excellent';
      else if (latency < 500) quality = 'good';
      else quality = 'poor';

      setStatus(prev => ({ ...prev, connectionQuality: quality }));
    } catch (error) {
      setStatus(prev => ({ ...prev, connectionQuality: 'poor' }));
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync queue check
    updatePendingSync();

    // Check connection quality periodically
    const qualityInterval = setInterval(checkConnectionQuality, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityInterval);
    };
  }, [handleOnline, handleOffline, updatePendingSync, checkConnectionQuality]);

  // Monitor sync progress
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const isSyncing = syncService.getIsSyncing();
      if (isSyncing !== status.isSyncing) {
        setStatus(prev => ({ ...prev, isSyncing }));
      }
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [status.isSyncing]);

  return {
    ...status,
    triggerSync,
    updatePendingSync
  };
}

