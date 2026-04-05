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
        "text-gray-400 flex items-center gap-2 font-semibold",
        block ? "mb-2 text-sm" : "text-xs",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </label>
  );
}
