/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import QRCode from "qrcode";
import { IconQrcode, IconDownload, IconRefresh, IconCopy, IconCheck } from "@tabler/icons-react";

export default function QRCodePage() {
  const [qrValue, setQrValue] = useState("INV-1000");
  const [inputValue, setInputValue] = useState("INV-1000");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrSize, setQrSize] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "Emerald", hex: "#064E3B" },
    { name: "Blue", hex: "#2563EB" },
    { name: "Red", hex: "#DC2626" },
  ];

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Simulate slight delay for UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      const url = await QRCode.toDataURL(inputValue, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: "#FFFFFF",
        },
      });
      setQrImageUrl(url);
      setQrValue(inputValue);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial generation
  useEffect(() => {
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateQRCode();
  };

  const handleDownload = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `QR-${qrValue}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputValue);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Masukkan ID atau URL..."
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#064E3B]/5 focus:border-[#064E3B] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">Ukuran (px)</label>
                  <div className="relative">
                    <select
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#064E3B]/5 focus:border-[#064E3B] transition-all appearance-none cursor-pointer"
                    >
                      <option value={250}>250 x 250</option>
                      <option value={500}>500 x 500</option>
                      <option value={1000}>1000 x 1000</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <IconRefresh size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warna QR</label>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setQrColor(color.hex)}
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center border-2 ${qrColor === color.hex ? "border-[#064E3B] scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {qrColor === color.hex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#064E3B] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-950/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <IconRefresh size={18} className="animate-spin" />
                  ) : (
                    <>
                      <IconQrcode size={18} /> Generate Baru
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center min-h-112.5">
              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* QR Display */}
                <div className="relative group">
                  <div className={`p-8 bg-white border-4 border-gray-50 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 transition-all duration-500 ${isLoading ? "opacity-20 scale-95 blur-sm" : "opacity-100 scale-100"}`}>
                    <div className="w-56 h-56 bg-gray-50 flex items-center justify-center rounded-2xl overflow-hidden relative border border-gray-100">
                      {qrImageUrl ? <img src={qrImageUrl} alt="QR Preview" className="w-full h-full object-contain p-2" /> : <IconQrcode size={120} className="text-gray-200" />}
                    </div>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-col gap-6 w-full max-w-50">
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-xl font-bold text-gray-900 tracking-tight truncate">{qrValue || "N/A"}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Preview Label QR</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                      <IconDownload size={18} /> Download
                    </button>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                      {isCopied ? <IconCheck size={18} className="text-emerald-500" /> : <IconCopy size={18} />}
                      {isCopied ? "Copied" : "Copy ID"}
                    </button>
                  </div>

                  <div className="border-t border-gray-50">
                    <p className="text-xs text-gray-400 leading-relaxed">ID ini dapat dipindai oleh perangkat mobile untuk akses cepat.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
