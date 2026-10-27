# Katalog komponen

Impor selalu lewat alias `@/components/...`. Semua komponen interaktif memakai `"use client"`.

## `components/ui`: komponen generik

Tidak mengenal domain (inventory, storage, dsb.). Boleh dipakai di mana saja.

### Button

```tsx
import Button from "@/components/ui/Button";

<Button variant="page-primary" onClick={save}>Simpan</Button>
```

`variant`: `page-primary` | `page-secondary` | `page-outline` (tombol di halaman), `modal-primary` | `modal-secondary` | `modal-danger` (tombol di dialog). `type` bawaan `"button"`. Menerima semua atribut `<button>`.

### PageHeader

Judul halaman. Dipakai di **setiap** halaman supaya judul dan tombol aksi sejajar.

```tsx
<PageHeader title="Vendors" description="Kelola data supplier." actions={<Button variant="page-primary">Tambah vendor</Button>} />
```

### DataTable

```tsx
<DataTable<User>
  data={filteredUsers}
  columns={[
    { header: "Nama", accessor: (u) => <span className="font-bold">{u.name}</span> },
    { header: "Email", accessor: "email" },
  ]}
  pageSize={10}
  density="dense"
  loading={loading}
/>
```

| Prop | Keterangan |
| --- | --- |
| `data` | Baris. Tipe baris diambil dari generik, jangan pakai `any` |
| `columns` | `{ header, accessor: keyof T \| (row) => ReactNode, className? }` |
| `pageSize` | Baris per halaman (10) |
| `density` | `"dense"` atau `"normal"` |
| `loading` | Menampilkan skeleton menggantikan baris |
| `onRowClick` | Membuat seluruh baris bisa diklik (kursor pointer, `Enter`/`Spasi` untuk keyboard), mis. membuka detail di modal |
| `bodyCellClassName` | Kelas tambahan untuk semua sel |

Aturan tampilan: **satu baris per data**. Sel tidak membungkus teks (`whitespace-nowrap`); teks panjang dipotong dengan `truncate` dan `max-w-*`. Jangan menumpuk dua informasi di satu sel (mis. nama dan email); buat kolom sendiri.

### Skeleton, TableSkeleton, PageSkeleton

```tsx
<Skeleton className="h-4 w-32" />
<TableSkeleton columns={5} rows={8} withHeader />
```

`PageSkeleton` dipakai oleh `app/(app)/loading.tsx`. Skeleton dekoratif (`aria-hidden`); `TableSkeleton` dan `PageSkeleton` membawa `role="status"` dan `aria-busy`.

### Modal dan ConfirmDialog

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Tambah vendor">...</Modal>

<ConfirmDialog
  isOpen={!!deleting}
  title="Hapus Ruangan"
  message={<>Hapus <b>{deleting?.name}</b>? Tindakan ini tidak bisa dibatalkan.</>}
  icon={<IconTrash size={16} />}
  onConfirm={confirmDelete}
  onClose={() => setDeleting(null)}
/>
```

Setiap aksi yang menghapus data atau tidak bisa dibatalkan **wajib** memakai `ConfirmDialog` dan menyebut apa yang ikut hilang. `confirmLabel` bawaan "Hapus"; `tone="primary"` untuk konfirmasi non-destruktif. `Modal` ditutup dengan Esc atau klik latar.

### GroupManagerModal

Dialog untuk mengelola grup (kategori, lokasi, dsb.): tambah grup baru dan aktifkan atau nonaktifkan. Tata letaknya sama dengan dialog grup di Inventory dan Assets.

```tsx
<GroupManagerModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Manajemen Location Group"
  description="Kelompokkan ruangan berdasarkan lokasi."
  groups={locationGroups}
  usage={(name) => `${countRooms(name)} ruangan`}
  onAdd={(name) => (addLocationGroup(name) ? undefined : "Lokasi sudah ada")}
  onToggle={toggleLocationGroup}
/>
```

`onAdd` mengembalikan pesan galat untuk menolak nama, atau tidak mengembalikan apa pun bila diterima. Grup nonaktif tetap melekat pada data lama tetapi tidak bisa dipilih untuk data baru.

### Input, Select, FormLabel

```tsx
<FormLabel htmlFor="name">Nama</FormLabel>
<Input id="name" value={v} onChange={...} />          // size="md" (bawaan) untuk form di dialog
<Select size="sm" value={t} onChange={...}>...</Select> // size="sm" untuk panel padat
```

`fieldClass` dan `compactFieldClass` diekspor untuk kasus `<input>` mentah. Jangan menulis ulang kelas field di halaman.

### Badge

```tsx
<Badge tone="success" icon={<IconCircleCheckFilled size={12} />}>Active</Badge>
```

`tone`: `success` | `danger` | `warning` | `info` | `neutral`. Warna ditentukan oleh `tone`, bukan oleh pemanggil. Pemetaan status ke tone dilakukan di halaman (mis. `Good` ke `success`, `Maintenance` ke `warning`, `Broken` ke `danger`).

### Switch

```tsx
<Switch checked={menu.active} label={`Tampilkan ${menu.name}`} onChange={(active) => updateMenu(menu.id, { active })} />
```

`label` wajib karena tidak ada teks yang terlihat (nama aksesibel). Mendukung `disabled` dan `title`.

### EmptyState

`<EmptyState icon title description action />` untuk daftar atau halaman yang belum berisi.

### Breadcrumb dan ThemeToggle

`Breadcrumb` menerima `items: { label; href? }[]`. Breadcrumb di header dibuat otomatis oleh `layout/HeaderBreadcrumb`; halaman tidak perlu membuatnya sendiri. `ThemeToggle` adalah tombol light/dark (lihat [architecture.md](./architecture.md#tema-lightdark)).

### SearchableSelect

`options: { id; label; sublabel? }[]`, `value` (label terpilih), `onChange`, `placeholder`, `label?`, `required?`.

## `components/layout`

- **DashboardLayout**: sidebar, header, area konten, footer. Dirender **satu kali** di `app/(app)/layout.tsx`. Sidebar dibangun dari store menu dan role aktif (`sidebarFor`). Header: breadcrumb (kiri), pencarian global (tengah), tema dan notifikasi (kanan).
- **HeaderBreadcrumb**: menurunkan breadcrumb dari URL. Nama diambil dari menu di Settings; nama ruangan dari store; rute di luar menu memakai peta label kecil di file ini. Tambahkan label di `SEGMENT_LABELS` untuk rute baru yang tidak ada di sidebar.

## `components/dashboard`

`charts.tsx` berisi semua kode recharts (`InventoryStatusChart`, `CategoryReportChart`, `ServicePieChart`, `ReportStatusChart`). Dimuat lazy dengan `next/dynamic` di dashboard. Tambahkan grafik baru di sini, bukan langsung di halaman.

## `components/storage`

Lihat [storage-module.md](./storage-module.md): `ShelfViewer`, `shelf-builders`, `ShelfContents`, `RoomBuilderPanel`, `BuilderFields` (`Slider`, `ColorField`, `CoverToggles`), `ContainerPreview`.
