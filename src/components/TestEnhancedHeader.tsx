import { Moon, Sun, ChevronLeft, Menu, X, BarChart3, RefreshCw, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { checkForUpdates } from "@/lib/sw-register";

interface TestEnhancedHeaderProps {
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

export function TestEnhancedHeader({
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
}: TestEnhancedHeaderProps) {
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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/98 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            
            {/* Left Section: Back + Logo + Customer */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back Button */}
              {(backTo || onBackClick) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {backTo ? (
                      <Link to={backTo} aria-label={backTooltip}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200"
                        aria-label={backTooltip}
                        onClick={onBackClick}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{backTooltip}</TooltipContent>
                </Tooltip>
              )}

              {/* Logo & Brand */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-bold">☀️</span>
                </div>
                <div className="min-w-0">
                  <h1 className="font-heading font-bold text-lg text-foreground leading-tight">SolarSpark</h1>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">
                    {customerName || "Survey"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              
              {/* Quick Actions Dropdown */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200" 
                        aria-label="Quick actions"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Quick actions</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sections.map((section) => (
                    <DropdownMenuItem 
                      key={section.key} 
                      onClick={() => onJumpToSection?.(section.key)}
                    >
                      {section.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/submissions" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>View Submissions</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200"
                    aria-label="Refresh"
                    onClick={() => {
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
                <TooltipContent side="bottom">Refresh page</TooltipContent>
              </Tooltip>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onThemeToggle}
                    className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200"
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Toggle theme</TooltipContent>
              </Tooltip>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200 lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>

              {/* Account Menu - Desktop only */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 rounded-lg hover:bg-muted/60 transition-all duration-200 hidden lg:flex" 
                    aria-label="Account"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                  <DropdownMenuItem disabled>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-border/40 py-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground px-2 mb-3">Jump to Section</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {sections.map((section) => (
                      <Button
                        key={section.key}
                        variant="ghost"
                        className="w-full justify-start text-sm h-10 px-3"
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

                <div className="pt-3 border-t border-border/40">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-10 px-3"
                    asChild
                  >
                    <Link to="/submissions">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Submissions
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
