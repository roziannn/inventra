"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IconUser, IconMail, IconShieldCheck, IconMapPin, IconPhone, IconMessageDots } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const handleRequestChange = () => {
    toast.loading("Mengirim permintaan perubahan...", { duration: 2000 });
    setTimeout(() => {
      toast.success("Permintaan perubahan telah dikirim ke Administrator!");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">Informasi pribadi dan detail akun Anda.</p>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-100">Read-Only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-24 h-24 bg-[#064E3B] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg mb-4">AD</div>
              <h2 className="text-lg font-bold text-gray-900">Admin User</h2>
              <p className="text-sm text-[#10B981] font-semibold uppercase tracking-wider mt-1">Manager</p>

              <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col gap-4 text-left text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <IconMail size={18} className="text-gray-400" />
                  <span>admin@inventra.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconPhone size={18} className="text-gray-400" />
                  <span>+62 812 3456 7890</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconMapPin size={18} className="text-gray-400" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
                  <IconUser size={20} className="text-[#064E3B]" />
                  Informasi Pribadi
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    defaultValue="Admin User" 
                    readOnly 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                  <input 
                    type="text" 
                    defaultValue="admin_inventra" 
                    readOnly 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue="admin@inventra.com" 
                    readOnly 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nomor Telepon</label>
                  <input 
                    type="text" 
                    defaultValue="+62 812 3456 7890" 
                    readOnly 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-2 text-amber-600">
                  <IconShieldCheck size={14} className="mt-0.5 shrink-0" />
                  <p className="text-[10px] font-medium leading-relaxed italic">
                    Data profil dikelola oleh sistem. Silakan hubungi Administrator IT jika terdapat kesalahan data.
                  </p>
                </div>
                <button 
                  onClick={handleRequestChange}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#064E3B] text-white rounded-xl text-[11px] font-bold shadow-md hover:bg-[#053F30] transition-colors shrink-0"
                >
                  <IconMessageDots size={16} />
                  Minta Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
