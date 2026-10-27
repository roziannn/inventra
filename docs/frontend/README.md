# Inventra frontend

Dokumentasi frontend Inventra (Next.js App Router, React 19, TypeScript, Tailwind CSS 4).

| Dokumen | Isi |
| --- | --- |
| [architecture.md](./architecture.md) | Stack, routing dan app shell, struktur folder, state, tema, performa |
| [components.md](./components.md) | Katalog komponen (`ui/`, `layout/`, `dashboard/`, `storage/`) beserta props dan contoh |
| [conventions.md](./conventions.md) | Standar kode, penamaan, tipe, aksesibilitas, copy, checklist review |
| [storage-module.md](./storage-module.md) | Modul Storage 3D: model data, viewer, builder rak, pintu dan jendela, wadah |
| [recipes.md](./recipes.md) | Langkah praktis: menambah halaman, tabel, menu, jenis rak, menyambung API |

## Menjalankan

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Server pengembangan (Turbopack) |
| `pnpm build` / `pnpm start` | Build produksi dan menjalankannya |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`eslint-config-next`) |
| `pnpm format` / `pnpm format:check` | Prettier (lebar baris 200, lihat `.prettierrc.json`) |

Sebelum membuat pull request, `pnpm typecheck`, `pnpm lint`, dan `pnpm format:check` harus bersih.

## Status data

Frontend saat ini berjalan **tanpa backend**. Data halaman (inventory, assets, vendors, users, reports, audit trail) adalah data contoh di dalam file halaman. Data yang bisa diubah pengguna (ruangan, rak, wadah, menu, role, tema) disimpan di `localStorage` melalui store di `lib/`. Lihat [architecture.md](./architecture.md#state-dan-data) dan [recipes.md](./recipes.md#menyambung-ke-api).
