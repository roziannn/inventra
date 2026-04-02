"use client";

import React, { useState, useEffect } from "react";
import { IconPackage, IconBoxSeam, IconArrowUpRight, IconCircleCheck, IconClock, IconArrowRight, IconTags, IconBuildingSkyscraper, IconChartDonut3, IconChartBar, IconSpeakerphone, IconAlertTriangle } from "@tabler/icons-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

const inventoryStatusData = [
  { status: "Good", total: 2450, color: "#877FC1" },
  { status: "New", total: 775, color: "#A78BFA" },
  { status: "Repairing", total: 280, color: "#DBD3F5" },
  { status: "Maintenance", total: 420, color: "#F59E0B" },
  { status: "Damaged", total: 150, color: "#EF4444" },
  { status: "Lost", total: 45, color: "#94A3B8" },
];

const mostReportedByCategory = [
  { category: "IT Equipment", reports: 24 },
  { category: "Furniture", reports: 17 },
  { category: "Office Supply", reports: 13 },
  { category: "Vehicle", reports: 9 },
  { category: "Machinery", reports: 7 },
];

const lowStockAlerts = [
  { item: "RJ45 Connector Cat6", sku: "TEC-RJ45-01", stock: 42, minStock: 120, level: "Low" },
  { item: "LAN Cable Cat6 2m", sku: "TEC-LAN-02", stock: 18, minStock: 60, level: "Urgent" },
  { item: "SSD Thermal Pad", sku: "TEC-THM-03", stock: 9, minStock: 30, level: "Urgent" },
  { item: "Cable Ties 20cm", sku: "TEC-TIE-04", stock: 75, minStock: 150, level: "Low" },
  { item: "Battery CMOS CR2032", sku: "TEC-BAT-05", stock: 14, minStock: 40, level: "Urgent" },
];

const serviceBreakdown = [
  { name: "Self service", total: 41, color: "#877FC1" },
  { name: "By vendor", total: 29, color: "#DBD3F5" },
];

const reportStatusData = [
  { status: "Pending", total: 18, color: "#F59E0B" },
  { status: "In progress", total: 33, color: "#877FC1" },
  { status: "Resolved", total: 19, color: "#4ADE80" },
  { status: "Completed", total: 14, color: "#22C55E" },
];

