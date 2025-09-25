import {
  supabase,
  Survey,
  SurveyPhoto,
  SurveyAudio,
  SyncQueueItem,
} from "@/lib/supabase";

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
      .single();

    if (error && error.code !== "PGRST116") throw error;
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

  // Audio Operations
  static async uploadAudio(
    surveyId: string,
    file: Blob,
    section: string,
    field: string,
    transcription?: string
  ): Promise<SurveyAudio> {
    const timestamp = Date.now();
    const filename = `${surveyId}_${section}_${field}_${timestamp}.webm`;
    const filePath = `surveys/${surveyId}/audio/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("survey-audio")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("survey-audio")
      .getPublicUrl(filePath);

    // Save to database
    const audioData: Partial<SurveyAudio> = {
      survey_id: surveyId,
      section,
      field,
      filename,
      file_path: urlData.publicUrl,
      transcription,
      file_size: file.size,
      sync_status: "synced",
    };

    const { data, error } = await supabase
      .from("survey_audio")
      .insert([audioData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Sync Queue Operations
  static async addToSyncQueue(
    item: Omit<SyncQueueItem, "id" | "created_at">
  ): Promise<SyncQueueItem> {
    const queueItem: Partial<SyncQueueItem> = {
      ...item,
      retry_count: 0,
      max_retries: 3,
      status: "pending",
    };

    const { data, error } = await supabase
      .from("sync_queue")
      .insert([queueItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    const { data, error } = await supabase
      .from("sync_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updateSyncQueueItem(
    id: string,
    updates: Partial<SyncQueueItem>
  ): Promise<void> {
    const { error } = await supabase
      .from("sync_queue")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  }

  static async removeFromSyncQueue(id: string): Promise<void> {
    const { error } = await supabase.from("sync_queue").delete().eq("id", id);

    if (error) throw error;
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

  static subscribeToPhotoUpdates(
    surveyId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`photos-${surveyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "survey_photos",
          filter: `survey_id=eq.${surveyId}`,
        },
        callback
      )
      .subscribe();
  }
}
