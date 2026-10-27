"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormLabel from "@/components/ui/FormLabel";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useHydrated } from "@/lib/use-hydrated";
import { MENU_ICONS } from "@/lib/settings/menu-icons";
import { PERMISSION_KEYS, addRole, can, childrenOf, removeRole, setActiveRole, setPermissions, updateRole, useSettings, type MenuItem, type PermissionKey, type Role } from "@/lib/settings/settings-store";
import { IconCopy, IconLock, IconPencil, IconPlayerPlay, IconPlus, IconShieldLock, IconTrash } from "@tabler/icons-react";

const fieldClass = "w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none";
const PERMISSION_LABELS: Record<PermissionKey, string> = { view: "Lihat", create: "Tambah", edit: "Ubah", delete: "Hapus" };

type FormState = { name: string; description: string; copyFromId: string };

export default function RoleSettingsPage() {
  const { menus, roles, activeRoleId } = useSettings();
  const hydrated = useHydrated();
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", description: "", copyFromId: "" });
  const [deleting, setDeleting] = useState<Role | null>(null);

  const role = roles.find((r) => r.id === selectedId) ?? roles[0];
  const rows = childrenOf(menus, null).flatMap((g) => [g, ...childrenOf(menus, g.id)]);
  const isGroup = (menu: MenuItem) => menus.some((x) => x.parentId === menu.id);
  const readOnly = !!role?.locked;

  const accessCount = (r: Role) => menus.filter((x) => can(r, x.id, "view")).length;

  const openCreate = (copyFromId = "") => {
    const source = roles.find((r) => r.id === copyFromId);
    setEditing(null);
    setForm({ name: source ? `${source.name} (salinan)` : "", description: source?.description ?? "", copyFromId });
    setFormOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditing(r);
    setForm({ name: r.name, description: r.description, copyFromId: "" });
    setFormOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error("Nama role wajib diisi");
    if (roles.some((r) => r.id !== editing?.id && r.name.toLowerCase() === name.toLowerCase())) return toast.error("Nama role sudah dipakai");
    if (editing) {
      updateRole(editing.id, { name, description: form.description.trim() });
      toast.success("Role diperbarui");
    } else {
      const created = addRole({ name, description: form.description.trim(), copyFromId: form.copyFromId || undefined });
      setSelectedId(created.id);
      toast.success("Role ditambahkan");
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    removeRole(deleting.id);
    if (selectedId === deleting.id) setSelectedId(roles[0]?.id ?? "");
    toast.success(`Role ${deleting.name} dihapus`);
    setDeleting(null);
  };

  // core menus keep "view" for every role, so skip them when bulk toggling
  const lockedView = (menu: MenuItem, key: PermissionKey) => key === "view" && !!menu.locked;

  const toggleCell = (menu: MenuItem, key: PermissionKey) => {
    if (!role || readOnly || lockedView(menu, key)) return;
    setPermissions(role.id, [{ menuId: menu.id, key, value: !can(role, menu.id, key) }]);
  };

  const toggleRow = (menu: MenuItem) => {
    if (!role || readOnly) return;
    const keys = isGroup(menu) ? (["view"] as PermissionKey[]) : PERMISSION_KEYS.filter((k) => !lockedView(menu, k));
    const all = keys.every((k) => can(role, menu.id, k));
    setPermissions(role.id, keys.map((key) => ({ menuId: menu.id, key, value: !all })));
  };

  const toggleColumn = (key: PermissionKey) => {
    if (!role || readOnly) return;
    const targets = rows.filter((m) => !lockedView(m, key) && (key === "view" || !isGroup(m)));
    const all = targets.every((m) => can(role, m.id, key));
    setPermissions(role.id, targets.map((m) => ({ menuId: m.id, key, value: !all })));
  };

  const checkbox = (checked: boolean, disabled: boolean, onChange: () => void, label: string) => (
    <input type="checkbox" aria-label={label} checked={checked} disabled={disabled} onChange={onChange} className="h-4 w-4 cursor-pointer accent-violet-600 disabled:cursor-not-allowed disabled:opacity-50" />
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Role</h2>
            <p className="text-xs text-gray-500 font-medium">Atur hak akses tiap role per menu: lihat, tambah, ubah, dan hapus.</p>
          </div>
          <Button variant="page-primary" onClick={() => openCreate()}>
            <IconPlus size={16} stroke={3} /> Tambah Role
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-2 lg:w-72 lg:shrink-0">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`rounded-xl border p-3 text-left transition-all ${role?.id === r.id ? "border-violet-600 bg-violet-50/60 dark:bg-violet-500/12" : "border-gray-200 bg-white hover:border-violet-400 dark:border-gray-100/10 dark:bg-white/6"}`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <IconShieldLock size={16} className="text-violet-600" />
                  <span className="min-w-0 flex-1 truncate">{r.name}</span>
                  {r.locked && <IconLock size={12} className="text-gray-400" aria-label="Role inti" />}
                  {r.id === activeRoleId && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Aktif</span>}
                </span>
                <span className="mt-1 block line-clamp-2 text-[11px] text-gray-500">{r.description || "Tanpa deskripsi"}</span>
                <span className="mt-1.5 block text-[11px] font-semibold text-gray-600">
                  {accessCount(r)} dari {menus.length} menu bisa dilihat
                </span>
              </button>
            ))}
          </div>

          {role && (
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-100/10 dark:bg-white/6">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-100/10">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-gray-900">{role.name}</h3>
                  <p className="text-xs text-gray-500">{role.description || "Tanpa deskripsi"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="page-outline" onClick={() => { setActiveRole(role.id); toast.success(`Sidebar sekarang mengikuti role ${role.name}`); }} disabled={role.id === activeRoleId} title="Pakai role ini untuk melihat sidebar sesuai hak aksesnya">
                    <IconPlayerPlay size={14} /> {role.id === activeRoleId ? "Sedang dipakai" : "Pakai role ini"}
                  </Button>
                  <Button variant="page-outline" onClick={() => openCreate(role.id)}>
                    <IconCopy size={14} /> Duplikat
                  </Button>
                  <Button variant="page-outline" onClick={() => openEdit(role)} disabled={readOnly}>
                    <IconPencil size={14} /> Ubah
                  </Button>
                  <Button variant="page-outline" onClick={() => setDeleting(role)} disabled={readOnly || role.id === activeRoleId} title={role.id === activeRoleId ? "Role yang sedang dipakai tidak bisa dihapus" : undefined}>
                    <IconTrash size={14} /> Hapus
                  </Button>
                </div>
              </div>

              {readOnly && <p className="bg-violet-50 px-4 py-2 text-[11px] font-medium text-violet-700 dark:bg-violet-500/12 dark:text-violet-200">Super Admin selalu punya akses penuh dan tidak bisa diubah.</p>}

              {!hydrated && <TableSkeleton columns={6} rows={10} withHeader />}
              <div className="overflow-x-auto" hidden={!hydrated}>
                <table className="w-full min-w-[34rem] text-left">
                  <thead>
                    <tr className="bg-gray-50/70 text-xs font-bold text-gray-400 dark:bg-white/6">
                      <th className="px-4 py-2.5">Menu</th>
                      {PERMISSION_KEYS.map((key) => (
                        <th key={key} className="w-20 px-2 py-2.5 text-center">
                          <label className="flex cursor-pointer flex-col items-center gap-1">
                            {PERMISSION_LABELS[key]}
                            {checkbox(
                              rows.filter((m) => !lockedView(m, key) && (key === "view" || !isGroup(m))).every((m) => can(role, m.id, key)),
                              readOnly,
                              () => toggleColumn(key),
                              `Semua ${PERMISSION_LABELS[key]}`,
                            )}
                          </label>
                        </th>
                      ))}
                      <th className="w-16 px-2 py-2.5 text-center">Semua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((menu) => {
                      const group = isGroup(menu);
                      const Icon = MENU_ICONS[menu.icon] ?? MENU_ICONS.folder;
                      const rowKeys = group ? (["view"] as PermissionKey[]) : PERMISSION_KEYS.filter((k) => !lockedView(menu, k));
                      return (
                        <tr key={menu.id} className="border-t border-gray-100 dark:border-gray-100/10">
                          <td className={`px-4 py-2 ${menu.parentId ? "pl-10" : ""}`}>
                            <span className={`flex items-center gap-2 text-sm ${group ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                              <Icon size={15} className="shrink-0 text-gray-400" />
                              {menu.name}
                              {!menu.active && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">Disembunyikan</span>}
                            </span>
                          </td>
                          {PERMISSION_KEYS.map((key) => (
                            <td key={key} className="px-2 py-2 text-center">
                              {group && key !== "view" ? <span className="text-gray-300">-</span> : checkbox(can(role, menu.id, key), readOnly || lockedView(menu, key), () => toggleCell(menu, key), `${PERMISSION_LABELS[key]} ${menu.name}`)}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center">{checkbox(rowKeys.every((k) => can(role, menu.id, k)), readOnly, () => toggleRow(menu), `Semua akses ${menu.name}`)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-gray-100 px-4 py-2.5 text-[11px] text-gray-400 dark:border-gray-100/10">Hak Lihat menentukan menu yang muncul di sidebar. Menu inti Settings selalu tampil untuk semua role.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Ubah Role" : form.copyFromId ? "Duplikat Role" : "Tambah Role"}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="role-name">Nama role</FormLabel>
            <input id="role-name" autoFocus className={fieldClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel htmlFor="role-desc">Deskripsi</FormLabel>
            <input id="role-desc" className={fieldClass} placeholder="Opsional" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          {!editing && (
            <div className="flex flex-col gap-1.5">
              <FormLabel htmlFor="role-copy">Salin hak akses dari</FormLabel>
              <select id="role-copy" className={fieldClass} value={form.copyFromId} onChange={(e) => setForm((f) => ({ ...f, copyFromId: e.target.value }))}>
                <option value="">Kosong (tanpa akses)</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="modal-secondary" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button variant="modal-primary" type="submit">
              {editing ? "Simpan" : "Tambah Role"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Hapus Role">
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Hapus role <b>{deleting.name}</b>? Hak aksesnya ikut terhapus dan tidak bisa dibatalkan.
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
    </>
  );
}
