import { useState } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface VoiceNoteProps {
  id: string;
  label: string;
  transcript: string;
  onChange: (transcript: string) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

export function VoiceNote({
  id,
  label,
  transcript,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage
}: VoiceNoteProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Simulate recording timer
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Auto-stop after 30 seconds (demo)
    setTimeout(() => {
      clearInterval(timer);
      stopRecording();
    }, 30000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    
    // Simulate transcription
    const sampleTranscript = "This is a sample voice note transcription. The system captured your audio and converted it to text automatically.";
    onChange(sampleTranscript);
  };

  const playRecording = () => {
    setIsPlaying(true);
    // Simulate playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const deleteRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    onChange("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-3", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
          {!isRecording && !hasRecording && (
            <Button
              type="button"
              onClick={startRecording}
              className="recording-button bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Mic className="h-4 w-4 mr-2" />
              Record
            </Button>
          )}
          
          {isRecording && (
            <>
              <Button
                type="button"
                onClick={stopRecording}
                variant="destructive"
                size="sm"
                className="recording-pulse"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-destructive rounded-full recording-pulse" />
                <span className="text-sm font-medium text-foreground">
                  Recording: {formatTime(recordingTime)}
                </span>
              </div>
            </>
          )}
          
          {hasRecording && !isRecording && (
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={playRecording}
                variant="secondary"
                size="sm"
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? "Playing..." : "Play"}
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {formatTime(recordingTime)}
              </span>
              
              <Button
                type="button"
                onClick={deleteRecording}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Editable Transcript */}
        {(transcript || hasRecording) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Transcript (editable)
            </Label>
            <Textarea
              value={transcript}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Voice transcript will appear here..."
              className="min-h-[100px] resize-none survey-input"
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              Timestamp: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
      
      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <span>!</span>
          <span>{flagMessage}</span>
          <button className="underline hover:no-underline">
            Click to resolve
          </button>
        </div>
      )}
    </div>
  );
}