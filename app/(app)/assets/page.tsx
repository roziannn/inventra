"use client";

import React, { useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { useInitialLoading } from "@/lib/use-initial-loading";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import FormLabel from "@/components/ui/FormLabel";
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
import { assetCategories, demoAssets } from "@/lib/demo/hardware";

const initialAssets = demoAssets;

const initialCategories = assetCategories.map((name) => ({ name: name as string, isActive: true }));

type Asset = (typeof initialAssets)[number];

export default function AssetsPage() {
  const [assets, setAssets] = useState(initialAssets);
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "Laptop",
    assignee: "Unassigned",
    condition: "Good",
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    setFormData({ name: "", serialNumber: "", category: "Laptop", assignee: "Unassigned", condition: "Good" });
  };

  const handleEditClick = (asset: Asset) => {
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

  const loading = useInitialLoading();

  const columns = [
    {
      header: "Nama aset",
      accessor: (item: Asset) => (
        <div className="min-w-0 max-w-72 py-1 flex items-center gap-2">
          <p className="font-bold text-gray-900 truncate">{item.name}</p>
          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 font-semibold">{item.id}</span>
        </div>
      ),
    },
    { header: "Serial number", accessor: "serialNumber" as const },
    {
      header: "Kategori",
      accessor: (item: Asset) => <span className="text-sm text-gray-700">{item.category}</span>,
    },
    {
      header: "PIC / Assignee",
      accessor: (item: Asset) => <span className="text-sm font-semibold text-gray-700">{item.assignee}</span>,
    },
    {
      header: "Kondisi",
      accessor: (item: Asset) => {
        const config: Record<string, { tone: BadgeTone; icon: React.ReactNode }> = {
          Good: { tone: "success", icon: <IconCircleCheckFilled size={12} /> },
          Maintenance: { tone: "warning", icon: <IconSettingsFilled size={12} /> },
          Broken: { tone: "danger", icon: <IconCircleXFilled size={12} /> },
        };
        const current = config[item.condition] ?? config.Good;
        return (
          <Badge tone={current.tone} icon={current.icon}>
            {item.condition}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      accessor: (item: Asset) => (
        <button
          onClick={() => handleEditClick(item)}
          className="p-1.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/12 transition-all"
        >
          <IconEdit size={18} />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Assets"
          description="Daftar aset tetap dan inventaris perusahaan Anda."
          actions={
            <>
              <Button variant="page-secondary" onClick={() => setIsCategoryModalOpen(true)}>
                <IconLayoutGrid size={16} /> Asset Group
              </Button>
              <Button variant="page-primary" onClick={() => setIsModalOpen(true)}>
                <IconPlus size={16} stroke={3} /> Tambah aset
              </Button>
            </>
          }
        />

        {/* Integrated Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-2">
          <div className="relative w-full md:w-80 group">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari nama aset atau serial..."
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <IconFilter size={16} />
              <span>Filter:</span>
            </div>
            <select className="bg-transparent border-b border-gray-200 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-violet-400 transition-all">
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
        <DataTable loading={loading} data={assets} columns={columns} pageSize={10} density="dense" />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Aset Baru">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel icon={<IconBoxSeam size={16} />}>Nama Aset</FormLabel>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: MacBook Pro M1 2021"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel icon={<IconHash size={16} />}>Serial Number</FormLabel>
                  <input
                    required
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="SN-XXXX-XXXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel icon={<IconTags size={16} />}>Kategori</FormLabel>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
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
                  <FormLabel icon={<IconUser size={16} />}>PIC / Assignee</FormLabel>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Nama penanggung jawab..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel icon={<IconInfoCircle size={16} />}>Kondisi</FormLabel>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Good">Good</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button variant="modal-secondary" type="button" onClick={handleCloseModal} className="flex-1">
                Batal
              </Button>
              <Button variant="modal-primary" type="submit" className="flex-1">
                Simpan Aset
              </Button>
            </div>
          </form>
        </Modal>

        {/* Category Modal */}
        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manajemen Kategori Aset">
          <div className="space-y-6">
            <div className="p-4 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-100 dark:border-violet-500/20">
              <p className="text-sm text-violet-800 dark:text-violet-300 leading-relaxed font-medium">Kelola kategori aset untuk pengelompokan yang lebih baik di platform Inventra.</p>
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
                  <div
                    key={cat.name}
                    className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${cat.isActive ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-200 opacity-60"}`}
                  >
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
    </>
  );
}
