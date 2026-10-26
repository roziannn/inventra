"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { OPENING_KINDS, clampOffset, doorClearances, openingsCollide, wallLength, type Opening, type Rect, type WallId } from "@/lib/room-openings";

import { SHELF_TYPES, itemsAtLevel, levelSlots, levelTag, type ShelfData } from "@/lib/shelf-model";

export { SHELF_TYPES, defaultLevelTag, fillPercent, itemsAtLevel, levelSlots, levelTag } from "@/lib/shelf-model";
export type { ShelfData, ShelfItem, ShelfType } from "@/lib/shelf-model";

export type ShelfPlace = Pick<ShelfData, "x" | "z" | "rotated" | "length" | "type">;

export type ViewerMode = "view" | "rak" | "ruangan";

interface ShelfViewerProps {
  shelves: ShelfData[];
  openings: Opening[];
  roomWidth: number;
  roomDepth: number;
  roomCode: string;
  selectedId: string | null;
  selectedOpeningId: string | null;
  mode: ViewerMode;
  selectedLevel: number | null;
  onSelect: (id: string | null, level?: number | null) => void;
  onSelectOpening: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onMoveOpening: (id: string, wall: WallId, offset: number) => void;
  onBlocked?: () => void;
}

const WALL_H = 2.6;
const WALL_T = 0.12;

function halfExtents(s: Pick<ShelfData, "rotated" | "length" | "type">) {
  const hl = s.length / 2;
  const hd = SHELF_TYPES[s.type].depth / 2;
  return { hx: s.rotated ? hd : hl, hz: s.rotated ? hl : hd };
}

export function clampToRoom(x: number, z: number, s: Pick<ShelfData, "rotated" | "length" | "type">, roomWidth: number, roomDepth: number) {
  const { hx, hz } = halfExtents(s);
  return {
    x: Math.max(-roomWidth / 2 + hx, Math.min(roomWidth / 2 - hx, x)),
    z: Math.max(-roomDepth / 2 + hz, Math.min(roomDepth / 2 - hz, z)),
  };
}

export function shelfsOverlap(a: ShelfPlace, b: ShelfPlace) {
  const ea = halfExtents(a);
  const eb = halfExtents(b);
  return Math.abs(a.x - b.x) < ea.hx + eb.hx - 1e-6 && Math.abs(a.z - b.z) < ea.hz + eb.hz - 1e-6;
}

function hitsRect(s: ShelfPlace, r: Rect) {
  const { hx, hz } = halfExtents(s);
  return Math.abs(s.x - r.cx) < hx + r.hx - 1e-6 && Math.abs(s.z - r.cz) < hz + r.hz - 1e-6;
}

/** true when the shelf stands in the clear area in front of a door */
export function blockedByDoor(s: ShelfPlace, openings: Opening[], roomWidth: number, roomDepth: number) {
  return doorClearances(openings, roomWidth, roomDepth).some((r) => hitsRect(s, r));
}

