# Resep

## Menambah halaman dashboard

1. Buat `app/(app)/nama-halaman/page.tsx`. Jangan membungkus dengan `DashboardLayout`; shell sudah ada di `app/(app)/layout.tsx`.
2. Mulai dengan `PageHeader` (judul, deskripsi, aksi).
3. Tambahkan skeleton untuk data yang dimuat (lihat di bawah) dan `EmptyState` untuk keadaan kosong.
4. Pasang hak akses: `const perm = usePermissions("/path-menu")`, lalu sembunyikan tombol tambah (`perm.create`), kolom Aksi dan tombol ubah (`perm.edit`), dan tombol hapus (`perm.delete`). Lihat [architecture.md](./architecture.md#menu-role-dan-hak-akses).
5. Daftarkan menu: tambahkan item di `seedMenus` (`lib/settings/settings-store.ts`) dengan ikon dari `lib/settings/menu-icons.ts`, dan beri hak akses di `seedRoles`. Pengguna yang sudah punya data tersimpan bisa memakai **Settings > Menu > Reset Default**, atau menambah menu lewat UI.
6. Rute yang tidak ada di sidebar: tambahkan label di `SEGMENT_LABELS` (`components/layout/HeaderBreadcrumb.tsx`).

## Menambah tabel

```tsx
"use client";

type Vendor = (typeof initialVendors)[number];

export default function VendorsPage() {
  const loading = useInitialLoading();                // ganti dengan status loading dari API
  const columns = [
    { header: "Nama", accessor: (v: Vendor) => <span className="block max-w-72 truncate font-bold">{v.name}</span> },
    { header: "Email", accessor: (v: Vendor) => <span className="block max-w-64 truncate text-sm">{v.email}</span> },
    { header: "Status", accessor: (v: Vendor) => <Badge tone={v.status === "Active" ? "success" : "danger"}>{v.status}</Badge> },
  ];
  return <DataTable data={vendors} columns={columns} loading={loading} pageSize={10} density="dense" />;
}
```

Aturan: satu baris per data, satu informasi per kolom, kolom Aksi di paling kanan, header sentence case.

## Menambah store `localStorage`

Salin pola `lib/storage/container-store.ts`: `KEY` berversi, `cache`, `load()` malas dengan `try/catch`, `commit()` yang menyimpan dan memberi tahu pendengar, `subscribe`, dan `useX()` berbasis `useSyncExternalStore` dengan snapshot server berupa data bawaan. Perubahan selalu immutable. Di komponen, tampilkan skeleton selagi `useHydrated()` bernilai `false`.

## Menambah komponen `ui`

1. Taruh di `components/ui/NamaKomponen.tsx`; tanpa impor dari `lib/storage` atau `lib/settings`.
2. Props bertipe jelas; `className` hanya bila memang perlu; sertakan nama aksesibel untuk kontrol tanpa teks.
3. Dukung light dan dark lewat token atau `dark:`.
4. Dokumentasikan di [components.md](./components.md) dengan satu contoh pemakaian.
5. Ganti implementasi kembar yang ada di halaman dengan komponen baru.

## Menyambung ke API

Saat backend tersedia:

1. Buat lapisan data per domain (mis. `lib/api/vendors.ts` dan hook `useVendors()`), kembalikan `{ data, isLoading, error }`. Server Components atau route handler Next.js bisa dipakai; sesuaikan dengan kebutuhan interaktivitas halaman.
2. Ganti `useState(initialX)` di halaman dengan hook itu dan teruskan `isLoading` ke `DataTable loading`. Hapus `useInitialLoading`.
3. Pindahkan data contoh ke `prisma/seed.js` dan tambahkan model Prisma yang diperlukan. Tipe baris tabel diambil dari tipe API, bukan dari data contoh.
4. Store `localStorage` (ruangan, wadah, menu, role) diganti satu per satu dengan hook data yang sama bentuknya (`useRooms()`, `useContainers()`, `useSettings()`), sehingga komponen pemakainya tidak berubah.
5. Hak akses: UI sudah menegakkan Lihat, Tambah, Ubah, dan Hapus (sidebar, akses halaman, dan tombol). Tegakkan hak yang sama di server (middleware dan pengecekan di setiap API); UI hanya mencerminkannya.

## Debug cepat

- **Layar kosong atau tidak berubah setelah mengganti data contoh**: data tersimpan di `localStorage` menimpa data awal. Hapus kunci `inventra:*` di DevTools, atau pakai tombol Reset Default di halaman terkait.
- **Hydration mismatch**: ada pembacaan `localStorage`, `window`, atau `Date.now()` saat render. Pindahkan ke store atau gate dengan `useHydrated()`.
- **Dev server macet atau panik setelah memindah banyak file**: hentikan prosesnya, hapus `.next`, jalankan lagi.
