"use client";

import React from "react";
import { IconDoor, IconWindow, IconPlus, IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import Button from "@/components/Button";
import { Slider, inputClass } from "@/components/BuilderFields";
import { OPENING_KINDS, WALL_IDS, WALL_LABELS, wallLength, type Opening, type OpeningKind } from "@/lib/room-openings";

interface RoomBuilderPanelProps {
  size: { width: number; depth: number };
  sizeDraft: { width: string; depth: string };
  minSize: number;
  maxSize: number;
  onSizeDraftChange: (key: "width" | "depth", value: string) => void;
  onApplySize: () => void;
  openings: Opening[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (kind: OpeningKind) => void;
  onUpdate: (id: string, patch: Partial<Opening>) => void;
  onRemove: (id: string) => void;
}

export default function RoomBuilderPanel({ size, sizeDraft, minSize, maxSize, onSizeDraftChange, onApplySize, openings, selectedId, onSelect, onAdd, onUpdate, onRemove }: RoomBuilderPanelProps) {
  const counters: Record<OpeningKind, number> = { door: 0, window: 0 };
  const labelled = openings.map((o) => ({ o, label: `${OPENING_KINDS[o.kind].label} ${++counters[o.kind]}` }));

  return (
    <>
      <section className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-900">Ukuran Ruangan</p>
        <div className="flex gap-2">
          {(["width", "depth"] as const).map((key) => (
            <label key={key} className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-gray-500">
              {key === "width" ? "Lebar" : "Panjang"} (m)
              <input
                type="number"
                inputMode="decimal"
                min={minSize}
                max={maxSize}
                step={0.5}
                className={inputClass}
                value={sizeDraft[key]}
                onChange={(e) => onSizeDraftChange(key, e.target.value)}
                onBlur={onApplySize}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </label>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">
          Saat ini {size.width} x {size.depth} m ({(size.width * size.depth).toFixed(1)} m²)
        </p>
      </section>

      <hr className="border-gray-100 dark:border-gray-100/10" />

      <section className="flex flex-col gap-2">
        <p className="text-xs font-bold text-gray-900">Pintu & Jendela ({openings.length})</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onAdd("door")} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-400 px-2 py-2 text-[11px] font-bold text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/12">
            <IconPlus size={14} stroke={3} /> Pintu
          </button>
          <button onClick={() => onAdd("window")} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-400 px-2 py-2 text-[11px] font-bold text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/12">
            <IconPlus size={14} stroke={3} /> Jendela
          </button>
        </div>

        {labelled.length === 0 && <p className="text-[11px] text-gray-400">Belum ada pintu atau jendela.</p>}

        {labelled.map(({ o, label }) => {
          const isSelected = o.id === selectedId;
          const Icon = o.kind === "door" ? IconDoor : IconWindow;
          const spec = OPENING_KINDS[o.kind];
          const len = wallLength(o.wall, size.width, size.depth);
          const maxWidth = Math.min(spec.max, len - 0.2);
          const start = o.offset - o.width / 2 + len / 2;
          const maxStart = Math.max(0.1, len - o.width - 0.1);
          return (
            <div key={o.id} className={`rounded-lg border transition-all ${isSelected ? "border-violet-600 bg-violet-50/60 dark:bg-violet-500/12" : "border-gray-200 dark:border-gray-100/10"}`}>
              <button onClick={() => onSelect(isSelected ? null : o.id)} className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${o.kind === "door" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-gray-900">{label}</span>
                  <span className="block truncate text-[11px] text-gray-500">
                    Dinding {WALL_LABELS[o.wall]} · lebar {o.width.toFixed(1)} m
                  </span>
                </span>
              </button>

              {isSelected && (
                <div className="flex flex-col gap-2 border-t border-violet-200 p-2.5 dark:border-violet-500/20">
                  <div>
                    <p className="mb-1 text-[11px] text-gray-500">Dinding</p>
                    <div className="grid grid-cols-4 gap-1">
                      {WALL_IDS.map((w) => (
                        <button
                          key={w}
                          onClick={() => onUpdate(o.id, { wall: w })}
                          className={`rounded-md border px-1 py-1.5 text-[11px] font-bold ${o.wall === w ? "border-violet-600 bg-violet-600 text-white" : "border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-100/10 dark:text-gray-200"}`}
                        >
                          {WALL_LABELS[w]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Slider label="Posisi dari ujung" value={Math.min(Math.max(start, 0.1), maxStart)} min={0.1} max={maxStart} onChange={(v) => onUpdate(o.id, { offset: v - len / 2 + o.width / 2 })} />
                  <Slider label="Lebar" value={o.width} min={spec.min} max={Math.max(spec.min, maxWidth)} onChange={(width) => onUpdate(o.id, { width })} />
                  <Button variant="modal-danger" className="!min-h-8 !py-1.5" onClick={() => onRemove(o.id)}>
                    <IconTrash size={14} /> Hapus {label}
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex gap-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-snug text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>Area kuning di depan pintu harus tetap kosong sebagai jalur lewat. Rak yang menghalanginya akan berwarna merah.</span>
        </div>
      </section>
    </>
  );
}
