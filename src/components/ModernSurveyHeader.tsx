import { Moon, Sun, ChevronLeft, Menu, X, BarChart3, RefreshCw, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { checkForUpdates } from "@/lib/sw-register";

interface ModernSurveyHeaderProps {
  customerName: string;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  backTo?: string;
  backTooltip?: string;
  onBackClick?: () => void;
  onJumpToSection?: (sectionKey: string) => void;
  autoSaveStatus?: "idle" | "saving" | "saved" | "error";
  isSaving?: boolean;
  offlineIndicator?: React.ReactNode;
}

export function ModernSurveyHeader({
  customerName,
  isDarkMode,
  onThemeToggle,
  backTo,
  backTooltip = "Back",
  onBackClick,
  onJumpToSection,
  autoSaveStatus,
  isSaving,
  offlineIndicator,
}: ModernSurveyHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { key: 'general', label: 'General & Contact' },
    { key: 'electricity', label: 'Electricity Baseline' },
    { key: 'property', label: 'Property Overview' },
    { key: 'roof', label: 'Roof Inspection' },
    { key: 'loft', label: 'Loft / Attic' },
    { key: 'electrical', label: 'Electrical Supply' },
    { key: 'battery', label: 'Battery & Storage' },
    { key: 'safety', label: 'Health & Hazards' },
    { key: 'preferences', label: 'Preferences & Next Steps' },
  ];

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Left: Logo + Back Button - Better mobile spacing */}
            <div className="flex items-center gap-3 sm:gap-3 min-w-0 flex-1">
              {/* Back Button */}
              {(backTo || onBackClick) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {backTo ? (
                      <Link to={backTo} aria-label={backTooltip}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-muted/50 transition-colors flex-shrink-0"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-muted/50 transition-colors flex-shrink-0"
                        aria-label={backTooltip}
                        onClick={onBackClick}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>{backTooltip}</TooltipContent>
                </Tooltip>
              )}

              {/* Logo - Better mobile layout */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="text-sm sm:text-lg leading-none translate-y-[1px] sm:block hidden">☀️</span>
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading font-bold text-sm sm:text-lg text-foreground truncate">SolarSpark</h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {customerName || "Survey"}
                  </p>
                </div>
              </div>
            </div>


            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
              {/* Quick navigation dropdown - Desktop only */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hidden sm:flex" aria-label="Sections">
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Quick sections</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Jump to section</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sections.map((section) => (
                    <DropdownMenuItem key={section.key} onClick={() => onJumpToSection?.(section.key)}>
                      {section.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Submissions link - Hidden on small screens */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/submissions" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full" aria-label="Submissions">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View submissions</TooltipContent>
              </Tooltip>

              {/* Auto-save Status - Hidden on small screens */}
              {autoSaveStatus && (
                <div className="hidden lg:flex items-center gap-2 text-xs">
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

              {/* Offline/online indicator - Hidden on mobile */}
              <div className="hidden sm:block">
                {offlineIndicator}
              </div>

              {/* Refresh - Hidden on small screens */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hidden sm:flex"
                    aria-label="Refresh"
                    onClick={() => {
                      try {
                        checkForUpdates().finally(() => window.location.reload());
                      } catch {
                        window.location.reload();
                      }
                    }}
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full sm:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Menu className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onThemeToggle}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-muted/50 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? (
                      <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle theme</TooltipContent>
              </Tooltip>

              {/* Profile/settings placeholder - Hidden on small screens */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hidden sm:flex" aria-label="Account">
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


          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2 mb-3">Jump to Section</h3>
                {sections.map((section) => (
                  <Button
                    key={section.key}
                    variant="ghost"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => {
                      onJumpToSection?.(section.key);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {section.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
