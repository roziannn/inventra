"use client";

import React, { useState, use } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import { clampToRoom, shelfsOverlap, SHELF_TYPES, type ShelfData, type ShelfType } from "@/components/ShelfViewer";
import { rooms } from "@/lib/storage-data";
import { IconPlus, IconRotate, IconTrash, IconTool, IconCheck } from "@tabler/icons-react";

const ShelfViewer = dynamic(() => import("@/components/ShelfViewer"), {
  ssr: false,
  loading: () => <div className="h-[calc(100vh-15rem)] min-h-[28rem] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

function findFreeSpot(draft: Pick<ShelfData, "rotated" | "length" | "type">, shelves: ShelfData[], width: number, depth: number) {
  for (let z = -depth / 2; z <= depth / 2; z += 0.5) {
    for (let x = -width / 2; x <= width / 2; x += 0.5) {
      const c = clampToRoom(x, z, draft, width, depth);
      if (!shelves.some((o) => shelfsOverlap({ ...draft, ...c }, o))) return c;
    }
  }
  return null;
}

const typeOptions = Object.keys(SHELF_TYPES) as ShelfType[];
const inputClass = "w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs focus:border-violet-600 focus:outline-none dark:border-gray-100/10";

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-500">
      <span className="flex justify-between">
        {label} <b className="text-gray-900">{value.toFixed(1)} m</b>
      </span>
      <input type="range" min={min} max={max} step={0.1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-violet-600" />
    </label>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between text-xs text-gray-500">
      Warna
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-14 cursor-pointer rounded-md border border-gray-200 bg-transparent dark:border-gray-100/10" />
    </label>
  );
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const room = rooms.find((r) => r.id === roomId);
  const [shelves, setShelves] = useState<ShelfData[]>(room?.shelves ?? []);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ name: "", levels: 4, type: "standard" as ShelfType, ...pick("standard") });

  function pick(type: ShelfType) {
    const { length, height, color } = SHELF_TYPES[type];
    return { length, height, color };
  }

  if (!room) notFound();

  const selected = shelves.find((s) => s.id === selectedShelf);
  const update = (id: string, patch: Partial<ShelfData>) => setShelves((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // apply a change to a shelf only if it still fits in the room and doesn't hit other shelves
  const tryUpdate = (s: ShelfData, patch: Partial<ShelfData>, errorMessage = "Perubahan ditolak, rak tidak muat atau menabrak rak lain") => {
    const next = { ...s, ...patch };
    const limit = next.rotated ? room.depth : room.width;
    const pos = clampToRoom(next.x, next.z, next, room.width, room.depth);
    if (next.length > limit - 0.1 || shelves.some((o) => o.id !== s.id && shelfsOverlap({ ...next, ...pos }, o))) {
      toast.error(errorMessage);
      return;
    }
    update(s.id, { ...patch, ...pos });
  };

  const addShelf = () => {
    const place = { rotated: false, length: draft.length, type: draft.type };
    const spot = findFreeSpot(place, shelves, room.width, room.depth);
    if (!spot) {
      toast.error("Tidak ada ruang kosong untuk rak baru");
      return;
    }
    const id = `RK-${Date.now()}`;
    const name = draft.name.trim() || `Rak ${shelves.length + 1}`;
    setShelves((prev) => [...prev, { id, name, levels: draft.levels, usedPercent: 0, ...spot, ...place, height: draft.height, color: draft.color }]);
    setSelectedShelf(id);
    setDraft((d) => ({ ...d, name: "" }));
  };

  const remove = (id: string) => {
    setShelves((prev) => prev.filter((s) => s.id !== id));
    setSelectedShelf(null);
  };

  const maxLength = Math.max(1, Math.floor(Math.min(room.width, room.depth) * 10 - 1) / 10);

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
                <select
                  className={inputClass}
                  value={draft.type}
                  onChange={(e) => {
                    const type = e.target.value as ShelfType;
                    setDraft((d) => ({ ...d, type, ...pick(type), length: Math.min(pick(type).length, maxLength) }));
                  }}
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {SHELF_TYPES[t].label}
                    </option>
                  ))}
                </select>
                <input className={inputClass} placeholder={`Rak ${shelves.length + 1}`} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                <Slider label="Panjang" value={draft.length} min={0.8} max={maxLength} onChange={(length) => setDraft((d) => ({ ...d, length }))} />
                <Slider label="Tinggi" value={draft.height} min={1} max={5} onChange={(height) => setDraft((d) => ({ ...d, height }))} />
                <label className="flex items-center justify-between text-xs text-gray-500">
                  Jumlah tingkat
                  <input type="number" min={1} max={8} className={`${inputClass} !w-20`} value={draft.levels} onChange={(e) => setDraft((d) => ({ ...d, levels: Math.max(1, Math.min(8, Number(e.target.value) || 1)) }))} />
                </label>
                <ColorField value={draft.color} onChange={(color) => setDraft((d) => ({ ...d, color }))} />
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
                <p className="flex items-center gap-2 font-bold text-gray-900">
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
                  {s.name}
                </p>
                <p className="text-gray-500">
                  {SHELF_TYPES[s.type].label} · {s.length.toFixed(1)} x {s.height.toFixed(1)} m · {s.levels} tingkat · terisi {s.usedPercent}%
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${s.usedPercent}%` }} />
                </div>
              </button>
            ))}

            {editMode && selected && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-100/10">
                <p className="text-xs font-bold text-gray-900">Edit {selected.name}</p>
                <select
                  className={inputClass}
                  value={selected.type}
                  onChange={(e) => {
                    const type = e.target.value as ShelfType;
                    tryUpdate(selected, { type, ...pick(type) });
                  }}
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {SHELF_TYPES[t].label}
                    </option>
                  ))}
                </select>
                <input className={inputClass} value={selected.name} onChange={(e) => update(selected.id, { name: e.target.value })} />
                <Slider label="Panjang" value={selected.length} min={0.8} max={maxLength} onChange={(length) => tryUpdate(selected, { length }, "Panjang ditolak, rak akan menabrak atau keluar ruangan")} />
                <Slider label="Tinggi" value={selected.height} min={1} max={5} onChange={(height) => update(selected.id, { height })} />
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
                <ColorField value={selected.color} onChange={(color) => update(selected.id, { color })} />
                <div className="flex gap-2">
                  <Button variant="modal-secondary" className="flex-1" onClick={() => tryUpdate(selected, { rotated: !selected.rotated }, "Tidak bisa diputar, rak akan menabrak atau keluar ruangan")}>
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
