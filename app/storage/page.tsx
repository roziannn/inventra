"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { IconBuildingWarehouse, IconLayoutRows } from "@tabler/icons-react";
import { rooms } from "@/lib/storage-data";

export default function StoragePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Storage</h2>
          <p className="text-xs text-gray-500 font-medium">Kelola ruangan dan rak penyimpanan barang.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/storage/${room.id}`}
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
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
