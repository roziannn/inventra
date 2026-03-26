/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import SearchableSelect from "@/components/SearchableSelect";
import {
  IconSearch,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconUser,
  IconTool,
  IconTruck,
  IconMessage,
  IconCheck,
  IconBookmark,
  IconSend,
  IconFilter,
  IconLock,
  IconMail,
  IconAlertTriangle,
  IconFileExport,
  IconCalendar,
} from "@tabler/icons-react";
import { toast } from "react-hot-toast";

// Dummy Data for Selects
const userOptions = [
  { id: "1", label: "Budi Santoso", sublabel: "IT Department" },
  { id: "2", label: "Siti Aminah", sublabel: "Finance" },
  { id: "3", label: "Andi Wijaya", sublabel: "Operations" },
  { id: "4", label: "Sarah Miller", sublabel: "HR" },
  { id: "5", label: "John Doe", sublabel: "Procurement" },
];

const assigneeOptions = [
  { id: "t1", label: "Teknisi Andi", sublabel: "Internal IT" },
  { id: "t2", label: "Teknisi Budi", sublabel: "Maintenance" },
  { id: "v1", label: "PT Sejahtera Service", sublabel: "Vendor" },
  { id: "v2", label: "Dell Support Indonesia", sublabel: "Vendor" },
  { id: "v3", label: "CV Maju Jaya", sublabel: "Vendor" },
];

const initialReports = Array.from({ length: 25 }, (_, i) => ({
  id: `TRX-${1000 + i}`,
  item: i % 2 === 0 ? "MacBook Pro M1" : 'Monitor Dell 24"',
  reporter: i % 2 === 0 ? "Budi Santoso" : "Siti Aminah",
  author: "Admin System",
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "In progress" : "Resolved",
  reportDate: "2026-03-20",
  token: `TOKEN-${1000 + i}X`,
  problem: "Layar berkedip saat digunakan lebih dari 2 jam. Kemungkinan overheat pada chipset grafis.",
  serviceType: i % 2 === 0 ? "Self service" : "By vendor",
  assignee: i % 2 === 0 ? "Teknisi Andi" : "PT Sejahtera Service",
  comments: [
    { user: "Andi", text: "Sudah dicek, butuh ganti thermal paste.", date: "2026-03-20 11:00" },
    { user: "Admin", text: "Silahkan diproses segera.", date: "2026-03-20 11:30" },
  ],
  solutions: [{ id: "SOL-1", text: "Pembersihan debu pada fan dan penggantian thermal paste.", author: "Andi", date: "2026-03-20 14:00", isReference: i === 0 }],
}));

const formatDateTimeShort = (dateStr: string) => {
  const d = new Date(dateStr);
  return d
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/,/g, "");
};

