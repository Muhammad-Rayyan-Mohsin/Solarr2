import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
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
  children
}: SurveySectionProps) {
  const hasFlags = flaggedFields > 0;
  const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <div className="survey-card">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-10 text-left transition-colors",
          hasFlags && "border-l-4 border-l-warning"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <h2 className={cn(
              "text-xl font-semibold",
              hasFlags ? "text-warning" : "text-foreground"
            )}>
              {title}
            </h2>
          </div>
          
          {hasFlags && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning font-medium">
                {flaggedFields} flag{flaggedFields !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Completion Count */}
        <div className="text-right">
          <div className="inline-flex items-center rounded-full border border-border bg-accent/50 px-3 py-1 text-xs font-medium text-foreground">
            <span className="tabular-nums">
              {completedFields}
            </span>
            <span className="px-1 text-muted-foreground">/</span>
            <span className="tabular-nums">
              {totalFields}
            </span>
          </div>
        </div>

      </button>

      <div
        className={cn(
          "accordion-content overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-10 pb-10 pt-0 space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
}