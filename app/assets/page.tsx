/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconEdit,
  IconCircleCheckFilled,
  IconSettingsFilled,
  IconCircleXFilled,
  IconBoxSeam,
  IconHash,
  IconTags,
  IconUser,
  IconInfoCircle,
  IconLayoutGrid,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { toast } from "react-hot-toast";

const initialAssets = Array.from({ length: 30 }, (_, i) => ({
  id: `AST-${2000 + i}`,
  name: i % 2 === 0 ? `MacBook Pro M${(i % 3) + 1}` : `Monitor Dell UltraSharp ${i + 20}"`,
  category: i % 4 === 0 ? "IT Equipment" : i % 4 === 1 ? "Office Supply" : i % 4 === 2 ? "Vehicle" : "Machinery",
  serialNumber: `SN-${10000 + i}XYZ`,
  condition: i % 5 === 0 ? "Maintenance" : "Good",
  assignee: i % 3 === 0 ? "Budi S." : i % 3 === 1 ? "Siti A." : "Unassigned",
}));

const initialCategories = [
  { name: "IT Equipment", isActive: true },
  { name: "Office Supply", isActive: true },
  { name: "Vehicle", isActive: true },
  { name: "Machinery", isActive: true },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState(initialAssets);
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingAsset, setEditingAsset] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "IT Equipment",
    assignee: "Unassigned",
    condition: "Good",
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    setFormData({ name: "", serialNumber: "", category: "IT Equipment", assignee: "Unassigned", condition: "Good" });
  };

  const handleEditClick = (asset: any) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      serialNumber: asset.serialNumber,
      category: asset.category,
      assignee: asset.assignee,
      condition: asset.condition,
    });
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.some((c) => c.name === newCategoryName.trim())) {
      setCategories([...categories, { name: newCategoryName.trim(), isActive: true }]);
      toast.success(`Kategori "${newCategoryName.trim()}" berhasil ditambahkan`);
      setNewCategoryName("");
    } else if (categories.some((c) => c.name === newCategoryName.trim())) {
      toast.error("Kategori sudah ada");
    }
  };

  const handleToggleCategory = (categoryName: string) => {
    setCategories(
      categories.map((c) => {
        if (c.name === categoryName) {
          const newState = !c.isActive;
          toast.success(`Kategori "${categoryName}" ${newState ? "diaktifkan" : "dinonaktifkan"}`);
          return { ...c, isActive: newState };
        }
        return c;
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAsset) {
      // Logic Update
      const updatedAssets = assets.map((asset) => {
        if (asset.id === editingAsset.id) {
          return {
            ...asset,
            ...formData,
          };
        }
        return asset;
      });
      setAssets(updatedAssets);
      toast.success("Aset berhasil diperbarui");
    } else {
      // Logic Create
      const newAsset = {
        id: `AST-${2000 + assets.length}`,
        ...formData,
      };
      setAssets([newAsset, ...assets]);
      toast.success("Aset berhasil ditambahkan");
    }

    handleCloseModal();
  };

  const columns = [
    {
      header: "Nama aset",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IconBoxSeam size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{item.name}</p>
            <p className="text-[10px] text-gray-400">{item.id}</p>
          </div>
        </div>
      ),
    },
    { header: "Serial number", accessor: "serialNumber" as const },
    {
      header: "Kategori",
      accessor: (item: any) => <span className="text-[10px] px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-bold uppercase tracking-widest">{item.category}</span>,
    },
    {
      header: "PIC / Assignee",
      accessor: (item: any) => <span className="text-sm font-semibold text-gray-700">{item.assignee}</span>,
    },
    {
      header: "Kondisi",
      accessor: (item: any) => {
        const config: any = {
          Good: {
            style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            icon: <IconCircleCheckFilled size={12} />,
          },
          Maintenance: {
            style: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            icon: <IconSettingsFilled size={12} />,
          },
          Broken: {
            style: "bg-rose-500/10 text-rose-600 border-rose-500/20",
            icon: <IconCircleXFilled size={12} />,
          },
        };

        const current = config[item.condition] || config.Good;

        return (
          <span
            className={`
            inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold border
            ${current.style}
          `}
          >
            {current.icon}
            {item.condition}
          </span>
        );
      },
    },
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
        <Breadcrumb items={[{ label: "Assets" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Assets</h2>
            <p className="text-xs text-gray-500">Daftar aset tetap dan inventaris perusahaan Anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <IconLayoutGrid size={16} /> Asset Group
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <IconPlus size={16} stroke={3} /> Tambah aset
            </button>
          </div>
        </div>

        {/* Integrated Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input type="text" placeholder="Cari nama aset atau serial..." className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <IconFilter size={16} />
              <span>Filter:</span>
            </div>
            <select className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#064E3B] transition-all">
              <option>Semua kategori</option>
              {categories
                .filter((c) => c.isActive)
                .map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable data={assets} columns={columns} pageSize={10} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Aset Baru">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconBoxSeam size={16} /> Nama Aset
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: MacBook Pro M1 2021"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconHash size={16} /> Serial Number
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="SN-XXXX-XXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconTags size={16} /> Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all appearance-none cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.isActive)
                      .map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconUser size={16} /> PIC / Assignee
                  </label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Nama penanggung jawab..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconInfoCircle size={16} /> Kondisi
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Good">Good</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-3.5 bg-[#064E3B] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                Simpan Aset
              </button>
            </div>
          </form>
        </Modal>

        {/* Category Modal */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manajemen Kategori Aset">
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">Kelola kategori aset untuk pengelompokan yang lebih baik di platform Inventra.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tambah Kategori Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Perangkat Jaringan"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 bg-[#064E3B] disabled:bg-gray-200 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#043327] transition-all active:scale-95"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">List Kategori Terdaftar</label>
              <div className="grid grid-cols-1 gap-2 max-h-62.5 overflow-y-auto pr-2 scrollbar-hide">
                {categories.map((cat) => (
                  <div key={cat.name} className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${cat.isActive ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-200 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                        <IconTags size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${cat.isActive ? "text-gray-700" : "text-gray-400"}`}>{cat.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${cat.isActive ? "text-emerald-500" : "text-gray-400"}`}>{cat.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        cat.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {cat.isActive ? <IconCircleX size={14} /> : <IconCircleCheck size={14} />}
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button onClick={() => setIsCategoryModalOpen(false)} className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