export default function ReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [editingReport, setEditingReport] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<any>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const today = mounted ? new Date().toISOString().split("T")[0] : "";

  const [formData, setFormData] = useState({
    item: "",
    reporter: "",
    problem: "",
    serviceType: "Self service",
    assignee: "",
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
    setFormData({ item: "", reporter: "", problem: "", serviceType: "Self service", assignee: "" });
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReportToDelete(null);
    setConfirmEmail("");
    setConfirmPassword("");
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
    setStartDate("");
    setEndDate("");
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate export process
    const exportPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Data laporan dari ${startDate} hingga ${endDate} berhasil diekspor`);
      }, 2000);
    });

    toast.promise(exportPromise, {
      loading: "Menyiapkan data export...",
      success: (message: any) => message,
      error: "Gagal mengekspor data",
    });

    handleCloseExportModal();
  };

  const handleDeleteClick = (report: any) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmEmail && confirmPassword) {
      setReports(reports.filter((r) => r.id !== reportToDelete.id));
      toast.success(`Laporan ${reportToDelete.id} berhasil dihapus`);
      handleCloseDeleteModal();
    }
  };

  const handleEditClick = (report: any) => {
    setEditingReport(report);
    setFormData({
      item: report.item,
      reporter: report.reporter,
      problem: report.problem,
      serviceType: report.serviceType,
      assignee: report.assignee,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReport) {
      // Logic Update
      const updatedReports = reports.map((r) => {
        if (r.id === editingReport.id) {
          return {
            ...r,
            ...formData,
          };
        }
        return r;
      });
      setReports(updatedReports);
      toast.success("Laporan berhasil diperbarui");
    } else {
      // Logic Create
      const newReport = {
        ...formData,
        id: `TRX-${1000 + reports.length}`,
        token: `TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        author: "Admin System",
        status: "Pending",
        reportDate: new Date().toISOString().split("T")[0],
        comments: [],
        solutions: [],
      };
      setReports([newReport, ...reports]);
      toast.success("Laporan baru berhasil dibuat");
    }

    handleCloseModal();
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedReport) return;

    const newComment = {
      user: "Admin",
      text: commentInput,
      date: formatDateTimeShort(new Date().toISOString()),
    };

    const updatedReport = {
      ...selectedReport,
      comments: [...selectedReport.comments, newComment],
    };

    setSelectedReport(updatedReport);
    setReports(reports.map((r) => (r.id === selectedReport.id ? updatedReport : r)));
    setCommentInput("");
    toast.success("Komentar ditambahkan");
  };

  const toggleReference = (solId: string) => {
    let isNowReference = false;
    const updatedSolutions = selectedReport.solutions.map((sol: any) => {
      if (sol.id === solId) {
        isNowReference = !sol.isReference;
        return { ...sol, isReference: isNowReference };
      }
      return sol;
    });

    const updatedReport = { ...selectedReport, solutions: updatedSolutions };
    setSelectedReport(updatedReport);
    setReports(reports.map((r) => (r.id === selectedReport.id ? updatedReport : r)));
    toast.success(isNowReference ? "Solusi dijadikan referensi" : "Referensi dihapus");
  };

  const handleMarkAsComplete = () => {
    if (!selectedReport) return;

    const updatedReport = {
      ...selectedReport,
      status: "Resolved", // Matching existing status logic for 'Complete'
    };

    setSelectedReport(updatedReport);
    setReports(reports.map((r) => (r.id === selectedReport.id ? updatedReport : r)));
    toast.success(`Laporan ${selectedReport.id} ditandai sebagai Selesai`);
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
      ),
    },
    {
      header: "Status",
      accessor: (item: any) => (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
            item.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : item.status === "In progress" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Aksi",
      className: "text-center",
      accessor: (item: any) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setSelectedReport(item);
              setView("detail");
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          >
            <IconEye size={16} />
          </button>
          <button onClick={() => handleEditClick(item)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all">
            <IconEdit size={16} />
          </button>
          <button onClick={() => handleDeleteClick(item)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all">
            <IconTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (view === "detail" && selectedReport) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4 pb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
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
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${selectedReport.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
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
                  <h4 className="text-sm font-bold text-gray-900">Problem Description</h4>
                  <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-xl border border-gray-100">&quot;{selectedReport.problem}&quot;</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <IconBookmark size={18} className="text-blue-500" /> Solusi & Penanganan
                  </h3>
                  <button className="text-[10px] font-bold text-[#064E3B] uppercase tracking-widest hover:text-[#10B981] transition-colors">Tambah Solusi</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Deskripsi Solusi</th>
                        <th className="px-6 py-3">Posted By</th>
                        <th className="px-6 py-3">Tanggal</th>
                        <th className="px-6 py-3 text-center">Referesi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedReport.solutions.length > 0 ? (
                        selectedReport.solutions.map((sol: any) => (
                          <tr key={sol.id} className="text-sm group">
                            <td className="px-6 py-4 font-medium text-gray-700">
                              <div className="flex items-center gap-2">
                                {sol.text}
                                {sol.isReference && (
                                  <span className="inline-flex items-center gap-1 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">
                                    <IconCheck size={10} stroke={4} /> Verified Ref
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-semibold">{sol.author}</td>
                            <td className="px-6 py-4 text-gray-400 text-xs font-medium">{formatDateTimeShort(sol.date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => toggleReference(sol.id)}
                                  className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${
                                    sol.isReference ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200" : "text-gray-300 hover:text-blue-600 hover:bg-blue-50"
                                  }`}
                                >
                                  <IconBookmark size={16} stroke={sol.isReference ? 3 : 2} />
                                  {sol.isReference ? "Hapus Ref" : "Jadikan Ref"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-xs italic">
                            Belum ada solusi yang ditambahkan.
                          </td>
                        </tr>
                      )}
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
                <div className="space-y-4 max-h-75 overflow-y-auto pr-2 scrollbar-hide">
                  {selectedReport.comments.length > 0 ? (
                    selectedReport.comments.map((c: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl space-y-1 group">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-gray-900">{c.user}</span>
                          <span className="text-gray-400">{formatDateTimeShort(c.date)}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4 italic">Belum ada diskusi.</p>
                  )}
                </div>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Tulis balasan..."
                    className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                  <button
                    onClick={handleAddComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#064E3B] text-white rounded-lg flex items-center justify-center hover:bg-[#043327] transition-all shadow-md active:scale-95"
                  >
                    <IconSend size={14} stroke={2.5} />
                  </button>
                </div>
              </div>

              <div className="bg-[#064E3B] rounded-2xl p-6 text-white space-y-4 shadow-xl">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Quick Action</p>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10">Gunakan Referensi Solusi</button>
                  <button
                    onClick={handleMarkAsComplete}
                    disabled={selectedReport.status === "Resolved"}
                    className="w-full py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:translate-y-0.5"
                  >
                    <IconCheck size={16} stroke={3} /> {selectedReport.status === "Resolved" ? "Laporan Selesai" : "Mark as Complete"}
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
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Reports" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h2>
            <p className="text-xs text-gray-500">Laporan kerusakan dan perbaikan inventaris.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <IconFileExport size={16} stroke={3} /> Export Data
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <IconPlus size={16} stroke={3} /> Buat laporan baru
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input type="text" placeholder="Cari ID, barang, pelapor..." className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <IconFilter size={16} />
              <span>Status:</span>
            </div>
            <select className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#064E3B] transition-all">
              <option>Semua status</option>
              <option>Pending</option>
              <option>In progress</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <DataTable data={reports} columns={columns} pageSize={10} />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Laporan Baru">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Barang</label>
              <input
                required
                type="text"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="Contoh: MacBook Pro M1"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
              />
            </div>

            <SearchableSelect label="Nama Pelapor" options={userOptions} value={formData.reporter} onChange={(val) => setFormData({ ...formData, reporter: val })} placeholder="Pilih pelapor..." required />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipe Layanan</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                >
                  <option value="Self service">Self service</option>
                  <option value="By vendor">By vendor</option>
                </select>
              </div>
              <SearchableSelect label="Assign ke" options={assigneeOptions} value={formData.assignee} onChange={(val) => setFormData({ ...formData, assignee: val })} placeholder="Pilih teknisi..." />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deskripsi Masalah</label>
              <textarea
                required
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows={3}
                placeholder="Jelaskan detail kerusakan..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-3 bg-[#064E3B] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all">
                Simpan Laporan
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Konfirmasi Hapus Laporan">
          <form onSubmit={handleConfirmDelete} className="space-y-6">
            <div className="flex flex-col items-center text-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                <IconAlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-red-900">Apakah Anda yakin?</h3>
              <p className="text-sm text-red-600 font-medium leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Menghapus laporan <span className="font-black uppercase">{reportToDelete?.id}</span> akan menghapus seluruh data terkait secara permanen.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconMail size={16} /> Konfirmasi Email
                </label>
                <input
                  required
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconLock size={16} /> Kata Sandi
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/5 transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={handleCloseDeleteModal} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <IconTrash size={16} stroke={3} /> Hapus Permanen
              </button>
            </div>
          </form>
        </Modal>

        {/* Export Reports Modal */}
        <Modal isOpen={isExportModalOpen} onClose={handleCloseExportModal} title="Export Data Laporan">
          <form onSubmit={handleExport} className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">Pilih rentang tanggal untuk mengekspor data laporan kerusakan dan perbaikan.</p>
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
              <button type="button" onClick={handleCloseExportModal} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button
                type="submit"
                disabled={!startDate || !endDate || endDate < startDate}
                className="flex-1 px-4 py-3.5 bg-[#064E3B] disabled:bg-gray-200 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <IconFileExport size={16} /> Mulai Export
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
