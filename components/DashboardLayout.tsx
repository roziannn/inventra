/* eslint-disable react-hooks/exhaustive-deps */
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
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sulphur_Point } from "next/font/google";
import { searchData } from "@/lib/search-data";
import toast from "react-hot-toast";

const sulphurPoint = Sulphur_Point({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;
    const initialTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : prefersDark ? "dark" : "light";
    setTheme(initialTheme);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const sidebarItems = [
    { name: "Dashboard", icon: IconLayoutDashboard, href: "/" },
    { name: "Inventory", icon: IconPackage, href: "/inventory" },
    { name: "Assets", icon: IconBoxSeam, href: "/assets" },
    { name: "Vendors", icon: IconBuildingSkyscraper, href: "/vendors" },
    { name: "Users", icon: IconUsers, href: "/users" },
    {
      name: "Labeling",
      icon: IconTags,
      href: "/labeling",
      subItems: [
        { name: "Print Label", href: "/labeling/print" },
        { name: "QR Code", href: "/labeling/qr" },
      ],
    },
    { name: "Reports", icon: IconFileAnalytics, href: "/reports" },
    { name: "Audit Trail", icon: IconHistory, href: "/audit-trail" },
  ];

  // Auto-open sub-menu if current path is a sub-item
  useEffect(() => {
    sidebarItems.forEach((item) => {
      if (item.subItems) {
        if (pathname.startsWith(item.href)) {
          setOpenSubMenu(item.name);
        }
      }
    });
  }, [pathname]);

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
    // Logika logout bisa ditambahkan di sini
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden relative transition-colors duration-300">
      {/* --- SIDEBAR --- */}
      <aside
        className={`bg-zinc-900 text-white flex flex-col shadow-xl transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,transform] z-100 absolute lg:relative h-full overflow-visible ${isCollapsed ? "w-20" : "w-60"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute right-0 translate-x-1/2 top-10 bg-violet-500 text-white rounded-full p-1.5 shadow-xl z-[120] hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <IconChevronLeft size={14} stroke={3} className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>

        <div className="h-16 flex items-center px-5 shrink-0">
          <div className="w-8 h-8 bg-violet-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-950/50">
            <IconBoxSeam size={17} stroke={2.4} className="text-white" />
          </div>
          <span
            className={`${sulphurPoint.className} ml-3 text-2xl font-black tracking-[0.06em] text-violet-100 origin-left whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-out ${isCollapsed ? "opacity-0 -translate-x-1 max-w-0" : "opacity-100 translate-x-0 max-w-[140px]"}`}
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
                  <button onClick={() => toggleSubMenu(item.name)} className={`w-full flex items-center rounded-xl px-3 py-2.5 gap-3 ${isActive ? "bg-white/10 text-white" : "text-violet-100/60 hover:bg-white/5 hover:text-white"}`}>
                    <item.icon size={20} stroke={2} className="shrink-0" />
                    <div
                      className={`flex-1 flex items-center justify-between overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-out ${
                        isCollapsed ? "opacity-0 -translate-x-1 max-w-0 pointer-events-none" : "opacity-100 translate-x-0 max-w-[180px]"
                      }`}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                      <IconChevronDown size={14} className={isSubMenuOpen ? "rotate-180" : ""} />
                    </div>
                  </button>

                  {!isCollapsed && isSubMenuOpen && (
                    <div className="flex flex-col space-y-0.5 mt-0.5">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center pl-12 pr-3 py-2 rounded-xl text-sm font-medium ${isSubActive ? "text-white bg-white/5" : "text-violet-100/40 hover:text-white hover:bg-white/5"}`}
                          >
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.name} href={item.href} className={`w-full flex items-center rounded-xl px-3 py-2.5 gap-3 ${isActive ? "bg-white/10 text-white shadow-sm" : "text-violet-100/60 hover:bg-white/5 hover:text-white"}`}>
                <item.icon size={20} stroke={2} className="shrink-0" />
                <span
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-out ${
                    isCollapsed ? "opacity-0 -translate-x-1 max-w-0 pointer-events-none" : "opacity-100 translate-x-0 max-w-[180px]"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="h-14 border-t border-white/5 shrink-0 flex items-center px-3">
          <button onClick={handleLogout} className={`flex items-center w-full text-violet-100/50 hover:text-red-400 transition-all duration-300 group ${isCollapsed ? "justify-center" : "gap-3 px-3 py-2"}`}>
            <IconLogout size={20} stroke={2} />
            <span
              className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-out ${
                isCollapsed ? "opacity-0 -translate-x-1 max-w-0 pointer-events-none" : "opacity-100 translate-x-0 max-w-[120px]"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && <div className="lg:hidden absolute inset-0 bg-black/50 z-90" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-card flex items-center justify-between px-4 lg:px-8 shrink-0 z-80 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <IconMenu2 size={24} />
            </button>
            <div className="relative w-48 md:w-64 lg:w-96 group" ref={searchRef}>
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
                <div className="absolute top-full left-0 w-full mt-2 bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-200">
                  <div className="p-2 border-b border-border/60 bg-muted/40">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-200 uppercase tracking-widest px-2">Hasil Pencarian</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {filteredResults.map((result, idx) => (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        onClick={() => {
                          router.push(result.href);
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-violet-50/50 dark:hover:bg-violet-950/40 transition-colors group text-left border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-violet-100 text-gray-500 group-hover:text-violet-600 flex items-center justify-center transition-colors">
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
                <div className="absolute top-full left-0 w-full mt-2 bg-card rounded-xl shadow-2xl border border-border p-6 z-200 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Tidak ada hasil ditemukan untuk &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg border border-border bg-muted/60 hover:bg-muted transition-colors text-gray-600 dark:text-gray-200">
              {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>
            <Link href="/notifications" className="p-2 rounded-lg border border-border bg-muted/60 hover:bg-muted transition-colors text-gray-600 dark:text-gray-200 relative">
              <IconBell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </Link>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 pl-4 border-l border-gray-100 focus:outline-none group transition-all">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-violet-500 transition-colors">Admin User</p>
                  <p className="text-xs text-violet-500 font-semibold tracking-wide">Manager</p>
                </div>
                <div
                  className={`w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:ring-4 group-hover:ring-violet-50 transition-all ${isProfileOpen ? "ring-4 ring-violet-50" : ""}`}
                >
                  AD
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-200 animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Akun</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-xs">AD</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Admin User</p>
                        <p className="text-sm text-gray-500 font-medium">admin@inventra.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 space-y-0.5">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                        <IconUser size={18} stroke={2} />
                      </div>
                      <span className="font-medium">Profil Saya</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                        <IconSettings size={18} stroke={2} />
                      </div>
                      <span className="font-medium">Pengaturan</span>
                    </Link>
                  </div>

                  <div className="h-px bg-gray-50 my-2 mx-4"></div>

                  <div className="px-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-white flex items-center justify-center transition-colors">
                        <IconLogout size={18} stroke={2} />
                      </div>
                      <span className="font-bold">Keluar Aplikasi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background transition-colors duration-300">{children}</section>

        {/* Footer */}
        <footer className="h-12 bg-card flex items-center justify-between px-4 lg:px-8 shrink-0 z-80 transition-colors duration-300">
          <p className="text-xs text-gray-400 dark:text-gray-300 font-medium tracking-wider">
            &copy; {mounted ? new Date().getFullYear() : ""} <span className="text-violet-500 dark:text-violet-400 font-bold">INVENTRA</span>. ASSET & INVENTORY.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-300 font-bold uppercase tracking-widest hidden sm:block">System Online</span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-muted border border-border text-gray-400 dark:text-gray-200 rounded-md font-mono">v1.0.2</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
