import { useSyncExternalStore } from "react";
import { DEFAULT_CONTAINERS, type ContainerType } from "@/lib/shelf-model";

// Front-end only: the container library (boxes, crates, drums) lives in localStorage until a backend exists.
const KEY = "inventra:containers:v1";

let cache: ContainerType[] | null = null;
const listeners = new Set<() => void>();

function load(): ContainerType[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as ContainerType[]) : DEFAULT_CONTAINERS;
  } catch {
    cache = DEFAULT_CONTAINERS;
  }
  return cache;
}

function commit(next: ContainerType[]) {
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

export function useContainers() {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_CONTAINERS);
}

export function addContainerType(input: Omit<ContainerType, "id">) {
  const container: ContainerType = { id: `ct-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, ...input };
  commit([...load(), container]);
  return container;
}

export function updateContainerType(id: string, patch: Partial<Omit<ContainerType, "id">>) {
  commit(load().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

export function removeContainerType(id: string) {
  commit(load().filter((c) => c.id !== id));
}

export function resetContainerTypes() {
  commit(DEFAULT_CONTAINERS);
}
