import type { ShelfData } from "@/components/ShelfViewer";

export interface Room {
  id: string;
  name: string;
  location: string;
  shelves: ShelfData[];
}

// Dummy data (FE only)
export const rooms: Room[] = [
  {
    id: "RM-001",
    name: "Ruangan 1",
    location: "Gedung A - Lantai 1",
    shelves: [
      { id: "RK-101", name: "Rak 1", levels: 4, usedPercent: 75 },
      { id: "RK-102", name: "Rak 2", levels: 4, usedPercent: 40 },
      { id: "RK-103", name: "Rak 3", levels: 3, usedPercent: 90 },
    ],
  },
  {
    id: "RM-002",
    name: "Ruangan 2",
    location: "Gedung A - Lantai 2",
    shelves: [
      { id: "RK-201", name: "Rak 1", levels: 5, usedPercent: 20 },
      { id: "RK-202", name: "Rak 2", levels: 5, usedPercent: 55 },
    ],
  },
  {
    id: "RM-003",
    name: "Gudang Utama",
    location: "Gedung B",
    shelves: [
      { id: "RK-301", name: "Rak 1", levels: 4, usedPercent: 60 },
      { id: "RK-302", name: "Rak 2", levels: 4, usedPercent: 85 },
      { id: "RK-303", name: "Rak 3", levels: 4, usedPercent: 30 },
      { id: "RK-304", name: "Rak 4", levels: 3, usedPercent: 10 },
    ],
  },
];
