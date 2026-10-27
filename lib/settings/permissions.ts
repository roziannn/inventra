import { can, useSettings, type MenuItem, type PermissionKey, type Role } from "@/lib/settings/settings-store";

export type Permissions = Record<PermissionKey, boolean>;

const ALLOWED: Permissions = { view: true, create: true, edit: true, delete: true };

/** The menu that owns a URL path: exact match first, otherwise the longest menu path that is a prefix (never "/"). */
export function findMenuForPath(menus: MenuItem[], pathname: string): MenuItem | undefined {
  const matches = menus.filter((m) => pathname === m.href || (m.href !== "/" && pathname.startsWith(`${m.href}/`)));
  // prefer the most specific path; between a group and its child with the same path, prefer the child (it has its own rights)
  return matches.sort((a, b) => b.href.length - a.href.length || Number(!!b.parentId) - Number(!!a.parentId))[0];
}

export function permissionsFor(menu: MenuItem | undefined, role: Role | undefined): Permissions {
  // pages that are not in the menu (notifications, profile) and core menus (Settings) are always open
  if (!menu || menu.locked) return ALLOWED;
  return { view: can(role, menu.id, "view"), create: can(role, menu.id, "create"), edit: can(role, menu.id, "edit"), delete: can(role, menu.id, "delete") };
}

/**
 * What the active role may do on a page. `href` is the menu path of the page, e.g. "/inventory".
 * Use it to hide buttons the role must not use:
 *   const perm = usePermissions("/inventory");
 *   {perm.create && <Button>Tambah barang</Button>}
 */
export function usePermissions(href: string): Permissions {
  const { menus, roles, activeRoleId } = useSettings();
  const menu = findMenuForPath(menus, href);
  return permissionsFor(
    menu,
    roles.find((r) => r.id === activeRoleId),
  );
}
