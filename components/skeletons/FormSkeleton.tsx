import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
  fieldCount?: number;
}

function FormSkeleton({ fieldCount = 6 }: FormSkeletonProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Programm Info Card */}
      <div className="glass rounded-xl p-4 border border-slate-700/50 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {Array.from({ length: Math.ceil(fieldCount / 2) }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {rowIndex * 2 + 1 < fieldCount && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            )}
          </div>
        ))}

        {/* Textarea fields */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      {/* Info Box */}
      <div className="glass rounded-xl p-4 border border-slate-700/50 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export { FormSkeleton };
export type { FormSkeletonProps };
