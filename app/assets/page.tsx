"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { IconPlus, IconSearch, IconFilter, IconDotsVertical, IconBoxSeam } from "@tabler/icons-react";

const dummyAssets = Array.from({ length: 30 }, (_, i) => ({
  id: `AST-${2000 + i}`,
  name: i % 2 === 0 ? `MacBook Pro M${(i % 3) + 1}` : `Monitor Dell UltraSharp ${i + 20}"`,
  category: i % 4 === 0 ? "IT Equipment" : i % 4 === 1 ? "Office Supply" : i % 4 === 2 ? "Vehicle" : "Machinery",
  serialNumber: `SN-${10000 + i}XYZ`,
  condition: i % 5 === 0 ? "Maintenance" : "Good",
  assignee: i % 3 === 0 ? "Budi S." : i % 3 === 1 ? "Siti A." : "Unassigned",
}));

export default function AssetsPage() {
  const columns = [
    {
      header: "Nama aset",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IconBoxSeam size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{item.name}</p>
            <p className="text-[10px] text-gray-400">{item.id}</p>
          </div>
        </div>
      ),
    },
    { header: "Serial number", accessor: "serialNumber" as const },
    { 
      header: "Kategori", 
      accessor: (item: any) => (
        <span className="text-xs text-gray-500 font-medium">{item.category}</span>
      )
    },
    { 
      header: "PIC / Assignee", 
      accessor: (item: any) => (
        <span className="text-sm font-semibold text-gray-700">{item.assignee}</span>
      )
    },
    { 
      header: "Kondisi", 
      accessor: (item: any) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
          item.condition === "Good" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}>
          {item.condition}
        </span>
      )
    },
    { 
      header: "Aksi", 
      className: "text-right",
      accessor: () => (
        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
          <IconDotsVertical size={18} />
        </button>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Assets" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Assets</h2>
            <p className="text-xs text-gray-500">Daftar aset tetap dan inventaris perusahaan Anda.</p>
          </div>
          <button className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
            <IconPlus size={16} stroke={3} /> Tambah aset
          </button>
        </div>

        {/* Integrated Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari nama aset atau serial..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <IconFilter size={16} />
                <span>Filter:</span>
            </div>
            <select className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#064E3B] transition-all">
              <option>Semua kategori</option>
              <option>IT Equipment</option>
              <option>Office Supply</option>
              <option>Vehicle</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable data={dummyAssets} columns={columns} pageSize={10} />
      </div>
    </DashboardLayout>
  );
}
