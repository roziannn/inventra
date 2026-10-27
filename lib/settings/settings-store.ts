import { useSyncExternalStore } from "react";
import type { MenuIconKey } from "@/lib/settings/menu-icons";

// Front-end only store for menu and role settings, persisted in localStorage until a backend exists.
const KEY = "inventra:settings:v1";

export interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: MenuIconKey;
  parentId: string | null;
  order: number;
  active: boolean;
  /** core menus that cannot be hidden, deleted or revoked, so nobody gets locked out of settings */
  locked?: boolean;
}

export const PERMISSION_KEYS = ["view", "create", "edit", "delete"] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type Permission = Record<PermissionKey, boolean>;

export interface Role {
  id: string;
  name: string;
  description: string;
  /** full access that can't be edited or deleted */
  locked?: boolean;
  permissions: Record<string, Permission>;
}

export interface SettingsState {
  menus: MenuItem[];
  roles: Role[];
  activeRoleId: string;
}

const m = (id: string, name: string, href: string, icon: MenuIconKey, parentId: string | null, order: number, locked = false): MenuItem => ({ id, name, href, icon, parentId, order, active: true, locked: locked || undefined });

const seedMenus: MenuItem[] = [
  m("m-dashboard", "Dashboard", "/", "dashboard", null, 0),
  m("m-inventory", "Inventory", "/inventory", "inventory", null, 1),
  m("m-assets", "Assets", "/assets", "assets", null, 2),
  m("m-storage", "Storage", "/storage", "storage", null, 3),
  m("m-vendors", "Vendors", "/vendors", "vendors", null, 4),
  m("m-users", "Users", "/users", "users", null, 5),
  m("m-labeling", "Labeling", "/labeling", "labeling", null, 6),
  m("m-labeling-print", "Print Label", "/labeling/print", "labeling", "m-labeling", 0),
  m("m-labeling-qr", "QR Code", "/labeling/qr", "labeling", "m-labeling", 1),
  m("m-reports", "Reports", "/reports", "reports", null, 7),
  m("m-audit", "Audit Trail", "/audit-trail", "audit", null, 8),
  m("m-settings", "Settings", "/settings", "settings", null, 9, true),
  m("m-settings-general", "Umum", "/settings", "settings", "m-settings", 0, true),
  m("m-settings-menu", "Menu", "/settings/menu", "settings", "m-settings", 1, true),
  m("m-settings-role", "Role", "/settings/role", "settings", "m-settings", 2, true),
];

const perm = (view: boolean, create = false, edit = false, del = false): Permission => ({ view, create, edit, delete: del });

function permissionsFor(ids: string[], grant: (id: string) => Permission): Record<string, Permission> {
  return Object.fromEntries(ids.map((id) => [id, grant(id)]));
}

const seedIds = seedMenus.map((x) => x.id);

const seedRoles: Role[] = [
  {
    id: "role-super-admin",
    name: "Super Admin",
    description: "Akses penuh ke seluruh menu dan pengaturan.",
    locked: true,
    permissions: permissionsFor(seedIds, () => perm(true, true, true, true)),
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "Mengelola data operasional dan melihat laporan.",
    permissions: permissionsFor(seedIds, (id) => (["m-users", "m-audit"].includes(id) ? perm(true) : perm(true, true, true, false))),
  },
  {
    id: "role-staff",
    name: "Staff",
    description: "Operasional harian: inventory, asset, dan storage.",
    permissions: permissionsFor(seedIds, (id) => {
      if (["m-dashboard", "m-inventory", "m-assets", "m-storage", "m-labeling", "m-labeling-print", "m-labeling-qr"].includes(id)) return perm(true, id !== "m-dashboard", id !== "m-dashboard");
      return perm(false);
    }),
  },
];

export const defaultSettings: SettingsState = { menus: seedMenus, roles: seedRoles, activeRoleId: "role-super-admin" };

let cache: SettingsState | null = null;
const listeners = new Set<() => void>();

function load(): SettingsState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as SettingsState) : defaultSettings;
  } catch {
    cache = defaultSettings;
  }
  return cache;
}