export default function ShelfViewer({ shelves, openings, roomWidth, roomDepth, roomCode, selectedId, selectedOpeningId, selectedLevel, mode, onSelect, onSelectOpening, onMove, onMoveOpening, onBlocked }: ShelfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const modeRef = useRef(mode);
  const selectedOpeningRef = useRef(selectedOpeningId);
  const onSelectOpeningRef = useRef(onSelectOpening);
  const onMoveOpeningRef = useRef(onMoveOpening);
  const selectedLevelRef = useRef(selectedLevel);
  const onSelectRef = useRef(onSelect);
  const onMoveRef = useRef(onMove);
  const onBlockedRef = useRef(onBlocked);
  const yawRef = useRef(0);
  const pitchRef = useRef(1.0);
  const zoomRef = useRef(1);
  const zoomBy = (factor: number) => {
    zoomRef.current = Math.max(0.3, Math.min(2, zoomRef.current * factor));
  };

  useEffect(() => {
    selectedRef.current = selectedId;
    modeRef.current = mode;
    selectedOpeningRef.current = selectedOpeningId;
    onSelectOpeningRef.current = onSelectOpening;
    onMoveOpeningRef.current = onMoveOpening;
    selectedLevelRef.current = selectedLevel;
    onSelectRef.current = onSelect;
    onMoveRef.current = onMove;
    onBlockedRef.current = onBlocked;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.6);
    dir.position.set(4, 8, 6);
    scene.add(dir);

    const geoms: THREE.BufferGeometry[] = [];
    const box = (w: number, h: number, d: number) => {
      const g = new THREE.BoxGeometry(w, h, d);
      geoms.push(g);
      return g;
    };

    // room floor
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
    const floor = new THREE.Mesh(box(roomWidth, 0.04, roomDepth), floorMat);
    floor.position.y = -0.02;
    scene.add(floor);

    const gridPts: number[] = [];
    for (let x = -roomWidth / 2; x <= roomWidth / 2 + 1e-6; x += 1) gridPts.push(x, 0, -roomDepth / 2, x, 0, roomDepth / 2);
    for (let z = -roomDepth / 2; z <= roomDepth / 2 + 1e-6; z += 1) gridPts.push(-roomWidth / 2, 0, z, roomWidth / 2, 0, z);
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3)), new THREE.LineBasicMaterial({ color: 0xcbd5e1 }));
    grid.position.y = 0.005;
    scene.add(grid);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x52525b });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x1e40af });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xc99a5b });
    const selectedFloorMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.35, depthWrite: false });
    const beamMats: THREE.MeshStandardMaterial[] = [];
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd4a373 });
    const dangerFloorMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55, depthWrite: false });
    const bandMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.32, depthWrite: false });
    const bandEdgeMat = new THREE.LineBasicMaterial({ color: 0x0e7490, depthTest: false, transparent: true });
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const groups: { id: string; group: THREE.Group; shelf: ShelfData; beamMat: THREE.MeshStandardMaterial; danger: THREE.Mesh; sel: THREE.Mesh; band: THREE.Mesh }[] = [];
    const placeOf = (g: (typeof groups)[number]): ShelfPlace => ({ x: g.group.position.x, z: g.group.position.z, rotated: g.shelf.rotated, length: g.shelf.length, type: g.shelf.type });

    // purple location tag, drawn on a canvas so the code is readable in 3D
    const tagGeo = new THREE.PlaneGeometry(0.52, 0.228);
    const textures: THREE.Texture[] = [];
    const tagMats: THREE.Material[] = [];
    const makeTag = (text: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 112;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#b9a3f0";
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 104, 14);
        ctx.fill();
        ctx.strokeStyle = "#8b6fd8";
        ctx.lineWidth = 6;
        ctx.stroke();
        let size = 54;
        ctx.font = `700 ${size}px sans-serif`;
        while (ctx.measureText(text).width > 220 && size > 18) {
          size -= 2;
          ctx.font = `700 ${size}px sans-serif`;
        }
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 128, 58);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      textures.push(tex);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
      tagMats.push(mat);
      return mat;
    };

    shelves.forEach((shelf, shelfIndex) => {
      const group = new THREE.Group();
      group.position.set(shelf.x, 0, shelf.z);
      group.rotation.y = shelf.rotated ? Math.PI / 2 : 0;
      group.userData.id = shelf.id;

      const W = shelf.length;
      const H = shelf.height;
      const D = SHELF_TYPES[shelf.type].depth;
      const beamMat = new THREE.MeshStandardMaterial({ color: shelf.color });
      beamMats.push(beamMat);
      const add = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
        const m = new THREE.Mesh(box(w, h, d), mat);
        m.position.set(x, y, z);
        group.add(m);
        return m;
      };
      const addTag = (text: string, x: number, y: number, z: number) => {
        const m = new THREE.Mesh(tagGeo, makeTag(text));
        m.position.set(x, y, z);
        group.add(m);
      };

      if (shelf.type === "standard") {
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(0.06, H, 0.06, frameMat, (sx * W) / 2, H / 2, (sz * D) / 2);
        const step = H / shelf.levels;
        const perLevel = levelSlots(shelf);
        for (let l = 0; l < shelf.levels; l++) {
          add(W, 0.05, D, beamMat, 0, l * step + 0.03, 0);
          addTag(levelTag(roomCode, shelfIndex, shelf, l), -W / 2 + 0.38, l * step + 0.08, D / 2 + 0.012);
          const count = Math.min(perLevel, itemsAtLevel(shelf, l).length);
          for (let b = 0; b < count; b++) {
            add(0.4, step * 0.6, 0.45, boxMat, (b - (perLevel - 1) / 2) * (W / perLevel), l * step + 0.05 + (step * 0.6) / 2, 0);
          }
        }
      } else {
        // heavy duty pallet racking: blue braced upright frames, colored beams, wooden decks
        const bays = Math.max(1, Math.round(W / 1.8));
        const bayW = W / bays;
        const zf = D / 2 - 0.04;
        for (let i = 0; i <= bays; i++) {
          const x = -W / 2 + i * bayW;
          add(0.07, H, 0.07, blueMat, x, H / 2, -zf);
          add(0.07, H, 0.07, blueMat, x, H / 2, zf);
          const seg = 0.5;
          const segs = Math.max(1, Math.round(H / seg));
          const sh = H / segs;
          for (let k = 0; k < segs; k++) {
            const y0 = k * sh;
            const dz = (k % 2 === 0 ? 1 : -1) * 2 * zf;
            const len = Math.hypot(sh, dz);
            const diag = add(0.03, len, 0.03, blueMat, x, y0 + sh / 2, 0);
            diag.rotation.x = Math.atan2(dz, sh);
            add(0.03, 0.03, 2 * zf, blueMat, x, y0, 0);
          }
        }
        const step = (H - 0.3) / shelf.levels;
        for (let l = 0; l < shelf.levels; l++) {
          const stocked = itemsAtLevel(shelf, l).length;
          const y = 0.25 + l * step;
          add(W, 0.12, 0.05, beamMat, 0, y, -zf);
          add(W, 0.12, 0.05, beamMat, 0, y, zf);
          addTag(levelTag(roomCode, shelfIndex, shelf, l), -W / 2 + 0.5, y, zf + 0.03);
          for (let b = 0; b < bays; b++) {
            const cx = -W / 2 + (b + 0.5) * bayW;
            add(bayW - 0.12, 0.03, D - 0.12, woodMat, cx, y + 0.04, 0);
            if (b >= stocked) continue;
            const bh = Math.max(0.2, Math.min(step - 0.3, 0.9));
            add(bayW * 0.8, bh, D * 0.8, boxMat, cx, y + 0.055 + bh / 2, 0);
          }
        }
      }

      const hit = add(W, H, D, hitMat, 0, H / 2, 0);
      hit.userData.hit = true;

      const danger = new THREE.Mesh(box(W + 0.2, 0.01, D + 0.2), dangerFloorMat);
      danger.position.y = 0.015;
      danger.visible = false;
      group.add(danger);
      const sel = new THREE.Mesh(box(W + 0.2, 0.01, D + 0.2), selectedFloorMat);
      sel.position.y = 0.012;
      sel.visible = false;
      group.add(sel);

      const bandGeo = box(W + 0.08, H / shelf.levels, D + 0.08);
      const band = new THREE.Mesh(bandGeo, bandMat);
      const bandEdges = new THREE.LineSegments(new THREE.EdgesGeometry(bandGeo), bandEdgeMat);
      geoms.push(bandEdges.geometry);
      bandEdges.renderOrder = 10;
      band.add(bandEdges);
      band.visible = false;
      group.add(band);

      scene.add(group);
      groups.push({ id: shelf.id, group, shelf, beamMat, danger, sel, band });
    });

    // walls with door/window cut-outs; rebuilt cheaply while an opening is being dragged
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.3, depthWrite: false });
    const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0x92602b });
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.5, depthWrite: false });
    const selectedFrameMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x4c1d95 });
    const clearanceMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.25, depthWrite: false });
    const wallGroup = new THREE.Group();
    scene.add(wallGroup);
    let wallGeoms: THREE.BufferGeometry[] = [];
    let liveOpenings = openings;
    let builtSelected: string | null = null;

    const buildWalls = (ops: Opening[]) => {
      wallGroup.clear();
      wallGeoms.forEach((g) => g.dispose());
      tagGeo.dispose();
      textures.forEach((t) => t.dispose());
      tagMats.forEach((m) => m.dispose());
      wallGeoms = [];
      builtSelected = selectedOpeningRef.current;

      // a piece of wall: `along` = center along the wall, w = length, y0..y1 vertical span
      const piece = (wall: WallId, along: number, w: number, y0: number, y1: number, t: number, mat: THREE.Material, parent: THREE.Object3D = wallGroup) => {
        if (w <= 1e-4 || y1 - y0 <= 1e-4) return null;
        const horizontal = wall === "back" || wall === "front";
        const g = horizontal ? new THREE.BoxGeometry(w, y1 - y0, t) : new THREE.BoxGeometry(t, y1 - y0, w);
        wallGeoms.push(g);
        const m = new THREE.Mesh(g, mat);
        const fixed = wall === "back" ? -roomDepth / 2 : wall === "front" ? roomDepth / 2 : wall === "left" ? -roomWidth / 2 : roomWidth / 2;
        const y = (y0 + y1) / 2;
        if (horizontal) m.position.set(along, y, fixed);
        else m.position.set(fixed, y, along);
        parent.add(m);
        return m;
      };

      (["back", "front", "left", "right"] as WallId[]).forEach((wall) => {
        const len = wallLength(wall, roomWidth, roomDepth);
        const onWall = ops.filter((o) => o.wall === wall).sort((a, b) => a.offset - b.offset);
        let cursor = -len / 2 - WALL_T / 2;
        const solid = (from: number, to: number) => piece(wall, (from + to) / 2, to - from, 0, WALL_H, WALL_T, wallMat);

        onWall.forEach((o) => {
          const spec = OPENING_KINDS[o.kind];
          const a = o.offset - o.width / 2;
          const b = o.offset + o.width / 2;
          if (a > cursor) solid(cursor, a);
          cursor = Math.max(cursor, b);
          piece(wall, o.offset, o.width, 0, spec.sill, WALL_T, wallMat);
          piece(wall, o.offset, o.width, spec.sill + spec.height, WALL_H, WALL_T, wallMat);

          const selected = o.id === selectedOpeningRef.current;
          const group = new THREE.Group();
          group.userData.openingId = o.id;
          wallGroup.add(group);
          const top = spec.sill + spec.height;
          const frame = selected ? selectedFrameMat : o.kind === "door" ? doorFrameMat : windowFrameMat;
          const T = WALL_T + 0.05;
          const f = 0.06;
          piece(wall, a + f / 2, f, spec.sill, top, T, frame, group);
          piece(wall, b - f / 2, f, spec.sill, top, T, frame, group);
          piece(wall, o.offset, o.width, top - f, top, T, frame, group);
          if (spec.sill > 0) piece(wall, o.offset, o.width, spec.sill, spec.sill + f, T + 0.08, frame, group);
          if (o.kind === "door") {
            piece(wall, o.offset, o.width - 2 * f, 0, spec.height - f, 0.05, doorLeafMat, group);
            piece(wall, o.offset + o.width / 2 - 0.2, 0.05, 0.95, 1.05, 0.12, frame, group);
          } else {
            piece(wall, o.offset, o.width - 2 * f, spec.sill + f, top - f, 0.02, glassMat, group);
            piece(wall, o.offset, 0.04, spec.sill + f, top - f, 0.05, frame, group);
          }
          // invisible, slightly bigger box so the opening is easy to grab
          const hit = piece(wall, o.offset, o.width + 0.2, spec.sill, top, 0.6, hitMat, group);
          if (hit) hit.userData.openingId = o.id;
        });
        solid(cursor, len / 2 + WALL_T / 2);
      });

      doorClearances(ops, roomWidth, roomDepth).forEach((r) => {
        const g = new THREE.BoxGeometry(r.hx * 2, 0.01, r.hz * 2);
        wallGeoms.push(g);
        const m = new THREE.Mesh(g, clearanceMat);
        m.position.set(r.cx, 0.012, r.cz);
        wallGroup.add(m);
      });
    };
    buildWalls(openings);

    const fitRadius = () => {
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const forWidth = (roomWidth / 2 + 0.5) / (t * camera.aspect);
      const forDepth = (roomDepth / 2 + 2.5) / t;
      return Math.max(6, Math.max(forWidth, forDepth * 0.8) * 1.05);
    };
    const target = new THREE.Vector3(0, 0.5, 0);
    const updateCamera = () => {
      const yaw = yawRef.current;
      const radius = fitRadius() * zoomRef.current;
      const pitch = pitchRef.current;
      camera.position.set(radius * Math.sin(yaw) * Math.cos(pitch), target.y + radius * Math.sin(pitch), radius * Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(target);
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const dom = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    const setRay = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), camera);
    };
    const pickShelf = () => {
      const hit = raycaster.intersectObjects(groups.map((g) => g.group), true)[0];
      let obj: THREE.Object3D | null = hit?.object ?? null;
      while (obj && !obj.userData.id) obj = obj.parent;
      const g = groups.find((x) => x.group === obj);
      if (!g || !hit) return null;
      const localY = g.group.worldToLocal(hit.point.clone()).y;
      const level = Math.max(0, Math.min(g.shelf.levels - 1, Math.floor(localY / (g.shelf.height / g.shelf.levels))));
      return { g, level };
    };

    let orbiting = false;
    let draggedOpening: { id: string; wall: WallId; offset: number } | null = null;
    let dragMoved = false;
    let dragged: (typeof groups)[number] | null = null;
    const offset = new THREE.Vector3();
    let moved = 0;
    const startPos = new THREE.Vector3();
    let lastX = 0;
    let lastY = 0;

    const pickOpening = () => {
      const hit = raycaster.intersectObject(wallGroup, true).find((h) => {
        let obj: THREE.Object3D | null = h.object;
        while (obj && !obj.userData.openingId) obj = obj.parent;
        return !!obj;
      });
      let obj: THREE.Object3D | null = hit?.object ?? null;
      while (obj && !obj.userData.openingId) obj = obj.parent;
      return (obj?.userData.openingId as string | undefined) ?? null;
    };

    const onDown = (e: PointerEvent) => {
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      setRay(e);
      if (modeRef.current === "ruangan") {
        const id = pickOpening();
        const op = liveOpenings.find((o) => o.id === id);
        if (op) {
          draggedOpening = { id: op.id, wall: op.wall, offset: op.offset };
          dragMoved = false;
          onSelectOpeningRef.current(op.id);
        } else {
          orbiting = true;
        }
        return;
      }
      const picked = pickShelf();
      if (picked && modeRef.current === "rak") {
        dragged = picked.g;
        startPos.copy(picked.g.group.position);
        onSelectRef.current(picked.g.id, picked.level);
        if (raycaster.ray.intersectPlane(plane, point)) offset.copy(picked.g.group.position).sub(point);
      } else {
        orbiting = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (draggedOpening) {
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved <= 3) return;
        setRay(e);
        if (raycaster.ray.intersectPlane(plane, point)) {
          const dist: [WallId, number][] = [
            ["back", Math.abs(point.z + roomDepth / 2)],
            ["front", Math.abs(point.z - roomDepth / 2)],
            ["left", Math.abs(point.x + roomWidth / 2)],
            ["right", Math.abs(point.x - roomWidth / 2)],
          ];
          const wall = dist.sort((a, b) => a[1] - b[1])[0][0];
          const current = liveOpenings.find((o) => o.id === draggedOpening!.id)!;
          const along = wall === "back" || wall === "front" ? point.x : point.z;
          const next = { ...current, wall, offset: clampOffset(along, current.width, wall, roomWidth, roomDepth) };
          const valid = next.width <= wallLength(wall, roomWidth, roomDepth) - 0.2 && !liveOpenings.some((o) => openingsCollide(next, o));
          if (valid && (next.wall !== current.wall || next.offset !== current.offset)) {
            draggedOpening = { id: next.id, wall: next.wall, offset: next.offset };
            dragMoved = true;
            liveOpenings = liveOpenings.map((o) => (o.id === next.id ? next : o));
            buildWalls(liveOpenings);
          }
        }
      } else if (dragged) {
        moved += Math.abs(dx) + Math.abs(dy);
        setRay(e);
        if (raycaster.ray.intersectPlane(plane, point)) {
          const nx = point.x + offset.x;
          const nz = point.z + offset.z;
          const c = clampToRoom(nx, nz, dragged.shelf, roomWidth, roomDepth);
          dragged.group.position.set(c.x, 0, c.z);
        }
      } else if (orbiting) {
        moved += Math.abs(dx) + Math.abs(dy);
        yawRef.current = Math.max(-1.2, Math.min(1.2, yawRef.current - dx * 0.006));
        pitchRef.current = Math.max(0.1, Math.min(1.4, pitchRef.current + dy * 0.006));
      }
    };
    const onUp = (e: PointerEvent) => {
      if (draggedOpening) {
        if (dragMoved) onMoveOpeningRef.current(draggedOpening.id, draggedOpening.wall, draggedOpening.offset);
      } else if (dragged) {
        if (moved > 3) {
          const d = dragged;
          const blocked = groups.some((o) => o !== d && shelfsOverlap(placeOf(d), placeOf(o))) || blockedByDoor(placeOf(d), liveOpenings, roomWidth, roomDepth);
          if (blocked) {
            d.group.position.copy(startPos);
            onBlockedRef.current?.();
          } else {
            onMoveRef.current(d.id, d.group.position.x, d.group.position.z);
          }
        }
      } else if (orbiting && moved <= 5 && e.target === dom) {
        setRay(e);
        if (modeRef.current === "ruangan") onSelectOpeningRef.current(null);
        else {
          const picked = pickShelf();
          onSelectRef.current(picked?.g.id ?? null, picked?.level ?? null);
        }
      }
      dragged = null;
      draggedOpening = null;
      orbiting = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? 1.1 : 0.9);
    };
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    const animate = () => {
      groups.forEach((g) => {
        const colliding = groups.some((o) => o !== g && shelfsOverlap(placeOf(g), placeOf(o))) || blockedByDoor(placeOf(g), liveOpenings, roomWidth, roomDepth);
        g.beamMat.color.set(colliding ? 0xef4444 : g.shelf.color);
        g.beamMat.emissive.setHex(colliding ? 0x991b1b : g.id === selectedRef.current ? 0x333333 : 0x000000);
        g.danger.visible = colliding;
        g.sel.visible = !colliding && g.id === selectedRef.current;
        const lvl = selectedLevelRef.current;
        g.band.visible = g.id === selectedRef.current && lvl !== null && lvl < g.shelf.levels;
        if (g.band.visible && lvl !== null) g.band.position.y = ((lvl + 0.5) * g.shelf.height) / g.shelf.levels;
      });
      if (builtSelected !== selectedOpeningRef.current) buildWalls(liveOpenings);
      dom.style.cursor = dragged || draggedOpening ? "grabbing" : modeRef.current === "view" ? "grab" : "move";
      updateCamera();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      geoms.forEach((g) => g.dispose());
      wallGeoms.forEach((g) => g.dispose());
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      [...beamMats, frameMat, blueMat, woodMat, selectedFloorMat, dangerFloorMat, boxMat, bandMat, bandEdgeMat, hitMat, floorMat, wallMat, doorLeafMat, doorFrameMat, windowFrameMat, glassMat, selectedFrameMat, clearanceMat].forEach((m) => m.dispose());
      renderer.dispose();
      container.removeChild(dom);
    };
  }, [shelves, openings, roomWidth, roomDepth, roomCode]);

  const zoomBtn = "flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 dark:border-gray-100/10 dark:bg-zinc-800 dark:text-gray-100";

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5" />
      <div className="absolute bottom-3 left-3 flex flex-col gap-2">
        <button type="button" aria-label="Zoom in" className={zoomBtn} onClick={() => zoomBy(0.8)}>
          <IconPlus size={16} />
        </button>
        <button type="button" aria-label="Zoom out" className={zoomBtn} onClick={() => zoomBy(1.25)}>
          <IconMinus size={16} />
        </button>
      </div>
    </div>
  );
}
