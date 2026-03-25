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
  IconPrinter,
  IconQrcode,
  IconTags,
  IconUser,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { searchData } from "@/lib/search-data";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      ]
    },
    { name: "Reports", icon: IconFileAnalytics, href: "/reports" },
    { name: "Audit Trail", icon: IconHistory, href: "/audit-trail" },
  ];

  // Auto-open sub-menu if current path is a sub-item
  useEffect(() => {
    sidebarItems.forEach(item => {
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
      searchData.inventory.forEach(item => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Inventory", href: "/inventory", icon: IconPackage });
        }
      });

      // Search in Assets
      searchData.assets.forEach(item => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.serial.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Asset", href: "/assets", icon: IconBoxSeam });
        }
      });

      // Search in Reports
      searchData.reports.forEach(item => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "Report", href: "/reports", icon: IconFileAnalytics });
        }
      });

      // Search in Users
      searchData.users.forEach(item => {
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.email.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...item, type: "User", href: "/users", icon: IconUsers });
        }
      });

      // Search in Vendors
      searchData.vendors.forEach(item => {
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

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-gray-900 overflow-hidden relative">
      {/* --- SIDEBAR --- */}
      <aside className={`bg-[#064E3B] text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out z-[100] absolute lg:relative h-full ${isCollapsed ? "w-[80px]" : "w-[240px]"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3 top-10 bg-[#10B981] text-white rounded-full p-1.5 shadow-xl z-50 hover:scale-110 active:scale-95 transition-all duration-300">
          <IconChevronLeft size={14} stroke={3} className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>

        <div className="h-16 flex items-center px-5 shrink-0">
          <div className="min-w-[32px] h-8 bg-[#10B981] rounded flex items-center justify-center shadow-lg">
            <IconBoxSeam size={18} stroke={2.5} className="text-white" />
          </div>
          <span className={`ml-3 text-lg font-bold transition-all duration-500 ${isCollapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100 w-auto"}`}>Inventra</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-hide">
          {sidebarItems.map((item) => {
            const hasSubItems = !!item.subItems;
            const isSubMenuOpen = openSubMenu === item.name;
            const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));

            if (hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`w-full flex items-center rounded-xl px-3 py-2.5 gap-3 ${
                      isActive ? "bg-white/10 text-white" : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={20} stroke={2} className="shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                        <IconChevronDown size={14} className={isSubMenuOpen ? "rotate-180" : ""} />
                      </div>
                    )}
                  </button>
                  
                  {!isCollapsed && isSubMenuOpen && (
                    <div className="flex flex-col space-y-0.5 mt-0.5">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center pl-12 pr-3 py-2 rounded-xl text-sm font-medium ${
                              isSubActive ? "text-white bg-white/5" : "text-emerald-100/40 hover:text-white hover:bg-white/5"
                            }`}
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
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center rounded-xl px-3 py-2.5 gap-3 ${
                  isActive ? "bg-white/10 text-white shadow-sm" : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} stroke={2} className="shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap opacity-100">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="h-14 border-t border-white/5 shrink-0 flex items-center px-3">
          <button className={`flex items-center w-full text-emerald-100/50 hover:text-red-400 transition-all duration-300 group ${isCollapsed ? "justify-center" : "gap-3 px-3 py-2"}`}>
            <IconLogout size={20} stroke={2} />
            <span className={`text-sm font-medium transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute inset-0 bg-black/50 z-[90]" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-[80]">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <IconMenu2 size={24} />
            </button>
            <div className="relative w-48 md:w-64 lg:w-96 group" ref={searchRef}>
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                placeholder="Cari assets, inventory, reports etc"
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[200]">
                  <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Hasil Pencarian</p>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {filteredResults.map((result, idx) => (
                      <button
                        key={`${result.type}-${result.id}-${idx}`}
                        onClick={() => {
                          router.push(result.href);
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 transition-colors group text-left border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 text-gray-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                            <result.icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">{result.title || result.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                              {result.type} &bull; {result.id} {result.sku || result.serial || result.email ? `&bull; ${result.sku || result.serial || result.email}` : ""}
                            </p>
                          </div>
                        </div>
                        <IconArrowRight size={14} className="text-gray-300 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSuggestions && filteredResults.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-6 z-[200] text-center">
                  <p className="text-sm text-gray-500 font-medium">Tidak ada hasil ditemukan untuk &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="p-2 text-gray-400 hover:text-[#064E3B] transition-colors relative">
                <IconBell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </Link>
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-4 border-l border-gray-100 focus:outline-none group transition-all"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#064E3B] transition-colors">Admin User</p>
                  <p className="text-[10px] text-[#10B981] font-semibold tracking-wide">Manager</p>
                </div>
                <div className={`w-9 h-9 bg-[#064E3B] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:ring-4 group-hover:ring-emerald-50 transition-all ${isProfileOpen ? "ring-4 ring-emerald-50" : ""}`}>
                  AD
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[200] animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informasi Akun</p>
                    <div className="flex items-center gap-3 mt-2">
                       <div className="w-10 h-10 bg-[#064E3B] rounded-full flex items-center justify-center text-white font-bold text-xs">AD</div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">Admin User</p>
                          <p className="text-[11px] text-gray-500 font-medium">admin@inventra.com</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="px-2 space-y-0.5">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                        <IconUser size={18} stroke={2} />
                      </div>
                      <span className="font-medium">Profil Saya</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                        <IconSettings size={18} stroke={2} />
                      </div>
                      <span className="font-medium">Pengaturan</span>
                    </Link>
                  </div>
                  
                  <div className="h-px bg-gray-50 my-2 mx-4"></div>
                  
                  <div className="px-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group">
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
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F9FAFB]">
          {children}
        </section>

        {/* Footer */}
        <footer className="h-14 bg-white border-t border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-[80]">
           <p className="text-[10px] text-gray-400 font-medium tracking-wider">
              &copy; {mounted ? new Date().getFullYear() : ""} <span className="text-[#064E3B] font-bold">INVENTRA</span>. ASSET & INVENTORY.
           </p>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">System Online</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-md font-mono">
                 v1.0.2
              </span>
           </div>
        </footer>
      </main>
    </div>
  );
}
