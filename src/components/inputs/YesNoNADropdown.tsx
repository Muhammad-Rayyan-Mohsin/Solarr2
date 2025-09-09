import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type YesNoNAValue = "yes" | "no" | "na";

interface YesNoNADropdownProps {
  id: string;
  label: string;
  value: YesNoNAValue | null;
  onChange: (value: YesNoNAValue) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  placeholder?: string;
}

const options: { value: YesNoNAValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "na", label: "N/A" }
];

export function YesNoNADropdown({
  id,
  label,
  value,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage,
  placeholder = "Select..."
}: YesNoNADropdownProps) {
  return (
    <div className={cn("space-y-3", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-base font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            "h-11 text-base rounded-lg",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border shadow-lg z-50">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-muted cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
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