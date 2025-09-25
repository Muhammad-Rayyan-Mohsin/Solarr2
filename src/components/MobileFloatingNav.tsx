import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Home, FileText, Zap, Battery, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

interface MobileFloatingNavProps {
  sections: Section[];
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  className?: string;
}

export function MobileFloatingNav({
  sections,
  currentSection,
  onSectionChange,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  className,
}: MobileFloatingNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "general": return <FileText className="h-4 w-4" />;
      case "electricity": return <Zap className="h-4 w-4" />;
      case "property": return <Home className="h-4 w-4" />;
      case "roof": return <Home className="h-4 w-4" />;
      case "loft": return <Home className="h-4 w-4" />;
      case "electrical": return <Zap className="h-4 w-4" />;
      case "battery": return <Battery className="h-4 w-4" />;
      case "safety": return <Shield className="h-4 w-4" />;
      case "preferences": return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const currentSectionData = sections[currentIndex];

  return (
    <div className={cn("fixed bottom-4 left-4 right-4 z-50 md:hidden", className)}>
      {/* Main Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-2">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="mobile-button rounded-xl"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* Current Section */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 mx-2 mobile-button rounded-xl"
          >
            <div className="flex items-center gap-2">
              {getSectionIcon(currentSection)}
              <span className="mobile-label font-medium">
                {currentSectionData?.title || "Survey"}
              </span>
            </div>
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={!canGoNext}
            className="mobile-button rounded-xl"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Section List */}
      {isExpanded && (
        <div className="mt-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSectionChange(section.id);
                  setIsExpanded(false);
                }}
                className={cn(
                  "w-full justify-start mobile-button rounded-xl",
                  section.id === currentSection && "bg-primary/10 text-primary",
                  section.completed && "text-green-600"
                )}
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon(section.id)}
                  <span className="mobile-label font-medium">{section.title}</span>
                  {section.completed && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
