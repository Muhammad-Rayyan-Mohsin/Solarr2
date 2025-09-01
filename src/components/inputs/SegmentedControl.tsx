import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SegmentedValue = "yes" | "no" | "na";

interface SegmentedControlProps {
  id: string;
  label: string;
  value: SegmentedValue | null;
  onChange: (value: SegmentedValue) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

const options: { value: SegmentedValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "na", label: "N/A" }
];

export function SegmentedControl({
  id,
  label,
  value,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage
}: SegmentedControlProps) {
  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="segmented-control">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 px-6 py-3 text-base font-medium rounded-md transition-all duration-200",
              value === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      
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