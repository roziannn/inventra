"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useRooms } from "@/lib/storage/room-store";
import { useSettings } from "@/lib/settings/settings-store";

// labels for routes that are not in the sidebar menu
const SEGMENT_LABELS: Record<string, string> = {
  wadah: "Jenis Wadah",
  "print-layout": "Print Layout",
  notifications: "Notifikasi",
  profile: "Profil",
};

const titleCase = (segment: string) => segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** breadcrumb for the header, derived from the current route so every page gets one */
export default function HeaderBreadcrumb() {
  const pathname = usePathname();
  const { menus } = useSettings();
  const rooms = useRooms();

  const segments = pathname.split("/").filter(Boolean);
  const labelFor = (href: string, segment: string) =>
    menus.find((m) => m.href === href && m.parentId === null)?.name ??
    menus.find((m) => m.href === href)?.name ??
    (href.startsWith("/storage/") ? rooms.find((r) => r.id === segment)?.name : undefined) ??
    SEGMENT_LABELS[segment] ??
    titleCase(decodeURIComponent(segment));

  const items =
    segments.length === 0
      ? [{ label: menus.find((m) => m.href === "/")?.name ?? "Dashboard" }]
      : segments.map((segment, i) => {
          const href = `/${segments.slice(0, i + 1).join("/")}`;
          return { label: labelFor(href, segment), href: i < segments.length - 1 ? href : undefined };
        });

  return <Breadcrumb items={items} />;
}
