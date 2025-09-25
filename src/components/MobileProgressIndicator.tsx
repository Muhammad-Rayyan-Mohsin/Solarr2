import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProgress {
  id: string;
  title: string;
  completed: number;
  total: number;
  status: "completed" | "in-progress" | "pending" | "flagged";
}

interface MobileProgressIndicatorProps {
  sections: SectionProgress[];
  currentSection?: string;
  overallProgress: number;
  className?: string;
}

export function MobileProgressIndicator({
  sections,
  currentSection,
  overallProgress,
  className,
}: MobileProgressIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSections = sections.filter(s => s.status === "completed").length;
  const totalSections = sections.length;

  const getStatusIcon = (section: SectionProgress) => {
    switch (section.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "in-progress":
        return <Circle className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn("bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm p-4 md:hidden", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="mobile-section-title text-gray-900">Survey Progress</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mobile-button rounded-xl"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="mobile-label text-gray-600">Overall Progress</span>
          <span className="mobile-label font-semibold text-gray-900">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="mobile-progress">
          <div 
            className="mobile-progress-bar"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Section Details */}
      {isExpanded && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          {sections.map((section) => (
            <div
              key={section.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl transition-colors",
                section.id === currentSection && "bg-primary/10"
              )}
            >
              {getStatusIcon(section)}
              <div className="flex-1 min-w-0">
                <p className="mobile-label font-medium text-gray-900">
                  {section.title}
                </p>
                <p className="mobile-caption text-gray-500 hidden sm:block">
                  {section.completed}/{section.total} questions
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ 
                      width: `${section.total > 0 ? (section.completed / section.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
