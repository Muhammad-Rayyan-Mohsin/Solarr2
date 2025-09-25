import React, { useState, useRef } from "react";
import { Camera, Upload, X, Eye, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./HelpTooltip";

interface PhotoGuideline {
  title: string;
  description: string;
  icon?: string;
}

interface EnhancedPhotoUploadProps {
  id: string;
  label: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  maxPhotos?: number;
  guidelines?: PhotoGuideline[];
  showPreview?: boolean;
  showGuidelines?: boolean;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  className?: string;
  description?: string;
}

export function EnhancedPhotoUpload({
  id,
  label,
  photos,
  onPhotosChange,
  required = false,
  isFlagged = false,
  flagMessage,
  maxPhotos = 5,
  guidelines = [],
  showPreview = true,
  showGuidelines = true,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  maxFileSize = 10,
  className,
  description,
}: EnhancedPhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setError(null);
    setUploading(true);

    try {
      const newPhotos: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!acceptedFormats.includes(file.type)) {
          setError(`Invalid file type: ${file.name}. Please use JPEG, PNG, or WebP.`);
          continue;
        }
        
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(`File too large: ${file.name}. Maximum size is ${maxFileSize}MB.`);
          continue;
        }
        
        // Convert to base64 for storage
        const base64 = await fileToBase64(file);
        newPhotos.push(base64);
      }
      
      // Check if adding new photos would exceed max
      if (photos.length + newPhotos.length > maxPhotos) {
        setError(`Maximum ${maxPhotos} photos allowed. Please remove some photos first.`);
        setUploading(false);
        return;
      }
      
      onPhotosChange([...photos, ...newPhotos]);
    } catch (err) {
      setError("Failed to process photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileSize = (base64: string) => {
    // Rough estimation of file size from base64
    const sizeInBytes = (base64.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB.toFixed(1);
  };

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {showGuidelines && guidelines.length > 0 && (
            <HelpTooltip
              content={
                <div className="space-y-2">
                  <p className="font-medium">Photo Guidelines:</p>
                  {guidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-xs">{guideline.icon || "•"}</span>
                      <div>
                        <p className="text-xs font-medium">{guideline.title}</p>
                        <p className="text-xs text-muted-foreground">{guideline.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Max {maxPhotos} photos</span>
          <span>•</span>
          <span>Max {maxFileSize}MB each</span>
          <span>•</span>
          <span>JPEG, PNG, WebP</span>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isFlagged && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            ) : (
              <Camera className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {uploading ? "Uploading photos..." : "Upload photos"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to select
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            disabled={uploading || photos.length >= maxPhotos}
            className="h-8"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Photo Preview */}
      {showPreview && photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Uploaded Photos ({photos.length}/{maxPhotos})
            </p>
            <Badge variant="secondary" className="text-xs">
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(photo, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = photo;
                          link.download = `photo-${index + 1}.jpg`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {getFileSize(photo)}MB
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      {showGuidelines && guidelines.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-foreground">Photo Guidelines</p>
              </div>
              
              <div className="space-y-2">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {guideline.icon || "•"}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {guideline.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {guideline.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isFlagged && flagMessage && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-destructive rounded-full" />
            {flagMessage}
          </div>
        </div>
      )}
    </div>
  );
}
