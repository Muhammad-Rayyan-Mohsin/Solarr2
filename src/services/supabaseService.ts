import {
  supabase,
  Survey,
  SurveyPhoto,
  SurveyAudio,
  SyncQueueItem,
} from "@/lib/supabase";

export class SupabaseService {
  // Survey Operations
  static async createSurvey(surveyData: Partial<Survey>): Promise<Survey> {
    const { data, error } = await supabase
      .from("surveys")
      .insert([{ ...surveyData, status: "completed", sync_status: "synced" }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSurvey(
    id: string,
    surveyData: Partial<Survey>
  ): Promise<Survey> {
    const { data, error } = await supabase
      .from("surveys")
      .update({ ...surveyData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
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

  static async listSurveys(): Promise<Survey[]> {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Photo Operations
  static async uploadPhoto(
    surveyId: string,
    file: File,
    section: string,
    field: string,
    metadata?: any
  ): Promise<SurveyPhoto> {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${surveyId}_${section}_${field}_${timestamp}.jpg`;
    const filePath = `surveys/${surveyId}/photos/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("survey-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("survey-photos")
      .getPublicUrl(filePath);

    // Create thumbnail
    const thumbnailPath = `surveys/${surveyId}/thumbnails/${filename}`;
    const thumbnailBlob = await this.createThumbnail(file);

    const { error: thumbnailError } = await supabase.storage
      .from("survey-photos")
      .upload(thumbnailPath, thumbnailBlob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (thumbnailError)
      console.warn("Thumbnail upload failed:", thumbnailError);

    // Save to database
    const photoData: Partial<SurveyPhoto> = {
      survey_id: surveyId,
      section,
      field,
      filename,
      file_path: urlData.publicUrl,
      thumbnail_path: thumbnailPath,
      file_size: file.size,
      metadata,
      sync_status: "synced",
    };

    const { data, error } = await supabase
      .from("survey_photos")
      .insert([photoData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSurveyPhotos(surveyId: string): Promise<SurveyPhoto[]> {
    const { data, error } = await supabase
      .from("survey_photos")
      .select("*")
      .eq("survey_id", surveyId)
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
