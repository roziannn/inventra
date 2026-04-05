/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import FormLabel from "@/components/FormLabel";
import { IconPlus, IconSearch, IconFilter, IconEdit, IconPackage, IconHash, IconTags, IconDatabase, IconWeight, IconLayoutGrid, IconCircleCheckFilled, IconCircleXFilled, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

const initialInventory = [
  { id: "INV-1001", name: "MacBook Pro M3", category: "Electronic", sku: "LAP-001", stock: 15, unit: "Unit", status: "In stock" },
  { id: "INV-1002", name: "Kursi Kerja Ergonomis", category: "Furniture", sku: "FUR-024", stock: 8, unit: "Pcs", status: "Low stock" },
  { id: "INV-1003", name: "Kertas A4 80gr", category: "Stationery", sku: "PAP-010", stock: 120, unit: "Rim", status: "In stock" },
  { id: "INV-1004", name: "Monitor Dell 24 inch", category: "Electronic", sku: "MON-005", stock: 5, unit: "Unit", status: "Low stock" },
  { id: "INV-1005", name: "Meja Meeting Kayu", category: "Furniture", sku: "FUR-088", stock: 2, unit: "Unit", status: "Low stock" },
];

const initialCategories = [
  { name: "Electronic", isActive: true },
  { name: "Stationery", isActive: true },
  { name: "Furniture", isActive: true },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // State untuk Search dan Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua kategori");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Electronic",
    stock: "",
    unit: "Pcs",
  });

  // 2. Logika Search & Filter menggunakan useMemo
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "Semua kategori" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", sku: "", category: "Electronic", stock: "", unit: "Pcs" });
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock.toString(),
      unit: item.unit,
    });
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCategories([...categories, { name: trimmedName, isActive: true }]);
      toast.success(`Kategori "${trimmedName}" berhasil ditambahkan`);
      setNewCategoryName("");
    } else if (trimmedName) {
      toast.error("Kategori sudah ada");
    }
  };

  const handleToggleCategory = (categoryName: string) => {
    setCategories(categories.map((c) => (c.name === categoryName ? { ...c, isActive: !c.isActive } : c)));
    toast.success(`Status kategori diperbarui`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockNum = Number(formData.stock);
    const status = stockNum > 10 ? "In stock" : "Low stock";

    if (editingItem) {
      setInventory(inventory.map((item) => (item.id === editingItem.id ? { ...item, ...formData, stock: stockNum, status } : item)));
      toast.success("Barang berhasil diperbarui");
    } else {
      const newItem = {
        id: `INV-${1000 + inventory.length + 1}`,
        ...formData,
        stock: stockNum,
        status,
      };
      setInventory([newItem, ...inventory]);
      toast.success("Barang berhasil ditambahkan");
    }
    handleCloseModal();
  };

  const columns = [
    {
      header: "Nama barang",
      accessor: (item: any) => (
        <div className="min-w-0 py-1 flex items-center gap-2">
          <p className="font-bold text-gray-900 truncate">{item.name}</p>
          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 font-semibold">{item.id}</span>
        </div>
      ),
    },
    { header: "SKU", accessor: "sku" as const },
    {
      header: "Kategori",
      accessor: (item: any) => <span className="text-sm text-gray-700">{item.category}</span>,
    },
    {
      header: "Stok",
      accessor: (item: any) => (
        <div>
          <span className="font-bold text-gray-900">{item.stock}</span>
          <span className="ml-1 text-gray-400 text-xs">{item.unit}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item: any) => {
        const isInStock = item.status === "In stock";
        return (
          <span
            className={`
            inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold
            ${isInStock ? "bg-violet-500/10 text-violet-600 border border-violet-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"}
          `}
          >
            {isInStock ? <IconCircleCheckFilled size={12} stroke={2.5} /> : <IconCircleXFilled size={12} stroke={2.5} />}
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      accessor: (item: any) => (
        <button onClick={() => handleEditClick(item)} className="p-1.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/12 transition-all">
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
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h2>
            <p className="text-xs text-gray-500">Kelola stok barang dan kategori inventaris Anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="page-secondary" onClick={() => setIsCategoryModalOpen(true)}>
              <IconLayoutGrid size={16} /> Inventory Group
            </Button>
            <Button variant="page-primary" onClick={() => setIsModalOpen(true)}>
              <IconPlus size={16} stroke={3} /> Tambah barang
            </Button>
          </div>
        </div>

        {/* 3. Search & Filter Bar (Sudah Berfungsi) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau SKU..."
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-violet-400 transition-all"
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

        {/* Gunakan filteredInventory di sini */}
        <DataTable data={filteredInventory} columns={columns} pageSize={10} density="dense" />

        {/* ... (Sisa Modal Modal tetap sama) ... */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Edit Barang" : "Tambah Barang Inventaris"}>
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel icon={<IconPackage size={16} />}>Nama Barang</FormLabel>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: MacBook Pro M3"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>
              {/* SKU & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel icon={<IconHash size={16} />}>SKU / Kode</FormLabel>
                  <input
                    required
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-XXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel icon={<IconTags size={16} />}>Kategori</FormLabel>
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
              {/* Stock & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel icon={<IconDatabase size={16} />}>Jumlah Stok</FormLabel>
                  <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel icon={<IconWeight size={16} />}>Satuan</FormLabel>
                  <input
                    required
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Pcs, Rim, Box..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <Button variant="modal-secondary" type="button" onClick={handleCloseModal} className="flex-1">
                Batal
              </Button>
              <Button variant="modal-primary" type="submit" className="flex-1">
                Simpan Barang
              </Button>
            </div>
          </form>
        </Modal>

        {/* Category Modal (Tetap Sama) */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manajemen Kategori">
          <div className="space-y-6">
            <div className="p-4 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-100 dark:border-violet-500/20">
              <p className="text-sm text-violet-800 dark:text-violet-300 leading-relaxed font-medium">Kelola kategori inventory untuk pengelompokan yang lebih baik di platform Inventra.</p>
            </div>

            <div className="space-y-3">
              <FormLabel>Tambah Kategori Baru</FormLabel>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Perangkat Jaringan"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
                <Button variant="modal-primary" onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                  Tambah
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <FormLabel>List Kategori Terdaftar</FormLabel>
              <div className="grid grid-cols-1 gap-2 max-h-62.5 overflow-y-auto pr-2 scrollbar-hide">
                {categories.map((cat) => (
                  <div key={cat.name} className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${cat.isActive ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-200 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.isActive ? "bg-violet-100 text-violet-700" : "bg-gray-200 text-gray-500"}`}>
                        <IconTags size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm ${cat.isActive ? "text-gray-700" : "text-gray-500"}`}>{cat.name}</span>
                        <span className={`text-xs ${cat.isActive ? "text-gray-500" : "text-gray-400"}`}>{cat.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        cat.isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                      }`}
                    >
                      {cat.isActive ? <IconCircleX size={14} /> : <IconCircleCheck size={14} />}
                      {cat.isActive ? "Set inactive" : "Set active"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button variant="modal-secondary" onClick={() => setIsCategoryModalOpen(false)} className="w-full">
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
