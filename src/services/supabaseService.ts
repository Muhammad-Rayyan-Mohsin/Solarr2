import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Survey = Database['public']['Tables']['surveys']['Row'];
type SurveyInsert = Database['public']['Tables']['surveys']['Insert'];

export interface SurveyPhoto {
  id?: string;
  survey_id: string;
  section: string;
  field: string;
  filename: string;
  file_path: string;
  thumbnail_path?: string;
  file_size: number;
  metadata?: any;
  created_at?: string;
  sync_status?: "pending" | "synced" | "failed";
}

export interface SurveyAudio {
  id?: string;
  survey_id: string;
  section: string;
  field: string;
  filename: string;
  file_path: string;
  transcription?: string;
  duration?: number;
  file_size: number;
  created_at?: string;
  sync_status?: "pending" | "synced" | "failed";
}

export interface SyncQueueItem {
  id?: string;
  survey_id: string;
  table_name: "surveys" | "survey_photos" | "survey_audio";
  operation: "INSERT" | "UPDATE" | "DELETE";
  data: any;
  created_at?: string;
  retry_count?: number;
  max_retries?: number;
  status?: "pending" | "processing" | "completed" | "failed";
}

export class SupabaseService {
  // Survey Operations
  static async createSurvey(surveyData: any): Promise<{ id: string }> {
    // Use our new RPC function that handles the normalized schema
    const { data: surveyId, error } = await supabase
      .rpc('create_full_survey', { payload: surveyData });

    if (error) throw error;
    return { id: surveyId };
  }

  static async updateSurvey(
    id: string,
    surveyData: any
  ): Promise<{ id: string }> {
    // TODO: Implement update for normalized schema
    // For now, throw an error as updates aren't supported yet
    throw new Error('Survey updates not yet implemented for new schema. Please create a new survey instead.');
  }

  static async getSurvey(id: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async listSurveys(): Promise<any[]> {
    const { data, error } = await supabase
      .from("surveys_list")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Fetch a complete survey with all related sections and assets
  static async getFullSurvey(surveyId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_full_survey', { p_survey_id: surveyId });
    if (error) throw error;
    return data;
  }

  // Delete a complete survey with all related data and assets
  static async deleteSurvey(surveyId: string): Promise<void> {
    try {
      // First, get all assets for this survey to delete from storage
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('storage_object_path')
        .eq('survey_id', surveyId);

      if (assetsError) {
        console.error('Error fetching assets for deletion:', assetsError);
        // Continue with deletion even if assets fetch fails
      }

      // Delete all files from storage
      if (assets && assets.length > 0) {
        const filePaths = assets.map(asset => asset.storage_object_path);
        const { error: storageError } = await supabase.storage
          .from('surveys')
          .remove(filePaths);

        if (storageError) {
          console.error('Error deleting files from storage:', storageError);
          // Continue with deletion even if storage deletion fails
        }
      }

      // Delete all database records (cascade will handle related tables)
      const { error: deleteError } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (deleteError) {
        throw deleteError;
      }

      console.log(`Survey ${surveyId} and all related data deleted successfully`);
    } catch (error) {
      console.error('Error deleting survey:', error);
      throw error;
    }
  }

  // Photo Operations - Updated for new schema
  static async uploadPhoto(
    surveyId: string,
    file: File,
    section: string,
    field: string,
    metadata?: any,
    roofFaceId?: string
  ): Promise<string> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filename = `${crypto.randomUUID()}.${fileExt}`;
    
    // Get user ID for storage path (or use anonymous fallback)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';
    const filePath = `surveys/${userId}/${surveyId}/assets/${section}/${field}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("surveys")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Create asset record in the new assets table
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .insert({
        survey_id: surveyId,
        roof_face_id: roofFaceId,
        section,
        field,
        kind: 'photo',
        storage_object_path: filePath,
        mime_type: file.type,
        byte_size: file.size,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (assetError) throw assetError;
    return asset.id;
  }

  static async getSurveyPhotos(surveyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("survey_id", surveyId)
      .eq("kind", "photo")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Audio Operations - Updated for new schema
  static async uploadAudio(
    surveyId: string,
    file: Blob,
    section: string,
    field: string,
    transcription?: string
  ): Promise<string> {
    // Generate unique filename
    const fileExt = 'webm';
    const filename = `${crypto.randomUUID()}.${fileExt}`;
    
    // Get user ID for storage path (or use anonymous fallback)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';
    const filePath = `surveys/${userId}/${surveyId}/assets/${section}/${field}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("surveys")
      .upload(filePath, file, {
        contentType: 'audio/webm',
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Create asset record in the new assets table
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .insert({
        survey_id: surveyId,
        section,
        field,
        kind: 'voice',
        storage_object_path: filePath,
        mime_type: 'audio/webm',
        byte_size: file.size,
        metadata: { transcription: transcription || '' }
      })
      .select()
      .single();

    if (assetError) throw assetError;
    return asset.id;
  }

  // Sync Queue Operations - These would need to be implemented in a proper sync queue table
  static async addToSyncQueue(
    item: Omit<SyncQueueItem, "id" | "created_at">
  ): Promise<SyncQueueItem> {
    // For now, just return the item - this would need a proper sync_queue table
    return { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    // For now, return empty array - this would need a proper sync_queue table
    return [];
  }

  static async updateSyncQueueItem(
    id: string,
    updates: Partial<SyncQueueItem>
  ): Promise<void> {
    // For now, do nothing - this would need a proper sync_queue table
  }

  static async removeFromSyncQueue(id: string): Promise<void> {
    // For now, do nothing - this would need a proper sync_queue table
  }

  // Utility Methods
  private static async createThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create thumbnail"));
          },
          "image/jpeg",
          0.7
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Real-time subscriptions
  static subscribeToSurveyUpdates(
    surveyId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`survey-${surveyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "surveys",
          filter: `id=eq.${surveyId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToAssetUpdates(
    surveyId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`assets-${surveyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: `survey_id=eq.${surveyId}`,
        },
        callback
      )
      .subscribe();
  }
}
