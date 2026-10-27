import React from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Placeholder block shown while data loads. Size it with className (e.g. "h-4 w-32"). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-gray-200/80 dark:bg-white/10", className)} />;
}

// deterministic widths so the skeleton looks like real, uneven content without random re-renders
const CELL_WIDTHS = ["w-4/5", "w-3/5", "w-2/3", "w-1/2", "w-3/4", "w-2/5"];

interface TableSkeletonProps {
  /** number of columns */
  columns: number;
  rows?: number;
  /** render the header row too (use when no real header is shown) */
  withHeader?: boolean;
}

/** Table-shaped skeleton: a faint header and `rows` rows of uneven bars. */
export function TableSkeleton({ columns, rows = 8, withHeader = false }: TableSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat data" className="w-full overflow-hidden">
      {withHeader && (
        <div className="grid gap-4 bg-gray-50/60 px-4 py-3 dark:bg-white/6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className="h-3 w-16" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid items-center gap-4 px-4 py-3.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={cn("h-4", CELL_WIDTHS[(r + c * 2) % CELL_WIDTHS.length])} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Generic page placeholder: title, subtitle and a table. Used by the route-level loading state. */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true" aria-label="Memuat halaman">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-8 w-40" />
      </div>
      <TableSkeleton columns={6} rows={8} withHeader />
    </div>
  );
}
