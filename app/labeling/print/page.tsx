/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { IconPrinter, IconSearch, IconFilter, IconSquare, IconSquareCheckFilled, IconCopy, IconMaximize, IconFileText, IconPackage, IconBarcode } from "@tabler/icons-react";

const dummyItems = Array.from({ length: 20 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  name: i % 2 === 0 ? `MacBook Pro M1 Pro` : `Dell UltraSharp Monitor`,
  category: i % 3 === 0 ? "Electronic" : i % 3 === 1 ? "Furniture" : "Stationery",
  sku: `SKU-${8000 + i}`,
  stock: (i * 7 + 5) % 100,
}));

export default function PrintLabelPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);
  const [labelSize, setLabelSize] = useState<"S" | "M" | "L" | "XL">("M");
  const [paperSize, setPaperSize] = useState<"A4" | "A5" | "Letter">("A4");

  // State untuk Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua kategori");

  // Logika Search & Filter
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return dummyItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === "Semua kategori" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const handleOpenPrintModal = () => {
    if (selectedItems.length === 0) return;
    setIsPrintModalOpen(true);
  };

  const handleFinalPrint = (e: React.FormEvent) => {
    e.preventDefault();
    const printData = {
      items: dummyItems.filter((item) => selectedItems.includes(item.id)),
      copies: printCopies,
      labelSize: labelSize,
      paperSize: paperSize,
    };
    localStorage.setItem("inventra_print_data", JSON.stringify(printData));
    window.open("/labeling/print/print-layout", "_blank");
    setIsPrintModalOpen(false);
  };

  const sizes = [
    { id: "S", name: "Small", desc: "25 x 15 mm" },
    { id: "M", name: "Medium", desc: "40 x 25 mm" },
    { id: "L", name: "Large", desc: "60 x 40 mm" },
    { id: "XL", name: "Extra Large", desc: "80 x 50 mm" },
  ];

  const getPreviewSize = () => {
    switch (labelSize) {
      case "S":
        return "w-24 h-14 text-[8px]";
      case "M":
        return "w-32 h-20 text-xs";
      case "L":
        return "w-44 h-28 text-xs";
      case "XL":
        return "w-56 h-36 text-sm";
    }
  };

  const columns = [
    {
      header: (
        <div className="flex justify-center">
          <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-gray-100">
            {selectedItems.length === filteredItems.length ? <IconSquareCheckFilled size={18} className="text-violet-500" /> : <IconSquare size={18} className="text-gray-400" />}
          </button>
        </div>
      ),
      accessor: (item: any) => (
        <div className="flex justify-center">
          <button onClick={() => toggleSelect(item.id)} className="p-1 rounded hover:bg-violet-50">
            {selectedItems.includes(item.id) ? <IconSquareCheckFilled size={18} className="text-violet-500" /> : <IconSquare size={18} className="text-gray-300" />}
          </button>
        </div>
      ),
      className: "w-[60px] text-center",
    },
    {
      header: "Nama Item",
      accessor: (item: any) => (
        <div className="min-w-0 py-1 flex items-center gap-2">
          <p className="font-bold text-gray-900 truncate leading-tight">{item.name}</p>
          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 font-semibold uppercase">{item.id}</span>
        </div>
      ),
    },
    {
      header: "SKU / Barcode",
      accessor: (item: any) => (
        <div className="flex items-center gap-2 text-gray-600">
          <IconBarcode size={14} className="text-gray-400" />
          <span className="text-sm font-medium tabular-nums">{item.sku}</span>
        </div>
      ),
    },
    {
      header: "Kategori",
      accessor: (item: any) => <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-bold uppercase tracking-widest">{item.category}</span>,
    },
    {
      header: "Stok",
      accessor: (item: any) => (
        <span className={`text-sm font-bold tabular-nums ${item.stock < 10 ? "text-rose-600" : "text-gray-700"}`}>
          {item.stock} <span className="text-xs font-medium text-gray-400 uppercase ml-0.5">Unit</span>
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Print Label</h2>
            <p className="text-xs text-gray-500 font-medium">Pilih item di bawah untuk mencetak stiker barcode inventaris.</p>
          </div>
          <button
            onClick={handleOpenPrintModal}
            disabled={selectedItems.length === 0}
            className="bg-zinc-900 disabled:bg-gray-200 disabled:shadow-none hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20 transition-all active:scale-95"
          >
            <IconPrinter size={18} stroke={2.5} />
            Cetak {selectedItems.length > 0 && `(${selectedItems.length} Label)`}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari item atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-violet-700 transition-all text-gray-900 font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <IconFilter size={16} />
              <span>Filter:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-violet-700 transition-all cursor-pointer"
            >
              <option value="Semua kategori">Semua kategori</option>
              <option value="Electronic">Electronic</option>
              <option value="Furniture">Furniture</option>
              <option value="Stationery">Stationery</option>
            </select>
          </div>
        </div>

        <div className="min-h-100">
          <DataTable data={filteredItems} columns={columns} pageSize={10} density="dense" />
        </div>

        {/* Print Configuration Modal */}
        <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title="Konfigurasi Cetak Label">
          <form onSubmit={handleFinalPrint} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconCopy size={16} /> Salinan per Item
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold transition-all active:scale-90"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={printCopies}
                      onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)}
                      className="w-full max-w-25 text-center py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => setPrintCopies(printCopies + 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold transition-all active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconFileText size={16} /> Ukuran Kertas
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="A4">A4 (Standard Paper)</option>
                    <option value="A5">A5 (Half A4)</option>
                    <option value="Letter">Letter (US Standard)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconMaximize size={16} /> Dimensi Label
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setLabelSize(s.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${labelSize === s.id ? "bg-violet-50 border-violet-500 shadow-sm shadow-violet-200" : "bg-white border-gray-100 hover:border-violet-200"}`}
                      >
                        <p className={`text-xs font-bold ${labelSize === s.id ? "text-violet-700" : "text-gray-700"}`}>
                          {s.name} ({s.id})
                        </p>
                        <p className="text-xs text-gray-400 font-medium uppercase">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200 relative overflow-hidden">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Pratinjau Label</p>
                <div className={`bg-white border-2 border-gray-900 rounded-md shadow-2xl flex flex-col p-2 transition-all duration-300 overflow-hidden ${getPreviewSize()}`}>
                  <div className="flex justify-between items-start border-b border-gray-100 pb-1 mb-1">
                    <div className="font-black leading-tight text-gray-900">INVENTRA</div>
                    <div className="text-[0.6em] font-mono text-gray-400">QR CODE</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-gray-900 truncate uppercase tracking-tighter leading-none mb-0.5">MACBOOK PRO M1</p>
                    <p className="text-gray-400 font-mono text-[0.8em]">INV-1000</p>
                  </div>
                  <div className="mt-auto pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-[0.7em] bg-black text-white px-1.5 rounded-sm">SKU-8000</span>
                    <span className="text-[0.5em] text-gray-300 font-bold uppercase">v1.2</span>
                  </div>
                </div>
                <p className="mt-6 text-xs text-gray-400 font-medium text-center leading-relaxed">
                  Pratinjau ini hanya simulasi tata letak.
                  <br />
                  Hasil akhir menyesuaikan pengaturan printer.
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => setIsPrintModalOpen(false)} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 shadow-lg shadow-violet-950/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <IconPrinter size={18} /> Konfirmasi Cetak
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}