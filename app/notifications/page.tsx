"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconAlertCircle, IconCircleCheckFilled, IconCircleDotFilled, IconFileAnalytics, IconPackage, IconSettings, IconUserPlus } from "@tabler/icons-react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";

const dummyNotifications = [
  {
    id: 1,
    title: "Stok Menipis",
    description: "Item 'Laptop Dell XPS 15' tersisa 2 unit lagi di gudang pusat.",
    time: "5 menit yang lalu",
    type: "alert",
    icon: IconAlertCircle,
    color: "bg-red-50 text-red-600",
    isRead: false,
  },
  {
    id: 2,
    title: "Aset Baru Ditugaskan",
    description: "Aset 'Monitor LG 24\"' telah berhasil ditugaskan kepada Budi Santoso.",
    time: "1 jam yang lalu",
    type: "inventory",
    icon: IconPackage,
    color: "bg-violet-50 text-violet-600",
    isRead: false,
  },
  {
    id: 3,
    title: "Laporan Mingguan Siap",
    description: "Laporan inventaris mingguan untuk periode 15-21 Maret telah selesai dibuat.",
    time: "3 jam yang lalu",
    type: "report",
    icon: IconFileAnalytics,
    color: "bg-blue-50 text-blue-600",
    isRead: true,
  },
  {
    id: 4,
    title: "User Baru Terdaftar",
    description: "Pengguna baru 'Siti Aminah' telah ditambahkan sebagai Staff Gudang.",
    time: "Kemarin, 14:30",
    type: "user",
    icon: IconUserPlus,
    color: "bg-purple-50 text-purple-600",
    isRead: true,
  },
  {
    id: 5,
    title: "Pembaruan Sistem",
    description: "Sistem Inventra telah diperbarui ke versi 2.1.0 dengan perbaikan fitur laporan.",
    time: "2 hari yang lalu",
    type: "system",
    icon: IconSettings,
    color: "bg-gray-50 text-gray-600",
    isRead: true,
  },
];

type NotificationItem = (typeof dummyNotifications)[number];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const handleMarkAllRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    toast.success("Semua notifikasi telah ditandai sebagai terbaca");
  };

  const handleOpenNotification = (notification: NotificationItem) => {
    setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
    setSelectedNotification({ ...notification, isRead: true });
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const columns = [
    {
      header: "Notifikasi",
      accessor: (item: NotificationItem) => (
        <button type="button" onClick={() => handleOpenNotification(item)} className="flex w-full min-w-0 items-start gap-3 py-1 text-left transition-opacity hover:opacity-80">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
            <item.icon size={20} stroke={2} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className={`truncate font-bold ${item.isRead ? "text-gray-700" : "text-gray-900"}`}>{item.title}</p>
              {!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
            </div>
            <p className="line-clamp-2 text-sm text-gray-500">{item.description}</p>
          </div>
        </button>
      ),
    },
    {
      header: "Kategori",
      accessor: (item: NotificationItem) => <span className="text-sm font-medium capitalize text-gray-700">{item.type}</span>,
    },
    { header: "Waktu", accessor: "time" as const, className: "whitespace-nowrap text-gray-500" },
    {
      header: "Status",
      accessor: (item: NotificationItem) => (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${item.isRead ? "border-gray-200 bg-gray-50 text-gray-600" : "border-violet-200 bg-violet-500/10 text-violet-600"}`}>
          {item.isRead ? <IconCircleCheckFilled size={12} stroke={2.5} /> : <IconCircleDotFilled size={12} stroke={2.5} />}
          {item.isRead ? "Sudah dibaca" : "Belum dibaca"}
        </span>
      ),
      className: "whitespace-nowrap",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifikasi</h2>
            <p className="text-xs text-gray-500">Lihat semua pembaruan dan aktivitas terbaru di Inventra.</p>
          </div>
          <Button variant="page-outline" onClick={handleMarkAllRead} className="h-8 self-start sm:self-auto">
            Tandai semua dibaca
          </Button>
        </div>

        <DataTable data={notifications} columns={columns} pageSize={10} density="dense" bodyCellClassName="!py-3" />

        <Modal isOpen={Boolean(selectedNotification)} onClose={handleCloseModal} title={selectedNotification?.title || "Detail Notifikasi"}>
          {selectedNotification && (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${selectedNotification.color}`}>
                  <selectedNotification.icon size={24} stroke={2} />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">{selectedNotification.type}</span>
                    <span className="text-xs font-medium text-gray-400">{selectedNotification.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{selectedNotification.description}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="modal-secondary" onClick={handleCloseModal}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
