#!/bin/bash
# Git push script for EduFunds loading states

cd /mnt/projekte

# Remove lock file if exists
rm -f .git/index.lock

# Configure git
git config user.email "dev@edufunds.de"
git config user.name "EduFunds Dev"

# Add all new files
git add Edufunds/components/ui/skeleton.tsx \
    Edufunds/components/ui/loading-spinner.tsx \
    Edufunds/components/ui/progress.tsx \
    Edufunds/components/skeletons/ \
    Edufunds/components/AsyncDataLoader.tsx \
    Edufunds/components/PageTransitionLoader.tsx \
    Edufunds/app/layout.tsx \
    Edufunds/components/KIAntragAssistent.tsx

# Commit
git commit -m "feat: Add loading states and skeleton screens

- Add reusable Skeleton component with pulse and shimmer effects
- Add ProgrammCardSkeleton for program listing loading states
- Add FormSkeleton for form loading states  
- Add DetailSkeleton for detail page loading states
- Add LoadingSpinner component with multiple variants
- Add ProgressBar, StepProgress, and LoadingProgress components
- Add PageTransitionLoader for Next.js route transitions
- Add AsyncDataLoader for async data fetching with loading states
- Update KIAntragAssistent with enhanced loading state and step progress
- Update layout.tsx to include PageTransitionLoader

All components are dark theme compatible with slate-800 backgrounds."

# Push to GitHub
git push -u origin master
