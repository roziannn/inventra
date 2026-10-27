import { useSyncExternalStore } from "react";

// Front-end only: location groups (e.g. a building or floor) that rooms are filed under, kept in localStorage.
const KEY = "inventra:storage-locations:v1";

export interface LocationGroup {
  name: string;
  isActive: boolean;
}

export const DEFAULT_LOCATION_GROUPS: LocationGroup[] = [
  { name: "Gedung A - Lantai 1", isActive: true },
  { name: "Gedung A - Lantai 2", isActive: true },
  { name: "Gedung B", isActive: true },
];

let cache: LocationGroup[] | null = null;
const listeners = new Set<() => void>();

function load(): LocationGroup[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as LocationGroup[]) : DEFAULT_LOCATION_GROUPS;
  } catch {
    cache = DEFAULT_LOCATION_GROUPS;
  }
  return cache;
}

function commit(next: LocationGroup[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: keep working in memory
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocationGroups() {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_LOCATION_GROUPS);
}

/** returns false when a group with that name already exists (case-insensitive) */
export function addLocationGroup(name: string) {
  const current = load();
  if (current.some((g) => g.name.toLowerCase() === name.toLowerCase())) return false;
  commit([...current, { name, isActive: true }]);
  return true;
}

export function toggleLocationGroup(name: string) {
  commit(load().map((g) => (g.name === name ? { ...g, isActive: !g.isActive } : g)));
}
