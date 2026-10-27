import { DEFAULT_CONTAINERS, levelSlots, type ShelfData, type ShelfItem, type ShelfType } from "@/lib/storage/shelf-model";
import { hardwareCatalog, type HardwareCategory } from "@/lib/demo/hardware";
import type { Opening } from "@/lib/storage/room-openings";

export interface Room {
  id: string;
  name: string;
  location: string;
  width: number;
  depth: number;
  openings: Opening[];
  shelves: ShelfData[];
}

// Dummy data (FE only)
export const itemCatalog = hardwareCatalog.map((i) => ({ id: i.id, name: i.name, sku: i.sku, category: i.category }));

// fill levels bottom-up until `percent` of the shelf capacity is stocked, using items from the given categories
function seedItems(shelfId: string, levels: number, percent: number, type: ShelfType, length: number, categories: HardwareCategory[]): ShelfItem[] {
  const slots = levelSlots({ type, length });
  const target = Math.round((percent / 100) * levels * slots);
  const pool = itemCatalog.filter((c) => categories.includes(c.category));
  const items: ShelfItem[] = [];
  for (let n = 0; n < target; n++) {
    const c = pool[(n + Number(shelfId.slice(-1))) % pool.length];
    items.push({ id: `${shelfId}-I${n + 1}`, level: Math.floor(n / slots), name: c.name, sku: c.sku, qty: 1 + ((n * 7) % 20), containerId: DEFAULT_CONTAINERS[(n + 1) % 4].id });
  }
  return items;
}

export const rooms: Room[] = [
  {
    id: "RM-001",
    name: "Gudang Komponen PC",
    location: "Gedung A - Lantai 1",
    width: 10,
    depth: 6,
    openings: [
      { id: "OP-1", kind: "door", wall: "front", offset: 3.5, width: 1 },
      { id: "OP-2", kind: "window", wall: "back", offset: -2, width: 1.6 },
      { id: "OP-3", kind: "window", wall: "back", offset: 2, width: 1.6 },
    ],
    shelves: [
      {
        id: "RK-101",
        name: "Rak CPU & RAM",
        levels: 4,
        items: seedItems("RK-101", 4, 75, "standard", 1.6, ["Processor", "Memory"]),
        x: -3,
        z: -1.5,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
      {
        id: "RK-102",
        name: "Rak Storage (SSD/HDD)",
        levels: 4,
        items: seedItems("RK-102", 4, 40, "standard", 1.6, ["Storage"]),
        x: 0,
        z: -1.5,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
      {
        id: "RK-103",
        name: "Rak GPU & Motherboard",
        levels: 3,
        items: seedItems("RK-103", 3, 90, "standard", 1.6, ["Graphics Card", "Motherboard"]),
        x: 3,
        z: -1.5,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
    ],
  },
  {
    id: "RM-002",
    name: "Ruang Aset IT",
    location: "Gedung A - Lantai 2",
    width: 8,
    depth: 5,
    openings: [
      { id: "OP-1", kind: "door", wall: "front", offset: 0, width: 1 },
      { id: "OP-2", kind: "window", wall: "right", offset: 0, width: 1.4 },
    ],
    shelves: [
      {
        id: "RK-201",
        name: "Rak Peripheral",
        levels: 5,
        items: seedItems("RK-201", 5, 20, "standard", 1.6, ["Peripheral"]),
        x: -2,
        z: 0,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
      {
        id: "RK-203",
        name: "Rak Besi - Networking",
        levels: 4,
        items: seedItems("RK-203", 4, 50, "angle", 3, ["Networking"]),
        x: 0,
        z: -2,
        rotated: false,
        type: "angle",
        length: 3,
        height: 2,
        color: "#e5e7eb",
        coverTop: true,
      },
      {
        id: "RK-202",
        name: "Rak Aksesoris",
        levels: 5,
        items: seedItems("RK-202", 5, 55, "standard", 1.6, ["Cable & Accessories"]),
        x: 2,
        z: 0,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
    ],
  },
  {
    id: "RM-003",
    name: "Gudang Utama",
    location: "Gedung B",
    width: 12,
    depth: 7,
    openings: [
      { id: "OP-1", kind: "door", wall: "front", offset: -4, width: 1.8 },
      { id: "OP-2", kind: "door", wall: "front", offset: 4, width: 1.8 },
      { id: "OP-3", kind: "window", wall: "back", offset: 0, width: 2.5 },
    ],
    shelves: [
      {
        id: "RK-301",
        name: "Rak Pallet - Casing & Monitor",
        levels: 3,
        items: seedItems("RK-301", 3, 60, "pallet", 3.6, ["Casing", "Peripheral"]),
        x: -4,
        z: -2,
        rotated: false,
        type: "pallet",
        length: 3.6,
        height: 3,
        color: "#f97316",
      },
      {
        id: "RK-302",
        name: "Rak PSU & Cooling",
        levels: 4,
        items: seedItems("RK-302", 4, 85, "standard", 1.6, ["Power Supply", "Cooling"]),
        x: -1,
        z: -2,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
      {
        id: "RK-303",
        name: "Rak Processor (Cadangan)",
        levels: 4,
        items: seedItems("RK-303", 4, 30, "standard", 1.6, ["Processor"]),
        x: 1.5,
        z: -2,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
      {
        id: "RK-304",
        name: "Rak Memory (Cadangan)",
        levels: 3,
        items: seedItems("RK-304", 3, 10, "standard", 1.6, ["Memory"]),
        x: 4,
        z: -2,
        rotated: false,
        type: "standard",
        length: 1.6,
        height: 2.2,
        color: "#a78bfa",
      },
      {
        id: "RK-305",
        name: "Rak Bin - Komponen Kecil",
        levels: 4,
        items: seedItems("RK-305", 4, 60, "bin", 1.8, ["Cable & Accessories", "Cooling"]),
        x: -3,
        z: 0.4,
        rotated: false,
        type: "bin",
        length: 1.8,
        height: 2,
        color: "#2563eb",
      },
      {
        id: "RK-306",
        name: "Rak Kubus - Kartu & Modul",
        levels: 4,
        items: seedItems("RK-306", 4, 50, "cubby", 1.6, ["Networking", "Memory"]),
        x: -0.8,
        z: 0.4,
        rotated: false,
        type: "cubby",
        length: 1.6,
        height: 1.8,
        color: "#d6b88c",
      },
      {
        id: "RK-307",
        name: "Rak Cantilever - Roll Kabel",
        levels: 3,
        items: seedItems("RK-307", 3, 50, "cantilever", 3, ["Cable & Accessories"]),
        x: 2.9,
        z: 0.6,
        rotated: false,
        type: "cantilever",
        length: 3,
        height: 2.5,
        color: "#ea580c",
      },
      {
        id: "RK-308",
        name: "Rak Kawat - Aksesoris",
        levels: 4,
        items: seedItems("RK-308", 4, 40, "wire", 1.2, ["Cable & Accessories", "Peripheral"]),
        x: 5.3,
        z: 0.6,
        rotated: false,
        type: "wire",
        length: 1.2,
        height: 1.8,
        color: "#cbd5e1",
      },
    ],
  },
];
