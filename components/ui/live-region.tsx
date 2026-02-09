import * as React from "react";

interface LiveRegionProps {
  id?: string;
  /** polite: announces when user is idle | assertive: interrupts immediately */
  priority?: "polite" | "assertive";
  children?: React.ReactNode;
  className?: string;
}

/**
 * Live Region Component for Screen Reader Announcements
 * 
 * Usage:
 * <LiveRegion id="announcement-region" priority="polite">
 *   {announcementMessage}
 * </LiveRegion>
 * 
 * Or use the hook for dynamic updates:
 * const announce = useAnnouncer('announcement-region');
 * announce('Form successfully submitted!');
 */
export function LiveRegion({ 
  id = "live-region",
  priority = "polite", 
  children,
  className = ""
}: LiveRegionProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

interface AlertRegionProps {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Alert Region for Error Messages
 * Announces immediately to screen readers
 */
export function AlertRegion({ 
  id = "alert-region",
  children,
  className = ""
}: AlertRegionProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={className}
    >
      {children}
    </div>
  );
}

// Hook for programmatic announcements
export function useAnnouncer(regionId: string = "live-region") {
  const announce = React.useCallback((message: string) => {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;
      // Clear after announcement to prevent re-announcement
      setTimeout(() => {
        if (region.textContent === message) {
          region.textContent = "";
        }
      }, 1000);
    }
  }, [regionId]);

  return announce;
}

export default LiveRegion;
