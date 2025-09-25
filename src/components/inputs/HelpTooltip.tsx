import React from "react";
import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  icon?: "help" | "info";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function HelpTooltip({
  content,
  icon = "help",
  side = "top",
  className,
}: HelpTooltipProps) {
  const IconComponent = icon === "help" ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors",
              className
            )}
            aria-label="Help information"
          >
            <IconComponent className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to add help tooltip to labels
export function LabelWithHelp({
  children,
  helpContent,
  helpIcon = "help",
  helpSide = "top",
}: {
  children: React.ReactNode;
  helpContent?: string;
  helpIcon?: "help" | "info";
  helpSide?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <div className="flex items-center gap-2">
      {children}
      {helpContent && (
        <HelpTooltip
          content={helpContent}
          icon={helpIcon}
          side={helpSide}
        />
      )}
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
