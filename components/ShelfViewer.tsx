"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ShelfData {
  id: string;
  name: string;
  levels: number;
  usedPercent: number;
  x: number;
  z: number;
  rotated: boolean;
}

interface ShelfViewerProps {
  shelves: ShelfData[];
  roomWidth: number;
  roomDepth: number;
  selectedId: string | null;
  editable: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
}

export const SHELF_W = 1.6;
export const SHELF_D = 0.7;
const SHELF_H = 2.2;
const WALL_H = 0.5;

export function clampToRoom(x: number, z: number, rotated: boolean, roomWidth: number, roomDepth: number) {
  const hw = (rotated ? SHELF_D : SHELF_W) / 2;
  const hd = (rotated ? SHELF_W : SHELF_D) / 2;
  return {
    x: Math.max(-roomWidth / 2 + hw, Math.min(roomWidth / 2 - hw, x)),
    z: Math.max(-roomDepth / 2 + hd, Math.min(roomDepth / 2 - hd, z)),
  };
}

export default function ShelfViewer({ shelves, roomWidth, roomDepth, selectedId, editable, onSelect, onMove }: ShelfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const editableRef = useRef(editable);
  const onSelectRef = useRef(onSelect);
  const onMoveRef = useRef(onMove);
  const yawRef = useRef(0);
  const pitchRef = useRef(0.9);

  useEffect(() => {
    selectedRef.current = selectedId;
    editableRef.current = editable;
    onSelectRef.current = onSelect;
    onMoveRef.current = onMove;
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
    const grid = new THREE.GridHelper(Math.max(roomWidth, roomDepth), Math.max(roomWidth, roomDepth), 0x94a3b8, 0xcbd5e1);
    grid.position.y = 0.005;
    scene.add(grid);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x52525b });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa });
    const selectedMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x4c1d95 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd4a373 });
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const groups: { id: string; group: THREE.Group; boards: THREE.Mesh[]; rotated: boolean }[] = [];

    shelves.forEach((shelf) => {
      const group = new THREE.Group();
      group.position.set(shelf.x, 0, shelf.z);
      group.rotation.y = shelf.rotated ? Math.PI / 2 : 0;
      group.userData.id = shelf.id;
      const boards: THREE.Mesh[] = [];

      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const post = new THREE.Mesh(box(0.06, SHELF_H, 0.06), frameMat);
          post.position.set((sx * SHELF_W) / 2, SHELF_H / 2, (sz * SHELF_D) / 2);
          group.add(post);
        }
      }

      const step = SHELF_H / shelf.levels;
      const filled = Math.round((shelf.usedPercent / 100) * shelf.levels * 3);
      let boxCount = 0;
      for (let l = 0; l < shelf.levels; l++) {
        const board = new THREE.Mesh(box(SHELF_W, 0.05, SHELF_D), boardMat);
        board.position.y = l * step + 0.03;
        group.add(board);
        boards.push(board);
        for (let b = 0; b < 3; b++) {
          if (boxCount++ >= filled) continue;
          const item = new THREE.Mesh(box(0.4, step * 0.6, 0.45), boxMat);
          item.position.set((b - 1) * 0.5, l * step + 0.05 + (step * 0.6) / 2, 0);
          group.add(item);
        }
      }
      const hit = new THREE.Mesh(box(SHELF_W, SHELF_H, SHELF_D), hitMat);
      hit.position.y = SHELF_H / 2;
      group.add(hit);

      scene.add(group);
      groups.push({ id: shelf.id, group, boards, rotated: shelf.rotated });
    });

    const radius = Math.max(8, Math.max(roomWidth, roomDepth) * 1.2);
    const target = new THREE.Vector3(0, 0.5, 0);
    const updateCamera = () => {
      const yaw = yawRef.current;
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
          const c = clampToRoom(point.x + offset.x, point.z + offset.z, dragged.rotated, roomWidth, roomDepth);
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
        if (moved > 3) onMoveRef.current(dragged.id, dragged.group.position.x, dragged.group.position.z);
      } else if (orbiting && moved <= 5 && e.target === dom) {
        setRay(e);
        onSelectRef.current(pickShelf()?.id ?? null);
      }
      dragged = null;
      orbiting = false;
    };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    const animate = () => {
      groups.forEach(({ id, boards }) => {
        const mat = id === selectedRef.current ? selectedMat : boardMat;
        boards.forEach((b) => (b.material = mat));
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
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      geoms.forEach((g) => g.dispose());
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      [frameMat, boardMat, selectedMat, boxMat, hitMat, floorMat, wallMat].forEach((m) => m.dispose());
      renderer.dispose();
      container.removeChild(dom);
    };
  }, [shelves, roomWidth, roomDepth]);

  return <div ref={containerRef} className="h-[28rem] w-full rounded-xl bg-gray-50 dark:bg-white/5" />;
}
