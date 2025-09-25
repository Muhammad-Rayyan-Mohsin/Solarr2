import React from "react";
import { CheckCircle, Circle, AlertTriangle, Clock, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionProgress {
  id: string;
  title: string;
  completed: number;
  total: number;
  status: "completed" | "in-progress" | "pending" | "flagged";
  flaggedFields?: number;
  estimatedTime?: string;
}

interface EnhancedProgressIndicatorProps {
  sections: SectionProgress[];
  currentSection?: string;
  overallProgress: number;
  className?: string;
  showDetails?: boolean;
  showTimeEstimates?: boolean;
  showFlags?: boolean;
}

export function EnhancedProgressIndicator({
  sections,
  currentSection,
  overallProgress,
  className,
  showDetails = true,
  showTimeEstimates = true,
  showFlags = true,
}: EnhancedProgressIndicatorProps) {
  const completedSections = sections.filter(s => s.status === "completed").length;
  const flaggedSections = sections.filter(s => s.status === "flagged").length;
  const totalSections = sections.length;

  const getSectionIcon = (section: SectionProgress) => {
    switch (section.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "flagged":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSectionStatusColor = (section: SectionProgress) => {
    switch (section.status) {
      case "completed":
        return "text-green-600";
      case "flagged":
        return "text-orange-500";
      case "in-progress":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Survey Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {completedSections}/{totalSections} sections
            </Badge>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium text-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedSections}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {sections.filter(s => s.status === "in-progress").length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{flaggedSections}</div>
            <div className="text-xs text-muted-foreground">Flagged</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {sections.filter(s => s.status === "pending").length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Section Details */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Section Details</h4>
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    currentSection === section.id
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30 border-border/50 hover:bg-muted/50"
                  )}
                >
                  {getSectionIcon(section)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className={cn(
                        "text-sm font-medium truncate",
                        getSectionStatusColor(section)
                      )}>
                        {section.title}
                      </h5>
                      {showFlags && section.flaggedFields && section.flaggedFields > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {section.flaggedFields} flag{section.flaggedFields !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1">
                        <Progress 
                          value={(section.completed / section.total) * 100} 
                          className="h-1"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {section.completed}/{section.total}
                      </span>
                    </div>
                    
                    {showTimeEstimates && section.estimatedTime && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Est. {section.estimatedTime}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {flaggedSections > 0 && (
                <span className="text-orange-500 font-medium">
                  {flaggedSections} section{flaggedSections !== 1 ? "s" : ""} need attention
                </span>
              )}
            </span>
            <span>
              {Math.round(overallProgress)}% complete
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
