import { useEffect, useRef, useState } from 'react';
import { offlineStorage } from '@/services/offlineStorage';

interface UseAutoSaveOptions {
  delay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAutoSave<T>(
  data: T,
  options: UseAutoSaveOptions = {}
) {
  const {
    delay = 500,
    enabled = true,
    onSave,
    onError
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>();

  // Debounced save function
  const saveData = async (dataToSave: T) => {
    if (!enabled || !dataToSave) return;

    try {
      setIsSaving(true);
      setSaveStatus('saving');

      await offlineStorage.saveFormData(dataToSave, true);
      
      setLastSaved(new Date());
      setSaveStatus('saved');
      onSave?.(dataToSave);

      // Clear saved status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      onError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced effect
  useEffect(() => {
    // Skip if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    lastDataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveStatus,
    saveNow: () => saveData(data)
  };
}

