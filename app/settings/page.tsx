"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconSettings, IconLock, IconBell, IconChevronRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState([
    { id: "email", title: "Email Notifikasi", desc: "Kirim ringkasan aktivitas penting dan perubahan data melalui email.", checked: true },
    { id: "low-stock", title: "Peringatan Stok Rendah", desc: "Tampilkan notifikasi saat stok item mencapai batas minimum.", checked: true },
    { id: "system-update", title: "Update Aktivitas Sistem", desc: "Beritahu perubahan penting seperti login, export, dan pembaruan data.", checked: false },
  ]);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Kata sandi berhasil diperbarui!");
  };

  const handleTogglePref = (id: string) => {
    const currentPref = notificationPrefs.find((pref) => pref.id === id);
    if (!currentPref) return;

    const nextChecked = !currentPref.checked;

    setNotificationPrefs((prev) => prev.map((pref) => (pref.id === id ? { ...pref, checked: nextChecked } : pref)));
    toast.success(`${currentPref.title} ${nextChecked ? "diaktifkan" : "dinonaktifkan"}!`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola preferensi sistem dan keamanan akun Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Settings */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {[
                { id: "general", name: "Umum", icon: IconSettings },
                { id: "security", name: "Keamanan", icon: IconLock },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.id as "general" | "security")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id ? "bg-zinc-900 text-white shadow-md" : "text-gray-500 hover:bg-white hover:text-violet-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {activeTab === item.id && <IconChevronRight size={14} />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Settings */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "general" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <IconBell size={20} className="text-violet-500" />
                  Notifikasi Sistem
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-6">Atur notifikasi sistem yang ingin Anda terima dari Inventra.</p>
                <div className="space-y-4">
                  {notificationPrefs.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{pref.title}</p>
                        <p className="text-sm text-gray-500 font-medium">{pref.desc}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={pref.checked}
                        aria-label={pref.title}
                        onClick={() => handleTogglePref(pref.id)}
                        className={`w-11 h-6 shrink-0 rounded-full relative transition-colors cursor-pointer ${pref.checked ? "bg-violet-500" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pref.checked ? "left-6" : "left-1"}`}></span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <IconLock size={20} className="text-violet-500" />
                    Ganti Kata Sandi
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">Disarankan menggunakan minimal 8 karakter dengan kombinasi angka dan simbol.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="px-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Kata Sandi Saat Ini</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Masukkan kata sandi lama"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all pr-12"
                        />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showCurrentPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Kata Sandi Baru</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Masukkan kata sandi baru"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all pr-12"
                          />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Konfirmasi Kata Sandi Baru</label>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Ulangi kata sandi baru"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pb-6 flex items-center justify-between border-t border-gray-50">
                    <p className="text-xs text-gray-400 font-medium italic">*Anda akan diminta untuk login kembali setelah mengganti kata sandi.</p>
                    <button type="submit" className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition-colors">
                      Perbarui Kata Sandi
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
