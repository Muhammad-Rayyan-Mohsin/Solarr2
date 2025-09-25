import { useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { What3WordsApiService } from "@/services/what3wordsApi";
import { useToast } from "@/hooks/use-toast";

interface What3WordsInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  onCoordinatesFound?: (lat: number, lng: number) => void;
}

export function What3WordsInput({
  id,
  label,
  value,
  onChange,
  placeholder = "///word.word.word",
  required = false,
  isFlagged = false,
  flagMessage,
  onCoordinatesFound,
}: What3WordsInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateAndConvert = async () => {
    if (!value.trim()) return;

    setIsValidating(true);
    
    try {
      // Format the input to ensure proper what3words format
      const formattedWords = What3WordsApiService.formatWords(value);
      
      // Validate format first
      if (!What3WordsApiService.validateWords(formattedWords)) {
        toast({
          title: "Invalid Format",
          description: "Please enter a valid what3words address (e.g., ///word.word.word)",
          variant: "destructive",
        });
        return;
      }

      // Convert to coordinates
      const result = await What3WordsApiService.convertToCoordinates(formattedWords);
      
      // Update the input with the properly formatted words
      onChange(result.words);
      
      // Notify parent component of the coordinates
      if (onCoordinatesFound) {
        onCoordinatesFound(result.coordinates.lat, result.coordinates.lng);
      }
      
      toast({
        title: "Location Found",
        description: `${result.words} → ${result.nearestPlace}`,
      });
      
    } catch (error) {
      console.error('What3Words conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "Could not convert what3words address. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputBlur = () => {
    if (value.trim() && What3WordsApiService.validateWords(What3WordsApiService.formatWords(value))) {
      validateAndConvert();
    }
  };

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={cn(
              "pl-4 pr-4",
              isFlagged && "border-warning focus:border-warning focus:ring-warning"
            )}
            required={required}
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={validateAndConvert}
          disabled={isValidating || !value.trim()}
          className="px-3"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isFlagged && flagMessage && (
        <p className="text-sm text-warning font-medium">{flagMessage}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Enter a what3words address for precise location (e.g., ///filled.count.soap)
      </p>
    </div>
  );
}
