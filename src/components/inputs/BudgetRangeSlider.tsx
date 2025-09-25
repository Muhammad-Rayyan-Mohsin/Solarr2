import React, { useState } from "react";
import { EnhancedSliderInput } from "./EnhancedSliderInput";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BudgetRangeSliderProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  className?: string;
}

const budgetRanges = [
  { min: 0, max: 5000, label: "< £5k", value: "under-5k" },
  { min: 5000, max: 8000, label: "£5-8k", value: "5k-8k" },
  { min: 8000, max: 12000, label: "£8-12k", value: "8k-12k" },
  { min: 12000, max: 20000, label: "£12-20k", value: "12k-20k" },
  { min: 20000, max: 50000, label: "£20-50k", value: "20k-50k" },
  { min: 50000, max: 100000, label: "> £50k", value: "over-50k" },
];

export function BudgetRangeSlider({
  id,
  label,
  value,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage,
  className,
}: BudgetRangeSliderProps) {
  const [sliderValue, setSliderValue] = useState(() => {
    const range = budgetRanges.find(r => r.value === value);
    return range ? (range.min + range.max) / 2 : 10000;
  });

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    
    // Find the appropriate budget range
    const range = budgetRanges.find(r => newValue >= r.min && newValue <= r.max);
    if (range) {
      onChange(range.value);
    }
  };

  const getCurrentRange = () => {
    const range = budgetRanges.find(r => r.value === value);
    return range || budgetRanges[2]; // Default to £8-12k
  };

  const currentRange = getCurrentRange();

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="space-y-4">
        {/* Current Selection Display */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {currentRange.label}
            </div>
            <div className="text-sm text-muted-foreground">
              £{currentRange.min.toLocaleString()} - £{currentRange.max.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Enhanced Slider */}
        <EnhancedSliderInput
          id={`${id}-slider`}
          label="Budget Range"
          value={sliderValue}
          onChange={handleSliderChange}
          min={0}
          max={100000}
          step={1000}
          unit="£"
          required={required}
          showLabels={true}
          showInput={true}
          showButtons={false}
          presetValues={[5000, 8000, 12000, 20000, 50000]}
          description="Drag the slider to select your budget range for the solar installation"
        />

        {/* Quick Select Buttons */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Quick select:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {budgetRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => {
                  setSliderValue((range.min + range.max) / 2);
                  onChange(range.value);
                }}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-md border transition-colors",
                  value === range.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
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
