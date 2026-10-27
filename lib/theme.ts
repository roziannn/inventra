import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "theme";
const listeners = new Set<() => void>();
let current: Theme | null = null;

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function snapshot(): Theme {
  return (current ??= storedTheme() ?? systemTheme());
}

/**
 * Applies the theme to <html>. Transitions are switched off for two frames so the whole page flips
 * in a single paint instead of fading hundreds of elements one by one.
 */
function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}

function emit() {
  listeners.forEach((l) => l());
}

export function setTheme(theme: Theme) {
  current = theme;
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // private mode: the choice just lasts for this session
  }
  apply(theme);
  emit();
}

export function toggleTheme() {
  setTheme(snapshot() === "dark" ? "light" : "dark");
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // without a saved choice, follow the operating system
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (storedTheme()) return;
    current = systemTheme();
    apply(current);
    emit();
  };
  media.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
  };
}

/** Current theme. Server render and hydration report "light"; the inline script in the root layout already set the real class. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, snapshot, () => "light");
}
