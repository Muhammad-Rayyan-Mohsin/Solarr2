import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedPhotoUpload } from "./EnhancedPhotoUpload";
import { cn } from "@/lib/utils";

interface TextWithPhotoInputProps {
  id: string;
  label: string;
  textValue: string;
  onTextChange: (value: string) => void;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  description?: string;
  multiline?: boolean;
  maxPhotos?: number;
  photoGuidelines?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export function TextWithPhotoInput({
  id,
  label,
  textValue,
  onTextChange,
  photos,
  onPhotosChange,
  placeholder,
  required = false,
  isFlagged = false,
  flagMessage,
  description,
  multiline = false,
  maxPhotos = 3,
  photoGuidelines,
}: TextWithPhotoInputProps) {
  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator")}>
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor={`${id}-text`} className="text-xs text-muted-foreground">
            Details
          </Label>
          {multiline ? (
            <Textarea
              id={`${id}-text`}
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                "enhanced-input min-h-[100px]",
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
          ) : (
            <Input
              id={`${id}-text`}
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                "enhanced-input",
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
          )}
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Photos
          </Label>
          <EnhancedPhotoUpload
            id={`${id}-photos`}
            label=""
            photos={photos}
            onPhotosChange={onPhotosChange}
            maxPhotos={maxPhotos}
            guidelines={photoGuidelines}
            description=""
          />
        </div>
      </div>

      {isFlagged && flagMessage && (
        <p className="text-sm text-destructive">{flagMessage}</p>
      )}
    </div>
  );
}