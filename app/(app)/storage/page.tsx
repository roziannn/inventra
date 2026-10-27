"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { fieldClass } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import FormLabel from "@/components/ui/FormLabel";
import { IconBuildingWarehouse, IconLayoutRows, IconPlus, IconPencil, IconTrash, IconDoor, IconBox, IconRuler2, IconPackages } from "@tabler/icons-react";
import { addRoom, removeRoom, updateRoom, useHydrated, useRooms } from "@/lib/storage/room-store";
import type { Room } from "@/lib/storage/storage-data";

const MIN_SIZE = 3;
const MAX_SIZE = 50;

type FormState = { name: string; location: string; width: string; depth: string };
const emptyForm: FormState = { name: "", location: "", width: "10", depth: "6" };

export default function StoragePage() {
  const rooms = useRooms();
  const hydrated = useHydrated();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setForm({ name: room.name, location: room.location, width: String(room.width), depth: String(room.depth) });
    setFormOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const location = form.location.trim();
    if (!name) {
      toast.error("Nama ruangan wajib diisi");
      return;
    }
    if (rooms.some((r) => r.id !== editing?.id && r.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Nama ruangan sudah dipakai");
      return;
    }
    if (editing) {
      updateRoom(editing.id, { name, location });
      toast.success("Ruangan diperbarui");
    } else {
      const width = Number(form.width.replace(",", "."));
      const depth = Number(form.depth.replace(",", "."));
      if (![width, depth].every((n) => Number.isFinite(n) && n >= MIN_SIZE && n <= MAX_SIZE)) {
        toast.error(`Ukuran ruangan harus antara ${MIN_SIZE} - ${MAX_SIZE} meter`);
        return;
      }
      addRoom({ name, location, width, depth });
      toast.success("Ruangan ditambahkan");
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    removeRoom(deleting.id);
    toast.success(`${deleting.name} dihapus`);
    setDeleting(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Storage"
          description="Kelola ruangan dan rak penyimpanan barang."
          actions={
            <>
              <Link
                href="/storage/wadah"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-100/10 dark:bg-white/6 dark:text-gray-100 dark:hover:bg-white/10"
              >
                <IconPackages size={16} /> Jenis Wadah
              </Link>
              <Button variant="page-primary" onClick={openCreate}>
                <IconPlus size={16} stroke={3} /> Tambah Ruangan
              </Button>
            </>
          }
        />

        {!hydrated ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={<IconBuildingWarehouse size={36} className="text-gray-300" />}
            title="Belum ada ruangan"
            description="Buat ruangan pertama, lalu susun rak, pintu, dan jendelanya di 3D."
            action={
              <Button variant="page-primary" onClick={openCreate}>
                <IconPlus size={16} stroke={3} /> Tambah Ruangan
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => {
              const itemCount = room.shelves.reduce((n, s) => n + s.items.length, 0);
              return (
                <div
                  key={room.id}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-violet-400 hover:shadow-md dark:border-gray-100/10 dark:bg-white/6"
                >
                  <Link href={`/storage/${room.id}`} className="block" aria-label={`Buka ${room.name}`}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/12">
                      <IconBuildingWarehouse size={22} />
                    </div>
                    <h3 className="pr-16 text-base font-bold text-gray-900">{room.name}</h3>
                    <p className="text-xs text-gray-500">{room.location || "Lokasi belum diisi"}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <IconRuler2 size={14} /> {room.width} x {room.depth} m
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconLayoutRows size={14} /> {room.shelves.length} rak
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconBox size={14} /> {itemCount} barang
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconDoor size={14} /> {room.openings.length} pintu/jendela
                      </span>
                    </div>
                  </Link>
                  <div className="absolute right-3 top-3 flex gap-1">
                    <button
                      onClick={() => openEdit(room)}
                      aria-label={`Ubah ${room.name}`}
                      title="Ubah nama dan lokasi"
                      className="rounded-lg p-2 text-gray-400 transition-all hover:bg-violet-50 hover:text-violet-600"
                    >
                      <IconPencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(room)}
                      aria-label={`Hapus ${room.name}`}
                      title="Hapus ruangan"
                      className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Ubah Ruangan" : "Tambah Ruangan"}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="room-name">Nama ruangan</FormLabel>
            <input id="room-name" autoFocus className={fieldClass} placeholder="Contoh: Gudang Arsip" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="room-location">Lokasi</FormLabel>
            <input id="room-location" className={fieldClass} placeholder="Contoh: Gedung A - Lantai 2" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          {!editing ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <FormLabel htmlFor="room-width">Lebar (m)</FormLabel>
                <input
                  id="room-width"
                  type="number"
                  inputMode="decimal"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  step={0.5}
                  className={fieldClass}
                  value={form.width}
                  onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <FormLabel htmlFor="room-depth">Panjang (m)</FormLabel>
                <input
                  id="room-depth"
                  type="number"
                  inputMode="decimal"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  step={0.5}
                  className={fieldClass}
                  value={form.depth}
                  onChange={(e) => setForm((f) => ({ ...f, depth: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Ukuran ruangan diubah lewat Ruangan Builder di halaman ruangan.</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="modal-secondary" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button variant="modal-primary" type="submit">
              {editing ? "Simpan" : "Tambah Ruangan"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Hapus Ruangan"
        message={
          deleting && (
            <>
              Hapus <b>{deleting.name}</b>? {deleting.shelves.length} rak dan {deleting.shelves.reduce((n, s) => n + s.items.length, 0)} barang di dalamnya ikut terhapus. Tindakan ini tidak bisa
              dibatalkan.
            </>
          )
        }
        icon={<IconTrash size={16} />}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
