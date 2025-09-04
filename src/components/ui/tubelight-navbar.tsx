"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const current = items.find((i) => {
      if (i.url.startsWith('#') || i.name === 'Home') return false; // Skip hash links and Home
      return i.url === currentPath;
    });
    if (current) {
      setActiveTab(current.name);
    } else if (currentPath === '/') {
      setActiveTab('Home');
    } else if (currentPath === '/survey') {
      setActiveTab('Survey');
    }
  }, [items]);

  // Listen for route changes
  useEffect(() => {
    const handleLocationChange = () => {
      const currentPath = window.location.pathname;
      const current = items.find((i) => {
        if (i.url.startsWith('#') || i.name === 'Home') return false;
        return i.url === currentPath;
      });
      if (current) {
        setActiveTab(current.name);
      } else if (currentPath === '/') {
        setActiveTab('Home');
      } else if (currentPath === '/survey') {
        setActiveTab('Survey');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [items]);

  return (
    <div className={cn("fixed bottom-4 sm:top-4 left-1/2 -translate-x-1/2 z-50", className)}>
      <div className="flex items-center gap-2 bg-background/90 border border-border backdrop-blur-lg py-2 px-2 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          
          const handleClick = () => {
            setActiveTab(item.name);
            
            // Special handling for Home button
            if (item.name === 'Home') {
              const currentPath = window.location.pathname;
              if (currentPath === '/') {
                // If already on landing page, scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                // If on different page, navigate to landing page
                window.location.href = '/';
              }
              return;
            }
            
            // Handle hash links for smooth scrolling
            if (item.url.startsWith('#')) {
              // First ensure we're on the landing page
              const currentPath = window.location.pathname;
              if (currentPath !== '/') {
                // Navigate to landing page with hash
                window.location.href = '/' + item.url;
                return;
              }
              
              // If already on landing page, scroll to element
              const element = document.querySelector(item.url);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                // Fallback: try again after a short delay
                setTimeout(() => {
                  const delayedElement = document.querySelector(item.url);
                  if (delayedElement) {
                    delayedElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }
            }
          };
          
          return item.url.startsWith('#') || item.name === 'Home' ? (
            <button
              key={item.name}
              onClick={handleClick}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          ) : (
            <Link
              key={item.name}
              to={item.url}
              onClick={handleClick}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
