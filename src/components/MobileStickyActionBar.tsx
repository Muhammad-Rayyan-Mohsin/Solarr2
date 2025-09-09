import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MobileStickyActionBarProps {
  progressPercent: number;
  onSave?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  saveLabel?: string;
  nextLabel?: string;
  previousLabel?: string;
  isSaving?: boolean;
  className?: string;
}

export function MobileStickyActionBar({
  progressPercent,
  onSave,
  onNext,
  onPrevious,
  saveLabel = "Save",
  nextLabel = "Next",
  previousLabel = "Previous",
  isSaving = false,
  className,
}: MobileStickyActionBarProps) {
  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-3 sm:hidden",
      "safe-area-pb", // Add safe area padding for phones with home indicators
      className
    )}>
      <div className="container mx-auto">
        {/* Progress bar */}
        <div className="mb-3">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {Math.round(progressPercent)}% complete
            </span>
            {isSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                Saving...
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious} className="h-11 flex-1">
              {previousLabel}
            </Button>
          )}
          
          {onSave && (
            <Button 
              onClick={onSave} 
              disabled={isSaving}
              className="h-11 flex-1"
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          )}
          
          {onNext && (
            <Button onClick={onNext} className="h-11 flex-1">
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
