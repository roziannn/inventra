"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormLabel from "@/components/ui/FormLabel";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useHydrated } from "@/lib/use-hydrated";
import { MENU_ICONS, MENU_ICON_KEYS, type MenuIconKey } from "@/lib/settings/menu-icons";
import { addMenu, childrenOf, moveMenu, removeMenu, resetSettings, updateMenu, useSettings, type MenuItem } from "@/lib/settings/settings-store";
import { IconArrowDown, IconArrowUp, IconLock, IconPencil, IconPlus, IconRestore, IconTrash } from "@tabler/icons-react";

const fieldClass = "w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none";

type FormState = { name: string; href: string; icon: MenuIconKey; parentId: string };
const emptyForm: FormState = { name: "", href: "/", icon: "folder", parentId: "" };

function Switch({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      title={disabled ? "Menu inti tidak bisa disembunyikan" : undefined}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-violet-600" : "bg-gray-300 dark:bg-white/20"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export default function MenuSettingsPage() {
  const { menus } = useSettings();
  const hydrated = useHydrated();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const groups = childrenOf(menus, null);
  // a menu with children is a group; only top-level menus can be a parent
  const parentOptions = groups.filter((g) => g.id !== editing?.id && !(editing && menus.some((x) => x.parentId === editing.id)));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (menu: MenuItem) => {
    setEditing(menu);
    setForm({ name: menu.name, href: menu.href, icon: menu.icon, parentId: menu.parentId ?? "" });
    setFormOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const href = form.href.trim();
    if (!name) return toast.error("Nama menu wajib diisi");
    if (!href.startsWith("/")) return toast.error("Path harus diawali dengan /");
    const parentId = form.parentId || null;
    if (menus.some((x) => x.id !== editing?.id && x.parentId === parentId && x.name.toLowerCase() === name.toLowerCase())) return toast.error("Nama menu sudah dipakai di level yang sama");
    if (editing) {
      updateMenu(editing.id, { name, href, icon: form.icon, parentId });
      toast.success("Menu diperbarui");
    } else {
      addMenu({ name, href, icon: form.icon, parentId });
      toast.success("Menu ditambahkan");
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    removeMenu(deleting.id);
    toast.success(`${deleting.name} dihapus`);
    setDeleting(null);
  };

  const rows: { menu: MenuItem; depth: 0 | 1; first: boolean; last: boolean }[] = groups.flatMap((g, gi) => {
    const subs = childrenOf(menus, g.id);
    return [
      { menu: g, depth: 0 as const, first: gi === 0, last: gi === groups.length - 1 },
      ...subs.map((c, ci) => ({ menu: c, depth: 1 as const, first: ci === 0, last: ci === subs.length - 1 })),
    ];
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Menu</h2>
            <p className="text-xs text-gray-500 font-medium">Atur menu di sidebar: urutan, nama, ikon, dan tampil atau tidaknya.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="page-secondary" onClick={() => setResetOpen(true)}>
              <IconRestore size={16} /> Reset Default
            </Button>
            <Button variant="page-primary" onClick={openCreate}>
              <IconPlus size={16} stroke={3} /> Tambah Menu
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-100/10 dark:bg-white/6">
          <div className="hidden grid-cols-[1fr_9rem_6rem_5rem_6rem] gap-3 bg-gray-50/70 px-4 py-2.5 text-xs font-bold text-gray-400 sm:grid dark:bg-white/6">
            <span>Menu</span>
            <span>Path</span>
            <span>Urutan</span>
            <span>Tampil</span>
            <span className="text-right">Aksi</span>
          </div>
          {!hydrated && <TableSkeleton columns={4} rows={9} />}
          {hydrated && rows.map(({ menu, depth, first, last }) => {
            const Icon = MENU_ICONS[menu.icon] ?? MENU_ICONS.folder;
            return (
              <div key={menu.id} className={`grid grid-cols-[1fr_auto] items-center gap-3 border-t border-gray-100 px-4 py-2.5 sm:grid-cols-[1fr_9rem_6rem_5rem_6rem] dark:border-gray-100/10 ${menu.active ? "" : "opacity-55"}`}>
                <div className={`flex min-w-0 items-center gap-2.5 ${depth ? "pl-8" : ""}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${depth ? "bg-gray-100 text-gray-500 dark:bg-white/8" : "bg-violet-50 text-violet-600 dark:bg-violet-500/12"}`}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 truncate text-sm font-bold text-gray-900">
                      {menu.name}
                      {menu.locked && <IconLock size={12} className="text-gray-400" aria-label="Menu inti" />}
                    </span>
                    <span className="block truncate text-[11px] text-gray-500 sm:hidden">{menu.href}</span>
                  </span>
                </div>
                <span className="hidden truncate font-mono text-xs text-gray-500 sm:block">{menu.href}</span>
                <div className="hidden gap-1 sm:flex">
                  <button onClick={() => moveMenu(menu.id, -1)} disabled={first} aria-label={`Naikkan ${menu.name}`} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-white/10">
                    <IconArrowUp size={14} />
                  </button>
                  <button onClick={() => moveMenu(menu.id, 1)} disabled={last} aria-label={`Turunkan ${menu.name}`} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-white/10">
                    <IconArrowDown size={14} />
                  </button>
                </div>
                <div className="hidden sm:block">
                  <Switch checked={menu.active} disabled={menu.locked} label={`Tampilkan ${menu.name}`} onChange={() => updateMenu(menu.id, { active: !menu.active })} />
                </div>
                <div className="flex justify-end gap-1">
                  <button onClick={() => openEdit(menu)} aria-label={`Ubah ${menu.name}`} className="rounded-lg p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600">
                    <IconPencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleting(menu)}
                    disabled={menu.locked}
                    aria-label={`Hapus ${menu.name}`}
                    title={menu.locked ? "Menu inti tidak bisa dihapus" : undefined}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400">Menu bergembok adalah menu inti Settings. Menu ini selalu tampil supaya pengaturan tidak terkunci.</p>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Ubah Menu" : "Tambah Menu"}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="menu-name">Nama menu</FormLabel>
            <input id="menu-name" autoFocus className={fieldClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="menu-href">Path</FormLabel>
            <input id="menu-href" className={`${fieldClass} font-mono`} placeholder="/contoh" value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="menu-parent">Induk</FormLabel>
            <select id="menu-parent" className={fieldClass} value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} disabled={!!editing?.locked}>
              <option value="">Menu utama</option>
              {parentOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  Submenu dari {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel>Ikon</FormLabel>
            <div className="grid grid-cols-6 gap-2">
              {MENU_ICON_KEYS.map((key) => {
                const Icon = MENU_ICONS[key];
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setForm((f) => ({ ...f, icon: key }))}
                    aria-label={key}
                    aria-pressed={form.icon === key}
                    className={`flex h-10 items-center justify-center rounded-lg border ${form.icon === key ? "border-violet-600 bg-violet-600 text-white" : "border-gray-200 text-gray-500 hover:border-violet-400"}`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="modal-secondary" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button variant="modal-primary" type="submit">
              {editing ? "Simpan" : "Tambah Menu"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Hapus Menu">
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Hapus menu <b>{deleting.name}</b>
              {menus.some((x) => x.parentId === deleting.id) ? " beserta semua submenunya" : ""}? Hak akses role untuk menu ini juga ikut terhapus.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="modal-secondary" onClick={() => setDeleting(null)}>
                Batal
              </Button>
              <Button variant="modal-danger" onClick={confirmDelete}>
                <IconTrash size={16} /> Hapus
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset ke Default">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">Menu dan role dikembalikan ke pengaturan awal. Menu baru, perubahan urutan, dan hak akses role akan hilang.</p>
          <div className="flex justify-end gap-2">
            <Button variant="modal-secondary" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
            <Button
              variant="modal-danger"
              onClick={() => {
                resetSettings();
                setResetOpen(false);
                toast.success("Pengaturan dikembalikan ke default");
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
