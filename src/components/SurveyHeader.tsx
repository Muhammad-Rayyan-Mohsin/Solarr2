import { Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProgressIndicator } from "./ProgressIndicator";

interface SurveyHeaderProps {
  customerName: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isOnline: boolean;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  offlineIndicator?: React.ReactNode;
  autoSaveStatus?: "idle" | "saving" | "saved" | "error";
  isSaving?: boolean;
}

export function SurveyHeader({
  customerName,
  currentStep,
  totalSteps,
  completedSteps,
  isOnline,
  isDarkMode,
  onThemeToggle,
  offlineIndicator,
  autoSaveStatus,
  isSaving,
}: SurveyHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground flex items-center">
              Survey
            </h1>
            <p className="text-sm text-muted-foreground">{customerName}</p>
          </div>

          {/* <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            completedSteps={completedSteps}
          /> */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <Link to="/submissions">
            <Button variant="ghost" size="sm">
              View Submissions
            </Button>
          </Link>

          {/* Auto-save Status */}
          {autoSaveStatus && (
            <div className="flex items-center space-x-2 text-sm">
              {autoSaveStatus === "saving" && (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Saving...</span>
                </>
              )}
              {autoSaveStatus === "saved" && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Saved</span>
                </>
              )}
              {autoSaveStatus === "error" && (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-muted-foreground">Save failed</span>
                </>
              )}
            </div>
          )}

          {/* Offline Status Indicator */}
          {offlineIndicator}

          {/* Dark/Light Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            className="h-9 w-9 p-0"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
