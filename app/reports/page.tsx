"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { 
  IconSearch, IconPlus, IconEye, IconEdit, IconTrash, 
  IconChevronLeft, IconUser, IconTool, IconTruck, IconMessage, IconCheck, IconBookmark
} from "@tabler/icons-react";

// Enhanced Dummy Data
const initialReports = Array.from({ length: 25 }, (_, i) => ({
  id: `TRX-${1000 + i}`,
  item: i % 2 === 0 ? "MacBook Pro M1" : "Monitor Dell 24\"",
  reporter: i % 2 === 0 ? "Budi Santoso" : "Siti Aminah",
  author: "Admin System",
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "In progress" : "Resolved",
  reportDate: "2026-03-20",
  token: `TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  problem: "Layar berkedip saat digunakan lebih dari 2 jam. Kemungkinan overheat pada chipset grafis.",
  serviceType: i % 2 === 0 ? "Self service" : "By vendor",
  assignee: i % 2 === 0 ? "Teknisi Internal (Andi)" : "PT Sejahtera Service",
  comments: [
    { user: "Andi", text: "Sudah dicek, butuh ganti thermal paste.", date: "2026-03-20 11:00" },
    { user: "Admin", text: "Silahkan diproses segera.", date: "2026-03-20 11:30" }
  ],
  solutions: [
    { id: "SOL-1", text: "Pembersihan debu pada fan dan penggantian thermal paste.", author: "Andi", isReference: i === 0 }
  ]
}));

export default function ReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    item: "",
    reporter: "",
    problem: "",
    serviceType: "Self service",
    assignee: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = {
      ...formData,
      id: `TRX-${1000 + reports.length}`,
      token: `TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      author: "Admin System",
      status: "Pending",
      reportDate: new Date().toISOString().split('T')[0],
      comments: [],
      solutions: []
    };
    setReports([newReport, ...reports]);
    setIsModalOpen(false);
    setFormData({ item: "", reporter: "", problem: "", serviceType: "Self service", assignee: "" });
  };

  const columns = [
    {
      header: "ID Transaksi",
      accessor: (item: any) => (
        <div>
          <p className="font-bold text-[#064E3B]">{item.id}</p>
          <p className="text-[10px] text-gray-400 font-medium tracking-tight">{item.token}</p>
        </div>
      ),
    },
    { header: "Barang", accessor: "item" as const },
    { 
      header: "Pelapor", 
      accessor: (item: any) => (
        <div>
          <p className="font-bold text-gray-900 leading-tight">{item.reporter}</p>
          <p className="text-[10px] text-gray-400">Oleh: {item.author}</p>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: (item: any) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
          item.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : 
          item.status === "In progress" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
        }`}>
          {item.status}
        </span>
      )
    },
    { 
      header: "Aksi", 
      className: "text-right",
      accessor: (item: any) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => { setSelectedReport(item); setView("detail"); }}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          >
            <IconEye size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all">
            <IconEdit size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all">
            <IconTrash size={16} />
          </button>
        </div>
      )
    },
  ];

  if (view === "detail" && selectedReport) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 pb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView("list")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <IconChevronLeft size={20} stroke={3} />
            </button>
            <Breadcrumb items={[{ label: "Reports", href: "/reports" }, { label: selectedReport.id }]} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReport.item}</h2>
                    <p className="text-sm text-gray-500 font-medium">Token ID: {selectedReport.token}</p>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                    selectedReport.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reporter</p>
                    <div className="flex items-center gap-2">
                      <IconUser size={16} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-800">{selectedReport.reporter}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Type</p>
                    <div className="flex items-center gap-2">
                      {selectedReport.serviceType === "Self service" ? <IconTool size={16} className="text-blue-500" /> : <IconTruck size={16} className="text-purple-500" />}
                      <span className="text-sm font-bold text-gray-800">{selectedReport.serviceType}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign To</p>
                    <span className="text-sm font-bold text-[#064E3B]">{selectedReport.assignee}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">Problem Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    "{selectedReport.problem}"
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <IconBookmark size={18} className="text-blue-500" /> Solusi & Penanganan
                    </h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Deskripsi Solusi</th>
                        <th className="px-6 py-3 text-right">Referensi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedReport.solutions.map((sol: any) => (
                        <tr key={sol.id} className="text-sm">
                          <td className="px-6 py-4 font-medium text-gray-700">
                            {sol.text}
                            {sol.isReference && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">
                                    <IconCheck size={10} stroke={4} /> Verified Ref
                                </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <IconBookmark size={16} className={sol.isReference ? "text-blue-600" : "text-gray-200"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <IconMessage size={18} className="text-gray-400" /> Diskusi
                </h4>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {selectedReport.comments.map((c: any, i: number) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-xl space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-bold text-gray-900">{c.user}</span>
                        <span className="text-gray-400">{c.date}</span>
                      </div>
                      <p className="text-xs text-gray-600">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#064E3B] rounded-2xl p-6 text-white space-y-4 shadow-xl">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Quick Action</p>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg">
                    <IconCheck size={16} stroke={3} /> Mark as Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Reports" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h2>
            <p className="text-xs text-gray-500">Laporan kerusakan dan perbaikan inventaris.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <IconPlus size={16} stroke={3} /> Buat laporan baru
          </button>
        </div>

        {/* Search */}
        <div className="flex py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari ID, barang, pelapor..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all"
            />
          </div>
        </div>

        <DataTable data={reports} columns={columns} pageSize={10} />

        {/* Create Report Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Buat Laporan Baru"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Barang</label>
              <input 
                required
                type="text" 
                value={formData.item}
                onChange={(e) => setFormData({...formData, item: e.target.value})}
                placeholder="Contoh: MacBook Pro M1"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Pelapor</label>
              <input 
                required
                type="text" 
                value={formData.reporter}
                onChange={(e) => setFormData({...formData, reporter: e.target.value})}
                placeholder="Nama Anda"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipe Layanan</label>
                <select 
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                >
                  <option value="Self service">Self service</option>
                  <option value="By vendor">By vendor</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign ke</label>
                <input 
                  type="text" 
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  placeholder="Nama teknisi/vendor"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deskripsi Masalah</label>
              <textarea 
                required
                value={formData.problem}
                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                rows={3}
                placeholder="Jelaskan detail kerusakan..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-3 bg-[#064E3B] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all"
              >
                Simpan Laporan
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
