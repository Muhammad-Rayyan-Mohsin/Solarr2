import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ToggleInputProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  description?: string;
}

export function ToggleInput({
  id,
  label,
  value,
  onChange,
  readOnly = false,
  required = false,
  isFlagged = false,
  flagMessage,
  description
}: ToggleInputProps) {
  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
            {readOnly && <span className="text-xs text-muted-foreground ml-2">(Auto-calculated)</span>}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        
        <Toggle
          id={id}
          pressed={value}
          onPressedChange={readOnly ? undefined : onChange}
          disabled={readOnly}
          className={cn(
            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
            readOnly && "opacity-50 cursor-not-allowed",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        >
          {value ? "Yes" : "No"}
        </Toggle>
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

