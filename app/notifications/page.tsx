"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { 
  IconBell, 
  IconAlertCircle, 
  IconPackage, 
  IconUserPlus, 
  IconFileAnalytics, 
  IconSettings,
  IconCheck
} from "@tabler/icons-react";

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
    color: "bg-emerald-50 text-emerald-600",
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

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Notifications" }]} />

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifikasi</h2>
            <p className="text-xs text-gray-500">Lihat semua pembaruan dan aktivitas terbaru di Inventra.</p>
          </div>
          <button className="text-[#064E3B] hover:text-[#043327] text-xs font-bold flex items-center gap-1 transition-colors">
            <IconCheck size={16} /> Tandai semua dibaca
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {dummyNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 lg:p-6 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${notification.isRead ? "" : "bg-emerald-50/10"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.color}`}>
                  <notification.icon size={20} stroke={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`text-sm font-bold ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{notification.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {notification.description}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
                )}
              </div>
            ))}
          </div>
          {dummyNotifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconBell size={32} />
              </div>
              <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi baru</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
