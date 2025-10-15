import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  name: string;
  completed: number;
  total: number;
  flagged?: number;
}

interface EnhancedProgressIndicatorProps {
  sections: Section[];
  currentSection?: string;
  onSectionClick?: (sectionId: string) => void;
  showFlagged?: boolean;
}

export function EnhancedProgressIndicator({
  sections,
  currentSection,
  onSectionClick,
  showFlagged = true
}: EnhancedProgressIndicatorProps) {
  const totalFields = sections.reduce((sum, section) => sum + section.total, 0);
  const completedFields = sections.reduce((sum, section) => sum + section.completed, 0);
  const flaggedFields = sections.reduce((sum, section) => sum + (section.flagged || 0), 0);
  const overallProgress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl">Survey Progress</h3>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: "hsl(174.7 83.9% 31.6%)" }}>
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {completedFields} of {totalFields}
                </div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-4" />
          </div>

          {/* Flags Summary */}
          {showFlagged && flaggedFields > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {flaggedFields} field{flaggedFields !== 1 ? 's' : ''} require{flaggedFields === 1 ? 's' : ''} attention
              </span>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-3">
            {sections.map((section) => {
              const sectionProgress =
                section.total > 0 ? (section.completed / section.total) * 100 : 0;
              const isComplete = section.completed === section.total && section.total > 0;
              const isCurrent = currentSection === section.id;
              const hasFlagged = (section.flagged || 0) > 0;

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionClick?.(section.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    isCurrent && "border-[hsl(174.7,83.9%,31.6%)] bg-[hsl(174.7,83.9%,31.6%)]/5 shadow-md",
                    !isCurrent && isComplete && "border-green-200 bg-green-50",
                    !isCurrent && !isComplete && "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Circle className="h-6 w-6 text-[hsl(174.7,83.9%,31.6%)] flex-shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300 flex-shrink-0" />
                      )}
                      <div>
                        <span className={cn(
                          "font-semibold block",
                          isCurrent && "text-[hsl(174.7,83.9%,31.6%)]",
                          isComplete && !isCurrent && "text-green-700"
                        )}>
                          {section.name}
                        </span>
                        {hasFlagged && (
                          <span className="text-xs text-yellow-600 font-medium flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {section.flagged} flagged
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {section.completed}/{section.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(sectionProgress)}%
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={sectionProgress} 
                    className={cn(
                      "h-2",
                      isCurrent && "[&>div]:bg-[hsl(174.7,83.9%,31.6%)]"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
