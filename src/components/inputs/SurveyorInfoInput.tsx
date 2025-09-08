import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SurveyorInfo {
  name: string;
  telephone: string;
  email: string;
}

interface SurveyorInfoInputProps {
  id: string;
  label: string;
  value: SurveyorInfo;
  onChange: (value: SurveyorInfo) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

export function SurveyorInfoInput({
  id,
  label,
  value,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage
}: SurveyorInfoInputProps) {
  const handleChange = (field: keyof SurveyorInfo, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  return (
    <div className={cn("space-y-4", isFlagged && "flag-indicator")}>
      <Label className="text-base font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-name`} className="text-sm font-medium text-muted-foreground">
            Name
          </Label>
          <Input
            id={`${id}-name`}
            type="text"
            value={value.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Surveyor name"
            className={cn(
              "h-11 text-base rounded-lg",
              isFlagged && "border-destructive focus:ring-destructive/50"
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-telephone`} className="text-sm font-medium text-muted-foreground">
            Telephone
          </Label>
          <Input
            id={`${id}-telephone`}
            type="tel"
            value={value.telephone}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="07XXX XXXXXX"
            className={cn(
              "h-11 text-base rounded-lg",
              isFlagged && "border-destructive focus:ring-destructive/50"
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-email`} className="text-sm font-medium text-muted-foreground">
            Email Address
          </Label>
          <Input
            id={`${id}-email`}
            type="email"
            value={value.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="surveyor@company.com"
            className={cn(
              "h-11 text-base rounded-lg",
              isFlagged && "border-destructive focus:ring-destructive/50"
            )}
          />
        </div>
      </div>
      
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