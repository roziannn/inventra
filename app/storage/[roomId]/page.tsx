"use client";

import React, { useState, useRef, use } from "react";
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
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
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

const MIN_ROOM = 3;
const MAX_ROOM = 50;
const typeOptions = Object.keys(SHELF_TYPES) as ShelfType[];
const inputClass = "w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs focus:border-violet-600 focus:outline-none dark:border-gray-100/10";

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-gray-500">
      <span className="flex justify-between">
        {label} <b className="text-gray-900">{value.toFixed(1)} m</b>
      </span>
      <input type="range" min={min} max={max} step={0.1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-violet-600" />
    </label>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="color" aria-label="Warna" title="Warna" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-transparent dark:border-gray-100/10" />
  );
}

function TypeSelect({ value, onChange }: { value: ShelfType; onChange: (t: ShelfType) => void }) {
  return (
    <select className={`${inputClass} flex-1`} value={value} onChange={(e) => onChange(e.target.value as ShelfType)}>
      {typeOptions.map((t) => (
        <option key={t} value={t}>
          {SHELF_TYPES[t].label}
        </option>
      ))}
    </select>
  );
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const room = rooms.find((r) => r.id === roomId);
  const [shelves, setShelves] = useState<ShelfData[]>(room?.shelves ?? []);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [size, setSize] = useState({ width: room?.width ?? 10, depth: room?.depth ?? 6 });
  const [sizeDraft, setSizeDraft] = useState({ width: String(room?.width ?? 10), depth: String(room?.depth ?? 6) });
  const nextId = useRef(0);
  const [draft, setDraft] = useState({ name: "", levels: 4, type: "standard" as ShelfType, ...pick("standard") });

  function pick(type: ShelfType) {
    const { length, height, color } = SHELF_TYPES[type];
    return { length, height, color };
  }

  if (!room) notFound();

  const update = (id: string, patch: Partial<ShelfData>) => setShelves((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // apply a change to a shelf only if it still fits in the room and doesn't hit other shelves
  const tryUpdate = (s: ShelfData, patch: Partial<ShelfData>, errorMessage = "Perubahan ditolak, rak tidak muat atau menabrak rak lain") => {
    const next = { ...s, ...patch };
    const limit = next.rotated ? size.depth : size.width;
    const pos = clampToRoom(next.x, next.z, next, size.width, size.depth);
    if (next.length > limit - 0.1 || shelves.some((o) => o.id !== s.id && shelfsOverlap({ ...next, ...pos }, o))) {
      toast.error(errorMessage);
      return;
    }
    update(s.id, { ...patch, ...pos });
  };

  const addShelf = () => {
    const place = { rotated: false, length: draft.length, type: draft.type };
    const spot = findFreeSpot(place, shelves, size.width, size.depth);
    if (!spot) {
      toast.error("Tidak ada ruang kosong untuk rak baru");
      return;
    }
    nextId.current += 1;
    const id = `RK-new-${nextId.current}`;
    const name = draft.name.trim() || `Rak ${shelves.length + 1}`;
    setShelves((prev) => [...prev, { id, name, levels: draft.levels, usedPercent: 0, ...spot, ...place, height: draft.height, color: draft.color }]);
    setSelectedShelf(id);
    setDraft((d) => ({ ...d, name: "" }));
    setShowAdd(false);
  };

  const remove = (id: string) => {
    setShelves((prev) => prev.filter((s) => s.id !== id));
    setSelectedShelf(null);
  };

  const applySize = () => {
    const width = Number(sizeDraft.width.replace(",", "."));
    const depth = Number(sizeDraft.depth.replace(",", "."));
    const reset = () => setSizeDraft({ width: String(size.width), depth: String(size.depth) });
    if (!Number.isFinite(width) || !Number.isFinite(depth) || width < MIN_ROOM || depth < MIN_ROOM || width > MAX_ROOM || depth > MAX_ROOM) {
      toast.error(`Ukuran ruangan harus antara ${MIN_ROOM} - ${MAX_ROOM} meter`);
      reset();
      return;
    }
    const fits = shelves.every((s) => {
      const c = clampToRoom(s.x, s.z, s, width, depth);
      return Math.abs(c.x - s.x) < 1e-6 && Math.abs(c.z - s.z) < 1e-6 && s.length <= (s.rotated ? depth : width);
    });
    if (!fits) {
      toast.error("Ukuran terlalu kecil, ada rak yang berada di luar ruangan. Geser atau kecilkan rak dulu.");
      reset();
      return;
    }
    setSize({ width, depth });
    setSizeDraft({ width: String(width), depth: String(depth) });
  };

  const maxLength = Math.max(1, Math.floor(Math.min(size.width, size.depth) * 10 - 1) / 10);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Storage", href: "/storage" }, { label: room.name }]} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{room.name}</h2>
            <p className="text-xs text-gray-500 font-medium">
              {room.location} · {size.width} x {size.depth} m
            </p>
          </div>
          <Button variant={editMode ? "page-primary" : "page-secondary"} onClick={() => setEditMode((v) => !v)}>
            {editMode ? <IconCheck size={16} /> : <IconTool size={16} />} {editMode ? "Selesai" : "Rak Builder"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 lg:h-[calc(100vh-14rem)] lg:min-h-[28rem] lg:flex-row">
          <div className="relative h-96 min-w-0 lg:h-full lg:flex-1">
            <ShelfViewer
              shelves={shelves}
              roomWidth={size.width}
              roomDepth={size.depth}
              selectedId={selectedShelf}
              editable={editMode}
              onSelect={setSelectedShelf}
              onMove={(id, x, z) => update(id, { x, z })}
              onBlocked={() => toast.error("Rak menabrak rak lain, posisi dikembalikan")}
            />
            <p className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 text-[11px] text-gray-500 dark:bg-zinc-900/70">
              {editMode ? "Drag rak untuk menggeser · drag area kosong untuk memutar · scroll untuk zoom" : "Drag untuk memutar · scroll untuk zoom · klik rak untuk detail"}
            </p>
          </div>

          <aside className="flex min-h-0 flex-col gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 lg:w-80 dark:border-gray-100/10 dark:bg-white/6">
            {editMode && (
              <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                <p className="text-xs font-bold text-gray-900">Ukuran Ruangan</p>
                <div className="flex gap-2">
                  {(["width", "depth"] as const).map((key) => (
                    <label key={key} className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-gray-500">
                      {key === "width" ? "Lebar" : "Panjang"} (m)
                      <input
                        type="number"
                        inputMode="decimal"
                        min={MIN_ROOM}
                        max={MAX_ROOM}
                        step={0.5}
                        className={inputClass}
                        value={sizeDraft[key]}
                        onChange={(e) => setSizeDraft((d) => ({ ...d, [key]: e.target.value }))}
                        onBlur={applySize}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-900">Rak ({shelves.length})</p>
              {editMode && (
                <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-violet-700">
                  <IconPlus size={14} stroke={3} /> {showAdd ? "Tutup" : "Tambah"}
                </button>
              )}
            </div>

            {editMode && showAdd && (
              <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                <TypeSelect
                  value={draft.type}
                  onChange={(type) => setDraft((d) => ({ ...d, type, ...pick(type), length: Math.min(pick(type).length, maxLength) }))}
                />
                <div className="flex gap-2">
                  <input className={inputClass} placeholder={`Rak ${shelves.length + 1}`} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                  <ColorField value={draft.color} onChange={(color) => setDraft((d) => ({ ...d, color }))} />
                </div>
                <div className="flex gap-3">
                  <Slider label="Panjang" value={draft.length} min={0.8} max={maxLength} onChange={(length) => setDraft((d) => ({ ...d, length }))} />
                  <Slider label="Tinggi" value={draft.height} min={1} max={5} onChange={(height) => setDraft((d) => ({ ...d, height }))} />
                </div>
                <label className="flex items-center justify-between text-[11px] text-gray-500">
                  Jumlah tingkat
                  <input type="number" min={1} max={8} className={`${inputClass} !w-16 !py-1`} value={draft.levels} onChange={(e) => setDraft((d) => ({ ...d, levels: Math.max(1, Math.min(8, Number(e.target.value) || 1)) }))} />
                </label>
                <Button variant="modal-primary" onClick={addShelf}>
                  Tambah ke ruangan
                </Button>
              </div>
            )}

            {shelves.map((s) => {
              const isSelected = s.id === selectedShelf;
              return (
                <div key={s.id} className={`rounded-lg border transition-all ${isSelected ? "border-violet-600 bg-violet-50/60 dark:bg-violet-500/12" : "border-gray-200 dark:border-gray-100/10"}`}>
                  <button onClick={() => setSelectedShelf(isSelected ? null : s.id)} className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
                    <span className="h-3 w-3 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-gray-900">{s.name}</span>
                      <span className="block truncate text-[11px] text-gray-500">
                        {SHELF_TYPES[s.type].label} · {s.length.toFixed(1)} x {s.height.toFixed(1)} m
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">{s.usedPercent}%</span>
                  </button>

                  {isSelected && editMode && (
                    <div className="flex flex-col gap-2 border-t border-violet-200 p-2.5 dark:border-violet-500/20">
                      <TypeSelect value={s.type} onChange={(type) => tryUpdate(s, { type, ...pick(type) })} />
                      <div className="flex gap-2">
                        <input className={inputClass} value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
                        <ColorField value={s.color} onChange={(color) => update(s.id, { color })} />
                      </div>
                      <div className="flex gap-3">
                        <Slider label="Panjang" value={s.length} min={0.8} max={maxLength} onChange={(length) => tryUpdate(s, { length }, "Panjang ditolak, rak akan menabrak atau keluar ruangan")} />
                        <Slider label="Tinggi" value={s.height} min={1} max={5} onChange={(height) => update(s.id, { height })} />
                      </div>
                      <label className="flex items-center justify-between text-[11px] text-gray-500">
                        Jumlah tingkat
                        <input
                          type="number"
                          min={1}
                          max={8}
                          className={`${inputClass} !w-16 !py-1`}
                          value={s.levels}
                          onChange={(e) => update(s.id, { levels: Math.max(1, Math.min(8, Number(e.target.value) || 1)) })}
                        />
                      </label>
                      <div className="flex gap-2">
                        <Button variant="modal-secondary" className="flex-1 !min-h-8 !py-1.5" onClick={() => tryUpdate(s, { rotated: !s.rotated }, "Tidak bisa diputar, rak akan menabrak atau keluar ruangan")}>
                          <IconRotate size={14} /> Putar
                        </Button>
                        <Button variant="modal-danger" className="flex-1 !min-h-8 !py-1.5" onClick={() => remove(s.id)}>
                          <IconTrash size={14} /> Hapus
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {shelves.length === 0 && <p className="text-[11px] text-gray-400">Belum ada rak. Aktifkan Rak Builder untuk menambah.</p>}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
