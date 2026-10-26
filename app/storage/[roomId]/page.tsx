"use client";

import React, { useState, useRef, useEffect, use } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import ShelfContents from "@/components/ShelfContents";
import RoomBuilderPanel from "@/components/RoomBuilderPanel";
import { ColorField, CoverToggles, Slider, inputClass } from "@/components/BuilderFields";
import { blockedByDoor, clampToRoom, shelfsOverlap, SHELF_TYPES, type ShelfData, type ShelfType, type ViewerMode } from "@/components/ShelfViewer";
import { OPENING_KINDS, clampOffset, openingFits, openingsCollide, wallLength, WALL_IDS, type Opening, type OpeningKind } from "@/lib/room-openings";
import { itemCatalog, type Room } from "@/lib/storage-data";
import { updateRoom, useHydrated, useRooms } from "@/lib/room-store";
import { fillPercent, levelSlots, levelTag } from "@/lib/shelf-model";
import { IconPlus, IconRotate, IconTrash, IconTool, IconBuildingWarehouse, IconEye, IconArrowBackUp, IconArrowForwardUp, IconCopy, IconSearch, IconX } from "@tabler/icons-react";

const ShelfViewer = dynamic(() => import("@/components/ShelfViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

function findFreeSpot(draft: Pick<ShelfData, "rotated" | "length" | "type">, shelves: ShelfData[], openings: Opening[], width: number, depth: number) {
  for (let z = -depth / 2; z <= depth / 2; z += 0.5) {
    for (let x = -width / 2; x <= width / 2; x += 0.5) {
      const c = clampToRoom(x, z, draft, width, depth);
      if (!shelves.some((o) => shelfsOverlap({ ...draft, ...c }, o)) && !blockedByDoor({ ...draft, ...c }, openings, width, depth)) return c;
    }
  }
  return null;
}

interface Layout {
  shelves: ShelfData[];
  openings: Opening[];
}

const MODES: { id: ViewerMode; label: string; icon: typeof IconEye }[] = [
  { id: "view", label: "Lihat", icon: IconEye },
  { id: "rak", label: "Rak Builder", icon: IconTool },
  { id: "ruangan", label: "Ruangan Builder", icon: IconBuildingWarehouse },
];

const MIN_ROOM = 3;
const MAX_ROOM = 50;
const CONTINUOUS_FIELDS = ["name", "color", "length", "height", "levels"];
const MAX_HISTORY = 100;

const typeOptions = Object.keys(SHELF_TYPES) as ShelfType[];
function TypeSelect({ value, onChange }: { value: ShelfType; onChange: (t: ShelfType) => void }) {
  return (
    <select className={`${inputClass} flex-1`} value={value} onChange={(e) => onChange(e.target.value as ShelfType)}>
      {typeOptions.map((t) => (
        <option key={t} value={t}>
          {SHELF_TYPES[t].label}
        </option>
      ))}
    </select>
  );
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const rooms = useRooms();
  const hydrated = useHydrated();
  const room = rooms.find((r) => r.id === roomId);

  // rooms come from localStorage, which only exists in the browser
  if (!hydrated) {
    return (
      <DashboardLayout>
        <div className="h-[28rem] animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
      </DashboardLayout>
    );
  }
  if (!room) notFound();
  return <RoomEditor key={room.id} room={room} />;
}

function RoomEditor({ room }: { room: Room }) {
  const [history, setHistory] = useState<{ past: Layout[]; present: Layout; future: Layout[] }>({ past: [], present: { shelves: room?.shelves ?? [], openings: room?.openings ?? [] }, future: [] });
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selectedOpening, setSelectedOpening] = useState<string | null>(null);
  const batchKey = useRef<string | null>(null);
  const shelves = history.present.shelves;
  const openings = history.present.openings;
  const activeId = shelves.some((s) => s.id === selectedShelf) ? selectedShelf : null;
  const activeOpeningId = openings.some((o) => o.id === selectedOpening) ? selectedOpening : null;
  const [mode, setMode] = useState<ViewerMode>("view");
  const editMode = mode === "rak";
  const [showAdd, setShowAdd] = useState(false);
  const [size, setSize] = useState({ width: room?.width ?? 10, depth: room?.depth ?? 6 });
  const [sizeDraft, setSizeDraft] = useState({ width: String(room?.width ?? 10), depth: String(room?.depth ?? 6) });
  const nextId = useRef(0);
  const roomCode = (room?.id.replace(/\D/g, "").slice(-2) ?? "01").padStart(2, "0");
  const [draft, setDraft] = useState({ name: "", levels: 4, type: "standard" as ShelfType, coverTop: false, coverBack: false, coverSides: false, ...pick("standard") });

  function pick(type: ShelfType) {
    const { length, height, color } = SHELF_TYPES[type];
    return { length, height, color };
  }

  // every change goes through here so it lands on the undo stack; slider/color/name tweaks on one shelf merge into one step
  // keep the room in the store so it survives navigation and refresh
  useEffect(() => {
    if (shelves === room.shelves && openings === room.openings && size.width === room.width && size.depth === room.depth) return;
    updateRoom(room.id, { shelves, openings, width: size.width, depth: size.depth });
  }, [shelves, openings, size, room]);

  const setLayout = (fn: (prev: Layout) => Layout, key: string | null = null) => {
    const merge = key !== null && batchKey.current === key;
    batchKey.current = key;
    setHistory((h) => {
      const next = fn(h.present);
      if (next === h.present) return h;
      return { past: merge ? h.past : [...h.past, h.present].slice(-MAX_HISTORY), present: next, future: [] };
    });
  };
  const setShelves = (fn: (prev: ShelfData[]) => ShelfData[], key: string | null = null) =>
    setLayout((l) => {
      const next = fn(l.shelves);
      return next === l.shelves ? l : { ...l, shelves: next };
    }, key);
  const setOpenings = (fn: (prev: Opening[]) => Opening[], key: string | null = null) =>
    setLayout((l) => {
      const next = fn(l.openings);
      return next === l.openings ? l : { ...l, openings: next };
    }, key);
  const endBatch = () => {
    batchKey.current = null;
  };
  const undo = () => {
    batchKey.current = null;
    setHistory((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h));
  };
  const redo = () => {
    batchKey.current = null;
    setHistory((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));
  };

  const update = (id: string, patch: Partial<ShelfData>) => {
    const keys = Object.keys(patch);
    const continuous = keys.some((k) => CONTINUOUS_FIELDS.includes(k)) && keys.every((k) => CONTINUOUS_FIELDS.includes(k) || k === "x" || k === "z");
    setShelves((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)), continuous ? `${id}:${keys.filter((k) => k !== "x" && k !== "z").join(",")}` : null);
  };

  // apply a change to a shelf only if it still fits in the room and doesn't hit other shelves
  const tryUpdate = (s: ShelfData, patch: Partial<ShelfData>, errorMessage = "Perubahan ditolak, rak tidak muat atau menabrak rak lain") => {
    const next = { ...s, ...patch };
    const limit = next.rotated ? size.depth : size.width;
    const pos = clampToRoom(next.x, next.z, next, size.width, size.depth);
    if (next.length > limit - 0.1 || shelves.some((o) => o.id !== s.id && shelfsOverlap({ ...next, ...pos }, o)) || blockedByDoor({ ...next, ...pos }, openings, size.width, size.depth)) {
      toast.error(errorMessage);
      return;
    }
    update(s.id, { ...patch, ...pos });
  };

  const addShelf = () => {
    const place = { rotated: false, length: draft.length, type: draft.type };
    const spot = findFreeSpot(place, shelves, openings, size.width, size.depth);
    if (!spot) {
      toast.error("Tidak ada ruang kosong untuk rak baru");
      return;
    }
    nextId.current += 1;
    const id = `RK-new-${nextId.current}`;
    const name = draft.name.trim() || `Rak ${shelves.length + 1}`;
    setShelves((prev) => [...prev, { id, name, levels: draft.levels, items: [], ...spot, ...place, height: draft.height, color: draft.color, coverTop: draft.coverTop, coverBack: draft.coverBack, coverSides: draft.coverSides }]);
    setSelectedShelf(id);
    setDraft((d) => ({ ...d, name: "" }));
    setShowAdd(false);
  };

  const remove = (id: string) => {
    const name = shelves.find((s) => s.id === id)?.name;
    setShelves((prev) => prev.filter((s) => s.id !== id));
    setSelectedShelf(null);
    toast((t) => (
      <span className="flex items-center gap-3 text-xs">
        {name} dihapus
        <button
          className="font-bold text-violet-600"
          onClick={() => {
            undo();
            toast.dismiss(t.id);
          }}
        >
          Urungkan
        </button>
      </span>
    ));
  };

  const duplicate = (s: ShelfData) => {
    const depth = SHELF_TYPES[s.type].depth;
    const ex = s.rotated ? depth : s.length;
    const ez = s.rotated ? s.length : depth;
    const gap = 0.1;
    const candidates = [
      { x: s.x + ex + gap, z: s.z },
      { x: s.x - ex - gap, z: s.z },
      { x: s.x, z: s.z + ez + gap },
      { x: s.x, z: s.z - ez - gap },
    ];
    const fits = (c: { x: number; z: number }) => {
      const cl = clampToRoom(c.x, c.z, s, size.width, size.depth);
      return Math.abs(cl.x - c.x) < 1e-6 && Math.abs(cl.z - c.z) < 1e-6 && !shelves.some((o) => shelfsOverlap({ ...s, ...c }, o)) && !blockedByDoor({ ...s, ...c }, openings, size.width, size.depth);
    };
    const spot = candidates.find(fits) ?? findFreeSpot(s, shelves, openings, size.width, size.depth);
    if (!spot) {
      toast.error("Tidak ada ruang kosong untuk menduplikat rak");
      return;
    }
    nextId.current += 1;
    const id = `RK-new-${nextId.current}`;
    setShelves((prev) => [...prev, { ...s, id, name: `${s.name} (salinan)`, items: [], x: spot.x, z: spot.z }]);
    setSelectedShelf(id);
  };

  // item search: every stocked item whose name, SKU or level tag matches
  const q = query.trim().toLowerCase();
  const results = q
    ? shelves.flatMap((shelf, shelfIndex) =>
        shelf.items
          .filter((i) => i.level < shelf.levels)
          .map((item) => ({ shelf, shelfIndex, item, tag: levelTag(roomCode, shelfIndex, shelf, item.level) }))
          .filter(({ item, tag }) => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || tag.toLowerCase().includes(q)),
      )
    : [];
  const highlights = results.map(({ shelf, item }) => ({ id: shelf.id, level: item.level }));
  const focusResult = (shelfId: string, level: number) => {
    setSelectedShelf(shelfId);
    setSelectedLevel(level);
  };

  const addItem = (shelf: ShelfData, level: number, item: { name: string; sku: string }, qty: number) => {
    if (shelf.items.filter((i) => i.level === level).length >= levelSlots(shelf)) {
      toast.error(`Tingkat ${level + 1} sudah penuh`);
      return;
    }
    nextId.current += 1;
    const entry = { id: `${shelf.id}-new-${nextId.current}`, level, name: item.name, sku: item.sku, qty };
    setShelves((prev) => prev.map((s) => (s.id === shelf.id ? { ...s, items: [...s.items, entry] } : s)));
  };

  const setTag = (shelfId: string, level: number, text: string) =>
    setShelves((prev) => prev.map((s) => (s.id === shelfId ? { ...s, tags: { ...s.tags, [level]: text } } : s)), `${shelfId}:tag:${level}`);

  const removeItem = (shelfId: string, itemId: string) => {
    setShelves((prev) => prev.map((s) => (s.id === shelfId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s)));
  };

  const addOpening = (kind: OpeningKind) => {
    const spec = OPENING_KINDS[kind];
    const walls = kind === "door" ? WALL_IDS : [...WALL_IDS].reverse();
    for (const wall of walls) {
      const len = wallLength(wall, size.width, size.depth);
      const width = Math.min(spec.width, len - 0.2);
      if (width < spec.min) continue;
      const half = len / 2 - width / 2 - 0.1;
      for (let step = 0; step <= half * 2 + 1e-6; step += 0.25) {
        for (const off of step === 0 ? [0] : [step / 2, -step / 2]) {
          if (Math.abs(off) > half) continue;
          nextId.current += 1;
          const candidate: Opening = { id: `OP-new-${nextId.current}`, kind, wall, offset: Math.round(off * 4) / 4, width };
          if (openings.some((o) => openingsCollide(candidate, o))) continue;
          setOpenings((prev) => [...prev, candidate]);
          setSelectedOpening(candidate.id);
          return;
        }
      }
    }
    toast.error(`Tidak ada ruang di dinding untuk ${spec.label.toLowerCase()} baru`);
  };

  const updateOpening = (id: string, patch: Partial<Opening>) => {
    const current = openings.find((o) => o.id === id);
    if (!current) return;
    const merged = { ...current, ...patch };
    const next = { ...merged, offset: clampOffset(merged.offset, merged.width, merged.wall, size.width, size.depth) };
    if (!openingFits(next, size.width, size.depth) || openings.some((o) => openingsCollide(next, o))) {
      toast.error("Tidak muat di dinding itu atau menabrak pintu/jendela lain");
      return;
    }
    const continuous = "offset" in patch || "width" in patch;
    setOpenings((prev) => prev.map((o) => (o.id === id ? next : o)), continuous ? `${id}:opening` : null);
  };

  const removeOpening = (id: string) => {
    const spec = openings.find((o) => o.id === id);
    setOpenings((prev) => prev.filter((o) => o.id !== id));
    setSelectedOpening(null);
    toast((t) => (
      <span className="flex items-center gap-3 text-xs">
        {spec ? OPENING_KINDS[spec.kind].label : "Objek"} dihapus
        <button
          className="font-bold text-violet-600"
          onClick={() => {
            undo();
            toast.dismiss(t.id);
          }}
        >
          Urungkan
        </button>
      </span>
    ));
  };

  const removeRef = useRef(remove);
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  const duplicateRef = useRef(duplicate);
  const shelvesRef = useRef(shelves);
  const activeRef = useRef(activeId);
  const modeRef = useRef(mode);
  const activeOpeningRef = useRef(activeOpeningId);
  const removeOpeningRef = useRef(removeOpening);
  useEffect(() => {
    removeRef.current = remove;
    undoRef.current = undo;
    redoRef.current = redo;
    duplicateRef.current = duplicate;
    shelvesRef.current = shelves;
    activeRef.current = activeId;
    modeRef.current = mode;
    activeOpeningRef.current = activeOpeningId;
    removeOpeningRef.current = removeOpening;
  });

  // keyboard: Delete removes the selected shelf, Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo
  useEffect(() => {
    if (mode === "view") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el.tagName === "INPUT" && !["range", "color", "checkbox"].includes((el as HTMLInputElement).type))) return;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if ((e.key === "Delete" || e.key === "Backspace") && modeRef.current === "ruangan" && activeOpeningRef.current) {
        e.preventDefault();
        removeOpeningRef.current(activeOpeningRef.current);
      } else if ((e.key === "Delete" || e.key === "Backspace") && modeRef.current === "rak" && activeRef.current) {
        e.preventDefault();
        removeRef.current(activeRef.current);
      } else if (mod && k === "d" && modeRef.current === "rak" && activeRef.current) {
        e.preventDefault();
        const target = shelvesRef.current.find((x) => x.id === activeRef.current);
        if (target) duplicateRef.current(target);
      } else if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redoRef.current();
        else undoRef.current();
      } else if (mod && k === "y") {
        e.preventDefault();
        redoRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const applySize = () => {
    const width = Number(sizeDraft.width.replace(",", "."));
    const depth = Number(sizeDraft.depth.replace(",", "."));
    const reset = () => setSizeDraft({ width: String(size.width), depth: String(size.depth) });
    if (!Number.isFinite(width) || !Number.isFinite(depth) || width < MIN_ROOM || depth < MIN_ROOM || width > MAX_ROOM || depth > MAX_ROOM) {
      toast.error(`Ukuran ruangan harus antara ${MIN_ROOM} - ${MAX_ROOM} meter`);
      reset();
      return;
    }
    const fits = shelves.every((s) => {
      const c = clampToRoom(s.x, s.z, s, width, depth);
      return Math.abs(c.x - s.x) < 1e-6 && Math.abs(c.z - s.z) < 1e-6 && s.length <= (s.rotated ? depth : width);
    });
    if (!fits) {
      toast.error("Ukuran terlalu kecil, ada rak yang berada di luar ruangan. Geser atau kecilkan rak dulu.");
      reset();
      return;
    }
    if (!openings.every((o) => openingFits(o, width, depth))) {
      toast.error("Ukuran terlalu kecil, ada pintu atau jendela yang tidak muat di dindingnya.");
      reset();
      return;
    }
    // keep every opening inside its wall and every shelf out of the (possibly moved) door areas
    const movedOpenings = openings.map((o) => ({ ...o, offset: clampOffset(o.offset, o.width, o.wall, width, depth) }));
    if (shelves.some((sh) => blockedByDoor(sh, movedOpenings, width, depth))) {
      toast.error("Ukuran ini membuat rak menghalangi area pintu. Geser rak dulu.");
      reset();
      return;
    }
    if (movedOpenings.some((o, i) => o.offset !== openings[i].offset)) setOpenings(() => movedOpenings);
    setSize({ width, depth });
    setSizeDraft({ width: String(width), depth: String(depth) });
  };

  const maxLength = Math.max(1, Math.floor(Math.min(size.width, size.depth) * 10 - 1) / 10);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Storage", href: "/storage" }, { label: room.name }]} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{room.name}</h2>
            <p className="text-xs text-gray-500 font-medium">
              {room.location} · {size.width} x {size.depth} m
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {mode !== "view" && (
              <>
                <Button variant="page-secondary" onClick={undo} disabled={!history.past.length} title="Undo (Ctrl+Z)" aria-label="Undo">
                  <IconArrowBackUp size={16} />
                </Button>
                <Button variant="page-secondary" onClick={redo} disabled={!history.future.length} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">
                  <IconArrowForwardUp size={16} />
                </Button>
              </>
            )}
            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/8" role="tablist" aria-label="Mode">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => setMode(id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    mode === id ? "bg-white text-violet-700 shadow-sm dark:bg-zinc-800 dark:text-violet-300" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:h-[calc(100vh-14rem)] lg:min-h-[28rem] lg:flex-row">
          <div className="relative h-96 min-w-0 lg:h-full lg:flex-1">
            <ShelfViewer
              shelves={shelves}
              openings={openings}
              roomWidth={size.width}
              roomDepth={size.depth}
              roomCode={roomCode}
              selectedId={activeId}
              selectedOpeningId={activeOpeningId}
              mode={mode}
              selectedLevel={activeId ? selectedLevel : null}
              highlights={highlights}
              onSelect={(id, level) => {
                setSelectedShelf(id);
                setSelectedLevel(level ?? null);
              }}
              onSelectOpening={setSelectedOpening}
              onMoveOpening={(id, wall, offset) => updateOpening(id, { wall, offset })}
              onMove={(id, x, z) => update(id, { x, z })}
              onBlocked={() => toast.error("Rak menabrak rak lain atau menghalangi pintu, posisi dikembalikan")}
            />
            <p className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 text-[11px] text-gray-500 dark:bg-zinc-900/70">
              {mode === "rak"
                ? "Drag rak untuk menggeser · Delete hapus · Ctrl+Z undo · Ctrl+D duplikat"
                : mode === "ruangan"
                  ? "Drag pintu/jendela di dinding untuk memindah · Delete hapus · Ctrl+Z undo"
                  : "Drag untuk memutar · scroll untuk zoom · klik rak untuk detail"}
            </p>
          </div>

          <aside onPointerUp={endBatch} onBlurCapture={endBatch} className="flex min-h-0 flex-col gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 lg:w-80 dark:border-gray-100/10 dark:bg-white/6">
            {mode === "ruangan" ? (
              <RoomBuilderPanel
                size={size}
                sizeDraft={sizeDraft}
                minSize={MIN_ROOM}
                maxSize={MAX_ROOM}
                onSizeDraftChange={(key, value) => setSizeDraft((d) => ({ ...d, [key]: value }))}
                onApplySize={applySize}
                openings={openings}
                selectedId={activeOpeningId}
                onSelect={setSelectedOpening}
                onAdd={addOpening}
                onUpdate={updateOpening}
                onRemove={removeOpening}
              />
            ) : (
              <>
                <div className="relative">
                  <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Cari barang, SKU, atau tag..."
                    className={`${inputClass} !pl-8 !pr-8`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setQuery("");
                      if (e.key === "Enter" && results[0]) focusResult(results[0].shelf.id, results[0].item.level);
                    }}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-700">
                      <IconX size={14} />
                    </button>
                  )}
                </div>

                {q && (
                  <div className="flex flex-col gap-1 rounded-lg bg-amber-50 p-2 dark:bg-amber-500/10">
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200">{results.length ? `${results.length} barang ditemukan` : "Barang tidak ditemukan di ruangan ini"}</p>
                    <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
                      {results.map(({ shelf, shelfIndex, item, tag }) => (
                        <button
                          key={`${shelf.id}:${item.id}`}
                          onClick={() => focusResult(shelf.id, item.level)}
                          className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-left hover:ring-1 hover:ring-amber-400 dark:bg-white/6"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-gray-900">{item.name}</span>
                            <span className="block truncate text-[10px] text-gray-500">
                              {shelf.name || `Rak ${shelfIndex + 1}`} · Tingkat {item.level + 1} · {tag}
                            </span>
                          </span>
                          <span className="text-[11px] font-bold text-gray-700">×{item.qty}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-900">Rak ({shelves.length})</p>
              {editMode && (
                <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-violet-700">
                  <IconPlus size={14} stroke={3} /> {showAdd ? "Tutup" : "Tambah"}
                </button>
              )}
            </div>

            {editMode && showAdd && (
              <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                <TypeSelect
                  value={draft.type}
                  onChange={(type) => setDraft((d) => ({ ...d, type, ...pick(type), length: Math.min(pick(type).length, maxLength) }))}
                />
                <div className="flex gap-2">
                  <input className={inputClass} placeholder={`Rak ${shelves.length + 1}`} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                  <ColorField value={draft.color} onChange={(color) => setDraft((d) => ({ ...d, color }))} />
                </div>
                <div className="flex gap-3">
                  <Slider label="Panjang" value={draft.length} min={0.8} max={maxLength} onChange={(length) => setDraft((d) => ({ ...d, length }))} />
                  <Slider label="Tinggi" value={draft.height} min={1} max={5} onChange={(height) => setDraft((d) => ({ ...d, height }))} />
                </div>
                <label className="flex items-center justify-between text-[11px] text-gray-500">
                  Jumlah tingkat
                  <input type="number" min={1} max={8} className={`${inputClass} !w-16 !py-1`} value={draft.levels} onChange={(e) => setDraft((d) => ({ ...d, levels: Math.max(1, Math.min(8, Number(e.target.value) || 1)) }))} />
                </label>
                <CoverToggles value={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
                <Button variant="modal-primary" onClick={addShelf}>
                  Tambah ke ruangan
                </Button>
              </div>
            )}

            {shelves.map((s, shelfIndex) => {
              const isSelected = s.id === activeId;
              return (
                <div key={s.id} className={`rounded-lg border transition-all ${isSelected ? "border-violet-600 bg-violet-50/60 dark:bg-violet-500/12" : "border-gray-200 dark:border-gray-100/10"}`}>
                  <button onClick={() => {
                      setSelectedShelf(isSelected ? null : s.id);
                      setSelectedLevel(isSelected ? null : 0);
                    }} className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
                    <span className="h-3 w-3 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-gray-900">{s.name}</span>
                      <span className="block truncate text-[11px] text-gray-500">
                        {SHELF_TYPES[s.type].label} · {s.length.toFixed(1)} x {s.height.toFixed(1)} m
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">{fillPercent(s)}%</span>
                  </button>

                  {isSelected && (
                    <div className="border-t border-violet-200 p-2.5 dark:border-violet-500/20">
                      <ShelfContents
                        shelf={s}
                        shelfIndex={shelfIndex}
                        roomCode={roomCode}
                        level={selectedLevel !== null && selectedLevel < s.levels ? selectedLevel : null}
                        onLevel={setSelectedLevel}
                        catalog={itemCatalog}
                        editable={editMode}
                        onAdd={(level, item, qty) => addItem(s, level, item, qty)}
                        onRemove={(itemId) => removeItem(s.id, itemId)}
                        onTag={(level, text) => setTag(s.id, level, text)}
                      />
                    </div>
                  )}

                  {isSelected && editMode && (
                    <div className="flex flex-col gap-2 border-t border-violet-200 p-2.5 dark:border-violet-500/20">
                      <TypeSelect value={s.type} onChange={(type) => tryUpdate(s, { type, ...pick(type) })} />
                      <div className="flex gap-2">
                        <input className={inputClass} value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
                        <ColorField value={s.color} onChange={(color) => update(s.id, { color })} />
                      </div>
                      <div className="flex gap-3">
                        <Slider label="Panjang" value={s.length} min={0.8} max={maxLength} onChange={(length) => tryUpdate(s, { length }, "Panjang ditolak, rak akan menabrak atau keluar ruangan")} />
                        <Slider label="Tinggi" value={s.height} min={1} max={5} onChange={(height) => update(s.id, { height })} />
                      </div>
                      <label className="flex items-center justify-between text-[11px] text-gray-500">
                        Jumlah tingkat
                        <input
                          type="number"
                          min={1}
                          max={8}
                          className={`${inputClass} !w-16 !py-1`}
                          value={s.levels}
                          onChange={(e) => update(s.id, { levels: Math.max(1, Math.min(8, Number(e.target.value) || 1)) })}
                        />
                      </label>
                      <CoverToggles value={s} onChange={(patch) => update(s.id, patch)} />
                      <div className="flex gap-2">
                        <Button variant="modal-secondary" className="min-w-0 flex-1 !min-h-8 !px-2 !py-1.5" onClick={() => tryUpdate(s, { rotated: !s.rotated }, "Tidak bisa diputar, rak akan menabrak atau keluar ruangan")}>
                          <IconRotate size={14} /> Putar
                        </Button>
                        <Button variant="modal-secondary" className="min-w-0 flex-1 !min-h-8 !px-2 !py-1.5" onClick={() => duplicate(s)} title="Duplikat (Ctrl+D)">
                          <IconCopy size={14} /> Duplikat
                        </Button>
                        <Button variant="modal-danger" className="min-w-0 flex-1 !min-h-8 !px-2 !py-1.5" onClick={() => remove(s.id)}>
                          <IconTrash size={14} /> Hapus
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {shelves.length === 0 && <p className="text-[11px] text-gray-400">Belum ada rak. Aktifkan Rak Builder untuk menambah.</p>}
              </>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