function commit(next: SettingsState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: keep working in memory
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings() {
  return useSyncExternalStore(subscribe, load, () => defaultSettings);
}

// ---------- reading helpers ----------

export function can(role: Role | undefined, menuId: string, key: PermissionKey) {
  if (!role) return false;
  return role.locked ? true : (role.permissions[menuId]?.[key] ?? false);
}

export function childrenOf(menus: MenuItem[], parentId: string | null) {
  return menus.filter((x) => x.parentId === parentId).sort((a, b) => a.order - b.order);
}

/** menus shown in the sidebar for a role: active, permitted (core menus always), groups only when something inside is visible */
export function sidebarFor(menus: MenuItem[], role: Role | undefined) {
  const visible = (x: MenuItem) => x.active && (x.locked || can(role, x.id, "view"));
  return childrenOf(menus, null)
    .map((top) => {
      const subs = childrenOf(menus, top.id).filter(visible);
      const hasChildren = menus.some((x) => x.parentId === top.id);
      if (!top.active) return null;
      if (hasChildren) return subs.length ? { menu: top, subs } : null;
      return visible(top) ? { menu: top, subs: [] as MenuItem[] } : null;
    })
    .filter((x): x is { menu: MenuItem; subs: MenuItem[] } => x !== null);
}

// ---------- menu actions ----------

function nextOrder(menus: MenuItem[], parentId: string | null) {
  return Math.max(-1, ...menus.filter((x) => x.parentId === parentId).map((x) => x.order)) + 1;
}

export function addMenu(input: Pick<MenuItem, "name" | "href" | "icon" | "parentId">) {
  const s = load();
  const id = `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const menu: MenuItem = { id, ...input, order: nextOrder(s.menus, input.parentId), active: true };
  commit({ ...s, menus: [...s.menus, menu] });
  return menu;
}

export function updateMenu(id: string, patch: Partial<Pick<MenuItem, "name" | "href" | "icon" | "parentId" | "active">>) {
  const s = load();
  commit({
    ...s,
    menus: s.menus.map((x) => {
      if (x.id !== id) return x;
      const next = { ...x, ...patch };
      if (patch.parentId !== undefined && patch.parentId !== x.parentId) next.order = nextOrder(s.menus, patch.parentId);
      return next;
    }),
  });
}

export function removeMenu(id: string) {
  const s = load();
  const gone = new Set([id, ...s.menus.filter((x) => x.parentId === id).map((x) => x.id)]);
  commit({
    ...s,
    menus: s.menus.filter((x) => !gone.has(x.id)),
    roles: s.roles.map((r) => ({ ...r, permissions: Object.fromEntries(Object.entries(r.permissions).filter(([k]) => !gone.has(k))) })),
  });
}

export function moveMenu(id: string, direction: -1 | 1) {
  const s = load();
  const item = s.menus.find((x) => x.id === id);
  if (!item) return;
  const siblings = childrenOf(s.menus, item.parentId);
  const i = siblings.findIndex((x) => x.id === id);
  const other = siblings[i + direction];
  if (!other) return;
  commit({ ...s, menus: s.menus.map((x) => (x.id === item.id ? { ...x, order: other.order } : x.id === other.id ? { ...x, order: item.order } : x)) });
}

// ---------- role actions ----------

export function addRole(input: { name: string; description: string; copyFromId?: string }) {
  const s = load();
  const source = s.roles.find((r) => r.id === input.copyFromId);
  const base = source ? (source.locked ? permissionsFor(s.menus.map((x) => x.id), () => perm(true, true, true, true)) : source.permissions) : {};
  const role: Role = { id: `role-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, name: input.name, description: input.description, permissions: JSON.parse(JSON.stringify(base)) };
  commit({ ...s, roles: [...s.roles, role] });
  return role;
}

export function updateRole(id: string, patch: Partial<Pick<Role, "name" | "description">>) {
  const s = load();
  commit({ ...s, roles: s.roles.map((r) => (r.id === id && !r.locked ? { ...r, ...patch } : r)) });
}

export function removeRole(id: string) {
  const s = load();
  commit({ ...s, roles: s.roles.filter((r) => r.id !== id || r.locked), activeRoleId: s.activeRoleId === id ? "role-super-admin" : s.activeRoleId });
}

export function setPermissions(roleId: string, changes: { menuId: string; key: PermissionKey; value: boolean }[]) {
  const s = load();
  commit({
    ...s,
    roles: s.roles.map((r) => {
      if (r.id !== roleId || r.locked) return r;
      const permissions = { ...r.permissions };
      changes.forEach(({ menuId, key, value }) => {
        permissions[menuId] = { ...(permissions[menuId] ?? perm(false)), [key]: value };
      });
      return { ...r, permissions };
    }),
  });
}

export function setActiveRole(id: string) {
  commit({ ...load(), activeRoleId: id });
}

export function resetSettings() {
  commit(defaultSettings);
}
