import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitSurveyButtonProps {
  formData: any;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SubmitSurveyButton({ formData, onSubmit, isSubmitting }: SubmitSurveyButtonProps) {
  // Calculate completion percentage
  const requiredFields = [
    'surveyorName', 'customerName', 'siteAddress', 'postcode', 'gridReference',
    'phone', 'email', 'surveyDate'
  ];
  
  const completedFields = requiredFields.filter(field => 
    formData[field] && formData[field].toString().trim() !== ''
  ).length;
  
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
  const isComplete = completionPercentage >= 80; // 80% completion required

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Compact Completion Status */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Completion:</span>
        <Badge variant={isComplete ? "default" : "outline"} className="text-xs">
          {completionPercentage}%
        </Badge>
        <span className="text-xs text-muted-foreground">
          ({completedFields}/{requiredFields.length} fields)
        </span>
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
      {!isComplete && (
        <div className="flex items-center gap-2 text-yellow-600 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Complete required fields to submit</span>
        </div>
      )}

      {isComplete && !isSubmitting && (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle className="h-3 w-3" />
          <span>Ready to submit</span>
        </div>
      )}
    </div>
  );
}
