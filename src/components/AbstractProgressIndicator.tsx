import React, { useState } from "react";
import { CheckCircle, Circle, AlertTriangle, Clock, FileText, Home, Zap, Battery, Shield, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SectionProgress {
  id: string;
  title: string;
  completed: number;
  total: number;
  status: "completed" | "in-progress" | "pending" | "flagged";
  flaggedFields?: number;
  estimatedTime?: string;
  icon?: React.ReactNode;
}

interface AbstractProgressIndicatorProps {
  sections: SectionProgress[];
  currentSection?: string;
  overallProgress: number;
  className?: string;
}

// Section icons mapping
const sectionIcons: Record<string, React.ReactNode> = {
  "general": <FileText className="h-4 w-4" />,
  "electricity": <Zap className="h-4 w-4" />,
  "property": <Home className="h-4 w-4" />,
  "roof": <Home className="h-4 w-4" />,
  "loft": <Home className="h-4 w-4" />,
  "electrical": <Zap className="h-4 w-4" />,
  "battery": <Battery className="h-4 w-4" />,
  "safety": <Shield className="h-4 w-4" />,
  "preferences": <Settings className="h-4 w-4" />,
  "summary": <FileText className="h-4 w-4" />,
};

export function AbstractProgressIndicator({
  sections,
  currentSection,
  overallProgress,
  className,
}: AbstractProgressIndicatorProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const getSectionIcon = (section: SectionProgress) => {
    const baseIcon = sectionIcons[section.id] || <Circle className="h-4 w-4" />;
    
    switch (section.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-black" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSectionColor = (section: SectionProgress) => {
    switch (section.status) {
      case "completed":
        return "bg-green-500";
      case "flagged":
        return "bg-orange-500";
      case "in-progress":
        return "bg-black";
      default:
        return "bg-gray-300";
    }
  };

  const getProgressGradient = () => {
    const completedCount = sections.filter(s => s.status === "completed").length;
    const inProgressCount = sections.filter(s => s.status === "in-progress").length;
    const flaggedCount = sections.filter(s => s.status === "flagged").length;
    
    if (completedCount === 0) {
      return "from-gray-300 to-gray-300";
    }
    
    const total = sections.length;
    const completedPercent = (completedCount / total) * 100;
    const inProgressPercent = (inProgressCount / total) * 100;
    const flaggedPercent = (flaggedCount / total) * 100;
    
    if (flaggedCount > 0) {
      return "from-green-500 via-orange-500 to-gray-300";
    } else if (inProgressCount > 0) {
      return "from-green-500 via-black to-gray-300";
    } else {
      return "from-green-500 to-gray-300";
    }
  };

  const completedSections = sections.filter(s => s.status === "completed").length;
  const flaggedSections = sections.filter(s => s.status === "flagged").length;

  return (
    <TooltipProvider>
      <div className={cn("w-full", className)}>
        {/* Main Progress Bar */}
        <div className="relative">
          {/* Background Track */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Progress Fill with Gradient */}
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                `bg-gradient-to-r ${getProgressGradient()}`
              )}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {/* Section Icons */}
          <div className="flex justify-between items-center mt-3 -mx-1">
            {sections.map((section, index) => {
              const position = (index / (sections.length - 1)) * 100;
              const isHovered = hoveredSection === section.id;
              
              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative mobile-progress-circle transition-all duration-300 cursor-pointer",
                        "hover:scale-110 hover:shadow-lg",
                        getSectionColor(section),
                        section.status === "completed" && "shadow-md",
                        section.status === "flagged" && "animate-pulse",
                        section.status === "in-progress" && "ring-2 ring-gray-200 dark:ring-gray-800",
                        isHovered && "scale-110 shadow-lg"
                      )}
                      style={{ 
                        position: 'absolute',
                        left: `${position}%`,
                        transform: 'translateX(-50%)',
                        top: '-12px'
                      }}
                      onMouseEnter={() => setHoveredSection(section.id)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <div className="text-white">
                        {getSectionIcon(section)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">{section.title}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {section.completed}/{section.total} questions completed
                      </div>
                      {section.flaggedFields && section.flaggedFields > 0 && (
                        <div className="text-xs text-orange-600">
                          {section.flaggedFields} flagged field{section.flaggedFields !== 1 ? 's' : ''}
                        </div>
                      )}
                      {section.estimatedTime && (
                        <div className="text-xs text-blue-600">
                          Est. {section.estimatedTime}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Progress Summary */}
      </div>
    </TooltipProvider>
  );
}
