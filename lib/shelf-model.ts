export type ShelfType = "standard" | "angle" | "pallet";

export const SHELF_TYPES: Record<ShelfType, { label: string; depth: number; length: number; height: number; color: string }> = {
  standard: { label: "Rak Standar", depth: 0.7, length: 1.6, height: 2.2, color: "#a78bfa" },
  angle: { label: "Rak Besi Siku (Boltless)", depth: 0.5, length: 3, height: 2, color: "#e5e7eb" },
  pallet: { label: "Rak Pallet (Heavy Duty)", depth: 0.9, length: 3.6, height: 3, color: "#f97316" },
};

export interface ShelfItem {
  id: string;
  /** 0 = bottom level */
  level: number;
  name: string;
  sku: string;
  qty: number;
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

/** how many items fit on one level (one box slot per item) */
export function levelSlots(s: Pick<ShelfData, "type" | "length">) {
  return s.type === "pallet" ? Math.max(1, Math.round(s.length / 1.8)) : Math.max(1, Math.floor(s.length / 0.55));
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
