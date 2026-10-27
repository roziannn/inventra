"use client";

import React from "react";

type ButtonVariant = "page-primary" | "page-secondary" | "page-outline" | "modal-primary" | "modal-secondary" | "modal-danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseClassName = "inline-flex items-center justify-center gap-2 font-bold transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none";

const variantClassNames: Record<ButtonVariant, string> = {
  "page-primary": "rounded-lg bg-zinc-900 px-4 py-2 text-xs text-white shadow-md hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-gray-100",
  "page-secondary":
    "rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 dark:border-gray-100/10 dark:bg-white/6 dark:text-gray-100 dark:hover:bg-white/10",
  "page-outline": "rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 active:scale-95 dark:border-gray-100/10 dark:text-gray-100 dark:hover:bg-white/10",
  "modal-primary": "min-h-10 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs text-white shadow-md hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-gray-100",
  "modal-secondary":
    "min-h-10 rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 active:scale-95 dark:border-gray-100/10 dark:text-gray-100 dark:hover:bg-white/10",
  "modal-danger": "min-h-10 rounded-xl bg-red-600 px-4 py-2.5 text-xs text-white shadow-md shadow-red-900/20 hover:bg-red-700 active:scale-95",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "page-primary", type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={cn(baseClassName, variantClassNames[variant], className)} {...props} />;
});

export default Button;
