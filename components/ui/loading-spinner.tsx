import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "orange" | "cyan" | "purple" | "green";
  text?: string;
  centered?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
  xl: "h-16 w-16 border-4",
};

const variantClasses = {
  default: "border-slate-600 border-t-orange-500",
  orange: "border-slate-700 border-t-orange-500",
  cyan: "border-slate-700 border-t-cyan-400",
  purple: "border-slate-700 border-t-purple-400",
  green: "border-slate-700 border-t-green-400",
};

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size = "md", 
    variant = "default", 
    text,
    centered = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center gap-3",
          centered && "justify-center min-h-[200px]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "rounded-full animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{ borderTopWidth: size === "lg" ? "3px" : undefined }}
        />
        {text && (
          <p className="text-sm text-slate-400 animate-pulse">{text}</p>
        )}
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
export type { LoadingSpinnerProps };
