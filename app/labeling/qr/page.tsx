"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { 
  IconQrcode, 
  IconDownload, 
  IconRefresh, 
  IconShare,
  IconCopy,
  IconExternalLink
} from "@tabler/icons-react";

export default function QRCodePage() {
  const [qrValue, setQrValue] = useState("INV-1000");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate generation delay
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Labeling" }, { label: "QR Code" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">QR Code Generator</h2>
            <p className="text-xs text-gray-500">Buat kode QR khusus untuk tracking aset dan inventaris cepat.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Form Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <IconRefresh size={18} className="text-emerald-500" /> Konfigurasi QR
              </h3>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-[#064E3B] transition-colors">Data / ID Asset</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      placeholder="Masukkan ID atau URL..."
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#064E3B]/5 focus:border-[#064E3B] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">Ukuran (px)</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#064E3B]/5 focus:border-[#064E3B] transition-all appearance-none cursor-pointer">
                      <option>250 x 250</option>
                      <option>500 x 500</option>
                      <option>1000 x 1000</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <IconRefresh size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warna</label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-black cursor-pointer ring-2 ring-emerald-500 ring-offset-2"></div>
                    <div className="w-8 h-8 rounded-full bg-[#064E3B] cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-8 h-8 rounded-full bg-red-600 cursor-pointer hover:scale-110 transition-transform"></div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#064E3B] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <IconRefresh size={16} className="animate-spin" />
                  ) : (
                    <>
                      <IconQrcode size={16} /> Generate Baru
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">Tips Tracking</h4>
              <p className="text-emerald-700 text-xs leading-relaxed">
                Gunakan ID unik (SKU atau Serial Number) untuk hasil tracking yang lebih akurat melalui scanner mobile.
              </p>
            </div>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative group">
                <div className={`p-6 bg-white border-4 border-gray-50 rounded-3xl transition-all duration-500 ${isLoading ? "opacity-20 scale-95 blur-sm" : "opacity-100 scale-100"}`}>
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden">
                    {/* Placeholder for QR Code image */}
                    <IconQrcode size={120} className="text-gray-300" />
                  </div>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-6 w-full max-w-xs text-center">
                <div>
                  <p className="text-lg font-black text-gray-900 tracking-tight">{qrValue || "N/A"}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Preview Label QR</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
                    <IconDownload size={14} /> Download
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                    <IconCopy size={14} /> Copy Link
                  </button>
                </div>
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100">
                  <IconShare size={14} /> Bagikan ke WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
