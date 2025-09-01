import { useState } from "react";
import { Mic, MicOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email" | "tel" | "date";
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  enableVoice?: boolean;
  includeLocation?: boolean;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  isFlagged = false,
  flagMessage,
  enableVoice = true,
  includeLocation = false
}: TextInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState("");

  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // In a real app, you'd stop speech recognition here
      console.log("Voice recording stopped");
    } else {
      // Start recording
      setIsRecording(true);
      // In a real app, you'd start speech recognition here
      console.log("Voice recording started");
      
      // Simulate voice transcription after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        onChange("Sample voice transcription text");
      }, 3000);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would call the What Three Words API here
          // For now, we'll just use coordinates
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setLocation(locationString);
          console.log("Location captured:", locationString);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {includeLocation && (
          <span className="text-xs text-muted-foreground ml-2">
            (includes location)
          </span>
        )}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "survey-input",
            enableVoice && "pr-12",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        />
        
        {enableVoice && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50",
              isRecording && "text-destructive recording-pulse"
            )}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isRecording ? "Stop recording" : "Start voice input"}
            </span>
          </Button>
        )}
      </div>
      
      {includeLocation && (
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="text-xs h-7 px-2"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Get Location
          </Button>
          {location && (
            <span className="text-xs text-muted-foreground">
              Location: {location}
            </span>
          )}
        </div>
      )}
      
      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
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