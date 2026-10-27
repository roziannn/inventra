import * as THREE from "three";
import { SHELF_TYPES, itemsAtLevel, levelSlots, type ContainerType, type ShelfData, type ShelfItem, type ShelfType } from "@/lib/storage/shelf-model";

type Add = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => THREE.Mesh;

export interface BuildMats {
  frame: THREE.Material;
  metal: THREE.Material;
  blue: THREE.Material;
  wood: THREE.Material;
  box: THREE.Material;
  chrome: THREE.Material;
  /** shelf-colored material for the body (also used by the optional covers) */
  body: THREE.Material;
}

export interface BuildContext {
  shelf: ShelfData;
  add: Add;
  addTag: (level: number, x: number, y: number, z: number) => void;
  /** one material per level so unselected levels can be dimmed */
  levelMats: THREE.Material[];
  mats: BuildMats;
  /** draws an item's container on a surface at baseY, scaled down to fit the slot (maxW x maxH x maxD) */
  addContainer: (item: ShelfItem, x: number, baseY: number, z: number, maxW: number, maxH: number, maxD: number) => void;
  containerOf: (item: ShelfItem) => ContainerType;
  matFor: (color: string) => THREE.Material;
}

const dims = (c: BuildContext) => ({ W: c.shelf.length, H: c.shelf.height, D: SHELF_TYPES[c.shelf.type].depth });

function standard(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(0.06, H, 0.06, mats.frame, (sx * W) / 2, H / 2, (sz * D) / 2);
  const step = H / shelf.levels;
  const perLevel = levelSlots(shelf);
  for (let l = 0; l < shelf.levels; l++) {
    add(W, 0.05, D, levelMats[l], 0, l * step + 0.03, 0);
    addTag(l, -W / 2 + 0.38, l * step + 0.08, D / 2 + 0.012);
    itemsAtLevel(shelf, l)
      .slice(0, perLevel)
      .forEach((it, b) => c.addContainer(it, (b - (perLevel - 1) / 2) * (W / perLevel), l * step + 0.05, 0, W / perLevel - 0.05, step - 0.08, D * 0.9));
  }
}

/** galvanized angle-iron racking: L-profile posts shared between bays, light panels with a front lip */
function angle(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  const bays = Math.max(1, Math.round(W / 1.5));
  const bayW = W / bays;
  const zf = D / 2 - 0.02;
  for (let i = 0; i <= bays; i++) {
    const x = -W / 2 + i * bayW;
    for (const sz of [-1, 1]) {
      add(0.05, H, 0.012, mats.metal, x, H / 2, sz * zf + sz * 0.019);
      add(0.012, H, 0.04, mats.metal, x - 0.019, H / 2, sz * zf);
    }
  }
  const perLevel = levelSlots(shelf);
  const step = shelf.levels > 1 ? (H - 0.25) / (shelf.levels - 1) : 0;
  for (let l = 0; l < shelf.levels; l++) {
    const y = 0.1 + l * step;
    for (let b = 0; b < bays; b++) {
      const cx = -W / 2 + (b + 0.5) * bayW;
      add(bayW - 0.06, 0.02, D, levelMats[l], cx, y, 0);
      add(bayW - 0.06, 0.06, 0.012, levelMats[l], cx, y - 0.02, D / 2 + 0.006);
      add(bayW - 0.06, 0.06, 0.012, levelMats[l], cx, y - 0.02, -D / 2 - 0.006);
    }
    addTag(l, -W / 2 + 0.34, y - 0.02, D / 2 + 0.02);
    itemsAtLevel(shelf, l)
      .slice(0, perLevel)
      .forEach((it, b) => c.addContainer(it, -W / 2 + (b + 0.5) * (W / perLevel), y + 0.01, 0, (W / perLevel) * 0.9, (step || H) - 0.05, D * 0.9));
  }
}

