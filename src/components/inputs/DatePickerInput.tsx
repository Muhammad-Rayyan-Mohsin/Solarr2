import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export function DatePickerInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  isFlagged = false,
  flagMessage,
  showTimeSelect = false,
  timeFormat = "HH:mm",
  dateFormat = "dd/MM/yyyy",
  minDate,
  maxDate,
  disabled = false,
  className,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert string value to Date object
  const selectedDate = value ? new Date(value) : null;

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Convert to ISO string for storage
      const isoString = date.toISOString();
      onChange(isoString);
    } else {
      onChange("");
    }
  };

  const formatDisplayValue = (dateString: string) => {
    if (!dateString) return "";
    
    // Handle both ISO string and date-only string formats
    let date: Date;
    if (dateString.includes('T')) {
      // ISO string format
      date = new Date(dateString);
    } else {
      // Date-only string format (YYYY-MM-DD)
      date = new Date(dateString + 'T00:00:00');
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }
    
    if (showTimeSelect) {
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {showTimeSelect && (
          <span className="text-xs text-muted-foreground ml-2">
            (includes time)
          </span>
        )}
      </Label>

      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          onCalendarOpen={() => setIsOpen(true)}
          onCalendarClose={() => setIsOpen(false)}
          placeholderText={placeholder}
          dateFormat={showTimeSelect ? `${dateFormat} ${timeFormat}` : dateFormat}
          showTimeSelect={showTimeSelect}
          showTimeSelectOnly={false}
          timeFormat={timeFormat}
          timeIntervals={15}
          timeCaption="Time"
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          customInput={
            <div className="relative">
              <input
                id={id}
                value={formatDisplayValue(value)}
                placeholder={placeholder}
                readOnly
                className={cn(
                  "enhanced-input pr-10",
                  isFlagged && "border-destructive focus:ring-destructive/50"
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
              >
                {showTimeSelect ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showTimeSelect ? "Select date and time" : "Select date"}
                </span>
              </Button>
            </div>
          }
          popperClassName="react-datepicker-popper"
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ]}
        />
      </div>

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
