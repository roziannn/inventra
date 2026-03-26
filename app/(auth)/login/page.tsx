"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconMail, IconLock, IconEye, IconEyeOff, IconBoxSeam, IconBrandGoogle, IconArrowRight, IconHeadset, IconBrandWhatsapp, IconExternalLink } from "@tabler/icons-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      toast.success("Selamat Datang Kembali, Admin!");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans">
      {/* --- Left Side: Branding & Illustration (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#064E3B] relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-12 flex items-center gap-4">
            <div className="w-14 h-14 bg-[#10B981] rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-950/50">
              <IconBoxSeam size={32} stroke={2.5} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">Inventra</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Satu Sistem Untuk <br />
              <span className="text-emerald-400">Semua Aset Anda.</span>
            </h2>
            <p className="text-emerald-100/70 text-lg leading-relaxed max-w-md">Kelola inventaris, tracking aset, dan laporan kerusakan dalam satu platform terintegrasi yang modern dan efisien.</p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-emerald-800/50 pt-12">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-emerald-100/50 text-xs font-semibold uppercase tracking-widest mt-1">Perusahaan</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">10k+</p>
              <p className="text-emerald-100/50 text-xs font-semibold uppercase tracking-widest mt-1">Aset Terdaftar</p>
            </div>
          </div>
        </div>

        {/* Branding Footer (Adjusted to match App Footer style) */}
        <div className="absolute bottom-10 left-12 right-12 flex items-center justify-between">
          <p className="text-[10px] text-emerald-100/30 font-medium tracking-wider">
            &copy; {mounted ? new Date().getFullYear() : ""} <span className="text-emerald-400 font-bold">INVENTRA</span>. ASSET & INVENTORY.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[9px] text-emerald-100/30 font-semibold uppercase tracking-widest">System Online</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-emerald-100/20 rounded-md font-mono">v1.0.2</span>
          </div>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#F9FAFB] lg:bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Only */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-lg mb-4">
              <IconBoxSeam size={24} stroke={2.5} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#064E3B] tracking-tighter uppercase">Inventra</h1>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat Datang</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Silahkan masuk ke akun Anda untuk mulai mengelola aset.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-10 space-y-5">
            <div className="space-y-2 group">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-[#064E3B] transition-colors">
                <IconMail size={14} /> Alamat Email
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-4 pr-4 py-3.5 bg-gray-50 lg:bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#064E3B]/5 focus:border-[#064E3B] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-[#064E3B] transition-colors">
                  <IconLock size={14} /> Kata Sandi
                </label>
                <button type="button" onClick={() => setIsModalOpen(true)} className="text-[11px] font-semibold text-[#064E3B]  hover:text-emerald-500 transition-colors cursor-pointer">
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-12 py-3.5 bg-gray-50 lg:bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#064E3B]/5 focus:border-[#064E3B] transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-[#064E3B] focus:ring-[#064E3B]/20 transition-all cursor-pointer" />
              <label htmlFor="remember" className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                Tetap masuk selama 30 hari
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-[#064E3B] hover:bg-[#043327] text-white py-4 rounded-2xl font-semibold text-sm uppercase tracking-[0.1em] shadow-xl shadow-emerald-950/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Masuk Sekarang <IconArrowRight size={18} stroke={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-widest">
              <span className="bg-[#F9FAFB] lg:bg-white px-4 text-gray-400">Atau masuk dengan</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
            <IconBrandGoogle size={20} className="text-red-500" /> Google SSO
          </button>

          <p className="text-center text-xs font-medium text-gray-500 pt-6">
            Tidak bisa masuk?{" "}
            <button onClick={() => setIsModalOpen(true)} className="text-[#064E3B] font-bold hover:underline underline-offset-4">
              Hubungi Admin IT
            </button>
          </p>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Bantuan Teknis & Akses">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="w-10 h-10 bg-[#064E3B] rounded-xl flex items-center justify-center shrink-0">
              <IconHeadset size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Hubungi Tim IT Support</h4>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">Jika Anda lupa kata sandi atau akun Anda terkunci, silakan hubungi administrator melalui saluran di bawah.</p>
            </div>
          </div>

          <div className="space-y-3">
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <IconBrandWhatsapp size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">WhatsApp Support</p>
                  <p className="text-xs text-gray-500">Respon cepat (08:00 - 17:00)</p>
                </div>
              </div>
              <IconExternalLink size={16} className="text-gray-300 group-hover:text-gray-400" />
            </a>

            <a href="mailto:it.support@company.com" className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <IconMail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Email Ticketing</p>
                  <p className="text-xs text-gray-500">it.support@inventra.com</p>
                </div>
              </div>
              <IconExternalLink size={16} className="text-gray-300 group-hover:text-gray-400" />
            </a>
          </div>

          <div className="pt-2">
            <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
