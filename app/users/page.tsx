"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import { IconPlus, IconSearch, IconDotsVertical } from "@tabler/icons-react";

const dummyUsers = Array.from({ length: 25 }, (_, i) => ({
  id: `USR-${500 + i}`,
  name: i % 3 === 0 ? `Ahmad ${i + 1}` : i % 3 === 1 ? `Sarah Miller ${i + 1}` : `John Doe ${i + 1}`,
  email: `user${i}@inventra.co.id`,
  role: i % 4 === 0 ? "Super Admin" : i % 4 === 1 ? "Manager" : "Staff",
  status: i % 6 === 0 ? "Inactive" : "Active",
  lastActive: `${Math.floor(Math.random() * 24)}h ago`,
}));

export default function UsersPage() {
  const columns = [
    {
      header: "User",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
            {item.name.split(" ").map((n: string) => n[0]).join("")}
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
      accessor: (item: any) => (
        <span className={`text-xs font-semibold ${
          item.role === "Super Admin" ? "text-purple-600" : item.role === "Manager" ? "text-blue-600" : "text-gray-600"
        }`}>
          {item.role}
        </span>
      )
    },
    { 
      header: "Status", 
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-gray-300"}`} />
          <span className="text-sm text-gray-700 font-medium">{item.status}</span>
        </div>
      )
    },
    { header: "Last active", accessor: "lastActive" as const },
    { 
      header: "Aksi", 
      className: "text-right",
      accessor: () => (
        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
          <IconDotsVertical size={18} />
        </button>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Breadcrumb items={[{ label: "Users" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h2>
            <p className="text-xs text-gray-500">Kelola anggota tim dan hak akses mereka.</p>
          </div>
          <button className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
            <IconPlus size={16} stroke={3} /> Tambah user
          </button>
        </div>

        {/* Integrated Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all"
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable data={dummyUsers} columns={columns} pageSize={10} />
      </div>
    </DashboardLayout>
  );
}
