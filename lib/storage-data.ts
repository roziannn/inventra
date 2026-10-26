import type { ShelfData } from "@/components/ShelfViewer";

export interface Room {
  id: string;
  name: string;
  location: string;
  width: number;
  depth: number;
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
    shelves: [
      { id: "RK-101", name: "Rak 1", levels: 4, usedPercent: 75, x: -3, z: -1.5, rotated: false },
      { id: "RK-102", name: "Rak 2", levels: 4, usedPercent: 40, x: 0, z: -1.5, rotated: false },
      { id: "RK-103", name: "Rak 3", levels: 3, usedPercent: 90, x: 3, z: -1.5, rotated: false },
    ],
  },
  {
    id: "RM-002",
    name: "Ruangan 2",
    location: "Gedung A - Lantai 2",
    width: 8,
    depth: 5,
    shelves: [
      { id: "RK-201", name: "Rak 1", levels: 5, usedPercent: 20, x: -2, z: 0, rotated: false },
      { id: "RK-202", name: "Rak 2", levels: 5, usedPercent: 55, x: 2, z: 0, rotated: false },
    ],
  },
  {
    id: "RM-003",
    name: "Gudang Utama",
    location: "Gedung B",
    width: 12,
    depth: 7,
    shelves: [
      { id: "RK-301", name: "Rak 1", levels: 4, usedPercent: 60, x: -3.5, z: -2, rotated: false },
      { id: "RK-302", name: "Rak 2", levels: 4, usedPercent: 85, x: -1, z: -2, rotated: false },
      { id: "RK-303", name: "Rak 3", levels: 4, usedPercent: 30, x: 1.5, z: -2, rotated: false },
      { id: "RK-304", name: "Rak 4", levels: 3, usedPercent: 10, x: 4, z: -2, rotated: false },
    ],
  },
];
