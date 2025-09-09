import { useState } from "react";
import { Calendar, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface DateRangeInputProps {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  customerAway: boolean;
  onCustomerAwayChange: (value: boolean) => void;
  awayNotes: string;
  onAwayNotesChange: (value: string) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  enableVoice?: boolean;
}

export function DateRangeInput({
  id,
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  customerAway,
  onCustomerAwayChange,
  awayNotes,
  onAwayNotesChange,
  required = false,
  isFlagged = false,
  flagMessage,
  enableVoice = false,
}: DateRangeInputProps) {
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
        onAwayNotesChange("Customer will be away during this period");
      }, 3000);
    }
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-md font-medium text-foreground">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          {/* <Label
            htmlFor={`${id}-start`}
            className="text-xs text-muted-foreground"
          >
            Start Date
          </Label> */}
          <div className="relative">
            <Input
              id={`${id}-start`}
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={cn(
                "survey-input",
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
            {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
          </div>
        </div>

        <div className="space-y-2">
          {/* <Label
            htmlFor={`${id}-end`}
            className="text-xs text-muted-foreground"
          >
            End Date
          </Label> */}
          <div className="relative">
            <Input
              id={`${id}-end`}
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={cn(
                "survey-input",
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
            {/* <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${id}-away`}
            checked={customerAway}
            onCheckedChange={onCustomerAwayChange}
          />
          <Label
            htmlFor={`${id}-away`}
            className="text-sm font-medium cursor-pointer"
          >
            Customer away during this period
          </Label>
        </div>

        {customerAway && (
          <Input
            placeholder="Notes about customer absence..."
            value={awayNotes}
            onChange={(e) => onAwayNotesChange(e.target.value)}
            className="survey-input"
          />
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
