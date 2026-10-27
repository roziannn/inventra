# Konvensi

## Kode

- **TypeScript ketat, tanpa `any`.** Tipe baris tabel diturunkan dari datanya: `type User = (typeof initialUsers)[number]` lalu `(item: User) => ...`. Bila benar-benar tak terhindarkan, beri komentar `eslint-disable-next-line` dengan alasan.
- **Server vs client.** Default komponen server. Tambahkan `"use client"` hanya bila memakai state, efek, atau API browser. `layout.tsx`, `loading.tsx`, `not-found.tsx` tetap server bila bisa.
- **Efek.** Jangan `setState` sinkron di dalam `useEffect` untuk menyalin data. Pakai `useSyncExternalStore` (store), `useMemo`, atau `useHydrated`.
- **Hook kustom** diawali `use`, satu tanggung jawab, di `lib/`.
- **Impor.** Alias `@/` untuk lintas folder, urutan: pustaka, `@/components`, `@/lib`, `@/types`. Tanpa impor relatif yang naik folder (`../`).
- **Pustaka berat** (`jspdf`, `qrcode`, `recharts`, `three`) tidak diimpor statis di halaman. Lihat [architecture.md](./architecture.md#performa).
- **Format.** Prettier (`pnpm format`). Jangan mengatur gaya manual.

## Penamaan

| Hal | Aturan | Contoh |
| --- | --- | --- |
| Komponen | `PascalCase.tsx`, satu komponen utama per file | `ConfirmDialog.tsx` |
| Hook dan util | `kebab-case.ts` | `use-hydrated.ts`, `room-store.ts` |
| Store | `*-store.ts` berisi hook baca (`useX`) dan fungsi ubah (`addX`, `updateX`, `removeX`) | `room-store.ts` |
| Tipe | `PascalCase`, tanpa awalan `I` | `ShelfData` |
| Rute | `kebab-case` bahasa yang dipakai di UI | `audit-trail`, `wadah` |

## Tampilan dan copy

- **Bahasa:** Indonesia untuk teks antarmuka. Istilah teknis yang sudah umum (Inventory, Assets, Audit trail) dibiarkan.
- **Huruf kapital:** hanya huruf pertama (sentence case) untuk label, judul kolom, tombol, dan badge: "Kata sandi saat ini", bukan "KATA SANDI SAAT INI" atau "Kata Sandi Saat Ini". Jangan memakai `uppercase` atau letter-spacing lebar. Pengecualian: logo, kode (ID, SKU), dan hasil cetak.
- **Tabel:** satu baris per data, satu informasi per kolom (lihat [components.md](./components.md#datatable)).
- **Halaman:** rata kiri dan lebar penuh. Jangan memakai `mx-auto max-w-*` di pembungkus halaman.
- **Judul halaman** lewat `PageHeader`. **Breadcrumb** otomatis dari header.
- **Aksi destruktif** lewat `ConfirmDialog`.
- **Umpan balik:** `toast.success` untuk berhasil, `toast.error` dengan alasan dan langkah berikutnya untuk gagal.
- **Keadaan kosong, memuat, dan error** selalu ada: `EmptyState`, skeleton, `error.tsx`.

## Aksesibilitas

- Tombol berisi ikon saja wajib punya `aria-label`.
- Kontrol kustom memakai peran yang benar (`role="switch"` + `aria-checked`, `role="tab"` + `aria-selected`).
- Semua input punya label (`FormLabel`/`htmlFor` atau `aria-label`).
- Pintasan keyboard tidak boleh aktif saat fokus ada di kolom teks, `select`, atau `textarea`.
- Jangan mengandalkan warna saja untuk status; sertakan teks atau ikon (lihat `Badge`).

## Gaya

- Utamakan token warna dan varian `dark:` (lihat [tema](./architecture.md#tema-lightdark)). Jangan menambah override `.dark .bg-*` global.
- Transisi hanya pada elemen kecil interaktif (`transition-colors`, `active:scale-95`). Tidak ada `transition` di kontainer besar.
- Utilitas Tailwind di JSX; gaya yang dipakai berulang menjadi komponen di `components/ui`, bukan konstanta kelas yang disalin antar file.

## Checklist review

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check` bersih
- [ ] Tidak ada `any`, `console.log`, atau kode mati
- [ ] Halaman dengan tabel: `loading` terhubung, kolom satu baris, keadaan kosong ada
- [ ] Aksi hapus memakai `ConfirmDialog`
- [ ] Label sentence case, teks Indonesia konsisten
- [ ] Terlihat benar di light dan dark, di lebar 375, 768, dan 1440
- [ ] Pustaka berat tidak ikut bundle awal
- [ ] Komponen baru yang generik ditaruh di `components/ui` dan didokumentasikan di [components.md](./components.md)
