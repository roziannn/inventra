export type WallId = "back" | "front" | "left" | "right";
export type OpeningKind = "door" | "window";

export interface Opening {
  id: string;
  kind: OpeningKind;
  wall: WallId;
  /** center position along the wall in meters, 0 = middle of the wall */
  offset: number;
  width: number;
}

export interface Rect {
  cx: number;
  cz: number;
  hx: number;
  hz: number;
}

export const OPENING_KINDS: Record<OpeningKind, { label: string; width: number; min: number; max: number; sill: number; height: number }> = {
  door: { label: "Pintu", width: 1, min: 0.7, max: 2.2, sill: 0, height: 2.1 },
  window: { label: "Jendela", width: 1.4, min: 0.5, max: 4, sill: 0.9, height: 1.2 },
};

export const WALL_LABELS: Record<WallId, string> = { back: "Belakang", front: "Depan", left: "Kiri", right: "Kanan" };
export const WALL_IDS = Object.keys(WALL_LABELS) as WallId[];

const CORNER_MARGIN = 0.1;
const GAP = 0.05;

export function wallLength(wall: WallId, roomWidth: number, roomDepth: number) {
  return wall === "back" || wall === "front" ? roomWidth : roomDepth;
}

export function clampOffset(offset: number, width: number, wall: WallId, roomWidth: number, roomDepth: number) {
  const half = wallLength(wall, roomWidth, roomDepth) / 2 - width / 2 - CORNER_MARGIN;
  return half <= 0 ? 0 : Math.max(-half, Math.min(half, offset));
}

export function openingFits(o: Pick<Opening, "width" | "wall">, roomWidth: number, roomDepth: number) {
  return o.width <= wallLength(o.wall, roomWidth, roomDepth) - 2 * CORNER_MARGIN + 1e-6;
}

export function openingsCollide(a: Opening, b: Opening) {
  return a.id !== b.id && a.wall === b.wall && Math.abs(a.offset - b.offset) < (a.width + b.width) / 2 + GAP;
}

/** floor area in front of a door that must stay clear (door swing / walking space) */
export function doorClearance(o: Opening, roomWidth: number, roomDepth: number): Rect | null {
  if (o.kind !== "door") return null;
  const c = o.width;
  switch (o.wall) {
    case "back":
      return { cx: o.offset, cz: -roomDepth / 2 + c / 2, hx: o.width / 2, hz: c / 2 };
    case "front":
      return { cx: o.offset, cz: roomDepth / 2 - c / 2, hx: o.width / 2, hz: c / 2 };
    case "left":
      return { cx: -roomWidth / 2 + c / 2, cz: o.offset, hx: c / 2, hz: o.width / 2 };
    case "right":
      return { cx: roomWidth / 2 - c / 2, cz: o.offset, hx: c / 2, hz: o.width / 2 };
  }
}

export function doorClearances(openings: Opening[], roomWidth: number, roomDepth: number) {
  return openings.map((o) => doorClearance(o, roomWidth, roomDepth)).filter((r): r is Rect => r !== null);
}
