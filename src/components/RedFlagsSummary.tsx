import { useState } from "react";
import { ChevronUp, ChevronDown, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RedFlag {
  id: string;
  section: string;
  field: string;
  message: string;
  severity: "low" | "medium" | "high";
}

interface RedFlagsSummaryProps {
  flags: RedFlag[];
  onJumpToField: (fieldId: string) => void;
}

export function RedFlagsSummary({ flags, onJumpToField }: RedFlagsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (flags.length === 0) return null;

  const getSeverityColor = (severity: RedFlag["severity"]) => {
    switch (severity) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-muted-foreground";
    }
  };

  const getSeverityBg = (severity: RedFlag["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-destructive/10 border-destructive/20";
      case "medium":
        return "bg-warning/10 border-warning/20";
      case "low":
        return "bg-muted/50 border-border";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span className="font-medium text-foreground">
            ⚠️ Red Flags ({flags.length})
          </span>
          {flags.some(flag => flag.severity === "high") && (
            <span className="px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full">
              High Priority
            </span>
          )}
        </div>
        
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 space-y-3 max-h-80 overflow-y-auto">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className={cn(
                "flex items-start justify-between p-3 rounded-lg border",
                getSeverityBg(flag.severity)
              )}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">
                    {flag.section}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {flag.field}
                  </span>
                  <span className={cn("text-xs font-medium", getSeverityColor(flag.severity))}>
                    {flag.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {flag.message}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onJumpToField(flag.id)}
                className="ml-4 h-8 w-8 p-0 shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Jump to field</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}