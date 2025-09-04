import { Moon, Sun, RefreshCw, BarChart3, Zap, ChevronDown, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { checkForUpdates } from "@/lib/sw-register";

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
  // New props
  onJumpToSection?: (sectionKey: string) => void;
  overallProgressPercent?: number; // 0-100
  // Optional back button
  backTo?: string;
  backTooltip?: string;
  onBackClick?: () => void;
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
  onJumpToSection,
  overallProgressPercent = 0,
  backTo,
  backTooltip = "Back",
  onBackClick,
}: SurveyHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <TooltipProvider>
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Optional Back button */}
            {(backTo || onBackClick) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  {backTo ? (
                    <Link to={backTo} aria-label={backTooltip} className="mr-1">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full mr-1"
                      aria-label={backTooltip}
                      onClick={onBackClick}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>{backTooltip}</TooltipContent>
              </Tooltip>
            )}
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-foreground">Survey</h1>
                <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Field</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[40vw] sm:max-w-none">{customerName}</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick navigation */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" aria-label="Sections">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
              <TooltipContent>Quick sections</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Jump to section</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { key: 'general', label: 'General & Contact' },
                  { key: 'electricity', label: 'Electricity Baseline' },
                  { key: 'property', label: 'Property Overview' },
                  { key: 'roof', label: 'Roof Inspection' },
                  { key: 'loft', label: 'Loft / Attic' },
                  { key: 'electrical', label: 'Electrical Supply' },
                  { key: 'battery', label: 'Battery & Storage' },
                  { key: 'safety', label: 'Health & Hazards' },
                  { key: 'preferences', label: 'Preferences & Next Steps' },
                ].map((s) => (
                  <DropdownMenuItem key={s.key} onClick={() => onJumpToSection?.(s.key)}>
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Submissions link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/submissions">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" aria-label="Submissions">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>View submissions</TooltipContent>
            </Tooltip>

            {/* Auto-save Status */}
            {autoSaveStatus && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                {autoSaveStatus === "saving" && (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    <span className="text-muted-foreground">Saving…</span>
                  </>
                )}
                {autoSaveStatus === "saved" && (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">Saved</span>
                  </>
                )}
                {autoSaveStatus === "error" && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-muted-foreground">Save failed</span>
                  </>
                )}
              </div>
            )}

            {/* Offline/online indicator (provided) */}
            {offlineIndicator}

            {/* Refresh */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full"
                  aria-label="Refresh"
                  onClick={() => {
                    // Try to check for SW updates, then fallback to hard reload
                    try {
                      checkForUpdates().finally(() => window.location.reload());
                    } catch {
                      window.location.reload();
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeToggle}
                  className="h-9 w-9 p-0 rounded-full"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>

            {/* Profile/settings placeholder */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" aria-label="Account">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Settings (coming soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Slim progress bar under navbar */}
        <div className="container px-4 sm:px-6 pb-2">
          <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overallProgressPercent))}%` }}
            />
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
}
