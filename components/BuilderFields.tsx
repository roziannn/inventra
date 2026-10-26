"use client";

import React from "react";

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
