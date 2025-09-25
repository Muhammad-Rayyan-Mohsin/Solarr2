import React from "react";
import { Label } from "@/components/ui/label";

interface SimplePhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function SimplePhoneInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
}: SimplePhoneInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <input
        id={id}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="enhanced-input w-full"
        required={required}
      />
    </div>
  );
}
