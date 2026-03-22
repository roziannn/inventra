"use client";

import React from "react";
import {
  IconPackage,
  IconBoxSeam,
  IconPlus,
  IconArrowUpRight,
  IconDotsVertical,
  IconAlertTriangle,
  IconArrowsLeftRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import DashboardLayout from "@/components/DashboardLayout";

const dataCondition = [
  { name: "Good", value: 2450, color: "#10B981" },
  { name: "Maintenance", value: 420, color: "#F59E0B" },
  { name: "Damaged", value: 150, color: "#EF4444" },
  { name: "Lost", value: 45, color: "#6366F1" },
  { name: "Repairing", value: 280, color: "#8B5CF6" },
  { name: "New", value: 775, color: "#064E3B" },
];

export default function FullDashboard() {
  const stats = [
    { label: "Inventory", val: "4,120", sub: "Pcs", icon: IconPackage, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Assets", val: "284", sub: "Units", icon: IconBoxSeam, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Loans", val: "18", sub: "Active", icon: IconArrowsLeftRight, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Low stock", val: "5", sub: "Urgent", icon: IconAlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
            <p className="text-xs text-gray-500">Pantau pergerakan stok dan aset secara real-time.</p>
          </div>
          <button className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
            <IconPlus size={16} stroke={3} /> Tambah data
          </button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105`}>
                <stat.icon size={20} stroke={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-lg font-bold text-gray-900 leading-none">{stat.val}</h3>
                  <span className="text-[10px] font-medium text-gray-400">{stat.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
            <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/20 shrink-0">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <IconPackage size={18} className="text-[#064E3B]" /> Kondisi inventory
              </h3>
              <button className="text-[10px] font-bold text-[#064E3B] hover:text-[#10B981] transition-colors">Detail laporan</button>
            </div>
            <div className="flex-1 p-5 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataCondition} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    dy={8}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      padding: "10px",
                    }}
                    itemStyle={{ fontWeight: 800, fontSize: "12px" }}
                    formatter={(value: number) => [`${value} Pcs`, "Total"]}
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
          <div className="flex flex-col gap-6">
            <div className="bg-[#064E3B] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shrink-0">
              <div className="relative z-10">
                <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">Kondisi aset</p>
                <div className="flex items-baseline mt-2">
                  <h4 className="text-4xl font-black">94</h4>
                  <span className="text-xl text-emerald-400 ml-1">%</span>
                </div>
                <p className="text-emerald-100/60 text-[11px] mt-1 font-medium">Seluruh aset dalam kondisi prima.</p>
                <button className="mt-5 w-full bg-white text-[#064E3B] py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-lg active:translate-y-0.5">
                  Export data <IconArrowUpRight size={14} stroke={3} />
                </button>
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px]"></div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xs tracking-wide shrink-0">
                <IconCircleCheck size={16} className="text-emerald-500" /> Akses cepat
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/label-generator"
                  className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 text-sm font-bold text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex justify-between items-center group shadow-sm"
                >
                  <span>Cetak label QR</span>
                  <IconDotsVertical size={16} className="text-gray-300 group-hover:text-emerald-600" />
                </Link>
                <button
                  className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 text-sm font-bold text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex justify-between items-center group shadow-sm"
                >
                  <span>Data vendor</span>
                  <IconDotsVertical size={16} className="text-gray-300 group-hover:text-emerald-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
