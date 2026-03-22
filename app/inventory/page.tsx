"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { IconPlus, IconSearch, IconFilter, IconEdit, IconPackage, IconHash, IconTags, IconDatabase, IconWeight, IconLayoutGrid, IconTrash, IconCircleCheck, IconCircleX } from "@tabler/icons-react";

const initialInventory = Array.from({ length: 25 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  name: i % 2 === 0 ? `Item ${i + 1} Pro` : `Standard Item ${i + 1}`,
  category: i % 3 === 0 ? "Electronic" : i % 3 === 1 ? "Stationery" : "Furniture",
  sku: `SKU-${8000 + i}`,
  stock: Math.floor(Math.random() * 500) + 10,
  unit: "Pcs",
  status: Math.random() > 0.2 ? "In stock" : "Low stock",
}));

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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Electronic",
    stock: "",
    unit: "Pcs",
  });

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
    if (newCategoryName.trim() && !categories.some(c => c.name === newCategoryName.trim())) {
      setCategories([...categories, { name: newCategoryName.trim(), isActive: true }]);
      setNewCategoryName("");
    }
  };

  const handleToggleCategory = (categoryName: string) => {
    setCategories(categories.map(c => 
      c.name === categoryName ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // Logic Update
      const updatedInventory = inventory.map(item => {
        if (item.id === editingItem.id) {
          const updatedStock = Number(formData.stock);
          return {
            ...item,
            ...formData,
            stock: updatedStock,
            status: updatedStock > 10 ? "In stock" : "Low stock",
          };
        }
        return item;
      });
      setInventory(updatedInventory);
    } else {
      // Logic Create
      const newItem = {
        id: `INV-${1000 + inventory.length}`,
        ...formData,
        stock: Number(formData.stock),
        status: Number(formData.stock) > 10 ? "In stock" : "Low stock",
      };
      setInventory([newItem, ...inventory]);
    }
    
    handleCloseModal();
  };

  const columns = [
    {
      header: "Nama barang",
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IconPackage size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{item.name}</p>
            <p className="text-[10px] text-gray-400">{item.id}</p>
          </div>
        </div>
      ),
    },
    { header: "SKU", accessor: "sku" as const },
    { 
      header: "Kategori", 
      accessor: (item: any) => (
        <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{item.category}</span>
      )
    },
    { 
      header: "Stok", 
      accessor: (item: any) => (
        <div>
          <span className="font-bold text-gray-900">{item.stock}</span>
          <span className="ml-1 text-gray-400 text-xs">{item.unit}</span>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: (item: any) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
          item.status === "In stock" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {item.status}
        </span>
      )
    },
    { 
      header: "Aksi", 
      className: "text-right",
      accessor: (item: any) => (
        <button 
          onClick={() => handleEditClick(item)}
          className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
        >
          <IconEdit size={18} />
        </button>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Inventory" }]} />

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h2>
            <p className="text-xs text-gray-500">Kelola stok barang dan kategori inventaris Anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <IconLayoutGrid size={16} /> Inventory Group
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#064E3B] hover:bg-[#043327] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <IconPlus size={16} stroke={3} /> Tambah barang
            </button>
          </div>
        </div>

        {/* Integrated Search & Filter (No Box) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau SKU..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#064E3B] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <IconFilter size={16} />
                <span>Filter:</span>
            </div>
            <select className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#064E3B] transition-all">
              <option>Semua kategori</option>
              {categories.filter(c => c.isActive).map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable data={inventory} columns={columns} pageSize={10} />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Barang Inventaris">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IconPackage size={16} /> Nama Barang
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Kertas A4 80gr"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconHash size={16} /> SKU / Kode
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="SKU-XXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconTags size={16} /> Kategori
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all appearance-none cursor-pointer"
                  >
                    {categories.filter(c => c.isActive).map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconDatabase size={16} /> Jumlah Stok
                  </label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <IconWeight size={16} /> Satuan
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="Pcs, Rim, Box..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#064E3B]/5 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="flex-1 px-4 py-3.5 border border-gray-100 text-gray-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-3.5 bg-[#064E3B] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
              >
                Simpan Barang
              </button>
            </div>
          </form>
        </Modal>

        {/* Category Modal */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manajemen Kategori Inventaris">
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                Kelola kategori barang untuk memudahkan pengelompokan inventaris Anda.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tambah Kategori Baru</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Alat Tulis Kantor"
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
              <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                {categories.map((cat) => (
                  <div key={cat.name} className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${cat.isActive ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-200 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                        <IconTags size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${cat.isActive ? "text-gray-700" : "text-gray-400"}`}>{cat.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${cat.isActive ? "text-emerald-500" : "text-gray-400"}`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        cat.isActive 
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
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
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
