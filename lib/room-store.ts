import { useSyncExternalStore } from "react";
import { rooms as seedRooms, type Room } from "@/lib/storage-data";

// Front-end only store: rooms live in localStorage until a backend exists.
const KEY = "inventra:storage-rooms:v1";

let cache: Room[] | null = null;
const listeners = new Set<() => void>();

function load(): Room[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Room[]) : seedRooms;
  } catch {
    cache = seedRooms;
  }
  return cache;
}

function commit(next: Room[]) {
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

export function useRooms() {
  return useSyncExternalStore(subscribe, load, () => seedRooms);
}

/** false during server render and hydration, true afterwards (localStorage is readable then) */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function addRoom(input: Pick<Room, "name" | "location" | "width" | "depth">): Room {
  const current = load();
  const next = Math.max(0, ...current.map((r) => Number(r.id.replace(/\D/g, "")) || 0)) + 1;
  const room: Room = { id: `RM-${String(next).padStart(3, "0")}`, ...input, openings: [], shelves: [] };
  commit([...current, room]);
  return room;
}

export function updateRoom(id: string, patch: Partial<Omit<Room, "id">>) {
  commit(load().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function removeRoom(id: string) {
  commit(load().filter((r) => r.id !== id));
}