/** chrome wire shelving: round-ish posts, wire decks made of a rail frame and thin slats */
function wire(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(0.035, H, 0.035, mats.chrome, sx * (W / 2 - 0.02), H / 2, sz * (D / 2 - 0.02));
  const step = H / shelf.levels;
  const perLevel = levelSlots(shelf);
  const slats = Math.max(4, Math.floor(W / 0.1));
  for (let l = 0; l < shelf.levels; l++) {
    const y = l * step + 0.08;
    const mat = levelMats[l];
    add(W, 0.025, 0.025, mat, 0, y, D / 2 - 0.015);
    add(W, 0.025, 0.025, mat, 0, y, -D / 2 + 0.015);
    add(0.025, 0.025, D, mat, -W / 2 + 0.015, y, 0);
    add(0.025, 0.025, D, mat, W / 2 - 0.015, y, 0);
    for (let k = 1; k < slats; k++) add(0.008, 0.012, D - 0.03, mat, -W / 2 + (k * W) / slats, y, 0);
    addTag(l, -W / 2 + 0.34, y, D / 2 + 0.012);
    itemsAtLevel(shelf, l)
      .slice(0, perLevel)
      .forEach((it, b) => c.addContainer(it, -W / 2 + (b + 0.5) * (W / perLevel), y + 0.0125, 0, W / perLevel - 0.04, step - 0.1, D * 0.9));
  }
}

/** shelving frame with open-front plastic bins; each slot is one bin and the level color is the bin color */
function bin(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(0.05, H, 0.05, mats.metal, (sx * W) / 2, H / 2, (sz * D) / 2);
  const step = H / shelf.levels;
  const perLevel = levelSlots(shelf);
  const slotW = W / perLevel;
  const bw = slotW - 0.05;
  const bd = D * 0.92;
  const bh = Math.min(step * 0.72, 0.4);
  for (let l = 0; l < shelf.levels; l++) {
    const y = l * step + 0.03;
    const mat = levelMats[l];
    add(W, 0.03, D, mats.metal, 0, y, 0);
    addTag(l, -W / 2 + 0.3, y, D / 2 + 0.012);
    const stocked = itemsAtLevel(shelf, l);
    for (let b = 0; b < perLevel; b++) {
      const cx = -W / 2 + (b + 0.5) * slotW;
      const base = y + 0.015;
      add(bw, 0.02, bd, mat, cx, base + 0.01, 0);
      add(bw, bh, 0.02, mat, cx, base + bh / 2, -bd / 2 + 0.01);
      add(0.02, bh, bd, mat, cx - bw / 2 + 0.01, base + bh / 2, 0);
      add(0.02, bh, bd, mat, cx + bw / 2 - 0.01, base + bh / 2, 0);
      add(bw, bh * 0.45, 0.02, mat, cx, base + (bh * 0.45) / 2, bd / 2 - 0.01);
      if (stocked[b]) c.addContainer(stocked[b], cx, base + 0.02, -0.02, (bw - 0.05) * 0.9, bh - 0.02, (bd - 0.05) * 0.8);
    }
  }
}

/** wooden pigeonhole cabinet: solid carcass with a grid of open cells */
function cubby(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  const t = 0.025;
  add(t, H, D, mats.body, -W / 2 + t / 2, H / 2, 0);
  add(t, H, D, mats.body, W / 2 - t / 2, H / 2, 0);
  add(W, t, D, mats.body, 0, H - t / 2, 0);
  add(W, H, 0.015, mats.body, 0, H / 2, -D / 2 + 0.0075);
  const step = H / shelf.levels;
  const cols = levelSlots(shelf);
  const cellW = (W - 2 * t) / cols;
  for (let l = 0; l < shelf.levels; l++) {
    const y = l * step;
    add(W - 2 * t, t, D, levelMats[l], 0, y + t / 2, 0);
    for (let k = 1; k < cols; k++) add(t * 0.8, step - t, D, levelMats[l], -W / 2 + t + k * cellW, y + t + (step - t) / 2, 0);
    addTag(l, -W / 2 + 0.3, y + t, D / 2 + 0.012);
    itemsAtLevel(shelf, l)
      .slice(0, cols)
      .forEach((it, b) => c.addContainer(it, -W / 2 + t + (b + 0.5) * cellW, y + t, 0, cellW * 0.9, step - t - 0.02, D * 0.85));
  }
}

