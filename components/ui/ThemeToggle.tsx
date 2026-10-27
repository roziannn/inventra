"use client";

import React from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { toggleTheme, useTheme } from "@/lib/theme";
import { useHydrated } from "@/lib/use-hydrated";

/** Light/dark switch. Owns its own subscription, so flipping the theme re-renders only this button. */
export default function ThemeToggle() {
  const theme = useTheme();
  const hydrated = useHydrated();

  return (
    <button onClick={toggleTheme} aria-label="Ganti tema" title="Ganti tema" className="rounded-lg border border-border bg-muted/60 p-2 text-gray-600 hover:bg-muted dark:text-gray-200">
      {hydrated ? theme === "dark" ? <IconMoon size={18} /> : <IconSun size={18} /> : <span className="block h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  );
}
