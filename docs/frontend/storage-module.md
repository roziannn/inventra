# Modul Storage 3D

Halaman `/storage` (daftar ruangan), `/storage/[roomId]` (ruangan 3D), dan `/storage/wadah` (jenis wadah).

## Model data (`lib/storage`)

```
Room            { id, name, location, width, depth, openings: Opening[], shelves: ShelfData[] }   ukuran dalam meter
ShelfData       { id, name, levels, items: ShelfItem[], x, z, rotated, type, length, height, color,
                  coverTop?, coverBack?, coverSides?, tags? }
ShelfItem       { id, level, name, sku, qty, containerId? }       level 0 = tingkat paling bawah
Opening         { id, kind: "door" | "window", wall, offset, width }
ContainerType   { id, name, shape: "box" | "crate" | "cylinder", width, height, depth, color }
```

- Koordinat: pusat ruangan = (0, 0); `x` ke kanan, `z` ke depan; satuan meter. `rotated` memutar rak 90°.
- `wall`: `back` | `front` | `left` | `right`. `offset` = posisi tengah bukaan sepanjang dinding (0 = tengah dinding).
- `tags[level]` adalah teks tag kustom. Bila kosong dipakai kode otomatis `kodeRuangan.nomorRak.nomorTingkat` (mis. `01.02.03`), lihat `levelTag` di `shelf-model.ts`.
- `items` tidak menyimpan "persen terisi"; persen dihitung dari jumlah barang dibanding kapasitas (`fillPercent`).

### Jenis rak (`SHELF_TYPES`)

| Tipe | Label | Dalam | Panjang | Tinggi | Slot per tingkat |
| --- | --- | --- | --- | --- | --- |
| `standard` | Rak Standar | 0,7 | 1,6 | 2,2 | `floor(panjang / 0,55)` |
| `angle` | Rak Besi Siku | 0,5 | 3 | 2 | `floor(panjang / 0,55)` |
| `wire` | Rak Kawat | 0,5 | 1,2 | 1,8 | `floor(panjang / 0,55)` |
| `bin` | Rak Bin | 0,5 | 1,8 | 2 | `floor(panjang / 0,45)` |
| `cubby` | Rak Kubus | 0,4 | 1,6 | 1,8 | `round(panjang / 0,4)` |
| `cantilever` | Rak Cantilever | 1 | 3 | 2,5 | 4 |
| `pallet` | Rak Pallet | 0,9 | 3,6 | 3 | `round(panjang / 1,8)` |

Satu slot menampung satu barang beserta wadahnya. Tingkat yang penuh menolak barang baru.

## Location group

`Room.location` berisi nama sebuah *location group* (mis. gedung atau lantai). Grup dikelola di `/storage` lewat tombol **Location Group** (`GroupManagerModal`) dan disimpan di `lib/storage/location-store.ts` (`useLocationGroups`, `addLocationGroup`, `toggleLocationGroup`). Form ruangan memilih lokasi dari grup aktif, dan daftar ruangan bisa dicari dan difilter per lokasi. Grup yang dinonaktifkan tidak bisa dipilih untuk ruangan baru, tetapi ruangan lama tetap tampil di bawah grup itu.

## Store

- `room-store.ts`: `useRooms()`, `addRoom`, `updateRoom`, `removeRoom`. Halaman ruangan menyimpan `shelves`, `openings`, ukuran ke store setiap berubah.
- `location-store.ts`: `useLocationGroups()`, `addLocationGroup`, `toggleLocationGroup`.
- `container-store.ts`: `useContainers()`, `addContainerType`, `updateContainerType`, `removeContainerType`, `resetContainerTypes`.
- Data awal ada di `storage-data.ts` (`rooms`, `itemCatalog`) dan `shelf-model.ts` (`DEFAULT_CONTAINERS`).

## Halaman ruangan

`app/(app)/storage/[roomId]/page.tsx` memiliki dua lapis:

1. `RoomDetailPage` membaca ruangan dari store dan menunggu hidrasi (`useHydrated`); 404 bila tidak ada.
2. `RoomEditor` memegang state kerja. Inisialisasi dari `room`, lalu menyimpan balik lewat `updateRoom`.

**Mode** (tab di kanan atas): `view` (lihat dan cari), `rak` (Rak Builder), `ruangan` (Ruangan Builder). Panel kanan berganti sesuai mode.

**Riwayat undo/redo.** `history = { past, present: { shelves, openings }, future }`, maksimal 100 langkah. Semua perubahan lewat `setLayout`. Perubahan beruntun pada satu rak (slider, warna, nama) digabung memakai *batch key* supaya satu undo mengembalikan satu gerakan slider. Ukuran ruangan tidak masuk riwayat.

