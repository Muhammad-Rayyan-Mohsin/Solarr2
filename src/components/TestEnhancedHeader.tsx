import { EnhancedSurveyHeader } from "@/components/EnhancedSurveyHeader";

interface TestEnhancedHeaderProps {
  progress?: number;
  completedFields?: number;
  totalFields?: number;
}

/**
 * Test Enhanced Header
 * Test version of the enhanced survey header
 */
export function TestEnhancedHeader({
  progress = 50,
  completedFields = 25,
  totalFields = 50
}: TestEnhancedHeaderProps) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Testing Enhanced Header</h2>
      <EnhancedSurveyHeader
        progress={progress}
        completedFields={completedFields}
        totalFields={totalFields}
      />
    </div>
  );
}
