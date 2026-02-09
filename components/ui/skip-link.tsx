import * as React from "react";

interface SkipLinkProps {
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Skip Link Component for Accessibility
 * Allows keyboard users to skip to main content
 * 
 * Usage:
 * <SkipLink targetId="main-content" />
 * <main id="main-content">...</main>
 */
export function SkipLink({ 
  targetId = "main-content", 
  children = "Zum Hauptinhalt springen",
  className = ""
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={`
        sr-only focus:not-sr-only 
        focus:absolute focus:top-4 focus:left-4 
        focus:z-[100] 
        focus:bg-orange-500 focus:text-slate-900 
        focus:px-4 focus:py-2 
        focus:rounded-md 
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900
        focus:font-medium
        ${className}
      `}
    >
      {children}
    </a>
  );
}

export default SkipLink;
