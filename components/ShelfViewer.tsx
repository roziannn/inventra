"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { IconPlus, IconMinus } from "@tabler/icons-react";

export type ShelfType = "standard" | "pallet";

export const SHELF_TYPES: Record<ShelfType, { label: string; depth: number; length: number; height: number; color: string }> = {
  standard: { label: "Rak Standar", depth: 0.7, length: 1.6, height: 2.2, color: "#a78bfa" },
  pallet: { label: "Rak Pallet (Heavy Duty)", depth: 0.9, length: 3.6, height: 3, color: "#f97316" },
};

export interface ShelfData {
  id: string;
  name: string;
  levels: number;
  usedPercent: number;
  x: number;
  z: number;
  rotated: boolean;
  type: ShelfType;
  length: number;
  height: number;
  color: string;
}

export type ShelfPlace = Pick<ShelfData, "x" | "z" | "rotated" | "length" | "type">;

interface ShelfViewerProps {
  shelves: ShelfData[];
  roomWidth: number;
  roomDepth: number;
  selectedId: string | null;
  editable: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onBlocked?: () => void;
}

const WALL_H = 0.5;

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
  return Math.abs(a.x - b.x) < ea.hx + eb.hx && Math.abs(a.z - b.z) < ea.hz + eb.hz;
}

export default function ShelfViewer({ shelves, roomWidth, roomDepth, selectedId, editable, onSelect, onMove, onBlocked }: ShelfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const editableRef = useRef(editable);
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
    editableRef.current = editable;
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

    // room floor + low walls
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
    const floor = new THREE.Mesh(box(roomWidth, 0.04, roomDepth), floorMat);
    floor.position.y = -0.02;
    scene.add(floor);
    const walls: [number, number, number, number][] = [
      [roomWidth, 0.08, 0, -roomDepth / 2],
      [roomWidth, 0.08, 0, roomDepth / 2],
      [0.08, roomDepth, -roomWidth / 2, 0],
      [0.08, roomDepth, roomWidth / 2, 0],
    ];
    walls.forEach(([w, d, x, z]) => {
      const wall = new THREE.Mesh(box(w, WALL_H, d), wallMat);
      wall.position.set(x, WALL_H / 2, z);
      scene.add(wall);
    });
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
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const groups: { id: string; group: THREE.Group; shelf: ShelfData; beamMat: THREE.MeshStandardMaterial; danger: THREE.Mesh; sel: THREE.Mesh }[] = [];
    const placeOf = (g: (typeof groups)[number]): ShelfPlace => ({ x: g.group.position.x, z: g.group.position.z, rotated: g.shelf.rotated, length: g.shelf.length, type: g.shelf.type });

    shelves.forEach((shelf) => {
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

      const filledRatio = shelf.usedPercent / 100;
      if (shelf.type === "standard") {
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(0.06, H, 0.06, frameMat, (sx * W) / 2, H / 2, (sz * D) / 2);
        const step = H / shelf.levels;
        const perLevel = Math.max(1, Math.floor(W / 0.55));
        const filled = Math.round(filledRatio * shelf.levels * perLevel);
        let n = 0;
        for (let l = 0; l < shelf.levels; l++) {
          add(W, 0.05, D, beamMat, 0, l * step + 0.03, 0);
          for (let b = 0; b < perLevel; b++) {
            if (n++ >= filled) continue;
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
        const filled = Math.round(filledRatio * shelf.levels * bays);
        let n = 0;
        for (let l = 0; l < shelf.levels; l++) {
          const y = 0.25 + l * step;
          add(W, 0.12, 0.05, beamMat, 0, y, -zf);
          add(W, 0.12, 0.05, beamMat, 0, y, zf);
          for (let b = 0; b < bays; b++) {
            const cx = -W / 2 + (b + 0.5) * bayW;
            add(bayW - 0.12, 0.03, D - 0.12, woodMat, cx, y + 0.04, 0);
            if (n++ >= filled) continue;
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

      scene.add(group);
      groups.push({ id: shelf.id, group, shelf, beamMat, danger, sel });
    });

    const fitRadius = () => {
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const forWidth = (roomWidth / 2 + 0.5) / (t * camera.aspect);
      const forDepth = (roomDepth / 2 + 1.5) / t;
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
      return groups.find((g) => g.group === obj) ?? null;
    };

    let orbiting = false;
    let dragged: (typeof groups)[number] | null = null;
    const offset = new THREE.Vector3();
    let moved = 0;
    const startPos = new THREE.Vector3();
    let lastX = 0;
    let lastY = 0;

    const onDown = (e: PointerEvent) => {
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      setRay(e);
      const picked = pickShelf();
      if (picked && editableRef.current) {
        dragged = picked;
        startPos.copy(picked.group.position);
        onSelectRef.current(picked.id);
        if (raycaster.ray.intersectPlane(plane, point)) offset.copy(picked.group.position).sub(point);
      } else {
        orbiting = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (dragged) {
        moved += Math.abs(dx) + Math.abs(dy);
        setRay(e);
        if (raycaster.ray.intersectPlane(plane, point)) {
          const c = clampToRoom(point.x + offset.x, point.z + offset.z, dragged.shelf, roomWidth, roomDepth);
          dragged.group.position.set(c.x, 0, c.z);
        }
      } else if (orbiting) {
        moved += Math.abs(dx) + Math.abs(dy);
        yawRef.current = Math.max(-1.2, Math.min(1.2, yawRef.current - dx * 0.006));
        pitchRef.current = Math.max(0.1, Math.min(1.4, pitchRef.current + dy * 0.006));
      }
    };
    const onUp = (e: PointerEvent) => {
      if (dragged) {
        if (moved > 3) {
          const d = dragged;
          const blocked = groups.some((o) => o !== d && shelfsOverlap(placeOf(d), placeOf(o)));
          if (blocked) {
            d.group.position.copy(startPos);
            onBlockedRef.current?.();
          } else {
            onMoveRef.current(d.id, d.group.position.x, d.group.position.z);
          }
        }
      } else if (orbiting && moved <= 5 && e.target === dom) {
        setRay(e);
        onSelectRef.current(pickShelf()?.id ?? null);
      }
      dragged = null;
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
        const colliding = groups.some((o) => o !== g && shelfsOverlap(placeOf(g), placeOf(o)));
        g.beamMat.color.set(colliding ? 0xef4444 : g.shelf.color);
        g.beamMat.emissive.setHex(colliding ? 0x991b1b : g.id === selectedRef.current ? 0x333333 : 0x000000);
        g.danger.visible = colliding;
        g.sel.visible = !colliding && g.id === selectedRef.current;
      });
      dom.style.cursor = editableRef.current ? (dragged ? "grabbing" : "move") : "grab";
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
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      [...beamMats, frameMat, blueMat, woodMat, selectedFloorMat, dangerFloorMat, boxMat, hitMat, floorMat, wallMat].forEach((m) => m.dispose());
      renderer.dispose();
      container.removeChild(dom);
    };
  }, [shelves, roomWidth, roomDepth]);

  const zoomBtn = "flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 dark:border-gray-100/10 dark:bg-zinc-800 dark:text-gray-100";

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[calc(100vh-15rem)] min-h-[28rem] w-full rounded-xl bg-gray-50 dark:bg-white/5" />
      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
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
