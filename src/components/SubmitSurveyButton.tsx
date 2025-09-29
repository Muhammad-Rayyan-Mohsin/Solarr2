import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Send, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitSurveyButtonProps {
  formData: any;
  onSubmit: () => void;
  isSubmitting: boolean;
  missingFields?: string[];
  invalidFields?: string[];
}

export function SubmitSurveyButton({ 
  formData, 
  onSubmit, 
  isSubmitting,
  missingFields = [],
  invalidFields = []
}: SubmitSurveyButtonProps) {
  // Calculate completion based on actual validation
  const totalIssues = missingFields.length + invalidFields.length;
  const isComplete = totalIssues === 0;
  
  // Estimate total required fields (approximate)
  const estimatedTotalFields = 45; // Approximate count from all sections
  const completedFields = Math.max(0, estimatedTotalFields - missingFields.length);
  const completionPercentage = Math.round((completedFields / estimatedTotalFields) * 100);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Compact Completion Status */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Completion:</span>
        <Badge variant={isComplete ? "default" : "outline"} className="text-xs">
          {completionPercentage}%
        </Badge>
        {totalIssues > 0 && (
          <span className="text-xs text-muted-foreground">
            ({totalIssues} {totalIssues === 1 ? 'issue' : 'issues'})
          </span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!isComplete || isSubmitting}
        variant="outline"
        className={cn(
          "h-10 sm:h-11 text-sm",
          isComplete && !isSubmitting && "border-green-600 text-green-600 hover:bg-green-50"
        )}
        size="default"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Submit Survey
          </>
        )}
      </Button>

      {/* Status Messages */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 text-yellow-600 text-xs max-w-md">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Missing required fields ({missingFields.length}):</div>
            <div className="mt-1 text-yellow-700">{missingFields.slice(0, 3).join(", ")}
              {missingFields.length > 3 && ` and ${missingFields.length - 3} more`}
            </div>
          </div>
        </div>
      )}

      {invalidFields.length > 0 && (
        <div className="flex items-start gap-2 text-red-600 text-xs max-w-md">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Invalid formats ({invalidFields.length}):</div>
            <div className="mt-1 text-red-700">{invalidFields.slice(0, 3).join(", ")}
              {invalidFields.length > 3 && ` and ${invalidFields.length - 3} more`}
            </div>
          </div>
        </div>
      )}

      {isComplete && !isSubmitting && (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle className="h-3 w-3" />
          <span>All required fields complete - Ready to submit</span>
        </div>
      )}
    </div>
  );
}
