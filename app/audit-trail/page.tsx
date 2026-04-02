/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import FormLabel from "@/components/FormLabel";
import { IconSearch, IconFileExport, IconCalendar } from "@tabler/icons-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { auditLogs, filterAuditLogsByRange, formatAuditDateRange, formatAuditDateTime } from "@/lib/audit-trail";

export default function AuditTrailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return auditLogs.filter((log) => {
      return log.action.toLowerCase().includes(query) || log.target.toLowerCase().includes(query) || log.description.toLowerCase().includes(query) || log.user.toLowerCase().includes(query) || log.id.toLowerCase().includes(query);
    });
  }, [searchQuery]);

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
    const exportLogs = filterAuditLogsByRange(auditLogs, startDate, endDate);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const headerTop = 12;
    const headerHeight = 22;
    const footerHeight = 10;
    const contentTop = headerTop + headerHeight;
    const footerTop = pageHeight - 18;
    const exportedAt = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    autoTable(doc, {
      startY: contentTop,
      margin: { top: contentTop, left: marginX, right: marginX, bottom: 20 },
      tableWidth: pageWidth - marginX * 2,
      head: [["Aktivitas", "Deskripsi", "Oleh", "Waktu"]],
      body: exportLogs.length
        ? exportLogs.map((log) => [`${log.action} ${log.target}`, log.description, log.user, formatAuditDateTime(log.date)])
        : [["-", "Tidak ada log pada rentang tanggal yang dipilih.", "-", "-"]],
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        textColor: 0,
        lineColor: 0,
        lineWidth: 0.2,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fillColor: false,
        textColor: 0,
        lineColor: 0,
        lineWidth: 0.25,
        fontStyle: "bold",
        fontSize: 8.5,
      },
      bodyStyles: {
        fillColor: false,
      },
      alternateRowStyles: {
        fillColor: false,
      },
      columnStyles: {
        0: { cellWidth: 34 },
        1: { cellWidth: 66, fontSize: 8 },
        2: { cellWidth: 27 },
        3: { cellWidth: 55, fontSize: 8.25, cellPadding: { top: 2, right: 2, bottom: 2, left: 2 } },
      },
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i += 1) {
      doc.setPage(i);
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(marginX, headerTop, pageWidth - marginX * 2, headerHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("INVENTRA", marginX + 4, headerTop + 5);
      doc.setFontSize(16);
      doc.text("Audit Trail", marginX + 4, headerTop + 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Periode ${formatAuditDateRange(startDate, endDate)}`, marginX + 4, headerTop + 16);

      const exportedBoxWidth = 58;
      const exportedBoxX = pageWidth - marginX - exportedBoxWidth;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Exported at", exportedBoxX + exportedBoxWidth - 3, headerTop + 5, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(exportedAt, exportedBoxX + exportedBoxWidth - 3, headerTop + 10, { align: "right" });
      doc.text(`Total log: ${exportLogs.length}`, exportedBoxX + exportedBoxWidth - 3, headerTop + 15, { align: "right" });

      doc.rect(marginX, footerTop, pageWidth - marginX * 2, footerHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("INVENTRA - Audit Trail Export | Dicetak oleh Administrator", marginX + 3, footerTop + 6.2);
      doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginX - 3, footerTop + 6.2, { align: "right" });
    }

    doc.save(`audit-trail-${startDate}-to-${endDate}.pdf`);
    toast.success(`Audit Trail ${startDate} sampai ${endDate} berhasil diunduh.`);
    handleCloseModal();
  };

  const columns = [
    {
      header: "Aktivitas",
      accessor: (item: any) => {
        return (
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex items-center gap-2">
              <p className="text-sm text-gray-700 font-medium truncate">
                {item.action} {item.target}
              </p>
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
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium whitespace-nowrap">{formatAuditDateTime(item.date)}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Audit trail</h2>
            <p className="text-xs text-gray-500">Log aktivitas sistem untuk pemantauan keamanan dan perubahan data.</p>
          </div>
          <Button variant="page-primary" onClick={() => setIsModalOpen(true)}>
            <IconFileExport size={16} stroke={3} /> Export Logs
          </Button>
        </div>

        <div className="flex py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas, user, atau ID..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>
        </div>
        <DataTable data={filteredLogs} columns={columns} pageSize={10} density="dense" />
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Export Audit Trail">
          <form onSubmit={handleExport} className="space-y-6">
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
              <p className="text-sm text-violet-800 leading-relaxed font-medium">Pilih rentang tanggal untuk mengekspor log aktivitas. Pastikan tanggal &quot;Hingga&quot; tidak lebih kecil dari tanggal &quot;Dari&quot;.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FormLabel icon={<IconCalendar size={16} />}>Dari Tanggal</FormLabel>
                <input
                  required
                  type="date"
                  max={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <FormLabel icon={<IconCalendar size={16} />}>Hingga Tanggal</FormLabel>
                <input
                  required
                  type="date"
                  min={startDate}
                  max={today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button variant="modal-secondary" type="button" onClick={handleCloseModal} className="flex-1">
                Batal
              </Button>
              <Button variant="modal-primary" type="submit" disabled={!startDate || !endDate || endDate < startDate} className="flex-1">
                Mulai Export
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
