import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAccordionScroll } from "@/hooks/use-accordion-scroll";
import { motion, AnimatePresence } from "framer-motion";

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
  const sectionRef = useRef<HTMLDivElement>(null);

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
        // Increased delay to account for framer-motion animation
        setTimeout(() => {
          scrollToSection();
        }, 200);
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
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </motion.div>
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

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                opacity: { duration: 0.3, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                opacity: { duration: 0.2 }
              }
            }}
            className="accordion-content overflow-hidden"
          >
            <motion.div 
              initial={{ y: -10 }}
              animate={{ 
                y: 0,
                transition: { duration: 0.3, delay: 0.15, ease: "easeOut" }
              }}
              exit={{ y: -10, transition: { duration: 0.2 } }}
              className="px-6 py-6 sm:px-8 sm:py-8 component-spacing text-sm sm:text-base"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
