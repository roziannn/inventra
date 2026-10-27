import React from "react";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** buttons and links shown on the right (stacked below the title on small screens) */
  actions?: React.ReactNode;
}

/** Title block used at the top of every page, so headings and action buttons line up everywhere. */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
        {description && <p className="text-xs font-medium text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