/** cantilever rack for long goods: center columns with arms reaching out to both sides */
function cantilever(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  const cols = Math.max(2, Math.round(W / 1.5) + 1);
  const colGap = W / (cols - 1);
  for (let i = 0; i < cols; i++) {
    const x = -W / 2 + i * colGap;
    add(0.1, H, 0.1, mats.blue, x, H / 2, 0);
    add(0.08, 0.06, D, mats.blue, x, 0.03, 0);
    const brace = add(0.03, Math.hypot(H * 0.45, D * 0.4), 0.03, mats.blue, x, H * 0.2, D * 0.2);
    brace.rotation.x = -Math.atan2(D * 0.4, H * 0.45);
  }
  const step = (H - 0.4) / shelf.levels;
  const bars = levelSlots(shelf);
  for (let l = 0; l < shelf.levels; l++) {
    const y = 0.35 + l * step;
    for (let i = 0; i < cols; i++) add(0.06, 0.06, D, levelMats[l], -W / 2 + i * colGap, y, 0);
    addTag(l, -W / 2 + 0.32, y, D / 2 + 0.035);
    itemsAtLevel(shelf, l)
      .slice(0, bars)
      .forEach((it, b) => {
        const t = c.containerOf(it);
        const thick = Math.max(0.08, Math.min(0.2, Math.min(t.width, t.depth) * 0.4));
        add(W - 0.1, thick, thick, c.matFor(t.color), 0, y + 0.03 + thick / 2, -D / 2 + (b + 0.5) * (D / bars));
      });
  }
}

/** heavy duty pallet racking: blue braced upright frames, colored beams, wooden decks */
function pallet(c: BuildContext) {
  const { shelf, add, addTag, levelMats, mats } = c;
  const { W, H, D } = dims(c);
  const bays = Math.max(1, Math.round(W / 1.8));
  const bayW = W / bays;
  const zf = D / 2 - 0.04;
  for (let i = 0; i <= bays; i++) {
    const x = -W / 2 + i * bayW;
    add(0.07, H, 0.07, mats.blue, x, H / 2, -zf);
    add(0.07, H, 0.07, mats.blue, x, H / 2, zf);
    const segs = Math.max(1, Math.round(H / 0.5));
    const sh = H / segs;
    for (let k = 0; k < segs; k++) {
      const y0 = k * sh;
      const dz = (k % 2 === 0 ? 1 : -1) * 2 * zf;
      const diag = add(0.03, Math.hypot(sh, dz), 0.03, mats.blue, x, y0 + sh / 2, 0);
      diag.rotation.x = Math.atan2(dz, sh);
      add(0.03, 0.03, 2 * zf, mats.blue, x, y0, 0);
    }
  }
  const step = (H - 0.3) / shelf.levels;
  for (let l = 0; l < shelf.levels; l++) {
    const stocked = itemsAtLevel(shelf, l);
    const y = 0.25 + l * step;
    add(W, 0.12, 0.05, levelMats[l], 0, y, -zf);
    add(W, 0.12, 0.05, levelMats[l], 0, y, zf);
    addTag(l, -W / 2 + 0.5, y, zf + 0.03);
    for (let b = 0; b < bays; b++) {
      const cx = -W / 2 + (b + 0.5) * bayW;
      add(bayW - 0.12, 0.03, D - 0.12, mats.wood, cx, y + 0.04, 0);
      if (stocked[b]) c.addContainer(stocked[b], cx, y + 0.055, 0, bayW * 0.8, Math.max(0.2, Math.min(step - 0.3, 0.9)), D * 0.8);
    }
  }
}

export const SHELF_BUILDERS: Record<ShelfType, (c: BuildContext) => void> = { standard, angle, wire, bin, cubby, cantilever, pallet };
