"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[8px]
            animate-aurora
            pointer-events-none
            absolute -inset-[10px] opacity-60 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
          <div
            className={cn(
              `
            [--aurora:repeating-linear-gradient(120deg,var(--blue-400)_5%,var(--violet-200)_20%,var(--indigo-300)_35%,var(--blue-300)_50%)]
            [background-image:var(--aurora)]
            [background-size:250%,_150%]
            [background-position:50%_50%,50%_50%]
            filter blur-[12px]
            animate-aurora
            pointer-events-none
            absolute -inset-[15px] opacity-40 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_15%,var(--transparent)_65%)]`
            )}
            style={{ animationDelay: '3s', animationDuration: '25s' }}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
