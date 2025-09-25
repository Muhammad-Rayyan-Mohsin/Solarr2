import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAccordionScroll } from "@/hooks/use-accordion-scroll";

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
  const { preventScrollDuringAnimation } = useAccordionScroll();

  const completionPercentage =
    totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
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

  const scrollToSection = () => {
    if (sectionRef.current) {
      const elementTop = sectionRef.current.offsetTop;
      const offset = 80; // Account for any fixed headers
      
      window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
    }
  };

  const handleToggle = () => {
    const wasOpen = isOpen;
    preventScrollDuringAnimation(() => {
      onToggle();
      
      // If section is being opened (not closed), scroll to it
      if (!wasOpen) {
        // Use setTimeout to ensure the section has expanded before scrolling
        setTimeout(() => {
          scrollToSection();
        }, 100);
      }
    });
  };

  return (
    <div ref={sectionRef} className="survey-section rounded-lg sm:rounded-xl border border-border bg-card shadow-sm mb-6">
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between text-left transition-colors hover:bg-muted/50 active:bg-muted/70 touch-target-section",
          "px-6 py-4 sm:px-8 sm:py-5", // Consistent padding using 8px scale
          hasFlags && "border-l-4 border-l-warning"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <h2
              className={cn(
                "text-lg font-semibold",
                hasFlags ? "text-warning" : ""
              )}
            >
              {title}
            </h2>
          </div>

          {hasFlags && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning font-medium hidden sm:inline">
                {flaggedFields} flag{flaggedFields !== 1 ? "s" : ""}
              </span>
              <span className="text-sm text-warning font-medium sm:hidden">
                {flaggedFields}
              </span>
            </div>
          )}
        </div>

        {/* Completion Count - Hidden on mobile */}
        <div className="flex-shrink-0 ml-4 hidden sm:block">
          <Badge variant="secondary" className="tabular-nums text-xs px-3 py-1">
            {completedFields}/{totalFields}
          </Badge>
        </div>
      </button>

      <div
        className={cn(
          "accordion-content transition-all duration-300 ease-out",
          isOpen ? "max-h-none opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8 component-spacing text-sm sm:text-base">{children}</div>
      </div>
    </div>
  );
}
