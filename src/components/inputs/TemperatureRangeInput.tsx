import { useState } from "react";
import { Mic, MicOff, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TemperatureRangeInputProps {
  id: string;
  label: string;
  minTemp: string;
  maxTemp: string;
  onMinTempChange: (value: string) => void;
  onMaxTempChange: (value: string) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  enableVoice?: boolean;
}

export function TemperatureRangeInput({
  id,
  label,
  minTemp,
  maxTemp,
  onMinTempChange,
  onMaxTempChange,
  required = false,
  isFlagged = false,
  flagMessage,
  enableVoice = false,
}: TemperatureRangeInputProps) {
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
        onMinTempChange("10");
        onMaxTempChange("35");
      }, 3000);
    }
  };

  const handleMinTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    if (value === "" || isNaN(numValue)) {
      onMinTempChange(value);
      return;
    }

    if (numValue < -50 || numValue > 100) {
      return;
    }

    onMinTempChange(value);
  };

  const handleMaxTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    if (value === "" || isNaN(numValue)) {
      onMaxTempChange(value);
      return;
    }

    if (numValue < -50 || numValue > 100) {
      return;
    }

    onMaxTempChange(value);
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label
            htmlFor={`${id}-min`}
            className="text-xs text-muted-foreground"
          >
            Min Temperature
          </Label>
          <div className="relative">
            <Input
              id={`${id}-min`}
              type="number"
              value={minTemp}
              onChange={handleMinTempChange}
              placeholder="-20"
              min={-50}
              max={100}
              step={0.1}
              className={cn(
                "survey-input pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              °C
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor={`${id}-max`}
            className="text-xs text-muted-foreground"
          >
            Max Temperature
          </Label>
          <div className="relative">
            <Input
              id={`${id}-max`}
              type="number"
              value={maxTemp}
              onChange={handleMaxTempChange}
              placeholder="50"
              min={-50}
              max={100}
              step={0.1}
              className={cn(
                "survey-input pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              °C
            </div>
          </div>
        </div>
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
