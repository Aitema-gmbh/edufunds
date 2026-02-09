import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgrammCardSkeletonProps {
  count?: number;
}

function ProgrammCardSkeleton({ count = 1 }: ProgrammCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-4">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Title */}
              <Skeleton className="h-7 w-3/4" />

              {/* Fördergeber */}
              <Skeleton className="h-5 w-1/2" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="h-6 w-18 rounded-md" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 md:items-end">
              <Skeleton className="h-11 w-36 rounded-xl" />
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>
        </article>
      ))}
    </>
  );
}

export { ProgrammCardSkeleton };
export type { ProgrammCardSkeletonProps };
