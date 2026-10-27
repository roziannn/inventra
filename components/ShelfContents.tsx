"use client";

import React, { useState } from "react";
import { IconBox, IconPlus, IconTag, IconX } from "@tabler/icons-react";
import Button from "@/components/Button";
import { inputClass } from "@/components/BuilderFields";
import { containerFor, defaultLevelTag, itemsAtLevel, levelSlots, levelTag, type ContainerType, type ShelfData } from "@/lib/shelf-model";

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
}

interface ShelfContentsProps {
  shelf: ShelfData;
  shelfIndex: number;
  roomCode: string;
  level: number | null;
  onLevel: (level: number) => void;
  catalog: CatalogItem[];
  containers: ContainerType[];
  editable: boolean;
  onAdd: (level: number, item: CatalogItem, qty: number, containerId: string) => void;
  onContainer: (itemId: string, containerId: string) => void;
  onRemove: (itemId: string) => void;
  onTag: (level: number, text: string) => void;
}

export default function ShelfContents({ shelf, shelfIndex, roomCode, level, onLevel, catalog, containers, editable, onAdd, onContainer, onRemove, onTag }: ShelfContentsProps) {
  const [catalogId, setCatalogId] = useState(catalog[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [containerId, setContainerId] = useState(containers[0]?.id ?? "");
  const slots = levelSlots(shelf);
  const items = level === null ? [] : itemsAtLevel(shelf, level);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold text-gray-500">Isi rak per tingkat</p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: shelf.levels }, (_, l) => l).map((l) => {
          const count = itemsAtLevel(shelf, l).length;
          return (
            <button
              key={l}
              onClick={() => onLevel(l)}
              className={`rounded-md border px-2 py-1 text-[11px] font-bold ${level === l ? "border-violet-600 bg-violet-600 text-white" : "border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-100/10 dark:text-gray-200"}`}
              title={`Tingkat ${l + 1}: ${count}/${slots} terisi`}
            >
              T{l + 1} <span className="font-normal opacity-80">{count}/{slots}</span>
            </button>
          );
        })}
      </div>

      {level === null ? (
        <p className="rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-400 dark:bg-white/5">Klik sebuah tingkat di rak (3D) atau pilih T1, T2, ... untuk melihat isinya.</p>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-lg bg-gray-50 p-2 dark:bg-white/5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2">
              <b className="text-gray-900">Tingkat {level + 1}</b>
              <span className="flex items-center gap-1 rounded bg-[#b9a3f0] px-1.5 py-0.5 text-[10px] font-bold text-white">
                <IconTag size={10} /> {levelTag(roomCode, shelfIndex, shelf, level)}
              </span>
            </span>
            <span className={items.length > slots ? "font-bold text-red-600" : "text-gray-500"}>
              {items.length}/{slots} slot
            </span>
          </div>
          {editable && (
            <label className="flex items-center gap-2 text-[11px] text-gray-500">
              Tag
              <input
                className={`${inputClass} !py-1`}
                maxLength={16}
                placeholder={defaultLevelTag(roomCode, shelfIndex, level)}
                value={shelf.tags?.[level] ?? ""}
                onChange={(e) => onTag(level, e.target.value)}
              />
            </label>
          )}
          {items.length === 0 && <p className="py-1 text-[11px] text-gray-400">Tingkat ini kosong.</p>}
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 dark:bg-white/6">
              <IconBox size={14} className="shrink-0 text-amber-700" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-gray-900">{it.name}</span>
                <span className="block text-[10px] text-gray-500">{it.sku}</span>
              </span>
              {editable ? (
                <select aria-label={`Wadah ${it.name}`} className="max-w-24 rounded border border-gray-200 bg-transparent px-1 py-0.5 text-[10px] dark:border-gray-100/10" value={containerFor(containers, it.containerId).id} onChange={(e) => onContainer(it.id, e.target.value)}>
                  {containers.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-sm border border-black/10" style={{ backgroundColor: containerFor(containers, it.containerId).color }} />
                  {containerFor(containers, it.containerId).name}
                </span>
              )}
              <span className="text-[11px] font-bold text-gray-700">×{it.qty}</span>
              {editable && (
                <button onClick={() => onRemove(it.id)} aria-label={`Keluarkan ${it.name}`} title="Keluarkan dari rak" className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <IconX size={14} />
                </button>
              )}
            </div>
          ))}

          {editable && (
            <div className="mt-1 flex flex-col gap-1.5 border-t border-gray-200 pt-2 dark:border-gray-100/10">
              <select className={inputClass} value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.sku})
                  </option>
                ))}
              </select>
              <select aria-label="Jenis wadah" className={inputClass} value={containerId} onChange={(e) => setContainerId(e.target.value)}>
                {containers.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    Wadah: {ct.name} ({Math.round(ct.width * 100)}x{Math.round(ct.height * 100)}x{Math.round(ct.depth * 100)} cm)
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input type="number" min={1} max={999} aria-label="Jumlah" className={`${inputClass} !w-20`} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))} />
                <Button
                  variant="modal-primary"
                  className="flex-1 !min-h-8 !py-1.5"
                  onClick={() => {
                    const c = catalog.find((x) => x.id === catalogId);
                    if (c) onAdd(level, c, qty, containerId);
                  }}
                >
                  <IconPlus size={14} /> Taruh di tingkat {level + 1}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
