"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  IconBell, 
  IconAlertCircle, 
  IconPackage, 
  IconUserPlus, 
  IconFileAnalytics, 
  IconSettings,
  IconCheck
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import Button from "@/components/Button";

const dummyNotifications = [
  // ... (data tetap sama)
];

export default function NotificationsPage() {
  const handleMarkAllRead = () => {
    toast.success("Semua notifikasi telah ditandai sebagai terbaca");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifikasi</h2>
            <p className="text-xs text-gray-500">Lihat semua pembaruan dan aktivitas terbaru di Inventra.</p>
          </div>
          <Button 
            variant="page-primary"
            onClick={handleMarkAllRead}
            className="h-8"
          >
            <IconCheck size={16} /> Tandai semua dibaca
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[
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
            ].map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 lg:p-6 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${notification.isRead ? "" : "bg-violet-50/10"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.color}`}>
                  <notification.icon size={20} stroke={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <h3 className={`text-sm font-bold truncate ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap font-medium">{notification.time}</span>
                      {!notification.isRead && (
                        <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
