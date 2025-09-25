import React, { useState } from "react";
import PhoneInput from "react-phone-number-input";
import { Phone, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  defaultCountry?: string;
  className?: string;
}

export function PhoneInputComponent({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  isFlagged = false,
  flagMessage,
  defaultCountry = "GB",
  className,
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = (phoneValue: string | undefined) => {
    const phoneString = phoneValue || "";
    onChange(phoneString);
    
    // Basic validation - check if it's a valid phone number format
    if (phoneString) {
      const isValidFormat = phoneString.length >= 10 && phoneString.length <= 15;
      setIsValid(isValidFormat);
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        <span className="text-xs text-muted-foreground ml-2">
          (auto-formatted)
        </span>
      </Label>

      <div className="relative">
        <PhoneInput
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          defaultCountry={defaultCountry as any}
          international
          countryCallingCodeEditable={true}
          addInternationalOption={true}
          className={cn(
            "phone-input-container",
            isFlagged && "phone-input-flagged"
          )}
          inputComponent={({ className, ...props }) => (
            <input
              {...props}
              disabled={false}
              readOnly={false}
              className={cn(
                "enhanced-input",
                isFlagged && "border-destructive focus:ring-destructive/50",
                isValid === true && "border-green-500 focus:ring-green-500/50",
                isValid === false && "border-orange-500 focus:ring-orange-500/50"
              )}
            />
          )}
        />
        
        {/* Validation indicator */}
        {value && isValid !== null && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        )}
      </div>

      {/* Validation message */}
      {value && isValid === false && (
        <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Please enter a valid phone number
          </div>
        </div>
      )}

      {isFlagged && flagMessage && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-destructive rounded-full" />
            {flagMessage}
          </div>
        </div>
      )}
    </div>
  );
}
