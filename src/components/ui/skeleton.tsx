interface SkeletonProps {
  className?: string;
}

/** Flat parchment placeholder block matching the editorial system (radius 0). */
export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={`animate-pulse bg-[var(--parchment)] ${className ?? ''}`} aria-hidden="true" />
);

interface SkeletonGridProps {
  count?: number;
  itemClassName?: string;
  className?: string;
}

/** Grid of image-card placeholders for recipe/collection index pages. */
export const SkeletonGrid = ({
  count = 6,
  itemClassName = 'h-[280px]',
  className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
}: SkeletonGridProps) => (
  <div className={className} role="status" aria-label="Loading content">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex flex-col gap-4">
        <Skeleton className={itemClassName} />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);

/** Page-level skeleton: eyebrow + display heading + rule, then content grid. */
export const SkeletonPage = ({ count = 6 }: { count?: number }) => (
  <div className="wrapper page">
    <div className="flex flex-col gap-6">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-16 w-2/3 max-w-xl" />
      <div className="divider" />
    </div>
    <SkeletonGrid count={count} />
  </div>
);
