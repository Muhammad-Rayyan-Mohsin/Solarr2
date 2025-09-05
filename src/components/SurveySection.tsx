import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SurveySectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  completedFields: number;
  totalFields: number;
  flaggedFields: number;
  children: React.ReactNode;
}

export function SurveySection({
  title,
  isOpen,
  onToggle,
  completedFields,
  totalFields,
  flaggedFields,
  children,
}: SurveySectionProps) {
  const hasFlags = flaggedFields > 0;

  const completionPercentage =
    totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
      } else {
        setContentHeight(0);
      }
    }
  }, [isOpen, children]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 sm:p-6 text-left transition-colors hover:bg-muted/50",
          hasFlags && "border-l-4 border-l-warning"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            )}
            <h2
              className={cn(
                "text-base sm:text-xl font-semibold truncate",
                hasFlags ? "text-warning" : "text-foreground"
              )}
            >
              {title}
            </h2>
          </div>

          {hasFlags && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
              <span className="text-xs sm:text-sm text-warning font-medium hidden sm:inline">
                {flaggedFields} flag{flaggedFields !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-warning font-medium sm:hidden">
                {flaggedFields}
              </span>
            </div>
          )}
        </div>

        {/* Completion Count */}
        <div className="flex-shrink-0">
          <Badge variant="secondary" className="tabular-nums text-xs">
            {completedFields}/{totalFields}
          </Badge>
        </div>
      </button>

      <div
        className={cn(
          "accordion-content overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-4 sm:space-y-6">{children}</div>
      </div>
    </div>
  );
}
