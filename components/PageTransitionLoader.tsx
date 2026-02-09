"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProgressBar } from "@/components/ui/progress";

interface PageTransitionLoaderProps {
  children: React.ReactNode;
}

function PageTransitionLoader({ children }: PageTransitionLoaderProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    };

    // Simulate progress during navigation
    let progressInterval: NodeJS.Timeout;
    if (isLoading) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
    }

    // Cleanup on path change
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, pathname, searchParams]);

  // Listen for route changes using native events
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("/") && !href.startsWith("//") && !anchor.target) {
          setIsLoading(true);
          setProgress(0);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      {/* Progress Bar at Top */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <ProgressBar 
            value={progress} 
            max={100} 
            size="sm" 
            variant="orange"
            className="rounded-none"
          />
        </div>
      )}
      
      {/* Full Screen Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-[99] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" variant="orange" />
            <p className="text-slate-300 animate-pulse">Seite wird geladen...</p>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
}

export { PageTransitionLoader };
export type { PageTransitionLoaderProps };
