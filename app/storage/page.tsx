"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { IconBuildingWarehouse, IconLayoutRows } from "@tabler/icons-react";
import type { ShelfData } from "@/components/ShelfViewer";

const ShelfViewer = dynamic(() => import("@/components/ShelfViewer"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

interface Room {
  id: string;
  name: string;
  location: string;
  shelves: ShelfData[];
}

// Dummy data (FE only)
const rooms: Room[] = [
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

export default function StoragePage() {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);

  const shelf = activeRoom?.shelves.find((s) => s.id === selectedShelf);

  const close = () => {
    setActiveRoom(null);
    setSelectedShelf(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Storage</h2>
          <p className="text-xs text-gray-500 font-medium">Kelola ruangan dan rak penyimpanan barang.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-violet-400 hover:shadow-md dark:border-gray-100/10 dark:bg-white/6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/12">
                <IconBuildingWarehouse size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900">{room.name}</h3>
              <p className="text-xs text-gray-500">{room.location}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <IconLayoutRows size={14} /> {room.shelves.length} rak
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={!!activeRoom} onClose={close} title={activeRoom ? `${activeRoom.name} - ${activeRoom.location}` : ""}>
        {activeRoom && (
          <div className="flex flex-col gap-3">
            <ShelfViewer shelves={activeRoom.shelves} selectedId={selectedShelf} onSelect={setSelectedShelf} />
            <p className="text-[11px] text-gray-400">Drag untuk memutar, klik rak untuk melihat detail.</p>
            <div className="flex flex-wrap gap-2">
              {activeRoom.shelves.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedShelf(s.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    s.id === selectedShelf ? "border-violet-600 bg-violet-600 text-white" : "border-gray-200 text-gray-700 hover:border-violet-400 dark:border-gray-100/10"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {shelf && (
              <div className="rounded-xl border border-gray-200 p-3 text-xs dark:border-gray-100/10">
                <p className="font-bold text-gray-900">{shelf.name}</p>
                <p className="text-gray-500">{shelf.levels} tingkat · terisi {shelf.usedPercent}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${shelf.usedPercent}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
