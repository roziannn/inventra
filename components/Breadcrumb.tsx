"use client";

import React from "react";
import Link from "next/link";
import { IconChevronRight, IconHome } from "@tabler/icons-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-gray-500 text-xs md:text-sm">
      <Link href="/" className="hover:text-[#10B981] transition-colors flex items-center">
        <IconHome size={16} stroke={2} />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <IconChevronRight size={14} stroke={3} className="text-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[#10B981] transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-bold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
