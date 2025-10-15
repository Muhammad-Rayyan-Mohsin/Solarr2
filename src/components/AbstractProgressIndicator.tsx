import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  name: string;
  completed: number;
  total: number;
}

interface AbstractProgressIndicatorProps {
  sections: Section[];
  currentSection?: string;
  onSectionClick?: (sectionId: string) => void;
  variant?: "default" | "minimal" | "detailed";
}

export function AbstractProgressIndicator({
  sections,
  currentSection,
  onSectionClick,
  variant = "default"
}: AbstractProgressIndicatorProps) {
  const totalFields = sections.reduce((sum, section) => sum + section.total, 0);
  const completedFields = sections.reduce((sum, section) => sum + section.completed, 0);
  const overallProgress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  if (variant === "minimal") {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span className="font-medium">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Survey Progress</h3>
          <span className="text-sm font-medium">
            {completedFields} / {totalFields} fields
          </span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Section Progress */}
      {variant === "detailed" && (
        <div className="space-y-3">
          {sections.map((section) => {
            const sectionProgress =
              section.total > 0 ? (section.completed / section.total) * 100 : 0;
            const isComplete = section.completed === section.total && section.total > 0;
            const isCurrent = currentSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick?.(section.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  isCurrent && "border-primary bg-primary/5",
                  !isCurrent && "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {isComplete && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <span className={cn(
                      "font-medium",
                      isCurrent && "text-primary"
                    )}>
                      {section.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {section.completed}/{section.total}
                  </span>
                </div>
                <Progress value={sectionProgress} className="h-2" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
