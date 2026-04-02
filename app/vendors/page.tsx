/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { IconPlus, IconSearch, IconFilter, IconEdit, IconBuildingSkyscraper, IconCircleCheckFilled, IconCircleXFilled, IconUser, IconMail, IconPhone, IconTags, IconLayoutGrid, IconMapPin } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

// 1. Data Vendor Riil (5 Data)
const initialVendors = [
  { id: "VND-101", name: "PT. Telekomunikasi Indonesia", contactPerson: "Budi Santoso", email: "corp@telkom.co.id", phone: "021-5243500", category: "IT Hardware", status: "Active", address: "Jl. Gatot Subroto No.52, Jakarta" },
  { id: "VND-102", name: "PT. Astra Graphia Tbk", contactPerson: "Siti Aminah", email: "info@astragraphia.co.id", phone: "021-3909191", category: "Office Supplies", status: "Active", address: "Jl. Kramat Raya No.43, Jakarta" },
  { id: "VND-103", name: "PT. Sumber Alfaria Trijaya", contactPerson: "Andi Wijaya", email: "supply@alfamart.co.id", phone: "021-5575596", category: "Logistics", status: "Inactive", address: "Jl. Jalur Sutera Barat No.9, Tangerang" },
  { id: "VND-104", name: "PT. United Tractors Tbk", contactPerson: "Hendra Kurniawan", email: "procurement@unitedtractors.com", phone: "021-2457999", category: "Maintenance", status: "Active", address: "Jl. Raya Bekasi Km.22, Jakarta" },
  { id: "VND-105", name: "PT. Indofood Sukses Makmur", contactPerson: "Rina Permata", email: "vendor@indofood.com", phone: "021-5795882", category: "Logistics", status: "Active", address: "Sudirman Plaza, Indofood Tower, Jakarta" },
];

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

  // State untuk Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua kategori");

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

  // 2. Logika Search & Filter (Real-time)
  const filteredVendors = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return vendors.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === "Semua kategori" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [vendors, searchQuery, selectedCategory]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", contactPerson: "", email: "", phone: "", category: "IT Hardware", address: "", status: "Active" });
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
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCategories([...categories, { name: trimmed, isActive: true }]);
      toast.success(`Kategori "${trimmed}" ditambahkan`);
      setNewCategoryName("");
    }
  };

  const handleToggleCategory = (categoryName: string) => {
    setCategories(categories.map((c) => (c.name === categoryName ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setVendors(vendors.map((item) => (item.id === editingItem.id ? { ...item, ...formData } : item)));
      toast.success("Vendor diperbarui");
    } else {
      const newItem = { id: `VND-${100 + vendors.length + 1}`, ...formData };
      setVendors([newItem, ...vendors]);
      toast.success("Vendor ditambahkan");
    }
    handleCloseModal();
  };

  const columns = [
    {
      header: "Vendor",
      accessor: (item: any) => (
        <div className="min-w-0 py-1 flex items-center gap-2">
          <p className="font-bold text-gray-900 truncate">{item.name}</p>
          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 font-semibold uppercase">{item.id}</span>
        </div>
      ),
    },
    {
      header: "Kontak",
      accessor: (item: any) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{item.contactPerson}</p>
          <p className="text-xs text-gray-400 truncate">{item.email}</p>
        </div>
      ),
    },
    {
      header: "Kategori",
      accessor: (item: any) => <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-bold uppercase tracking-widest">{item.category}</span>,
    },
    { header: "Telepon", accessor: "phone" as const },
    {
      header: "Status",
      accessor: (item: any) => {
        const isActive = item.status === "Active";
        return (
          <span
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold
              ${isActive ? "bg-violet-500/10 text-violet-600 border border-violet-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"}
            `}
          >
            {isActive ? <IconCircleCheckFilled size={12} stroke={2.5} /> : <IconCircleXFilled size={12} stroke={2.5} />}
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      accessor: (item: any) => (
        <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/12 transition-all">
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
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vendors</h2>
            <p className="text-xs text-gray-500 font-medium">Kelola data supplier dan rekanan bisnis Anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="page-secondary" onClick={() => setIsCategoryModalOpen(true)}>
              <IconLayoutGrid size={16} /> Vendor Group
            </Button>
            <Button variant="page-primary" onClick={() => setIsModalOpen(true)}>
              <IconPlus size={16} stroke={3} /> Tambah Vendor
            </Button>
          </div>
        </div>

        {/* 3. Search & Filter Bar (Berfungsi) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari nama, email, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-violet-700 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <IconFilter size={16} />
              <span>Filter:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-violet-700 transition-all cursor-pointer"
            >
              <option value="Semua kategori">Semua kategori</option>
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

        {/* Gunakan filteredVendors di sini */}
        <div className="min-h-100">
          <DataTable data={filteredVendors} columns={columns} pageSize={10} density="dense" />
        </div>

        {/* Modal-modal (Tetap sama seperti kode awal Anda) */}
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconTags size={16} /> Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all resize-none"
                />
              </div>

              {editingItem && (
                <div className="pt-2 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === "Active" ? "bg-violet-100 text-violet-600" : "bg-red-100 text-red-600"}`}>
                      {formData.status === "Active" ? <IconCircleCheckFilled size={20} /> : <IconCircleXFilled size={20} />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Status Vendor</p>
                      <p className="text-xs text-gray-500">
                        Klik toggle untuk mengubah ke {formData.status === "Active" ? "Inactive" : "Active"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.status === "Active" ? "bg-violet-600" : "bg-gray-300"}`}
                  >
                    <span className={`${formData.status === "Active" ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <Button variant="modal-secondary" type="button" onClick={handleCloseModal} className="flex-1">
                Batal
              </Button>
              <Button variant="modal-primary" type="submit" className="flex-1">
                Simpan Vendor
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Category Group */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manajemen Grup Vendor">
          <div className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Kategori baru..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/10"
              />
              <Button variant="modal-primary" onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                Tambah
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div key={cat.name} className={`flex items-center justify-between p-3 border rounded-xl ${cat.isActive ? "bg-white border-gray-100" : "bg-gray-50 opacity-50"}`}>
                  <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                  <button onClick={() => handleToggleCategory(cat.name)} className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                    {cat.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
            <Button variant="modal-secondary" onClick={() => setIsCategoryModalOpen(false)} className="w-full">
              Tutup
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
