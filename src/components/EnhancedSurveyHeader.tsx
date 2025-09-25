import { Moon, Sun, ChevronLeft, Menu, X, BarChart3, RefreshCw, User, ChevronDown, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { checkForUpdates } from "@/lib/sw-register";

interface EnhancedSurveyHeaderProps {
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
  currentSection?: string;
  progress?: number;
}

export function EnhancedSurveyHeader({
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
  currentSection,
  progress = 0,
}: EnhancedSurveyHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { key: 'general', label: 'General & Contact', icon: '📋' },
    { key: 'electricity', label: 'Electricity Baseline', icon: '⚡' },
    { key: 'property', label: 'Property Overview', icon: '🏠' },
    { key: 'roof', label: 'Roof Inspection', icon: '🏘️' },
    { key: 'loft', label: 'Loft / Attic', icon: '🏠' },
    { key: 'electrical', label: 'Electrical Supply', icon: '🔌' },
    { key: 'battery', label: 'Battery & Storage', icon: '🔋' },
    { key: 'safety', label: 'Health & Hazards', icon: '⚠️' },
    { key: 'preferences', label: 'Preferences & Next Steps', icon: '✅' },
  ];

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case "saving":
        return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />;
      case "saved":
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case "error":
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return <Save className="h-3 w-3" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Save failed";
      default:
        return "Auto-save";
    }
  };

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

            {/* Center Section: Progress & Current Section (Desktop only) */}
            <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
              {currentSection && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Current:</span>
                  <Badge variant="secondary" className="text-xs">
                    {sections.find(s => s.key === currentSection)?.label || currentSection}
                  </Badge>
                </div>
              )}
              {progress > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
                </div>
              )}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              
              {/* Auto-save Status - Desktop only */}
              {autoSaveStatus && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
                  {getAutoSaveIcon()}
                  <span className="text-xs text-muted-foreground">{getAutoSaveText()}</span>
                </div>
              )}

              {/* Offline Indicator - Desktop only */}
              <div className="hidden lg:block">
                {offlineIndicator}
              </div>

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
                  <DropdownMenuGroup>
                    {sections.map((section) => (
                      <DropdownMenuItem 
                        key={section.key} 
                        onClick={() => onJumpToSection?.(section.key)}
                        className={cn(
                          "flex items-center gap-2",
                          currentSection === section.key && "bg-muted"
                        )}
                      >
                        <span className="text-sm">{section.icon}</span>
                        <span className="text-sm">{section.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
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
                  <DropdownMenuItem disabled className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-border/40 py-4">
              <div className="space-y-3">
                
                {/* Mobile Progress */}
                {progress > 0 && (
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
                    </div>
                  </div>
                )}

                {/* Mobile Auto-save Status */}
                {autoSaveStatus && (
                  <div className="flex items-center gap-2 px-2 py-2 bg-muted/30 rounded-lg">
                    {getAutoSaveIcon()}
                    <span className="text-sm text-muted-foreground">{getAutoSaveText()}</span>
                  </div>
                )}

                {/* Mobile Offline Indicator */}
                <div className="lg:hidden px-2">
                  {offlineIndicator}
                </div>

                {/* Mobile Navigation */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground px-2 mb-3">Jump to Section</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {sections.map((section) => (
                      <Button
                        key={section.key}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm h-10 px-3",
                          currentSection === section.key && "bg-muted"
                        )}
                        onClick={() => {
                          onJumpToSection?.(section.key);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span className="mr-2">{section.icon}</span>
                        {section.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mobile Quick Actions */}
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
