import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DropdownSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

export function DropdownSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  isFlagged = false,
  flagMessage
}: DropdownSelectProps) {
  return (
    <div className={cn("space-y-3", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            "enhanced-select mobile-select",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
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