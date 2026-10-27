import { useSyncExternalStore } from "react";

/** false during server render and hydration, true afterwards. Use it before reading browser-only data (localStorage, dates). */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
