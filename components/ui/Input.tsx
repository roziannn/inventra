import React from "react";

/** Class names for text fields. Use these when a raw <input>/<select> is unavoidable; prefer <Input> and <Select>. */
export const fieldClass = "w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none dark:border-gray-100/10";
/** Smaller variant for dense side panels and builders. */
export const compactFieldClass = "w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs focus:border-violet-600 focus:outline-none dark:border-gray-100/10";

type Size = "md" | "sm";
const sizeClass: Record<Size, string> = { md: fieldClass, sm: compactFieldClass };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: Size;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ size = "md", className, ...props }, ref) {
  return <input ref={ref} className={cn(sizeClass[size], className)} {...props} />;
});

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: Size;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ size = "md", className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(sizeClass[size], className)} {...props}>
      {children}
    </select>
  );
});
