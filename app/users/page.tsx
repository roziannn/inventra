/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { IconPlus, IconSearch, IconEdit, IconFilter, IconUser, IconMail, IconBriefcase, IconShield, IconCircleCheck, IconCircleX, IconShieldCheck } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

const initialUsers = Array.from({ length: 25 }, (_, i) => ({
  id: `USR-${500 + i}`,
  name: i % 3 === 0 ? `Ahmad ${i + 1}` : i % 3 === 1 ? `Sarah Miller ${i + 1}` : `John Doe ${i + 1}`,
  email: `user${i}@inventra.co.id`,
  role: i % 4 === 0 ? "Super Admin" : i % 4 === 1 ? "Manager" : "Staff",
  status: i % 6 === 0 ? "Inactive" : "Active",
  lastActive: `${(i * 3) % 24}h ago`,
}));

const initialRoles = [
  { name: "Super Admin", isActive: true },
  { name: "Manager", isActive: true },
  { name: "Staff", isActive: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    emailPrefix: "",
    role: "Staff",
    status: "Active",
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: "", emailPrefix: "", role: "Staff", status: "Active" });
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    const emailPrefix = user.email.split("@")[0];
    setFormData({
      name: user.name,
      emailPrefix: emailPrefix,
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleAddRole = () => {
    if (newRoleName.trim() && !roles.some((r) => r.name === newRoleName.trim())) {
      setRoles([...roles, { name: newRoleName.trim(), isActive: true }]);
      toast.success(`Role "${newRoleName.trim()}" berhasil ditambahkan`);
      setNewRoleName("");
    } else if (roles.some((r) => r.name === newRoleName.trim())) {
      toast.error("Role sudah ada");
    }
  };

  const handleToggleRole = (roleName: string) => {
    setRoles(
      roles.map((r) => {
        if (r.name === roleName) {
          const newState = !r.isActive;
          toast.success(`Role "${roleName}" ${newState ? "diaktifkan" : "dinonaktifkan"}`);
          return { ...r, isActive: newState };
        }
        return r;
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Logic Update
      const updatedUsers = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formData.name,
            email: `${formData.emailPrefix}@inventra.co.id`,
            role: formData.role,
            status: formData.status,
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      toast.success("User berhasil diperbarui");
    } else {
      // Logic Create
      const newUser = {
        id: `USR-${500 + users.length}`,
        name: formData.name,
        email: `${formData.emailPrefix}@inventra.co.id`,
        role: formData.role,
        status: "Active",
        lastActive: "Just now",
      };
      setUsers([newUser, ...users]);
      toast.success("User berhasil ditambahkan");
    }

    handleCloseModal();
  };

  const columns = [
    {
      header: "User",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
            {item.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{item.name}</p>
            <p className="text-xs text-gray-400 truncate">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (item: any) => <span className={`text-xs font-semibold ${item.role === "Super Admin" ? "text-purple-600" : item.role === "Manager" ? "text-blue-600" : "text-gray-600"}`}>{item.role}</span>,
    },
    {
      header: "Status",
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-gray-300"}`} />
          <span className="text-sm text-gray-700 font-medium">{item.status}</span>
        </div>
      ),
    },
    { header: "Last active", accessor: "lastActive" as const },
    {
      header: "Aksi",
      accessor: (item: any) => (
        <button onClick={() => handleEditClick(item)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all">
          <IconEdit size={18} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Users" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h2>
            <p className="text-xs text-gray-500">Kelola anggota tim dan hak akses mereka.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <IconShieldCheck size={16} /> Role Group
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <IconPlus size={16} stroke={3} /> Tambah user
            </button>
          </div>
        </div>

        {/* Integrated Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input type="text" placeholder="Cari nama atau email..." className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <IconFilter size={16} />
              <span>Role:</span>
            </div>
            <select className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#064E3B] transition-all">
              <option>Semua role</option>
              {roles
                .filter((r) => r.isActive)
                .map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable data={users} columns={columns} pageSize={10} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Edit User" : "Tambah User Baru"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconUser size={16} /> Nama Lengkap
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconMail size={16} /> Email Perusahaan
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#064E3B]/5 transition-all">
                  <input
                    required
                    type="text"
                    value={formData.emailPrefix}
                    onChange={(e) => setFormData({ ...formData, emailPrefix: e.target.value.replace(/@/g, "") })}
                    placeholder="nama.user"
                    className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="px-4 py-3 bg-gray-100 text-gray-400 text-xs font-bold border-l border-gray-100">@inventra.co.id</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconBriefcase size={16} /> Role / Jabatan
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all appearance-none cursor-pointer"
                >
                  {roles
                    .filter((r) => r.isActive)
                    .map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                </select>
              </div>

              {editingUser && (
                <div className="pt-2 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === "Active" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {formData.status === "Active" ? <IconCircleCheck size={20} /> : <IconCircleX size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Status User</p>
                      <p className="text-xs font-medium text-gray-500">
                        User saat ini <span className={formData.status === "Active" ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>{formData.status}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === "Active" ? "bg-emerald-600" : "bg-gray-300"}`}
                  >
                    <span className={`${formData.status === "Active" ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-3.5 bg-[#064E3B] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                Simpan User
              </button>
            </div>
          </form>
        </Modal>

        {/* Role Group Modal */}
        <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Manajemen Role Group">
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">Daftar role yang tersedia. Nonaktifkan role untuk menyembunyikannya dari pilihan pendaftaran user.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tambah Role Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Contoh: Supervisor IT"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
                <button
                  onClick={handleAddRole}
                  disabled={!newRoleName.trim()}
                  className="px-4 bg-[#064E3B] disabled:bg-gray-200 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#043327] transition-all active:scale-95"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">List Role Terdaftar</label>
              <div className="grid grid-cols-1 gap-2 max-h-62.5 overflow-y-auto pr-2 scrollbar-hide">
                {roles.map((role) => (
                  <div key={role.name} className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${role.isActive ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-200 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                        <IconShield size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${role.isActive ? "text-gray-700" : "text-gray-400"}`}>{role.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${role.isActive ? "text-emerald-500" : "text-gray-400"}`}>{role.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleRole(role.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        role.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {role.isActive ? <IconCircleX size={14} /> : <IconCircleCheck size={14} />}
                      {role.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button onClick={() => setIsRoleModalOpen(false)} className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
