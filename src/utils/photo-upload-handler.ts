/**
 * Photo Upload Handler
 * Ensures all photos are properly uploaded to Supabase storage and database
 */

import { supabase } from "@/integrations/supabase/client";

export interface PhotoUploadResult {
  success: boolean;
  storagePath?: string;
  error?: string;
}

export interface AssetRecord {
  survey_id: string;
  section: string;
  field: string;
  kind: 'photo' | 'audio' | 'document';
  storage_object_path: string;
  mime_type: string;
  byte_size: number;
  metadata?: any;
}

export class PhotoUploadHandler {
  /**
   * Upload a single photo to Supabase storage
   */
  static async uploadPhoto(
    file: File,
    surveyId: string,
    section: string,
    field: string,
    index: number = 0
  ): Promise<PhotoUploadResult> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `${field}_${index}_${timestamp}.${fileExtension}`;
      // Ensure storage path aligns with storage policies and the rest of the app
      // Path format: surveys/{userId}/{surveyId}/assets/{section}/{field}/{filename}
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';
      const storagePath = `surveys/${userId}/${surveyId}/assets/${section}/${field}/${filename}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('surveys')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`
        };
      }

      return {
        success: true,
        storagePath
      };
    } catch (error) {
      console.error('Photo upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Upload multiple photos for a specific field
   */
  static async uploadPhotosForField(
    files: File[],
    surveyId: string,
    section: string,
    field: string
  ): Promise<{ storagePaths: string[]; errors: string[] }> {
    const storagePaths: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const result = await this.uploadPhoto(file, surveyId, section, field, i);
      
      if (result.success && result.storagePath) {
        storagePaths.push(result.storagePath);
      } else {
        errors.push(`${field}[${i}]: ${result.error || 'Unknown error'}`);
      }
    }

    return { storagePaths, errors };
  }

  /**
   * Upload all photos from form data
   */
  static async uploadAllPhotos(
    formData: any,
    surveyId: string
  ): Promise<{ assets: AssetRecord[]; errors: string[] }> {
    const assets: AssetRecord[] = [];
    const errors: string[] = [];

    // Helper function to process photo arrays
    const processPhotoArray = async (
      photos: string[],
      section: string,
      field: string
    ) => {
      if (!photos || photos.length === 0) return;

      for (let i = 0; i < photos.length; i++) {
        const photoPath = photos[i];
        if (!photoPath || typeof photoPath !== 'string') continue;

        // If it's already a storage path, use it directly
        if (photoPath.startsWith('surveys/')) {
          assets.push({
            survey_id: surveyId,
            section,
            field,
            kind: 'photo',
            storage_object_path: photoPath,
            mime_type: this.getMimeTypeFromPath(photoPath),
            byte_size: 0, // Will be updated when we have actual file info
          });
        } else if (photoPath.startsWith('data:image/')) {
          // Handle base64 images - convert and upload
          try {
            const file = await this.base64ToFile(photoPath, `photo_${i}.jpg`);
            const result = await this.uploadPhoto(file, surveyId, section, field, i);
            
            if (result.success && result.storagePath) {
              assets.push({
                survey_id: surveyId,
                section,
                field,
                kind: 'photo',
                storage_object_path: result.storagePath,
                mime_type: file.type,
                byte_size: file.size,
              });
            } else {
              errors.push(`${field}[${i}]: ${result.error || 'Upload failed'}`);
            }
          } catch (error) {
            errors.push(`${field}[${i}]: Failed to convert base64 to file`);
            console.error('Base64 conversion error:', error);
          }
        } else {
          // If it's a file path or URL, we might need to handle it differently
          console.warn(`Photo path not in expected format: ${photoPath}`);
        }
      }
    };

    // Process all photo fields
    const photoFields = [
      { data: formData.annualConsumptionPhoto, section: 'electricity_baseline', field: 'annual_consumption' },
      { data: formData.scaffoldAccessPhoto, section: 'property_overview', field: 'scaffold_access' },
      { data: formData.storageAreaPhoto, section: 'property_overview', field: 'storage_area' },
      { data: formData.roofTimberPhoto, section: 'loft_attic', field: 'roof_timber' },
      { data: formData.wallSpaceInverterPhoto, section: 'loft_attic', field: 'wall_space_inverter' },
      { data: formData.wallSpaceBatteryPhoto, section: 'loft_attic', field: 'wall_space_battery' },
      { data: formData.mainFusePhoto, section: 'electrical_supply', field: 'main_fuse' },
      { data: formData.consumerUnitLocationPhoto, section: 'electrical_supply', field: 'consumer_unit_location' },
      { data: formData.spareFuseWaysPhoto, section: 'electrical_supply', field: 'spare_fuse_ways' },
      { data: formData.existingSurgeProtectionPhoto, section: 'electrical_supply', field: 'existing_surge_protection' },
      { data: formData.earthBondingPhoto, section: 'electrical_supply', field: 'earth_bonding' },
      { data: formData.earthingSystemPhoto, section: 'electrical_supply', field: 'earthing_system' },
      { data: formData.cableRouteToRoof, section: 'electrical_supply', field: 'cable_route_to_roof' },
      { data: formData.cableRouteToBattery, section: 'electrical_supply', field: 'cable_route_to_battery' },
      { data: formData.ventilationPhoto, section: 'battery_storage', field: 'ventilation' },
      { data: formData.asbestosPhoto, section: 'health_safety', field: 'asbestos' },
      { data: formData.fragileRoofAreas, section: 'health_safety', field: 'fragile_roof_areas' },
    ];

    for (const { data, section, field } of photoFields) {
      if (data && Array.isArray(data)) {
        await processPhotoArray(data, section, field);
      }
    }

    // Process roof face photos
    if (formData.roofFaces && Array.isArray(formData.roofFaces)) {
      for (let i = 0; i < formData.roofFaces.length; i++) {
        const roofFace = formData.roofFaces[i];
        if (roofFace.photos && Array.isArray(roofFace.photos)) {
          await processPhotoArray(
            roofFace.photos,
            'roof_faces',
            `roof_face_${roofFace.id}_photos`
          );
        }
      }
    }

    return { assets, errors };
  }

  /**
   * Convert base64 data URI to File object
   */
  private static async base64ToFile(base64: string, filename: string): Promise<File> {
    const response = await fetch(base64);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * Get MIME type from file path
   */
  private static getMimeTypeFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Create asset records in the database
   */
  static async createAssetRecords(assets: AssetRecord[]): Promise<{ success: boolean; errors: string[] }> {
    if (assets.length === 0) {
      return { success: true, errors: [] };
    }

    try {
      const { error } = await supabase
        .from('assets')
        .insert(assets);

      if (error) {
        console.error('Asset creation error:', error);
        return {
          success: false,
          errors: [`Database error: ${error.message}`]
        };
      }

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Asset creation error:', error);
      return {
        success: false,
        errors: [`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Get photos from storage for a specific survey
   */
  static async getSurveyPhotos(surveyId: string): Promise<AssetRecord[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('survey_id', surveyId)
        .eq('kind', 'photo') as { data: AssetRecord[] | null; error: any };

      if (error) {
        console.error('Error fetching photos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching photos:', error);
      return [];
    }
  }

  /**
   * Delete photos from storage and database
   */
  static async deletePhotos(surveyId: string, photoPaths: string[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('surveys')
        .remove(photoPaths);

      if (storageError) {
        errors.push(`Storage deletion error: ${storageError.message}`);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('assets')
        .delete()
        .eq('survey_id', surveyId)
        .in('storage_object_path', photoPaths);

      if (dbError) {
        errors.push(`Database deletion error: ${dbError.message}`);
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Photo deletion error:', error);
      return {
        success: false,
        errors: [`Deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}

