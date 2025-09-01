import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxInputProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

export function CheckboxInput({
  id,
  label,
  checked,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage
}: CheckboxInputProps) {
  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          className={cn(
            isFlagged && "border-destructive focus:ring-destructive/50"
          )}
        />
        <Label 
          htmlFor={id} 
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      
      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
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
