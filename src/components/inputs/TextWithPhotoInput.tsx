import { useState, useRef } from "react";
import { Camera, Edit3, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { offlineStorage } from "@/services/offlineStorage";

interface TextWithPhotoInputProps {
  id: string;
  label: string;
  textValue: string;
  photos: string[];
  onTextChange: (value: string) => void;
  onPhotosChange: (photos: string[]) => void;
  placeholder?: string;
  type?: "text" | "number" | "email" | "tel";
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  maxPhotos?: number;
  photoLabel?: string;
}

export function TextWithPhotoInput({
  id,
  label,
  textValue,
  photos,
  onTextChange,
  onPhotosChange,
  placeholder,
  type = "text",
  required = false,
  isFlagged = false,
  flagMessage,
  maxPhotos = 3,
  photoLabel = "Add photos"
}: TextWithPhotoInputProps) {
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
        
        const photoId = `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await offlineStorage.savePhoto(photoId, file, 'survey', id, undefined, getDraftId());
        
        await offlineStorage.addToSyncQueue({
          type: 'CREATE',
          section: 'photos',
          field: photoId,
          value: { filename: file.name, size: file.size },
          maxRetries: 3
        });
        
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newPhotos = [...photos, e.target.result as string];
            onPhotosChange(newPhotos);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Failed to save photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Input
            id={id}
            type={type}
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "h-11 text-base rounded-lg",
              isFlagged && "border-destructive focus:ring-destructive/50"
            )}
          />
        </div>

        {/* Photo Section */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">{photoLabel}</div>
          
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {photos.length < maxPhotos && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center hover:border-muted-foreground/50 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {photos.length}/{maxPhotos} photos
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
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