"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import { 
  IconPrinter, 
  IconSearch, 
  IconFilter, 
  IconSquare,
  IconSquareCheckFilled,
  IconChevronRight,
  IconCopy,
  IconMaximize,
  IconFileText
} from "@tabler/icons-react";

const dummyItems = Array.from({ length: 20 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  name: i % 2 === 0 ? `MacBook Pro M1 Pro` : `Dell UltraSharp Monitor`,
  category: i % 3 === 0 ? "Electronic" : i % 3 === 1 ? "Furniture" : "Stationery",
  sku: `SKU-${8000 + i}`,
  stock: (i * 7 + 5) % 100,
}));

export default function PrintLabelPage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);
  const [labelSize, setLabelSize] = useState<"S" | "M" | "L" | "XL">("M");
  const [paperSize, setPaperSize] = useState<"A4" | "A5" | "Letter">("A4");

  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === dummyItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(dummyItems.map(item => item.id));
    }
  };

  const handleOpenPrintModal = () => {
    if (selectedItems.length === 0) {
      alert("Pilih setidaknya satu item untuk dicetak.");
      return;
    }
    setIsPrintModalOpen(true);
  };

  const handleFinalPrint = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Siapkan data untuk dikirim ke halaman cetak
    const printData = {
      items: dummyItems.filter(item => selectedItems.includes(item.id)),
      copies: printCopies,
      labelSize: labelSize,
      paperSize: paperSize
    };

    // Simpan di localStorage agar halaman baru bisa membacanya
    localStorage.setItem("inventra_print_data", JSON.stringify(printData));
    
    // Buka tab baru untuk print layout
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
    switch(labelSize) {
      case "S": return "w-24 h-14 text-[8px]";
      case "M": return "w-32 h-20 text-[10px]";
      case "L": return "w-44 h-28 text-xs";
      case "XL": return "w-56 h-36 text-sm";
    }
  };

  const columns = [
    {
      header: (
        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-100 rounded transition-colors">
          {selectedItems.length === dummyItems.length ? <IconSquareCheckFilled size={18} className="text-[#064E3B]" /> : <IconSquare size={18} className="text-gray-400" />}
        </button>
      ),
      accessor: (item: any) => (
        <button onClick={() => toggleSelect(item.id)} className="p-1 hover:bg-emerald-50 rounded transition-colors">
          {selectedItems.includes(item.id) ? <IconSquareCheckFilled size={18} className="text-[#064E3B]" /> : <IconSquare size={18} className="text-gray-300" />}
        </button>
      ),
      className: "w-10"
    },
    {
      header: "Item",
      accessor: (item: any) => (
        <div className="flex flex-col">
          <p className="font-bold text-gray-900">{item.name}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.id}</p>
        </div>
      ),
    },
    { header: "SKU", accessor: "sku" as const },
    { 
      header: "Kategori", 
      accessor: (item: any) => (
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{item.category}</span>
      )
    },
    { header: "Stok", accessor: "stock" as const },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Labeling" }, { label: "Print Label" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Print Label</h2>
            <p className="text-xs text-gray-500">Cetak label stiker untuk inventaris dan aset Anda.</p>
          </div>
          <button 
            onClick={handleOpenPrintModal}
            disabled={selectedItems.length === 0}
            className="bg-[#064E3B] disabled:bg-gray-200 hover:bg-[#043327] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <IconPrinter size={16} stroke={3} /> Cetak {selectedItems.length > 0 && `(${selectedItems.length})`}
          </button>
        </div>

        {/* Integrated Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari item atau SKU..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all text-gray-900"
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
              <option>Furniture</option>
              <option>Stationery</option>
            </select>
          </div>
        </div>

        <DataTable data={dummyItems} columns={columns} pageSize={10} />

        {/* Print Configuration Modal */}
        <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title="Konfigurasi Cetak Label">
          <form onSubmit={handleFinalPrint} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Settings Column */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconCopy size={16} /> Salinan / Item
                  </label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      value={printCopies}
                      onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)}
                      className="w-full max-w-[120px] text-center py-2 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900"
                    />
                    <button 
                      type="button"
                      onClick={() => setPrintCopies(printCopies + 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconFileText size={16} /> Pilih Ukuran Kertas
                  </label>
                  <select 
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B]/10 appearance-none cursor-pointer"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="A5">A5 (148 x 210 mm)</option>
                    <option value="Letter">Letter (216 x 279 mm)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconMaximize size={16} /> Pilih Ukuran Label
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setLabelSize(s.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          labelSize === s.id 
                            ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500" 
                            : "bg-white border-gray-100 hover:border-emerald-200"
                        }`}
                      >
                        <p className={`text-xs font-bold ${labelSize === s.id ? "text-emerald-700" : "text-gray-700"}`}>{s.name} ({s.id})</p>
                        <p className="text-[9px] text-gray-400 font-medium">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Column */}
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Pratinjau Label</p>
                
                <div className={`bg-white border-2 border-gray-900 rounded-md shadow-lg flex flex-col p-2 transition-all duration-300 overflow-hidden ${getPreviewSize()}`}>
                  <div className="flex justify-between items-start border-b border-gray-100 pb-1 mb-1">
                    <div className="font-black leading-tight truncate">INVENTRA</div>
                    <div className="font-mono text-gray-400">QR</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-gray-900 truncate uppercase tracking-tighter">MacBook Pro M1 Pro</p>
                    <p className="text-gray-500 font-mono">INV-1000</p>
                  </div>
                  <div className="mt-auto pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-[0.7em] bg-black text-white px-1">SKU-8000</span>
                    <span className="text-[0.6em] text-gray-300">v1.0</span>
                  </div>
                </div>
                
                <p className="mt-6 text-xs text-gray-500 font-medium text-center leading-relaxed">
                  Tampilan pratinjau disesuaikan dengan skala <br /> area cetak yang dipilih.
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsPrintModalOpen(false)} 
                className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-3.5 bg-[#064E3B] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-950/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <IconPrinter size={18} /> Konfirmasi
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
