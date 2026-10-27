import { DEFAULT_CONTAINERS, levelSlots, type ShelfData, type ShelfItem, type ShelfType } from "@/lib/shelf-model";
import type { Opening } from "@/lib/room-openings";

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
export const itemCatalog = [
  { id: "INV-1000", name: "Laptop Lenovo ThinkPad", sku: "SKU-8000" },
  { id: "INV-1001", name: "Kertas A4 80gsm (rim)", sku: "SKU-8001" },
  { id: "INV-1002", name: "Kursi Kantor Ergonomis", sku: "SKU-8002" },
  { id: "INV-1003", name: "Printer HP LaserJet", sku: "SKU-8003" },
  { id: "INV-1004", name: "Toner Cartridge", sku: "SKU-8004" },
  { id: "INV-1005", name: "Kabel HDMI 2m", sku: "SKU-8005" },
  { id: "INV-1006", name: "Monitor Dell 24 inch", sku: "SKU-8006" },
  { id: "INV-1007", name: "Meja Lipat", sku: "SKU-8007" },
];

// fill levels bottom-up until `percent` of the shelf capacity is stocked
function seedItems(shelfId: string, levels: number, percent: number, type: ShelfType, length: number): ShelfItem[] {
  const slots = levelSlots({ type, length });
  const target = Math.round((percent / 100) * levels * slots);
  const items: ShelfItem[] = [];
  for (let n = 0; n < target; n++) {
    const c = itemCatalog[(n + Number(shelfId.slice(-1))) % itemCatalog.length];
    items.push({ id: `${shelfId}-I${n + 1}`, level: Math.floor(n / slots), name: c.name, sku: c.sku, qty: 1 + ((n * 7) % 20), containerId: DEFAULT_CONTAINERS[(n + 1) % 4].id });
  }
  return items;
}
export const rooms: Room[] = [
  {
    id: "RM-001",
    name: "Ruangan 1",
    location: "Gedung A - Lantai 1",
    width: 10,
    depth: 6,
    openings: [
      { id: "OP-1", kind: "door", wall: "front", offset: 3.5, width: 1 },
      { id: "OP-2", kind: "window", wall: "back", offset: -2, width: 1.6 },
      { id: "OP-3", kind: "window", wall: "back", offset: 2, width: 1.6 },
    ],
    shelves: [
      { id: "RK-101", name: "Rak 1", levels: 4, items: seedItems("RK-101", 4, 75, "standard", 1.6), x: -3, z: -1.5, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-102", name: "Rak 2", levels: 4, items: seedItems("RK-102", 4, 40, "standard", 1.6), x: 0, z: -1.5, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-103", name: "Rak 3", levels: 3, items: seedItems("RK-103", 3, 90, "standard", 1.6), x: 3, z: -1.5, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
    ],
  },
  {
    id: "RM-002",
    name: "Ruangan 2",
    location: "Gedung A - Lantai 2",
    width: 8,
    depth: 5,
    openings: [
      { id: "OP-1", kind: "door", wall: "front", offset: 0, width: 1 },
      { id: "OP-2", kind: "window", wall: "right", offset: 0, width: 1.4 },
    ],
    shelves: [
      { id: "RK-201", name: "Rak 1", levels: 5, items: seedItems("RK-201", 5, 20, "standard", 1.6), x: -2, z: 0, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-203", name: "Rak Besi 1", levels: 4, items: seedItems("RK-203", 4, 50, "angle", 3), x: 0, z: -2, rotated: false, type: "angle", length: 3, height: 2, color: "#e5e7eb", coverTop: true },
      { id: "RK-202", name: "Rak 2", levels: 5, items: seedItems("RK-202", 5, 55, "standard", 1.6), x: 2, z: 0, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
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
      { id: "RK-301", name: "Rak Pallet 1", levels: 3, items: seedItems("RK-301", 3, 60, "pallet", 3.6), x: -4, z: -2, rotated: false, type: "pallet", length: 3.6, height: 3, color: "#f97316" },
      { id: "RK-302", name: "Rak 2", levels: 4, items: seedItems("RK-302", 4, 85, "standard", 1.6), x: -1, z: -2, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-303", name: "Rak 3", levels: 4, items: seedItems("RK-303", 4, 30, "standard", 1.6), x: 1.5, z: -2, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-304", name: "Rak 4", levels: 3, items: seedItems("RK-304", 3, 10, "standard", 1.6), x: 4, z: -2, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-305", name: "Rak Bin 1", levels: 4, items: seedItems("RK-305", 4, 60, "bin", 1.8), x: -3, z: 0.4, rotated: false, type: "bin", length: 1.8, height: 2, color: "#2563eb" },
      { id: "RK-306", name: "Rak Kubus 1", levels: 4, items: seedItems("RK-306", 4, 50, "cubby", 1.6), x: -0.8, z: 0.4, rotated: false, type: "cubby", length: 1.6, height: 1.8, color: "#d6b88c" },
      { id: "RK-307", name: "Rak Cantilever 1", levels: 3, items: seedItems("RK-307", 3, 50, "cantilever", 3), x: 2.9, z: 0.6, rotated: false, type: "cantilever", length: 3, height: 2.5, color: "#ea580c" },
      { id: "RK-308", name: "Rak Kawat 1", levels: 4, items: seedItems("RK-308", 4, 40, "wire", 1.2), x: 5.3, z: 0.6, rotated: false, type: "wire", length: 1.2, height: 1.8, color: "#cbd5e1" },
    ],
  },
];
