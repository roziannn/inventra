"use client";

import React from "react";
import type { ShelfData } from "@/lib/storage/shelf-model";

export const inputClass = "w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs focus:border-violet-600 focus:outline-none dark:border-gray-100/10";

export function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-gray-500">
      <span className="flex justify-between">
        {label} <b className="text-gray-900">{value.toFixed(1)} m</b>
      </span>
      <input type="range" min={min} max={max} step={0.1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-violet-600" />
    </label>
  );
}

export function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="color" aria-label="Warna" title="Warna" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-transparent dark:border-gray-100/10" />
  );
}

type Covers = Pick<ShelfData, "coverTop" | "coverBack" | "coverSides">;

const COVER_OPTIONS: { key: keyof Covers; label: string }[] = [
  { key: "coverTop", label: "Atas" },
  { key: "coverBack", label: "Belakang" },
  { key: "coverSides", label: "Samping" },
];

export function CoverToggles({ value, onChange }: { value: Covers; onChange: (patch: Covers) => void }) {
  return (
    <div>
      <p className="mb-1 text-[11px] text-gray-500">Tutup rak</p>
      <div className="grid grid-cols-3 gap-1">
        {COVER_OPTIONS.map(({ key, label }) => (
          <label
            key={key}
            className={`flex cursor-pointer items-center justify-center gap-1 rounded-md border px-1 py-1.5 text-[11px] font-bold ${
              value[key] ? "border-violet-600 bg-violet-600 text-white" : "border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-100/10 dark:text-gray-200"
            }`}
          >
            <input type="checkbox" className="sr-only" checked={!!value[key]} onChange={(e) => onChange({ [key]: e.target.checked })} />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
