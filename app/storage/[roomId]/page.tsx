"use client";

import React, { useState, use } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { rooms } from "@/lib/storage-data";

const ShelfViewer = dynamic(() => import("@/components/ShelfViewer"), {
  ssr: false,
  loading: () => <div className="h-[28rem] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const room = rooms.find((r) => r.id === roomId);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);

  if (!room) notFound();

  const shelf = room.shelves.find((s) => s.id === selectedShelf);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Storage", href: "/storage" }, { label: room.name }]} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{room.name}</h2>
          <p className="text-xs text-gray-500 font-medium">{room.location}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ShelfViewer shelves={room.shelves} selectedId={selectedShelf} onSelect={setSelectedShelf} />
            <p className="mt-2 text-[11px] text-gray-400">Drag untuk memutar, klik rak untuk melihat detail.</p>
          </div>

          <div className="flex flex-col gap-2">
            {room.shelves.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedShelf(s.id)}
                className={`rounded-xl border p-3 text-left text-xs transition-all ${
                  s.id === selectedShelf ? "border-violet-600 bg-violet-50 dark:bg-violet-500/12" : "border-gray-200 hover:border-violet-400 dark:border-gray-100/10"
                }`}
              >
                <p className="font-bold text-gray-900">{s.name}</p>
                <p className="text-gray-500">
                  {s.levels} tingkat · terisi {s.usedPercent}%
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${s.usedPercent}%` }} />
                </div>
              </button>
            ))}
            {!shelf && <p className="text-[11px] text-gray-400">Pilih rak untuk melihat detail.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