export default function FullDashboard() {
  const [time, setTime] = useState<string>("");
  const totalServiceReports = serviceBreakdown.reduce((acc, item) => acc + item.total, 0);
  const serviceGap = Math.abs(serviceBreakdown[0].total - serviceBreakdown[1].total);

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

      setTime(formatted.replace(/\s([AP]M)$/, "$1"));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Inventory", val: "4,120", sub: "Pcs", delta: "+6.2%", icon: IconPackage, color: "text-violet-600", bg: "bg-violet-50", chip: "bg-violet-500/10 text-violet-600" },
    { label: "Assets", val: "284", sub: "Units", delta: "+2.1%", icon: IconBoxSeam, color: "text-blue-600", bg: "bg-blue-50", chip: "bg-blue-500/10 text-blue-600" },
    { label: "Vendors", val: "124", sub: "Partners", delta: "+1.4%", icon: IconBuildingSkyscraper, color: "text-purple-600", bg: "bg-purple-50", chip: "bg-purple-500/10 text-purple-600" },
    { label: "Low stock", val: "5", sub: "Urgent", delta: "-9.0%", icon: IconAlertTriangle, color: "text-red-600", bg: "bg-red-50", chip: "bg-red-500/10 text-red-600" },
  ];

  const quickActions = [
    {
      href: "/labeling/print",
      title: "Print Label",
      description: "Cetak barcode atau label aset",
      icon: IconTags,
      tone: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-300",
    },
    {
      href: "/vendors",
      title: "Data Vendor",
      description: "Kelola supplier dan kontak vendor",
      icon: IconBuildingSkyscraper,
      tone: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-300",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 shadow-sm">
          <div className="relative flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="inline-flex self-start rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 md:order-2 md:self-start">What&apos;s New</div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/12 text-amber-700">
                <IconSpeakerphone size={18} stroke={2.1} className="animate-[pulse_2.6s_ease-in-out_infinite]" />
              </div>
              <div>
                <p className="mt-2 text-sm font-semibold text-amber-950">Audit Trail dan Reports sekarang sudah mendukung export data.</p>
                <p className="text-sm text-amber-900/70">Gunakan tombol export di masing-masing halaman untuk mengunduh log aktivitas atau laporan dengan cepat.</p>
              </div>
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card p-3.5 rounded-lg border border-border shadow-sm flex items-center gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent opacity-70" />
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon size={20} stroke={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <div className="flex items-baseline gap-1.5 justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="text-lg font-bold text-gray-900 leading-none">{stat.val}</h3>
                    <span className="text-xs font-medium text-gray-400">{stat.sub}</span>
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${stat.chip}`}>{stat.delta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-card rounded-lg border border-border shadow-sm overflow-hidden flex flex-col min-h-[320px] transition-colors duration-300">
            <div className="px-5 py-3.5 border-b border-border/60 flex justify-between items-center bg-muted/40 shrink-0">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <IconPackage size={18} className="text-violet-500" /> Kondisi asset
              </h3>
              <button className="text-xs font-bold text-violet-500 hover:text-violet-500 transition-colors inline-flex items-center gap-1">
                Detail laporan <IconArrowUpRight size={12} stroke={2.5} />
              </button>
            </div>
            <div className="flex-1 p-4 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryStatusData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={8} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid rgba(135,127,193,0.25)",
                      boxShadow: "0 12px 24px -8px rgba(0,0,0,0.3)",
                      padding: "8px 10px",
                      background: "#222026",
                    }}
                    labelStyle={{ color: "#DBD3F5", fontWeight: 700, marginBottom: 6 }}
                    itemStyle={{ color: "#F5F6FA", fontWeight: 700, fontSize: "12px" }}
                    formatter={(value) => [`${value ?? 0} Pcs`, "Total"]}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={28}>
                    {inventoryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-zinc-900 rounded-lg p-5 text-white relative overflow-hidden shadow-lg shrink-0">
              <div className="relative z-10">
                <p className="text-violet-400 text-xs font-bold tracking-widest uppercase">Kondisi aset</p>
                <div className="flex items-baseline mt-1.5">
                  <h4 className="text-3xl font-black">94</h4>
                  <span className="text-lg text-violet-400 ml-1">%</span>
                </div>
                <p className="text-violet-100/60 text-sm mt-1 font-medium">Seluruh aset dalam kondisi prima.</p>
                <button className="mt-4 w-full bg-white text-violet-500 py-2.5 rounded-md text-xs font-bold hover:bg-violet-50 transition-all flex items-center justify-center gap-2 shadow-lg active:translate-y-0.5">
                  Export data <IconArrowUpRight size={14} stroke={3} />
                </button>
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-400/10 rounded-full blur-[40px]"></div>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border shadow-sm flex flex-col overflow-hidden transition-colors duration-300 flex-1 min-h-0">
              <div className="mb-3 shrink-0">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-xs tracking-wide">
                  <IconCircleCheck size={16} className="text-violet-500" /> Akses cepat
                </h4>
                <p className="text-xs text-gray-500 mt-1">Aksi paling sering dipakai tim operasional</p>
              </div>
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-100 bg-muted/55 dark:bg-muted/80 text-sm hover:border-violet-200 dark:hover:border-violet-500/40 hover:bg-violet-50/40 dark:hover:bg-violet-500/10 transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${action.tone} flex items-center justify-center shrink-0 ring-1 ring-white/50 dark:ring-white/10`}>
                        <action.icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">{action.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{action.description}</p>
                      </div>
                      <IconArrowRight size={16} className="text-gray-300 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-all group-hover:translate-x-0.5 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 shrink-0">
          <div className="bg-card rounded-lg border border-border shadow-sm p-4 h-[300px] flex flex-col">
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-900">Most Report Based on Category</h4>
              <p className="text-xs text-gray-500">Kategori dengan laporan kerusakan terbanyak</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostReportedByCategory} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid rgba(135,127,193,0.25)",
                      boxShadow: "0 12px 24px -8px rgba(0,0,0,0.3)",
                      padding: "8px 10px",
                      background: "#222026",
                    }}
                    labelStyle={{ color: "#DBD3F5", fontWeight: 700, marginBottom: 6 }}
                    itemStyle={{ color: "#F5F6FA", fontWeight: 700, fontSize: "12px" }}
                    formatter={(value) => [`${value ?? 0} Reports`, "Total"]}
                  />
                  <Bar dataKey="reports" radius={[4, 4, 0, 0]} barSize={26} fill="#877FC1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-4 h-[300px] flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <IconChartDonut3 size={16} className="text-violet-500" /> Service Kerusakan
                </h4>
                <p className="text-xs text-gray-500">Self service vs by vendor</p>
              </div>
              <span className="text-xs font-semibold rounded-md px-2 py-1 bg-violet-500/10 text-violet-600">Selisih {serviceGap}</span>
            </div>

            <div className="h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceBreakdown} dataKey="total" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={4} stroke="none">
                    {serviceBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    contentStyle={{ borderRadius: "8px", border: "1px solid rgba(135,127,193,0.25)", background: "#222026" }}
                    labelStyle={{ color: "#DBD3F5", fontWeight: 700 }}
                    itemStyle={{ color: "#F5F6FA", fontWeight: 700, fontSize: "12px" }}
                    formatter={(value) => [`${value ?? 0} Reports`, "Total"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-500">Total reports</p>
                <p className="text-lg font-bold text-gray-900">{totalServiceReports}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              {serviceBreakdown.map((item) => (
                <div key={item.name} className="rounded-md border border-border/70 bg-muted/45 px-3 py-2">
                  <p className="text-xs text-gray-500">{item.name}</p>
                  <p className="text-sm font-bold text-gray-900">{item.total} reports</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border border-border shadow-sm p-4 h-[300px] flex flex-col">
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-900">Low Stock Alert</h4>
              <p className="text-xs text-gray-500">Daftar item yang butuh restock segera</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">SKU</th>
                    <th className="text-right py-2">Stock</th>
                    <th className="text-right py-2">Min</th>
                    <th className="text-right py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map((row) => (
                    <tr key={row.sku} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 text-sm font-semibold text-gray-800">{row.item}</td>
                      <td className="py-2 text-xs text-gray-500">{row.sku}</td>
                      <td className="py-2 text-right text-sm font-bold text-gray-800">{row.stock}</td>
                      <td className="py-2 text-right text-xs text-gray-500">{row.minStock}</td>
                      <td className="py-2 text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${row.level === "Urgent" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>{row.level}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-4 h-[300px] flex flex-col">
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <IconChartBar size={16} className="text-violet-500" /> Status Report
              </h4>
              <p className="text-xs text-gray-500">Pending, in progress, resolved, dan completed</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportStatusData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{ borderRadius: "8px", border: "1px solid rgba(135,127,193,0.25)", background: "#222026" }}
                    labelStyle={{ color: "#DBD3F5", fontWeight: 700 }}
                    itemStyle={{ color: "#F5F6FA", fontWeight: 700, fontSize: "12px" }}
                    formatter={(value) => [`${value ?? 0} Reports`, "Total"]}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={38}>
                    {reportStatusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
