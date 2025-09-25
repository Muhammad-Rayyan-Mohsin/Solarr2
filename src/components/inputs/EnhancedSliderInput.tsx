import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface EnhancedSliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  showLabels?: boolean;
  showInput?: boolean;
  showButtons?: boolean;
  presetValues?: number[];
  className?: string;
  description?: string;
}

export function EnhancedSliderInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  required = false,
  isFlagged = false,
  flagMessage,
  showLabels = true,
  showInput = true,
  showButtons = true,
  presetValues = [],
  className,
  description,
}: EnhancedSliderInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = (newValue: number[]) => {
    const val = newValue[0];
    onChange(val);
    setInputValue(val.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleInputBlur = () => {
    const numVal = parseFloat(inputValue);
    if (isNaN(numVal) || numVal < min || numVal > max) {
      setInputValue(value.toString());
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue);
    setInputValue(presetValue.toString());
  };

  const getPercentage = () => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator", className)}>
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
          {unit && <span className="text-xs text-muted-foreground ml-2">({unit})</span>}
        </Label>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Value Display */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-foreground">
          {value}{unit}
        </div>
        {showLabels && (
          <div className="flex justify-between w-full max-w-xs text-xs text-muted-foreground">
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
        
        {/* Progress indicator */}
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-200"
            style={{ width: `${getPercentage()}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {showButtons && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={value <= min}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              disabled={value >= max}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showInput && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              min={min}
              max={max}
              step={step}
              className="enhanced-input w-20 h-8 text-center"
            />
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
        )}
      </div>

      {/* Preset Values */}
      {presetValues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Quick select:</p>
          <div className="flex flex-wrap gap-2">
            {presetValues.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={value === preset ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="h-7 px-3 text-xs"
              >
                {preset}{unit}
              </Button>
            ))}
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
