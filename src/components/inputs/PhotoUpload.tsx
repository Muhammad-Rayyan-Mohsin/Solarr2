import { useState, useRef } from "react";
import { Camera, Edit3, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { offlineStorage } from "@/services/offlineStorage";

interface PhotoUploadProps {
  id: string;
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

export function PhotoUpload({
  id,
  label,
  photos,
  onChange,
  maxPhotos = 5,
  required = false,
  isFlagged = false,
  flagMessage
}: PhotoUploadProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDraftId = (): string | undefined => {
    try {
      const v = localStorage.getItem('draftId');
      return v || undefined;
    } catch {
      return undefined;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (photos.length >= maxPhotos) break;
        
        // Convert to base64 for immediate display
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newPhotos = [...photos, e.target.result as string];
            onChange(newPhotos);
          }
        };
        reader.readAsDataURL(file);
        
        // Also save to offline storage for sync later
        const photoId = `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await offlineStorage.savePhoto(photoId, file, 'survey', id, undefined, getDraftId());
      }
    } catch (error) {
      console.error('Failed to process photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
    setSelectedPhoto(null);
  };

  const openAnnotation = (photo: string) => {
    setSelectedPhoto(photo);
    // In a real app, you would open an annotation modal here
    console.log("Opening annotation for photo:", photo);
  };

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator")}> 
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="space-y-4">
        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="photo-thumbnail w-40 h-40 object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              
              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => openAnnotation(photo)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                  <span className="sr-only">Annotate photo</span>
                </Button>
                
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removePhoto(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove photo</span>
                </Button>
              </div>
            </div>
          ))}
          
          {/* Add Photo Button */}
          {photos.length < maxPhotos && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="photo-placeholder w-40 h-40"
            >
            <div className="text-center">
              {isUploading ? (
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              ) : (
                <Camera className="h-8 w-8 mx-auto mb-2" />
              )}
              <span className="text-sm font-medium">
                {isUploading ? 'Saving...' : '📷 Add Photo'}
              </span>
            </div>
            </button>
          )}
        </div>
        
          <div className="text-sm text-muted-foreground">
            ⚡ {photos.length}/{maxPhotos} photos added
          </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id={id}
      />
      
      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-base text-destructive">
          <span>⚠</span>
          <span>{flagMessage}</span>
          <button className="underline hover:no-underline">
            Click to resolve
          </button>
        </div>
      )}
    </div>
  );
}