import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface YesNoNADropdownProps {
  id: string;
  label: string;
  value: "yes" | "no" | "na" | null;
  onChange: (value: "yes" | "no" | "na" | null) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  description?: string;
}

export function YesNoNADropdown({
  id,
  label,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  isFlagged = false,
  flagMessage,
  description,
}: YesNoNADropdownProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === "yes" || newValue === "no" || newValue === "na") {
      onChange(newValue);
    } else {
      onChange(null);
    }
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Select value={value || ""} onValueChange={handleValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            "enhanced-select mobile-select",
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
          <SelectItem value="na">N/A</SelectItem>
        </SelectContent>
      </Select>
      {isFlagged && flagMessage && (
        <p className="text-sm text-destructive">{flagMessage}</p>
      )}
    </div>
  );
}