"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { IconPlus, IconSearch, IconFilter, IconDotsVertical, IconPackage } from "@tabler/icons-react";

const dummyInventory = Array.from({ length: 25 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  name: i % 2 === 0 ? `Item ${i + 1} Pro` : `Standard Item ${i + 1}`,
  category: i % 3 === 0 ? "Electronic" : i % 3 === 1 ? "Stationery" : "Furniture",
  sku: `SKU-${8000 + i}`,
  stock: Math.floor(Math.random() * 500) + 10,
  unit: "Pcs",
  status: Math.random() > 0.2 ? "In stock" : "Low stock",
}));

export default function InventoryPage() {
  const columns = [
    {
      header: "Nama barang",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IconPackage size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{item.name}</p>
            <p className="text-[10px] text-gray-400">{item.id}</p>
          </div>
        </div>
      ),
    },
    { header: "SKU", accessor: "sku" as const },
    { 
      header: "Kategori", 
      accessor: (item: any) => (
        <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{item.category}</span>
      )
    },
    { 
      header: "Stok", 
      accessor: (item: any) => (
        <div>
          <span className="font-bold text-gray-900">{item.stock}</span>
          <span className="ml-1 text-gray-400 text-xs">{item.unit}</span>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: (item: any) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
          item.status === "In stock" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {item.status}
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
        <Breadcrumb items={[{ label: "Inventory" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h2>
            <p className="text-xs text-gray-500">Kelola stok barang dan kategori inventaris Anda.</p>
          </div>
          <button className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
            <IconPlus size={16} stroke={3} /> Tambah barang
          </button>
        </div>

        {/* Integrated Search & Filter (No Box) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau SKU..."
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
              <option>Electronic</option>
              <option>Stationery</option>
              <option>Furniture</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable data={dummyInventory} columns={columns} pageSize={10} />
      </div>
    </DashboardLayout>
  );
}
