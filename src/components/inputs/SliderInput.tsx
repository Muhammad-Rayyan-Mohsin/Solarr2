import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  enableVoice?: boolean;
  unit?: string;
  presetValues?: number[];
}

export function SliderInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  required = false,
  isFlagged = false,
  flagMessage,
  enableVoice = false,
  unit,
  presetValues,
}: SliderInputProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      console.log("Voice recording stopped");
    } else {
      setIsRecording(true);
      console.log("Voice recording started");

      setTimeout(() => {
        setIsRecording(false);
        onChange(45);
      }, 3000);
    }
  };

  return (
    <div className={cn("space-y-3", isFlagged && "flag-indicator")}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {enableVoice && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            className={cn(
              "h-7 w-7 p-0 hover:bg-muted/50",
              isRecording && "text-destructive recording-pulse"
            )}
          >
            {isRecording ? (
              <MicOff className="h-3 w-3" />
            ) : (
              <Mic className="h-3 w-3" />
            )}
            <span className="sr-only">
              {isRecording ? "Stop recording" : "Start voice input"}
            </span>
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {min}
            {unit}
          </span>
          <span className="font-medium text-foreground text-sm">
            {value}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </div>

      {presetValues && (
        <div className="flex flex-wrap gap-1">
          {presetValues.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(preset)}
              className={cn(
                "text-xs h-6 px-2",
                value === preset && "bg-primary text-primary-foreground"
              )}
            >
              {preset}
              {unit}
            </Button>
          ))}
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