**Pintasan** (aktif di mode builder, tidak saat mengetik): `Delete`/`Backspace` hapus yang terpilih, `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` atau `Ctrl+Y` redo, `Ctrl/Cmd+D` duplikat rak.

**Aturan tata letak** (semua dicek sebelum perubahan diterima, lihat `tryUpdate`, `addShelf`, `duplicate`, `applySize`):

- rak tidak boleh keluar ruangan (`clampToRoom`)
- rak tidak boleh bertumpuk (`shelfsOverlap`)
- rak tidak boleh menghalangi area bebas di depan pintu (`blockedByDoor`, kedalaman area = lebar pintu)
- ukuran ruangan tidak boleh lebih kecil dari isinya; bukaan harus muat di dindingnya
- pintu dan jendela di satu dinding tidak boleh bertabrakan (`openingsCollide`)

Di viewer, rak yang melanggar aturan diberi warna merah selagi digeser; bila dilepas dalam keadaan melanggar, posisinya dikembalikan.

## Viewer (`components/storage/ShelfViewer.tsx`)

Komponen three.js tunggal. Props utama: `shelves`, `openings`, `containers`, `roomWidth/Depth`, `roomCode`, `mode`, `selectedId`, `selectedLevel`, `selectedOpeningId`, `highlights`, serta callback `onSelect`, `onSelectOpening`, `onMove`, `onMoveOpening`, `onBlocked`.

Cara kerja:

- Satu `useEffect` membangun scene dari props (dependensi: `shelves`, `openings`, `containers`, ukuran). Render loop memakai `requestAnimationFrame`; state interaksi (mode, pilihan, sorotan) dibaca dari **ref** sehingga berubah tanpa membangun ulang scene.
- Kamera orbit (drag area kosong), zoom (scroll atau tombol), jarak awal menyesuaikan ukuran ruangan dan lebar layar (`fitRadius`).
- **Memilih benda**: ray dites terhadap geometri nyata (papan, tiang, wadah, tag). Kotak bantu tak terlihat (area klik, pita sorotan, penanda lantai) diberi `userData.helper` dan diabaikan; bila yang kena hanya kotak rak, tingkat dihitung dari tinggi sinar saat melewati bidang tengah rak. Jangan menguji klik terhadap kotak pembungkus rak, karena sinar akan selalu masuk dari atas dan melaporkan tingkat teratas.
- Dinding dibangun per segmen dengan lubang untuk pintu dan jendela (`buildWalls`), dibangun ulang ringan saat bukaan digeser.
- Tag tingkat digambar ke `CanvasTexture`. Material wadah di-cache per warna dan semua geometri, tekstur, dan material dibuang di fungsi cleanup effect.
- Warna: tingkat terpilih terang dengan pita ungu; tingkat lain di rak yang sama diredupkan; hasil pencarian diberi pita kuning dan sisanya diredupkan; tabrakan merah.

### Menambah jenis rak

1. Tambahkan nilai di `ShelfType` dan entri di `SHELF_TYPES` (label, dalam, panjang, tinggi, warna) dan aturan slot di `levelSlots` (`lib/storage/shelf-model.ts`).
2. Tulis fungsi penggambar `function namaTipe(c: BuildContext)` di `components/storage/shelf-builders.ts` dan daftarkan di `SHELF_BUILDERS`. Fungsi menerima `add`, `addTag`, `levelMats`, `mats`, `addContainer`.
   - Gambar tiang dan papan memakai `levelMats[l]` untuk bagian yang berwarna kustom supaya peredupan dan warna tabrakan bekerja.
   - Tiap tingkat panggil `addTag(level, x, y, z)` dan `addContainer(item, x, baseY, z, maxW, maxH, maxD)` untuk tiap barang di tingkat itu.
   - Ketinggian papan harus jatuh di dalam pita tingkatnya, `[l * H/levels, (l+1) * H/levels)`, agar klik 3D memilih tingkat yang benar.
3. Opsional: beri contoh di `storage-data.ts`.
Dropdown jenis di panel builder terbentuk otomatis dari `SHELF_TYPES`.

## Wadah

Setiap barang punya `containerId`. `addContainer` di viewer menggambar sesuai bentuk (kardus dengan lakban, crate terbuka, drum silinder) dan **mengecilkan ukuran** agar muat di slot. Id yang tidak dikenal jatuh ke wadah pertama (`containerFor`). Wadah yang masih dipakai tidak bisa dihapus, dan minimal harus ada satu. `ContainerPreview` menggambar pratinjau isometrik (SVG) dari proporsi nyata wadah.
