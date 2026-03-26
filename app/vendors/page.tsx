/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { IconPlus, IconSearch, IconFilter, IconEdit, IconBuildingSkyscraper, IconUser, IconMail, IconPhone, IconTags, IconLayoutGrid, IconCircleCheck, IconCircleX, IconMapPin } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

const initialVendors = Array.from({ length: 15 }, (_, i) => ({
  id: `VND-${100 + i}`,
  name: i % 2 === 0 ? `PT. Vendor Jaya ${i + 1}` : `CV. Suplai Makmur ${i + 1}`,
  contactPerson: `Person ${i + 1}`,
  email: `vendor${i + 1}@example.com`,
  phone: `0812-3456-789${i}`,
  category: i % 3 === 0 ? "IT Hardware" : i % 3 === 1 ? "Office Supplies" : "Maintenance",
  status: i % 10 !== 0 ? "Active" : "Inactive",
  address: "Jl. Industri No. 123, Jakarta",
}));

const initialCategories = [
  { name: "IT Hardware", isActive: true },
  { name: "Office Supplies", isActive: true },
  { name: "Maintenance", isActive: true },
  { name: "Logistics", isActive: true },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState(initialVendors);
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    category: "IT Hardware",
    address: "",
    status: "Active",
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "IT Hardware",
      address: "",
      status: "Active",
    });
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      contactPerson: item.contactPerson,
      email: item.email,
      phone: item.phone,
      category: item.category,
      address: item.address,
      status: item.status,
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

    if (editingItem) {
      const updatedVendors = vendors.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            ...formData,
          };
        }
        return item;
      });
      setVendors(updatedVendors);
      toast.success("Vendor berhasil diperbarui");
    } else {
      const newItem = {
        id: `VND-${100 + vendors.length}`,
        ...formData,
        status: "Active",
      };
      setVendors([newItem, ...vendors]);
      toast.success("Vendor berhasil ditambahkan");
    }

    handleCloseModal();
  };

  const columns = [
    {
      header: "Vendor",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IconBuildingSkyscraper size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{item.name}</p>
            <p className="text-[10px] text-gray-400">{item.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Kontak",
      accessor: (item: any) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{item.contactPerson}</p>
          <p className="text-[10px] text-gray-400 truncate">{item.email}</p>
        </div>
      ),
    },
    {
      header: "Kategori",
      accessor: (item: any) => <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{item.category}</span>,
    },
    { header: "Telepon", accessor: "phone" as const },
    {
      header: "Status",
      accessor: (item: any) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>,
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
        <Breadcrumb items={[{ label: "Vendors" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vendors</h2>
            <p className="text-xs text-gray-500">Kelola data supplier dan rekanan bisnis Anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <IconLayoutGrid size={16} /> Vendor Group
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              <IconPlus size={16} stroke={3} /> Tambah Vendor
            </button>
          </div>
        </div>

        {/* Integrated Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input type="text" placeholder="Cari berdasarkan nama atau email..." className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all" />
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
        <DataTable data={vendors} columns={columns} pageSize={10} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Edit Vendor" : "Tambah Vendor Baru"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconBuildingSkyscraper size={16} /> Nama Vendor
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: PT. Global Teknologi"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconUser size={16} /> Contact Person
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nama kontak"
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
                    <IconMail size={16} /> Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vendor@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconPhone size={16} /> Telepon
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconMapPin size={16} /> Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap vendor..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all resize-none"
                />
              </div>

              {editingItem && (
                <div className="pt-2 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === "Active" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {formData.status === "Active" ? <IconCircleCheck size={20} /> : <IconCircleX size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Status Vendor</p>
                      <p className="text-xs font-medium text-gray-500">
                        Vendor saat ini <span className={formData.status === "Active" ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>{formData.status}</span>
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
                Simpan Vendor
              </button>
            </div>
          </form>
        </Modal>

        {/* Vendor Group Modal */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manajemen Grup Vendor">
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">Kelola kategori vendor untuk memudahkan pengelompokan rekanan bisnis Anda.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tambah Kategori Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Logistik & Pengiriman"
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
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">List Kategori</label>
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
