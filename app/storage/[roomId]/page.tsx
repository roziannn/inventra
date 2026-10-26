"use client";

import React, { useState, use } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import { clampToRoom, shelfsOverlap, type ShelfData } from "@/components/ShelfViewer";
import toast from "react-hot-toast";
import { rooms } from "@/lib/storage-data";
import { IconPlus, IconRotate, IconTrash, IconTool, IconCheck } from "@tabler/icons-react";

const ShelfViewer = dynamic(() => import("@/components/ShelfViewer"), {
  ssr: false,
  loading: () => <div className="h-[calc(100vh-13rem)] min-h-[28rem] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

function findFreeSpot(shelves: ShelfData[], width: number, depth: number) {
  for (let z = -depth / 2; z <= depth / 2; z += 0.5) {
    for (let x = -width / 2; x <= width / 2; x += 0.5) {
      const c = clampToRoom(x, z, false, width, depth);
      if (!shelves.some((o) => shelfsOverlap({ ...c, rotated: false }, o))) return c;
    }
  }
  return null;
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const room = rooms.find((r) => r.id === roomId);
  const [shelves, setShelves] = useState<ShelfData[]>(room?.shelves ?? []);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevels, setNewLevels] = useState(4);

  if (!room) notFound();

  const selected = shelves.find((s) => s.id === selectedShelf);
  const update = (id: string, patch: Partial<ShelfData>) => setShelves((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addShelf = () => {
    const spot = findFreeSpot(shelves, room.width, room.depth);
    if (!spot) {
      toast.error("Tidak ada ruang kosong untuk rak baru");
      return;
    }
    const id = `RK-${Date.now()}`;
    const name = newName.trim() || `Rak ${shelves.length + 1}`;
    setShelves((prev) => [...prev, { id, name, levels: newLevels, usedPercent: 0, x: spot.x, z: spot.z, rotated: false }]);
    setSelectedShelf(id);
    setNewName("");
  };

  const rotate = (s: ShelfData) => {
    const rotated = !s.rotated;
    const pos = clampToRoom(s.x, s.z, rotated, room.width, room.depth);
    if (shelves.some((o) => o.id !== s.id && shelfsOverlap({ ...pos, rotated }, o))) {
      toast.error("Tidak bisa diputar, rak akan menabrak rak lain");
      return;
    }
    update(s.id, { rotated, ...pos });
  };

  const remove = (id: string) => {
    setShelves((prev) => prev.filter((s) => s.id !== id));
    setSelectedShelf(null);
  };

  const inputClass = "w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs focus:border-violet-600 focus:outline-none dark:border-gray-100/10";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Storage", href: "/storage" }, { label: room.name }]} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{room.name}</h2>
            <p className="text-xs text-gray-500 font-medium">
              {room.location} · {room.width} x {room.depth} m
            </p>
          </div>
          <Button variant={editMode ? "page-primary" : "page-secondary"} onClick={() => setEditMode((v) => !v)}>
            {editMode ? <IconCheck size={16} /> : <IconTool size={16} />} {editMode ? "Selesai" : "Rak Builder"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ShelfViewer
              shelves={shelves}
              roomWidth={room.width}
              roomDepth={room.depth}
              selectedId={selectedShelf}
              editable={editMode}
              onSelect={setSelectedShelf}
              onMove={(id, x, z) => update(id, { x, z })}
              onBlocked={() => toast.error("Rak menabrak rak lain, posisi dikembalikan")}
            />
            <p className="mt-2 text-[11px] text-gray-400">
              {editMode ? "Drag rak untuk menggeser, drag area kosong untuk memutar kamera." : "Drag untuk memutar kamera, klik rak untuk melihat detail."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {editMode && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-100/10">
                <p className="text-xs font-bold text-gray-900">Tambah Rak</p>
                <input className={inputClass} placeholder={`Rak ${shelves.length + 1}`} value={newName} onChange={(e) => setNewName(e.target.value)} />
                <label className="flex items-center justify-between text-xs text-gray-500">
                  Jumlah tingkat
                  <input type="number" min={1} max={8} className={`${inputClass} !w-20`} value={newLevels} onChange={(e) => setNewLevels(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} />
                </label>
                <Button variant="modal-primary" onClick={addShelf}>
                  <IconPlus size={16} /> Tambah
                </Button>
              </div>
            )}

            {shelves.map((s) => (
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

            {editMode && selected && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-100/10">
                <p className="text-xs font-bold text-gray-900">Edit {selected.name}</p>
                <input className={inputClass} value={selected.name} onChange={(e) => update(selected.id, { name: e.target.value })} />
                <label className="flex items-center justify-between text-xs text-gray-500">
                  Jumlah tingkat
                  <input
                    type="number"
                    min={1}
                    max={8}
                    className={`${inputClass} !w-20`}
                    value={selected.levels}
                    onChange={(e) => update(selected.id, { levels: Math.max(1, Math.min(8, Number(e.target.value) || 1)) })}
                  />
                </label>
                <div className="flex gap-2">
                  <Button variant="modal-secondary" className="flex-1" onClick={() => rotate(selected)}>
                    <IconRotate size={16} /> Putar
                  </Button>
                  <Button variant="modal-danger" className="flex-1" onClick={() => remove(selected.id)}>
                    <IconTrash size={16} /> Hapus
                  </Button>
                </div>
              </div>
            )}
            {shelves.length === 0 && <p className="text-[11px] text-gray-400">Belum ada rak. Aktifkan Rak Builder untuk menambah.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
