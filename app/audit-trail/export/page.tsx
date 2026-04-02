"use client";

import React, { useEffect, useMemo, useState } from "react";
import { formatAuditDateRange, formatAuditDateTime } from "@/lib/audit-trail";
import Button from "@/components/Button";

interface AuditExportPayload {
  logs: Array<{
    id: string;
    action: string;
    target: string;
    description: string;
    user: string;
    date: string;
  }>;
  startDate: string;
  endDate: string;
  exportedAt: string;
}

export default function AuditTrailExportPage() {
  const [payload] = useState<AuditExportPayload | null>(() => {
    if (typeof window === "undefined") return null;

    const rawData = window.localStorage.getItem("inventra_audit_export_data");
    return rawData ? (JSON.parse(rawData) as AuditExportPayload) : null;
  });

  useEffect(() => {
    if (!payload) return;

    const timer = window.setTimeout(() => {
      window.print();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [payload]);

  const subtitle = useMemo(() => {
    if (!payload) return "";
    return `Periode ${formatAuditDateRange(payload.startDate, payload.endDate)}`;
  }, [payload]);

  const exportedAt = useMemo(() => {
    if (!payload) return "";

    return new Date(payload.exportedAt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, [payload]);

  if (!payload) {
    return <div className="p-10 text-center text-sm text-gray-500">Menyiapkan data export audit trail...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-6 text-black">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 18mm 14mm 18mm 14mm;
        }

        @media print {
          body {
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .print-shell {
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
            border-radius: 0;
          }

          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
          }

          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .print-content {
            margin-top: 42mm;
            margin-bottom: 20mm;
          }

          .page-counter::after {
            content: counter(page);
          }

          .page-total::after {
            content: counter(pages);
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex w-full max-w-5xl items-center justify-between border border-black px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Audit Trail Export</p>
          <p className="text-xs text-gray-600">Dialog print akan terbuka otomatis. Pilih Save as PDF untuk menyimpan file.</p>
        </div>
        <Button variant="page-primary" onClick={() => window.print()}>
          Cetak PDF
        </Button>
      </div>

      <div className="print-shell mx-auto w-full max-w-5xl border border-black bg-white p-8">
        <div className="print-header border border-black bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Inventra</p>
              <h1 className="mt-2 text-2xl font-bold">Audit Trail</h1>
              <p className="mt-1 text-sm">{subtitle}</p>
            </div>
            <div className="min-w-56 border border-black px-4 py-3 text-right">
              <p className="text-[10px] font-bold tracking-[0.14em]">Exported At</p>
              <p className="mt-2 text-sm">{exportedAt}</p>
            </div>
          </div>
        </div>

        <div className="print-content">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Log Aktivitas Sistem</p>
              <p className="text-xs text-gray-700">Dokumen ini menampilkan log aktivitas berdasarkan rentang tanggal yang dipilih.</p>
            </div>
            <div className="border border-black px-4 py-2 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]">Total Log</p>
              <p className="mt-1 text-lg font-bold">{payload.logs.length}</p>
            </div>
          </div>

          <div className="overflow-hidden border border-black">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-[0.12em]">
                  <th className="border border-black px-3 py-2">Aktivitas</th>
                  <th className="border border-black px-3 py-2">Deskripsi</th>
                  <th className="border border-black px-3 py-2">Oleh</th>
                  <th className="border border-black px-3 py-2">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {payload.logs.length > 0 ? (
                  payload.logs.map((log) => (
                    <tr key={log.id} className="align-top">
                      <td className="border border-black px-3 py-2 text-sm">
                        {log.action} {log.target}
                      </td>
                      <td className="border border-black px-3 py-2 text-sm">{log.description}</td>
                      <td className="border border-black px-3 py-2 text-sm">{log.user}</td>
                      <td className="border border-black px-3 py-2 text-sm whitespace-nowrap">{formatAuditDateTime(log.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-black px-4 py-10 text-center text-sm">
                      Tidak ada log pada rentang tanggal yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="print-footer border border-black bg-white px-6 py-3">
          <div className="flex items-center justify-between text-xs">
            <span>INVENTRA - Audit Trail Export</span>
            <span className="border border-black px-3 py-1">
              Halaman <span className="page-counter" /> dari <span className="page-total" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
