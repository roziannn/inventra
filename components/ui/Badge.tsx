import React from "react";

export type BadgeTone = "success" | "danger" | "warning" | "info" | "neutral";

const toneClass: Record<BadgeTone, string> = {
  success: "border-violet-500/20 bg-violet-500/10 text-violet-600",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-600",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  info: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  neutral: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-100/10 dark:bg-white/6",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/** Small status pill, e.g. Active / Inactive. Colors come from `tone`, never from the call site. */
export default function Badge({ tone = "neutral", icon, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-xs font-semibold ${toneClass[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
