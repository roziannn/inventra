"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { IconSearch, IconQrcode, IconPrinter, IconCheck, IconPackage, IconX } from "@tabler/icons-react";

const dummyInventory = Array.from({ length: 30 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  name: i % 2 === 0 ? `Item ${i + 1} Pro` : `Standard Item ${i + 1}`,
  category: i % 3 === 0 ? "Electronic" : i % 3 === 1 ? "Stationery" : "Furniture",
  sku: `SKU-${8000 + i}`,
}));

export default function LabelGeneratorPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1); // 1: Select, 2: Preview

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredInventory = dummyInventory.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedItems = dummyInventory.filter((item) => selectedIds.includes(item.id));

  const columns = [
    {
      header: "Pilih",
      className: "w-10",
      accessor: (item: any) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <div
            onClick={() => toggleSelect(item.id)}
            className={`w-6 h-6 rounded cursor-pointer border-2 transition-all flex items-center justify-center ${isSelected ? "bg-[#10B981] border-[#10B981] text-white" : "border-gray-200 bg-white"}`}
          >
            {isSelected && <IconCheck size={14} stroke={4} />}
          </div>
        );
      },
    },
    {
      header: "Nama barang",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
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
    { header: "Kategori", accessor: "category" as const },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 max-w-6xl mx-auto pb-10">
        <Breadcrumb items={[{ label: "Label generator" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">QR label generator</h2>
            <p className="text-xs text-gray-500">Pilih item inventaris untuk dicetak label QR-nya.</p>
          </div>
          {step === 1 ? (
            <button
              disabled={selectedIds.length === 0}
              onClick={() => setStep(2)}
              className="bg-[#064E3B] disabled:bg-gray-300 hover:bg-[#043327] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              Lanjutkan ke preview ({selectedIds.length})
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
                Kembali pilih barang
              </button>
              <button onClick={() => window.print()} className="bg-[#064E3B] hover:bg-[#043327] text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
                <IconPrinter size={16} /> Cetak label
              </button>
            </div>
          )}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Integrated Search */}
            <div className="flex py-2">
              <div className="relative w-full md:w-96 group">
                <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari barang untuk dicetak..."
                  className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all"
                />
              </div>
            </div>

            <DataTable data={filteredInventory} columns={columns} pageSize={10} />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl min-h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
              <IconQrcode size={24} className="text-[#064E3B]" /> Preview label ({selectedItems.length} item)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 print:grid-cols-3 print:gap-4">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex flex-col items-center border border-gray-100 p-4 rounded-lg bg-gray-50/50 print:border print:bg-white print:p-2">
                  <div className="w-full aspect-square bg-white border border-gray-200 rounded-md flex items-center justify-center mb-3">
                    <IconQrcode size={64} stroke={1.5} className="text-gray-900" />
                  </div>
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter text-center leading-none">{item.name}</p>
                  <p className="text-[8px] font-bold text-emerald-600 mt-1">{item.sku}</p>
                </div>
              ))}
            </div>

            {selectedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <IconX size={48} />
                <p className="mt-4 font-bold">Tidak ada barang yang dipilih.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
