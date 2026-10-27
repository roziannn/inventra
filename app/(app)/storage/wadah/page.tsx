"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormLabel from "@/components/ui/FormLabel";
import ContainerPreview from "@/components/storage/ContainerPreview";
import { addContainerType, removeContainerType, resetContainerTypes, updateContainerType, useContainers } from "@/lib/storage/container-store";
import { useRooms } from "@/lib/storage/room-store";
import { CONTAINER_SHAPES, containerFor, type ContainerShape, type ContainerType } from "@/lib/storage/shelf-model";
import { IconPencil, IconPlus, IconRestore, IconTrash } from "@tabler/icons-react";

const MIN_CM = 5;
const MAX_CM = 120;
const fieldClass = "w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none";
const COLOR_PRESETS = ["#d4a373", "#c58f5c", "#e9dcc0", "#3b82f6", "#1d4ed8", "#16a34a", "#dc2626", "#f59e0b", "#6b7280", "#a78bfa"];

type FormState = { name: string; shape: ContainerShape; width: string; height: string; depth: string; color: string };
const emptyForm: FormState = { name: "", shape: "box", width: "30", height: "25", depth: "30", color: "#d4a373" };

export default function ContainerTypesPage() {
  const containers = useContainers();
  const rooms = useRooms();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContainerType | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<ContainerType | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const usage = (ct: ContainerType) => rooms.reduce((n, r) => n + r.shelves.reduce((m, s) => m + s.items.filter((i) => containerFor(containers, i.containerId).id === ct.id).length, 0), 0);

  const cm = (v: string) => Number(v.replace(",", "."));
  const preview = { shape: form.shape, width: (cm(form.width) || 30) / 100, height: (cm(form.height) || 25) / 100, depth: (cm(form.depth) || 30) / 100, color: form.color };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (ct: ContainerType) => {
    setEditing(ct);
    setForm({ name: ct.name, shape: ct.shape, width: String(Math.round(ct.width * 100)), height: String(Math.round(ct.height * 100)), depth: String(Math.round(ct.depth * 100)), color: ct.color });
    setFormOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error("Nama wadah wajib diisi");
    if (containers.some((c) => c.id !== editing?.id && c.name.toLowerCase() === name.toLowerCase())) return toast.error("Nama wadah sudah dipakai");
    const dims = [cm(form.width), cm(form.height), cm(form.depth)];
    if (!dims.every((n) => Number.isFinite(n) && n >= MIN_CM && n <= MAX_CM)) return toast.error(`Ukuran harus antara ${MIN_CM} - ${MAX_CM} cm`);
    const data = { name, shape: form.shape, width: dims[0] / 100, height: dims[1] / 100, depth: dims[2] / 100, color: form.color };
    if (editing) {
      updateContainerType(editing.id, data);
      toast.success("Wadah diperbarui");
    } else {
      addContainerType(data);
      toast.success("Wadah ditambahkan");
    }
    setFormOpen(false);
  };

  const askDelete = (ct: ContainerType) => {
    if (containers.length <= 1) return toast.error("Minimal harus ada satu jenis wadah");
    const used = usage(ct);
    if (used > 0) return toast.error(`${ct.name} dipakai ${used} barang. Ganti wadah barang itu dulu.`);
    setDeleting(ct);
  };

  const numberField = (key: "width" | "height" | "depth", label: string) => (
    <div className="flex flex-col gap-1.5">
      <FormLabel htmlFor={`ct-${key}`}>{label} (cm)</FormLabel>
      <input id={`ct-${key}`} type="number" inputMode="decimal" min={MIN_CM} max={MAX_CM} className={fieldClass} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Jenis Wadah</h2>
            <p className="text-xs text-gray-500 font-medium">Atur kardus, crate, dan drum yang dipakai untuk menyimpan barang di rak: bentuk, ukuran, dan warna.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="page-secondary" onClick={() => setResetOpen(true)}>
              <IconRestore size={16} /> Reset Default
            </Button>
            <Button variant="page-primary" onClick={openCreate}>
              <IconPlus size={16} stroke={3} /> Tambah Wadah
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {containers.map((ct) => (
            <div key={ct.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-100/10 dark:bg-white/6">
              <div className="shrink-0 rounded-xl bg-gray-50 dark:bg-white/5">
                <ContainerPreview container={ct} size={88} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-gray-900">{ct.name}</h3>
                <p className="text-[11px] text-gray-500">{CONTAINER_SHAPES[ct.shape]}</p>
                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {Math.round(ct.width * 100)} x {Math.round(ct.height * 100)} x {Math.round(ct.depth * 100)} cm
                </p>
                <p className="text-[11px] text-gray-400">Dipakai {usage(ct)} barang</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(ct)} aria-label={`Ubah ${ct.name}`} className="rounded-lg p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600">
                  <IconPencil size={16} />
                </button>
                <button onClick={() => askDelete(ct)} aria-label={`Hapus ${ct.name}`} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">Ukuran wadah dikecilkan otomatis kalau tidak muat di slot rak. Wadah dipilih per barang di panel isi rak.</p>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Ubah Wadah" : "Tambah Wadah"}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-xl bg-gray-50">
              <ContainerPreview container={preview} size={104} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <FormLabel htmlFor="ct-name">Nama wadah</FormLabel>
              <input id="ct-name" autoFocus className={fieldClass} placeholder="Contoh: Kardus Sedang" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="ct-shape">Bentuk</FormLabel>
            <select id="ct-shape" className={fieldClass} value={form.shape} onChange={(e) => setForm((f) => ({ ...f, shape: e.target.value as ContainerShape }))}>
              {(Object.keys(CONTAINER_SHAPES) as ContainerShape[]).map((s) => (
                <option key={s} value={s}>
                  {CONTAINER_SHAPES[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {numberField("width", "Lebar")}
            {numberField("height", "Tinggi")}
            {numberField("depth", "Dalam")}
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel>Warna</FormLabel>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button type="button" key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} aria-label={`Warna ${c}`} aria-pressed={form.color === c} className={`h-7 w-7 rounded-full border-2 ${form.color === c ? "border-violet-600" : "border-transparent ring-1 ring-black/10"}`} style={{ backgroundColor: c }} />
              ))}
              <input type="color" aria-label="Warna lain" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="h-8 w-10 cursor-pointer rounded-md border border-gray-200 bg-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="modal-secondary" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button variant="modal-primary" type="submit">
              {editing ? "Simpan" : "Tambah Wadah"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Hapus Wadah">
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Hapus jenis wadah <b>{deleting.name}</b>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="modal-secondary" onClick={() => setDeleting(null)}>
                Batal
              </Button>
              <Button
                variant="modal-danger"
                onClick={() => {
                  removeContainerType(deleting.id);
                  toast.success(`${deleting.name} dihapus`);
                  setDeleting(null);
                }}
              >
                <IconTrash size={16} /> Hapus
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset ke Default">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">Daftar wadah dikembalikan ke 5 jenis awal. Wadah buatanmu dihapus, dan barang yang memakainya otomatis memakai wadah pertama.</p>
          <div className="flex justify-end gap-2">
            <Button variant="modal-secondary" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
            <Button
              variant="modal-danger"
              onClick={() => {
                resetContainerTypes();
                setResetOpen(false);
                toast.success("Wadah dikembalikan ke default");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
