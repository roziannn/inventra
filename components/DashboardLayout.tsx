/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconLayoutDashboard,
  IconPackage,
  IconBoxSeam,
  IconUsers,
  IconFileAnalytics,
  IconLogout,
  IconSearch,
  IconChevronLeft,
  IconMenu2,
  IconBell,
  IconHistory,
  IconArrowRight,
  IconBuildingSkyscraper,
  IconChevronDown,
  IconTags,
  IconUser,
  IconSettings,
  IconSun,
  IconMoon,
  IconBuildingWarehouse,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sulphur_Point } from "next/font/google";
import { searchData } from "@/lib/search-data";
import HeaderBreadcrumb from "@/components/HeaderBreadcrumb";
import { MENU_ICONS } from "@/lib/menu-icons";
import { sidebarFor, useSettings } from "@/lib/settings-store";
import toast from "react-hot-toast";

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { menus, roles, activeRoleId } = useSettings();
  const activeRole = roles.find((r) => r.id === activeRoleId);
  const sidebarItems = React.useMemo(
    () =>
      sidebarFor(menus, activeRole).map(({ menu, subs }) => ({
        name: menu.name,
        icon: MENU_ICONS[menu.icon] ?? MENU_ICONS.folder,
        href: menu.href,
        subItems: subs.length ? subs.map((x) => ({ name: x.name, href: x.href })) : undefined,
      })),
    [menus, activeRole],
  );
  const getActiveSubMenu = React.useCallback(
    (currentPath: string) => sidebarItems.find((item) => item.subItems && (currentPath === item.href || currentPath.startsWith(`${item.href}/`)))?.name ?? null,
    [sidebarItems],
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(() => getActiveSubMenu(pathname));
  const [themePreference, setThemePreference] = useState<"light" | "dark" | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const hasStoredTheme = storedTheme === "dark" || storedTheme === "light";
    const initialTheme = hasStoredTheme ? storedTheme : prefersDarkQuery.matches ? "dark" : "light";

    setThemePreference(hasStoredTheme ? storedTheme : null);
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    document.documentElement.style.colorScheme = initialTheme;
    setMounted(true);

    if (!hasStoredTheme) {
      const handleSystemThemeChange = (event: MediaQueryListEvent) => {
        const nextTheme = event.matches ? "dark" : "light";
        setTheme(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        document.documentElement.style.colorScheme = nextTheme;
      };

      prefersDarkQuery.addEventListener("change", handleSystemThemeChange);
      return () => prefersDarkQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;

    if (themePreference) {
      localStorage.setItem("theme", themePreference);
    } else {
      localStorage.removeItem("theme");
    }
  }, [theme, themePreference, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      setThemePreference(nextTheme);
      return nextTheme;
    });
  };

  // Keep the active submenu open immediately when navigating between child routes.
  useEffect(() => {
    const activeSubMenu = getActiveSubMenu(pathname);
    if (activeSubMenu && openSubMenu !== activeSubMenu) {
      setOpenSubMenu(activeSubMenu);
    }
  }, [getActiveSubMenu, openSubMenu, pathname]);

  const toggleSubMenu = (name: string) => {
    if (openSubMenu === name) {
      setOpenSubMenu(null);
    } else {
      setOpenSubMenu(name);
      if (isCollapsed) setIsCollapsed(false);
    }
  };

  // Handle Search logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results: any[] = [];

      // Search in Inventory
      searchData.inventory.forEach((item) => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Inventory", href: "/inventory", icon: IconPackage });
        }
      });

      // Search in Assets
      searchData.assets.forEach((item) => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.serial.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Asset", href: "/assets", icon: IconBoxSeam });
        }
      });

      // Search in Reports
      searchData.reports.forEach((item) => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Report", href: "/reports", icon: IconFileAnalytics });
        }
      });

      // Search in Users
      searchData.users.forEach((item) => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.email.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "User", href: "/users", icon: IconUsers });
        }
      });

      // Search in Vendors
      searchData.vendors.forEach((item) => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.email.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Vendor", href: "/vendors", icon: IconBuildingSkyscraper });
        }
      });

      setFilteredResults(results.slice(0, 6)); // Limit to 6 results
      setShowSuggestions(true);
    } else {
      setFilteredResults([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchQuery("");
    setShowSuggestions(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    toast.error("Anda telah keluar dari sistem.");
    setTimeout(() => {
      router.push("/login");
    }, 300);
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden relative transition-colors duration-300">
      {/* --- SIDEBAR --- */}
      <aside
        className={`bg-zinc-900 text-white flex flex-col shadow-xl transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,transform] z-100 absolute lg:relative h-full overflow-visible ${isCollapsed ? "w-20" : "w-60"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute right-0 translate-x-1/2 top-10 bg-violet-500 text-white rounded-full p-1.5 shadow-xl z-120 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <IconChevronLeft size={14} stroke={3} className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>

        <div className="h-16 flex items-center px-5 shrink-0">
          <div className="w-8 h-8 bg-violet-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-950/50">
            <IconBoxSeam size={17} stroke={2.4} className="text-white" />
          </div>
          <span
            className={`${sulphurPoint.className} ml-3 text-2xl font-black tracking-[0.06em] text-violet-100 origin-left whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-out ${isCollapsed ? "opacity-0 -translate-x-1 max-w-0" : "opacity-100 translate-x-0 max-w-35"}`}
          >
            Inventra
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto scrollbar-hide">
          {sidebarItems.map((item) => {
            const hasSubItems = !!item.subItems;
            const isSubMenuOpen = openSubMenu === item.name;
            const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));

            if (hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`w-full flex items-center rounded-xl px-3 py-2.5 gap-3 transition-colors duration-200 ${isActive ? "bg-white/10 text-white" : "text-violet-100/60 hover:bg-white/5 hover:text-white"}`}
                  >
                    <item.icon size={20} stroke={2} className="shrink-0" />
                    <div
                      className={`flex-1 flex items-center justify-between overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-out ${
                        isCollapsed ? "opacity-0 -translate-x-1 max-w-0 pointer-events-none" : "opacity-100 translate-x-0 max-w-45"
                      }`}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                      <IconChevronDown size={14} className={`transition-transform duration-300 ease-out ${isSubMenuOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSubMenuOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                    >
                      <div className="min-h-0">
                        <div className="flex flex-col space-y-0.5 pb-0.5">
                          {item.subItems?.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center pl-12 pr-3 py-2 rounded-xl text-sm font-medium transition-[background-color,color,transform] duration-200 ${
                                  isSubActive ? "text-white bg-white/6" : "text-violet-100/40 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span>{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center rounded-xl px-3 py-2.5 gap-3 transition-colors duration-200 ${isActive ? "bg-white/10 text-white" : "text-violet-100/60 hover:bg-white/5 hover:text-white"}`}
              >
                <item.icon size={20} stroke={2} className="shrink-0" />
                <span
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-out ${
                    isCollapsed ? "opacity-0 -translate-x-1 max-w-0 pointer-events-none" : "opacity-100 translate-x-0 max-w-45"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* --- Sidebar Footer: User Profile --- */}
        <div className="mt-auto p-4 relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">AD</div>
            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-bold text-white truncate">Admin User</p>
                <p className="text-xs text-violet-100/50 truncate">admin@inventra.com</p>
              </div>
            )}
            {!isCollapsed && <IconChevronDown size={14} className={`text-violet-100/30 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />}
          </button>

          {/* Profile Dropdown (Popover Up) */}
          {isProfileOpen && (
            <div
              className={`absolute bottom-full mb-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-200 animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom ${
                isCollapsed ? "left-14 w-48" : "left-3 right-3"
              }`}
            >
              <div className="p-4 border-b border-white/5 mb-1">
                <p className="text-xs font-bold text-violet-100/30">Akun Saya</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white font-bold text-xs">AD</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">Admin User</p>
                    <p className="text-xs text-violet-100/40 truncate">{activeRole?.name ?? "Super Admin"}</p>
                  </div>
                </div>
              </div>

              <div className="px-2 space-y-0.5">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-violet-100/60 hover:bg-white/5 hover:text-white rounded-xl transition-colors group">
                  <IconUser size={18} stroke={1.5} />
                  <span>Profil Saya</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-violet-100/60 hover:bg-white/5 hover:text-white rounded-xl transition-colors group">
                  <IconSettings size={18} stroke={1.5} />
                  <span>Pengaturan</span>
                </Link>
              </div>

              <div className="h-px bg-white/5 my-2 mx-4"></div>

              <div className="px-2">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group">
                  <IconLogout size={18} stroke={1.5} />
                  <span className="font-bold">Keluar Aplikasi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && <div className="lg:hidden absolute inset-0 bg-black/50 z-90" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-card grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 lg:px-8 shrink-0 z-80 transition-colors duration-300">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <IconMenu2 size={24} />
            </button>
            <div className="hidden min-w-0 overflow-hidden md:block">
              <HeaderBreadcrumb />
            </div>
          </div>
          <div className="relative w-40 sm:w-64 lg:w-96 group" ref={searchRef}>
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                placeholder="Cari assets, inventory, reports etc"
                className="w-full pl-10 pr-4 py-2 bg-muted/60 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-[200]">
                  <div className="p-2 border-b border-border/60 bg-muted">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-200 uppercase tracking-widest px-2">Hasil Pencarian</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {filteredResults.map((result, idx) => (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        onClick={() => {
                          router.push(result.href);
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors group text-left border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-violet-100 dark:group-hover:bg-violet-800/50 text-gray-500 group-hover:text-violet-600 dark:group-hover:text-violet-300 flex items-center justify-center transition-colors">
                            <result.icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-violet-900 dark:group-hover:text-violet-300 transition-colors">{result.title || result.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-300 font-medium tracking-tight">
                              {result.type} &bull; {result.id} {result.sku || result.serial || result.email ? `&bull; ${result.sku || result.serial || result.email}` : ""}
                            </p>
                          </div>
                        </div>
                        <IconArrowRight size={14} className="text-gray-300 group-hover:text-violet-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSuggestions && filteredResults.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-card rounded-xl shadow-2xl border border-border p-6 z-[200] text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Tidak ada hasil ditemukan untuk &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg border border-border bg-muted/60 hover:bg-muted transition-colors text-gray-600 dark:text-gray-200">
              {mounted ? theme === "dark" ? <IconMoon size={18} /> : <IconSun size={18} /> : <span className="block h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
            <Link href="/notifications" className="p-2 rounded-lg border border-border bg-muted/60 hover:bg-muted transition-colors text-gray-600 dark:text-gray-200 relative">
              <IconBell size={18} />
              <span className="absolute right-1.5 top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-card ring-2 ring-card">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background transition-colors duration-300">{children}</section>

        {/* Footer */}
        <footer className="h-12 bg-card flex items-center justify-between px-4 lg:px-8 shrink-0 z-80 transition-colors duration-300">
          <p className="text-xs text-gray-400 dark:text-gray-300 font-medium tracking-wider">
            &copy; {mounted ? new Date().getFullYear() : ""} <span className="text-violet-500 dark:text-violet-400 font-bold">INVENTRA</span>. ASSET & INVENTORY.
          </p>
        </footer>
      </main>
    </div>
  );
}
