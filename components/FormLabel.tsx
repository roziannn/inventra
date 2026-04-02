"use client";

import React from "react";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  icon?: React.ReactNode;
  block?: boolean;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function FormLabel({ icon, block = false, className, children, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        "text-gray-400 uppercase",
        block ? "mb-2 block text-sm font-bold tracking-wider" : "flex items-center gap-2 text-xs font-bold tracking-widest",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </label>
  );
}
