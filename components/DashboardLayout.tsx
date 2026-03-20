"use client";

import React, { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const sidebarItems = [
    { name: "Dashboard", icon: IconLayoutDashboard, href: "/" },
    { name: "Inventory", icon: IconPackage, href: "/inventory" },
    { name: "Assets", icon: IconBoxSeam, href: "/assets" },
    { name: "Users", icon: IconUsers, href: "/users" },
    { name: "Reports", icon: IconFileAnalytics, href: "/reports" },
    { name: "Audit Trail", icon: IconHistory, href: "/audit-trail" },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center rounded-xl transition-all duration-200 group relative overflow-hidden ${isCollapsed ? "justify-center py-2.5" : "px-3 py-2.5 gap-3"} ${
                  isActive ? "bg-white/10 text-white shadow-sm" : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} stroke={2} className={`shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
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
            <div className="relative w-48 md:w-64 lg:w-96 group">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981]" size={18} />
              <input
                type="text"
                placeholder="Cari data..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-[#064E3B] transition-colors relative">
                <IconBell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">Admin User</p>
                <p className="text-[10px] text-[#10B981] font-semibold tracking-wide">Manager</p>
              </div>
              <div className="w-9 h-9 bg-[#064E3B] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">AD</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F9FAFB]">
          {children}
        </section>
      </main>
    </div>
  );
}
