import { SurveyHeader } from "@/components/SurveyHeader";

interface EnhancedSurveyHeaderProps {
  progress: number;
  completedFields: number;
  totalFields: number;
  onExport?: () => void;
}

/**
 * Enhanced Survey Header
 * Extends the standard survey header with additional features
 */
export function EnhancedSurveyHeader({
  progress,
  completedFields,
  totalFields,
  onExport
}: EnhancedSurveyHeaderProps) {
  return (
    <SurveyHeader
      progress={progress}
      completedFields={completedFields}
      totalFields={totalFields}
      onExport={onExport}
    />
  );
}
