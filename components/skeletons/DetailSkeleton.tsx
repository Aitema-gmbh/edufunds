import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DetailSkeletonProps {}

function DetailSkeleton({}: DetailSkeletonProps) {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Skeleton className="h-6 w-40 mb-6" />

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-12 p-8 md:p-12 bg-slate-800/50">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />

          {/* Short Description */}
          <div className="space-y-2 mb-8">
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-4/5 max-w-2xl" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-14 w-48 rounded-xl" />
            <Skeleton className="h-14 w-40 rounded-xl" />
            <Skeleton className="h-14 w-36 rounded-xl" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-4">
              <Skeleton className="h-8 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            </div>

            {/* Funding Amount Card */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            {/* Categories */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-20 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-16 rounded-xl" />
              </div>
            </div>

            {/* School Types */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>

            {/* Federal States */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Deadline Card */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* Contact Card */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>

            {/* Links Card */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>

            {/* AI Hints Card */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DetailSkeleton };
export type { DetailSkeletonProps };
