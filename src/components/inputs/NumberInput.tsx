import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  enableVoice?: boolean;
  unit?: string;
}

export function NumberInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  required = false,
  isFlagged = false,
  flagMessage,
  enableVoice = false,
  unit,
}: NumberInputProps) {
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
        onChange("123");
      }, 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = parseFloat(inputValue);

    if (inputValue === "" || isNaN(numValue)) {
      onChange(inputValue);
      return;
    }

    if (min !== undefined && numValue < min) {
      return;
    }

    if (max !== undefined && numValue > max) {
      return;
    }

    onChange(inputValue);
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(
            "survey-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            unit && "pr-16",
            enableVoice && "pr-12",
            unit && enableVoice && "pr-20",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        />

        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            {unit}
          </div>
        )}

        {enableVoice && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50",
              unit && "right-12",
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
