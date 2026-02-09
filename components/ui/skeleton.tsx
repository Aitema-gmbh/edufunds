import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  pulse?: boolean;
  shimmer?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, pulse = true, shimmer = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-slate-700/50 rounded-md",
          pulse && "animate-pulse",
          shimmer && "animate-shimmer",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
