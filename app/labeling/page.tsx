"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
  IconPrinter, 
  IconQrcode, 
  IconArrowRight 
} from "@tabler/icons-react";

export default function LabelingOverviewPage() {
  const options = [
    {
      title: "Print Label",
      description: "Cetak label stiker standar untuk ditempel pada aset dan inventaris fisik.",
      href: "/labeling/print",
      icon: IconPrinter,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      hover: "hover:bg-blue-100/50 hover:border-blue-200"
    },
    {
      title: "QR Code",
      description: "Buat kode QR khusus yang dapat dipindai untuk akses data cepat melalui sistem.",
      href: "/labeling/qr",
      icon: IconQrcode,
      color: "bg-violet-50 text-violet-600 border-violet-100",
      hover: "hover:bg-violet-100/50 hover:border-violet-200"
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pilih Metode Labeling</h2>
          <p className="text-xs text-gray-500">Pilih salah satu metode di bawah ini untuk memulai proses labeling inventaris Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {options.map((option) => (
            <Link 
              key={option.title} 
              href={option.href}
              className={`group flex items-start gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 ${option.hover} active:scale-95`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${option.color}`}>
                <option.icon size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-lg text-gray-900">{option.title}</h3>
                  <IconArrowRight size={18} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gray-900 rounded-3xl text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <h4 className="text-xl font-bold mb-2">Butuh bantuan labeling?</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Kami menyediakan panduan lengkap tentang cara terbaik mencetak dan menempelkan label untuk durabilitas maksimal pada berbagai jenis permukaan.
              </p>
            </div>
            <button className="px-6 py-3 bg-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-violet-600 transition-all active:scale-95 shadow-lg shadow-violet-500/20">
              Lihat Panduan
            </button>
          </div>
          <IconQrcode className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12" />
        </div>
      </div>
    </DashboardLayout>
  );
}