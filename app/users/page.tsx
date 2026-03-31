/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { IconPlus, IconSearch, IconEdit, IconFilter, IconUser, IconMail, IconBriefcase, IconShield, IconCircleCheck, IconCircleX, IconShieldCheck, IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

const initialUsers = [
  {
    id: "USR-501",
    name: "Ahmad Fauzan",
    email: "ahmad.fauzan@inventra.co.id",
    role: "Super Admin",
    status: "Active",
    lastActive: "2h ago",
    createdBy: "Administrator",
    createdAt: new Date(2026, 2, 3),
  },
  {
    id: "USR-502",
    name: "Sarah Wijaya",
    email: "sarah.wijaya@inventra.co.id",
    role: "Manager",
    status: "Active",
    lastActive: "5h ago",
    createdBy: "Administrator",
    createdAt: new Date(2026, 2, 5),
  },
  {
    id: "USR-503",
    name: "John Pratama",
    email: "john.pratama@inventra.co.id",
    role: "Staff",
    status: "Inactive",
    lastActive: "1d ago",
    createdBy: "Administrator",
    createdAt: new Date(2026, 2, 8),
  },
  {
    id: "USR-504",
    name: "Dewi Lestari",
    email: "dewi.lestari@inventra.co.id",
    role: "Staff",
    status: "Active",
    lastActive: "30m ago",
    createdBy: "Administrator",
    createdAt: new Date(2026, 2, 10),
  },
  {
    id: "USR-505",
    name: "Rizky Ananda",
    email: "rizky.ananda@inventra.co.id",
    role: "Manager",
    status: "Active",
    lastActive: "10h ago",
    createdBy: "Administrator",
    createdAt: new Date(2026, 2, 12),
  },
];

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Semua role");

  const [newRoleName, setNewRoleName] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    emailPrefix: "",
    role: "Staff",
    status: "Active",
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = selectedRole === "Semua role" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

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
    const trimmed = newRoleName.trim();
    if (trimmed && !roles.some((r) => r.name === trimmed)) {
      setRoles([...roles, { name: trimmed, isActive: true }]);
      toast.success(`Role "${trimmed}" ditambahkan`);
      setNewRoleName("");
    } else if (roles.some((r) => r.name === trimmed)) {
      toast.error("Role sudah ada");
    }
  };

  const handleToggleRole = (roleName: string) => {
    setRoles(roles.map((r) => (r.name === roleName ? { ...r, isActive: !r.isActive } : r)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: `${formData.emailPrefix}@inventra.co.id`,
                role: formData.role,
                status: formData.status,
              }
            : u,
        ),
      );
      toast.success("User diperbarui");
    } else {
      const newUser = {
        id: `USR-${500 + users.length + 1}`,
        name: formData.name,
        email: `${formData.emailPrefix}@inventra.co.id`,
        role: formData.role,
        status: "Active",
        lastActive: "Just now",
        createdBy: "Admin",
        createdAt: new Date(),
      };
      setUsers([newUser, ...users]);
      toast.success("User ditambahkan");
    }
    handleCloseModal();
  };

  const columns = [
    {
      header: "User",
      accessor: (item: any) => (
        <div className="min-w-0 py-1">
          <p className="font-bold text-gray-900 truncate leading-tight">{item.name}</p>
          <p className="text-xs text-gray-400 truncate tracking-wide">{item.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium">{item.role}</span>,
    },
    {
      header: "Status",
      accessor: (item: any) => {
        const isActive = item.status === "Active";
        return (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold border ${isActive ? "bg-violet-500/10 text-violet-600 border border-violet-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"}`}
          >
            {isActive ? <IconCircleCheckFilled size={12} /> : <IconCircleXFilled size={12} />}
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Last active",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium">{item.lastActive}</span>,
    },
    {
      header: "Created by",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium">{item.createdBy}</span>,
    },
    {
      header: "Created at",
      accessor: (item: any) => <span className="text-sm text-gray-700 font-medium tabular-nums">{formatDate(item.createdAt)}</span>,
    },
    {
      header: "Aksi",
      accessor: (item: any) => (
        <button onClick={() => handleEditClick(item)} className="p-1.5 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-all active:scale-90">
          <IconEdit size={18} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h2>
            <p className="text-xs text-gray-500 font-medium">Kelola anggota tim dan hak akses mereka.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <IconShieldCheck size={16} /> Role Group
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <IconPlus size={16} stroke={3} /> Tambah user
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <IconFilter size={16} />
              <span>Filter:</span>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-violet-400 transition-all cursor-pointer"
            >
              <option value="Semua role">Semua role</option>
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

        <div className="min-h-100">
          <DataTable data={filteredUsers} columns={columns} pageSize={10} density="dense" />
        </div>

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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconMail size={16} /> Email Perusahaan
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
                  <input
                    required
                    type="text"
                    value={formData.emailPrefix}
                    onChange={(e) => setFormData({ ...formData, emailPrefix: e.target.value.replace(/@/g, "") })}
                    placeholder="nama.user"
                    className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="px-4 py-3 bg-gray-100 text-gray-400 text-xs font-black border-l border-gray-100 tracking-tighter">@inventra.co.id</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconBriefcase size={16} /> Role / Jabatan
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
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
                <div className="pt-2 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === "Active" ? "bg-violet-100 text-violet-600" : "bg-red-100 text-red-600"}`}>
                      {formData.status === "Active" ? <IconCircleCheckFilled size={20} /> : <IconCircleXFilled size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none mb-1">Status User</p>
                      <p className="text-xs font-medium text-gray-500 italic uppercase tracking-tighter">Status: {formData.status}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === "Active" ? "bg-violet-600" : "bg-gray-300"}`}
                  >
                    <span className={`${formData.status === "Active" ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`} />
                  </button>
                </div>
              )}
            </div>
            <div className="pt-4 flex gap-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 shadow-lg shadow-violet-900/20 transition-all active:scale-95">
                Simpan User
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Manajemen Role Group">
          <div className="space-y-6">
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
              <p className="text-xs text-violet-800 leading-relaxed font-bold uppercase tracking-tighter">Daftar role yang tersedia. Nonaktifkan role untuk menyembunyikannya dari pilihan pendaftaran user.</p>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tambah Role Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Contoh: Supervisor IT"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
                <button
                  onClick={handleAddRole}
                  disabled={!newRoleName.trim()}
                  className="px-4 bg-zinc-900 disabled:bg-gray-200 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
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
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.isActive ? "bg-violet-100 text-violet-700" : "bg-gray-200 text-gray-500"}`}>
                        <IconShield size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${role.isActive ? "text-gray-700" : "text-gray-400"}`}>{role.name}</span>
                        <span className={`text-xs font-bold uppercase tracking-tight ${role.isActive ? "text-violet-500" : "text-gray-400"}`}>{role.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleRole(role.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${role.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-violet-50 text-violet-600 hover:bg-violet-100"}`}
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