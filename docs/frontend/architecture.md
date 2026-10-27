# Arsitektur

## Stack

- **Next.js 16** (App Router, Turbopack) dan **React 19**
- **TypeScript** strict, alias `@/*` ke root repo
- **Tailwind CSS 4** dengan token warna di `app/globals.css` (`--background`, `--card`, `--border`, dll.)
- **three** untuk modul Storage 3D, **recharts** untuk grafik dashboard, **jspdf** + **jspdf-autotable** untuk ekspor PDF, **qrcode** untuk QR
- **@tabler/icons-react** untuk ikon, **react-hot-toast** untuk notifikasi singkat
- **Prisma** (`prisma/schema.prisma`) disiapkan untuk backend, belum dipakai oleh halaman

## Routing dan app shell

Semua halaman memakai route group, supaya sidebar dan header **dirender sekali** dan tidak dibuat ulang saat berpindah halaman.

```
app/
  layout.tsx            root: font, Toaster, skrip tema (mencegah kedipan)
  not-found.tsx         404 global
  (auth)/login/         halaman login, tanpa shell
  (print)/labeling/print/print-layout/   hasil cetak, tanpa shell
  (app)/                semua halaman dashboard
    layout.tsx          merender <DashboardLayout> satu kali
    loading.tsx         skeleton halaman saat navigasi
    error.tsx           error boundary dengan tombol "Coba lagi"
    not-found.tsx       404 di dalam shell
    page.tsx            dashboard
    inventory/ assets/ vendors/ users/ reports/ audit-trail/ notifications/ profile/
    labeling/ (qr, print)
    settings/ (umum, menu, role)
    storage/ ([roomId], wadah)
```

Aturan:

- Halaman baru untuk dashboard diletakkan di `app/(app)/...` dan **tidak** membungkus dirinya dengan `DashboardLayout`.
- Halaman tanpa sidebar (login, cetak) diletakkan di route group sendiri.
- Isi area konten bisa di-scroll sendiri (`<section>` di `DashboardLayout`); posisi scroll di-reset ke atas saat rute berubah.

## Struktur folder

```
components/
  ui/          komponen generik tanpa pengetahuan domain (Button, Modal, DataTable, ...)
  layout/      DashboardLayout, HeaderBreadcrumb
  dashboard/   grafik dashboard (recharts), dimuat lazy
  storage/     modul Storage 3D (viewer, builder, panel)
lib/
  theme.ts, use-hydrated.ts, use-initial-loading.ts   utilitas lintas fitur
  settings/    store menu dan role, peta ikon menu
  storage/     model rak, store ruangan dan wadah, pintu dan jendela, data contoh
  audit-trail.ts, search-data.ts, password.ts
types/         tipe bersama yang tidak milik satu modul (mis. labeling)
docs/frontend/ dokumentasi ini
```

Aturan arah ketergantungan: `app` boleh memakai `components` dan `lib`; `components/ui` tidak boleh mengimpor dari `lib/storage` atau `lib/settings`; `lib` tidak boleh mengimpor dari `components` kecuali tipe.

## State dan data

| Kebutuhan | Cara | Lokasi |
| --- | --- | --- |
| Data contoh halaman tabel | `useState` di halaman | `app/(app)/*/page.tsx` |
| Ruangan, rak, isi rak | store `localStorage` | `lib/storage/room-store.ts` |
| Jenis wadah | store `localStorage` | `lib/storage/container-store.ts` |
| Location group | store `localStorage` | `lib/storage/location-store.ts` |
| Menu, role, role aktif | store `localStorage` | `lib/settings/settings-store.ts` |
| Tema | store `localStorage` (`theme`) | `lib/theme.ts` |

Semua store memakai pola yang sama:

- Satu variabel `cache` di modul, di-load malas dari `localStorage`, diganti **immutable** pada setiap perubahan.
- `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`; snapshot server adalah data bawaan, sehingga render server dan hidrasi cocok.
- Fungsi perubahan (`addRoom`, `updateMenu`, ...) adalah fungsi biasa, bukan hook, jadi bisa dipanggil dari mana saja.

Kunci `localStorage`: `theme`, `inventra:storage-rooms:v1`, `inventra:containers:v1`, `inventra:storage-locations:v1`, `inventra:settings:v1`. Naikkan akhiran versi bila bentuk data berubah dan tambahkan migrasi.

### Membaca data browser dengan aman

`localStorage` tidak ada di server. Pakai `useHydrated()` (`lib/use-hydrated.ts`) sebelum menampilkan sesuatu yang bergantung pada data browser, dan tampilkan skeleton selagi `false`. Jangan memanggil `setState` di dalam `useEffect` hanya untuk menyalin data browser; gunakan store atau `useHydrated` + `useMemo`.

## Tema (light/dark)

- Kelas `dark` dipasang di `<html>`. Skrip kecil di `app/layout.tsx` menerapkannya **sebelum render pertama**, jadi tidak ada kedipan.
- `lib/theme.ts` memegang pilihan tema (`useTheme`, `setTheme`, `toggleTheme`). Tanpa pilihan tersimpan, tema mengikuti sistem operasi dan ikut berubah bila sistem berubah.
- Saat tema diganti, `<html>` diberi kelas `theme-switching` selama dua frame. Aturan di `globals.css` mematikan semua `transition` pada saat itu, sehingga seluruh halaman berganti dalam **satu kali paint** (tanpa fade ratusan elemen).
- `ThemeToggle` punya langganan sendiri, jadi hanya tombol itu yang dirender ulang.
- Warna dasar memakai token (`bg-background`, `bg-card`, `border-border`, `text-foreground`). Untuk komponen baru, utamakan token atau varian `dark:`; hindari menambah override global.

## Memuat data dan skeleton

- `DataTable` menerima `loading`; saat `true` ia menampilkan baris skeleton dengan header tetap. Pagination disembunyikan.
- Halaman tabel saat ini memakai `useInitialLoading()` (jeda singkat) sebagai pengganti status loading query. **Ganti** dengan flag loading dari lapisan data saat API tersedia.
- Tabel kustom memakai `TableSkeleton`; navigasi antar halaman memakai `app/(app)/loading.tsx` (`PageSkeleton`).

## Performa

- Pustaka berat dimuat **hanya saat dibutuhkan**: `jspdf` dan `jspdf-autotable` di dalam handler ekspor (`await import(...)`), `qrcode` di dalam handler generate, `recharts` lewat `next/dynamic` (`components/dashboard/charts.tsx`), `three` lewat `next/dynamic` di halaman ruangan.
- Sidebar dan header tidak dibuat ulang saat navigasi (app shell di route group).
- Pergantian tema tidak menjalankan transisi dan hanya merender ulang tombol tema.
- Hindari `transition-all` atau `transition-colors` pada kontainer besar; gunakan transisi hanya pada elemen kecil yang interaktif.
- Viewer 3D menyimpan material per warna, membuang geometri dan material saat dibongkar, dan memakai `ResizeObserver` alih-alih listener `window.resize`.
