import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FlaggedIssue {
  id: string;
  section: string;
  field: string;
  message: string;
  severity: "low" | "medium" | "high";
}

interface SummaryDisplayProps {
  totalPvCapacity: string;
  totalRoofArea: string;
  flaggedIssuesCount: number;
  flaggedIssues: FlaggedIssue[];
  recommendedActions: string[];
  onJumpToIssue: (issueId: string) => void;
}

export function SummaryDisplay({
  totalPvCapacity,
  totalRoofArea,
  flaggedIssuesCount,
  flaggedIssues,
  recommendedActions,
  onJumpToIssue
}: SummaryDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-yellow-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Auto-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Total Estimated PV Capacity
              </Label>
              <div className="text-2xl font-bold text-primary">
                {totalPvCapacity || "0"} kWp
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Total Available Roof Area
              </Label>
              <div className="text-2xl font-bold text-primary">
                {totalRoofArea || "0"} m²
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Flagged Issues Count
            </Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={flaggedIssuesCount > 0 ? "destructive" : "secondary"}
                className="text-lg px-3 py-1"
              >
                {flaggedIssuesCount}
              </Badge>
              {flaggedIssuesCount === 0 && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  All clear!
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {flaggedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Flagged Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flaggedIssues.map((issue) => (
                <div 
                  key={issue.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{issue.section}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-sm">{issue.field}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.message}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onJumpToIssue(issue.id)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Recommended Next Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendedActions.length > 0 ? (
              recommendedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific actions required at this time.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

