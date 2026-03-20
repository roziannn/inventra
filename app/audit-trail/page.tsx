"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { IconHistory, IconSearch, IconUser, IconSettings, IconPackage, IconTrash } from "@tabler/icons-react";

const dummyLogs = Array.from({ length: 30 }, (_, i) => ({
  id: `LOG-${5000 + i}`,
  action: i % 4 === 0 ? "Create" : i % 4 === 1 ? "Update" : i % 4 === 2 ? "Delete" : "Login",
  target: i % 3 === 0 ? "Inventory" : i % 3 === 1 ? "Asset" : "User",
  description: i % 4 === 0 ? `Created new item ${i + 1}` : i % 4 === 1 ? `Updated item details ${i + 1}` : i % 4 === 2 ? `Removed item ${i + 1}` : "User logged into system",
  user: i % 2 === 0 ? "Admin User" : "Manager User",
  date: "2026-03-20 10:45:22",
}));

export default function AuditTrailPage() {
  const columns = [
    {
      header: "Aktivitas",
      accessor: (item: any) => {
        const Icon = item.action === "Create" ? IconPackage : item.action === "Delete" ? IconTrash : item.action === "Update" ? IconSettings : IconUser;
        const color = item.action === "Create" ? "text-emerald-600 bg-emerald-50" : item.action === "Delete" ? "text-red-600 bg-red-50" : item.action === "Update" ? "text-blue-600 bg-blue-50" : "text-gray-600 bg-gray-50";
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{item.action} {item.target}</p>
              <p className="text-[10px] text-gray-400">{item.id}</p>
            </div>
          </div>
        );
      },
    },
    { header: "Deskripsi", accessor: "description" as const, className: "max-w-xs truncate" },
    { 
      header: "Oleh", 
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
            {item.user.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <span className="font-medium text-gray-700">{item.user}</span>
        </div>
      )
    },
    { 
      header: "Waktu", 
      accessor: (item: any) => (
        <span className="text-gray-500 font-medium">{item.date}</span>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Audit trail" }]} />

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Audit trail</h2>
          <p className="text-xs text-gray-500">Log aktivitas sistem untuk pemantauan keamanan dan perubahan data.</p>
        </div>

        {/* Search */}
        <div className="flex py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari aktivitas atau user..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all"
            />
          </div>
        </div>

        <DataTable data={dummyLogs} columns={columns} pageSize={10} />
      </div>
    </DashboardLayout>
  );
}
