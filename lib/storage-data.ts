import type { ShelfData } from "@/components/ShelfViewer";
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
      { id: "RK-101", name: "Rak 1", levels: 4, usedPercent: 75, x: -3, z: -1.5, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-102", name: "Rak 2", levels: 4, usedPercent: 40, x: 0, z: -1.5, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-103", name: "Rak 3", levels: 3, usedPercent: 90, x: 3, z: -1.5, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
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
      { id: "RK-201", name: "Rak 1", levels: 5, usedPercent: 20, x: -2, z: 0, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-202", name: "Rak 2", levels: 5, usedPercent: 55, x: 2, z: 0, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
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
      { id: "RK-301", name: "Rak Pallet 1", levels: 3, usedPercent: 60, x: -4, z: -2, rotated: false, type: "pallet", length: 3.6, height: 3, color: "#f97316" },
      { id: "RK-302", name: "Rak 2", levels: 4, usedPercent: 85, x: -1, z: -2, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-303", name: "Rak 3", levels: 4, usedPercent: 30, x: 1.5, z: -2, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
      { id: "RK-304", name: "Rak 4", levels: 3, usedPercent: 10, x: 4, z: -2, rotated: false, type: "standard", length: 1.6, height: 2.2, color: "#a78bfa" },
    ],
  },
];
