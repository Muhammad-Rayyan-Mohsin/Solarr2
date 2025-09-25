import { useCallback } from 'react';

/**
 * Custom hook to prevent smooth scrolling during accordion animations
 * This prevents the unwanted autoscroll behavior when sections are toggled
 */
export function useAccordionScroll() {
  const preventScrollDuringAnimation = useCallback((callback: () => void) => {
    // Add class to prevent smooth scrolling during accordion animation
    document.documentElement.classList.add('accordion-animating');
    
    // Execute the callback (usually the toggle function)
    callback();
    
    // Remove class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('accordion-animating');
    }, 350); // Slightly longer than the CSS transition duration (300ms)
  }, []);

  return { preventScrollDuringAnimation };
}
