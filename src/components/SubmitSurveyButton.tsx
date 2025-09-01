import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="w-full max-w-md">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Submit Survey</h3>
          <p className="text-sm text-gray-600 mb-4">
            Submit your survey data to the database
          </p>
        </div>

        {/* Completion Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Completion</span>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {completionPercentage}%
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isComplete ? "bg-green-500" : "bg-yellow-500"
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-500">
            {completedFields} of {requiredFields.length} required fields completed
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className={cn(
            "w-full",
            isComplete ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
          )}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Survey
            </>
          )}
        </Button>

        {/* Status Messages */}
        {!isComplete && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Please complete required fields before submitting</span>
          </div>
        )}

        {isComplete && !isSubmitting && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Survey ready to submit</span>
          </div>
        )}

        {/* Data Preview */}
        <div className="text-xs text-gray-500 space-y-1">
          <div><strong>Surveyor:</strong> {formData.surveyorName || 'Not specified'}</div>
          <div><strong>Customer:</strong> {formData.customerName || 'Not specified'}</div>
          <div><strong>Address:</strong> {formData.siteAddress || 'Not specified'}</div>
          <div><strong>Date:</strong> {formData.surveyDate || 'Not specified'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
