import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Placeholder for a list or page that has nothing to show yet. */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-100/20">
      {icon}
      <p className="text-sm font-bold text-gray-700">{title}</p>
      {description && <p className="max-w-xs text-xs text-gray-500">{description}</p>}
      {action}
    </div>
  );
}
