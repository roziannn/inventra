"use client";

import React, { useState, useEffect } from "react";
import { IconPackage, IconBoxSeam, IconArrowUpRight, IconAlertTriangle, IconArrowsLeftRight, IconCircleCheck, IconClock, IconArrowRight, IconTags, IconBuildingSkyscraper } from "@tabler/icons-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

const dataCondition = [
  { name: "Good", value: 2450, color: "#877FC1" },
  { name: "Maintenance", value: 420, color: "#F59E0B" },
  { name: "Damaged", value: 150, color: "#EF4444" },
  { name: "Lost", value: 45, color: "#6366F1" },
  { name: "Repairing", value: 280, color: "#8B5CF6" },
  { name: "New", value: 775, color: "#222026" },
];

export default function FullDashboard() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now
        .toLocaleString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/,/g, "");

      // Remove space before AM/PM to match "7:49AM"
      setTime(formatted.replace(/\s([AP]M)$/, "$1"));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Inventory", val: "4,120", sub: "Pcs", icon: IconPackage, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Assets", val: "284", sub: "Units", icon: IconBoxSeam, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Loans", val: "18", sub: "Active", icon: IconArrowsLeftRight, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Low stock", val: "5", sub: "Urgent", icon: IconAlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const quickActions = [
    {
      href: "/labeling/print",
      title: "Print Label",
      description: "Cetak barcode atau label aset",
      icon: IconTags,
    },
    {
      href: "/vendors",
      title: "Data Vendor",
      description: "Kelola supplier dan kontak vendor",
      icon: IconBuildingSkyscraper,
    },
  ];

  return (
    <DashboardLayout>
      <div className="h-full min-h-0 flex flex-col gap-3">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0">
          <div>
            <h2 className="page-header">Overview</h2>
            <p className="page-subheader">Pantau pergerakan stok dan aset secara real-time.</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <IconClock size={16} stroke={2.2} className="text-violet-500" />
            <span className="text-sm font-semibold tabular-nums">{time || "Loading..."}</span>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card p-3.5 rounded-xl border border-border shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all group">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon size={20} stroke={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-lg font-bold text-gray-900 leading-none">{stat.val}</h3>
                  <span className="text-xs font-medium text-gray-400">{stat.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Chart Card */}
          <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-0 transition-colors duration-300">
            <div className="px-5 py-3.5 border-b border-border/60 flex justify-between items-center bg-muted/40 shrink-0">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <IconPackage size={18} className="text-violet-500" /> Kondisi inventory
              </h3>
              <button className="text-xs font-bold text-violet-500 hover:text-violet-500 transition-colors">Detail laporan</button>
            </div>
            <div className="flex-1 p-4 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataCondition} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      padding: "10px",
                    }}
                    itemStyle={{ fontWeight: 800, fontSize: "12px" }}
                    formatter={(value) => [`${value ?? 0} Pcs`, "Total"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={35}>
                    {dataCondition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="bg-zinc-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shrink-0">
              <div className="relative z-10">
                <p className="text-violet-400 text-xs font-bold tracking-widest uppercase">Kondisi aset</p>
                <div className="flex items-baseline mt-1.5">
                  <h4 className="text-3xl font-black">94</h4>
                  <span className="text-lg text-violet-400 ml-1">%</span>
                </div>
                <p className="text-violet-100/60 text-sm mt-1 font-medium">Seluruh aset dalam kondisi prima.</p>
                <button className="mt-4 w-full bg-white text-violet-500 py-2.5 rounded-lg text-xs font-bold hover:bg-violet-50 transition-all flex items-center justify-center gap-2 shadow-lg active:translate-y-0.5">
                  Export data <IconArrowUpRight size={14} stroke={3} />
                </button>
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-400/10 rounded-full blur-[40px]"></div>
            </div>

            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col overflow-hidden transition-colors duration-300 flex-1 min-h-0">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-xs tracking-wide shrink-0">
                <IconCircleCheck size={16} className="text-violet-500" /> Akses cepat
              </h4>
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-100 bg-muted/55 dark:bg-muted/80 text-sm hover:border-violet-200 dark:hover:border-violet-500/40 hover:bg-violet-50/40 dark:hover:bg-violet-500/10 transition-all shadow-sm group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
                        <action.icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">{action.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-0.5">{action.description}</p>
                      </div>
                      <IconArrowRight size={15} className="text-gray-300 dark:text-gray-500 mt-1 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
