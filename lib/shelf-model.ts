export type ShelfType = "standard" | "angle" | "wire" | "bin" | "cubby" | "cantilever" | "pallet";

export const SHELF_TYPES: Record<ShelfType, { label: string; depth: number; length: number; height: number; color: string }> = {
  standard: { label: "Rak Standar", depth: 0.7, length: 1.6, height: 2.2, color: "#a78bfa" },
  angle: { label: "Rak Besi Siku (Boltless)", depth: 0.5, length: 3, height: 2, color: "#e5e7eb" },
  wire: { label: "Rak Kawat (Wire Shelving)", depth: 0.5, length: 1.2, height: 1.8, color: "#cbd5e1" },
  bin: { label: "Rak Bin (Kotak Plastik)", depth: 0.5, length: 1.8, height: 2, color: "#2563eb" },
  cubby: { label: "Rak Kubus (Pigeonhole)", depth: 0.4, length: 1.6, height: 1.8, color: "#d6b88c" },
  cantilever: { label: "Rak Cantilever (Barang Panjang)", depth: 1, length: 3, height: 2.5, color: "#ea580c" },
  pallet: { label: "Rak Pallet (Heavy Duty)", depth: 0.9, length: 3.6, height: 3, color: "#f97316" },
};

export interface ShelfItem {
  id: string;
  /** 0 = bottom level */
  level: number;
  name: string;
  sku: string;
  qty: number;
  /** packaging this item sits in (a ContainerType id); unknown or missing falls back to the first type */
  containerId?: string;
}

export interface ShelfData {
  id: string;
  name: string;
  levels: number;
  items: ShelfItem[];
  x: number;
  z: number;
  rotated: boolean;
  type: ShelfType;
  length: number;
  height: number;
  color: string;
  /** closed panels around the shelf */
  coverTop?: boolean;
  coverBack?: boolean;
  coverSides?: boolean;
  /** custom tag text per level (key = level index); empty means the auto code is used */
  tags?: Record<number, string>;
}

/** how many items fit on one level (one slot per item: a box, a bin, a cell or a bar) */
export function levelSlots(s: Pick<ShelfData, "type" | "length">) {
  switch (s.type) {
    case "pallet":
      return Math.max(1, Math.round(s.length / 1.8));
    case "bin":
      return Math.max(1, Math.floor(s.length / 0.45));
    case "cubby":
      return Math.max(1, Math.round(s.length / 0.4));
    case "cantilever":
      return 4;
    default:
      return Math.max(1, Math.floor(s.length / 0.55));
  }
}

export function itemsAtLevel(s: Pick<ShelfData, "items">, level: number) {
  return s.items.filter((i) => i.level === level);
}

export function fillPercent(s: Pick<ShelfData, "type" | "length" | "levels" | "items">) {
  const capacity = s.levels * levelSlots(s);
  const used = s.items.filter((i) => i.level < s.levels).length;
  return Math.min(100, Math.round((used / capacity) * 100));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** auto location code: room . shelf . level, e.g. 01.02.03 */
export function defaultLevelTag(roomCode: string, shelfIndex: number, level: number) {
  return `${roomCode}.${pad(shelfIndex + 1)}.${pad(level + 1)}`;
}

export function levelTag(roomCode: string, shelfIndex: number, shelf: Pick<ShelfData, "tags">, level: number) {
  return shelf.tags?.[level]?.trim() || defaultLevelTag(roomCode, shelfIndex, level);
}

// ---------- containers: the boxes, crates and drums stored on shelves ----------

export type ContainerShape = "box" | "crate" | "cylinder";

export const CONTAINER_SHAPES: Record<ContainerShape, string> = { box: "Kardus (tertutup)", crate: "Crate / bak terbuka", cylinder: "Drum / tong" };

export interface ContainerType {
  id: string;
  name: string;
  shape: ContainerShape;
  /** meters; for a cylinder the diameter is min(width, depth) */
  width: number;
  height: number;
  depth: number;
  color: string;
}

export const DEFAULT_CONTAINERS: ContainerType[] = [
  { id: "ct-kardus-s", name: "Kardus Kecil", shape: "box", width: 0.3, height: 0.25, depth: 0.3, color: "#d4a373" },
  { id: "ct-kardus-l", name: "Kardus Besar", shape: "box", width: 0.45, height: 0.4, depth: 0.4, color: "#c58f5c" },
  { id: "ct-arsip", name: "Box Arsip", shape: "box", width: 0.25, height: 0.3, depth: 0.38, color: "#e9dcc0" },
  { id: "ct-crate", name: "Crate Plastik", shape: "crate", width: 0.4, height: 0.25, depth: 0.3, color: "#3b82f6" },
  { id: "ct-drum", name: "Drum", shape: "cylinder", width: 0.35, height: 0.45, depth: 0.35, color: "#1d4ed8" },
];

export function containerFor(list: ContainerType[], id?: string): ContainerType {
  return list.find((c) => c.id === id) ?? list[0] ?? DEFAULT_CONTAINERS[0];
}
