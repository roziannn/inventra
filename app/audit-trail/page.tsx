/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { IconSearch, IconUser, IconSettings, IconPackage, IconTrash, IconFileExport, IconCalendar } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

const dummyLogs = Array.from({ length: 30 }, (_, i) => ({
  id: `LOG-${5000 + i}`,
  action: i % 4 === 0 ? "Create" : i % 4 === 1 ? "Update" : i % 4 === 2 ? "Delete" : "Login",
  target: i % 3 === 0 ? "Inventory" : i % 3 === 1 ? "Asset" : "User",
  description: i % 4 === 0 ? `Created new item ${i + 1}` : i % 4 === 1 ? `Updated item details ${i + 1}` : i % 4 === 2 ? `Removed item ${i + 1}` : "User logged into system",
  user: i % 2 === 0 ? "Admin User" : "Manager User",
  date: "2026-03-20 10:45:22",
}));

const formatDateTimeFull = (dateStr: string) => {
  const d = new Date(dateStr);
  return d
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/,/g, "");
};

export default function AuditTrailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const today = mounted ? new Date().toISOString().split("T")[0] : "";

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStartDate("");
    setEndDate("");
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();

    const exportPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Data dari ${startDate} hingga ${endDate} berhasil diekspor`);
      }, 2000);
    });

    toast.promise(exportPromise, {
      loading: "Menyiapkan data export...",
      success: (message: any) => message,
      error: "Gagal mengekspor data",
    });

    handleCloseModal();
  };

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
              <p className="text-sm text-gray-700 font-medium">
                {item.action} {item.target}
              </p>
              <p className="text-[11px] text-gray-400 font-medium">{item.id}</p>
            </div>
          </div>
        );
      },
    },

    {
      header: "Deskripsi",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium truncate block max-w-xs">{item.description}</span>,
    },

    {
      header: "Oleh",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium">{item.user}</span>,
    },

    {
      header: "Waktu",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium whitespace-nowrap">{formatDateTimeFull(item.date)}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Audit trail" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Audit trail</h2>
            <p className="text-xs text-gray-500">Log aktivitas sistem untuk pemantauan keamanan dan perubahan data.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
            <IconFileExport size={16} stroke={3} /> Export Logs
          </button>
        </div>

        {/* Search */}
        <div className="flex py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input type="text" placeholder="Cari aktivitas atau user..." className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all" />
          </div>
        </div>

        <DataTable data={dummyLogs} columns={columns} pageSize={10} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Export Audit Trail">
          <form onSubmit={handleExport} className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">Pilih rentang tanggal untuk mengekspor log aktivitas. Pastikan tanggal &quot;Hingga&quot; tidak lebih kecil dari tanggal &quot;Dari&quot;.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconCalendar size={16} /> Dari Tanggal
                </label>
                <input
                  required
                  type="date"
                  max={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconCalendar size={16} /> Hingga Tanggal
                </label>
                <input
                  required
                  type="date"
                  min={startDate}
                  max={today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button
                type="submit"
                disabled={!startDate || !endDate || endDate < startDate}
                className="flex-1 px-4 py-3.5 bg-[#064E3B] disabled:bg-gray-200 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
              >
                Mulai Export
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
