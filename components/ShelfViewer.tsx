"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ShelfData {
  id: string;
  name: string;
  levels: number;
  usedPercent: number;
}

interface ShelfViewerProps {
  shelves: ShelfData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SHELF_W = 1.6;
const SHELF_D = 0.7;
const SHELF_H = 2.2;
const GAP = 0.6;

export default function ShelfViewer({ shelves, selectedId, onSelect }: ShelfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    selectedRef.current = selectedId;
    onSelectRef.current = onSelect;
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

    const totalW = shelves.length * SHELF_W + (shelves.length - 1) * GAP;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(totalW + 4, 5), new THREE.MeshStandardMaterial({ color: 0xe5e7eb }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x52525b });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa });
    const selectedMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x4c1d95 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd4a373 });

    const groups: { id: string; group: THREE.Group; boards: THREE.Mesh[] }[] = [];
    const geoms: THREE.BufferGeometry[] = [];
    const box = (w: number, h: number, d: number) => {
      const g = new THREE.BoxGeometry(w, h, d);
      geoms.push(g);
      return g;
    };

    shelves.forEach((shelf, i) => {
      const group = new THREE.Group();
      group.position.x = -totalW / 2 + SHELF_W / 2 + i * (SHELF_W + GAP);
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
      // invisible hit area so the whole shelf is clickable
      const hit = new THREE.Mesh(box(SHELF_W, SHELF_H, SHELF_D), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = SHELF_H / 2;
      group.add(hit);

      scene.add(group);
      groups.push({ id: shelf.id, group, boards });
    });

    const radius = Math.max(7, totalW * 1.1);
    const target = new THREE.Vector3(0, SHELF_H / 2, 0);
    let yaw = 0;
    let pitch = 0.35;
    const updateCamera = () => {
      camera.position.set(target.x + radius * Math.sin(yaw) * Math.cos(pitch), target.y + radius * Math.sin(pitch), radius * Math.cos(yaw) * Math.cos(pitch));
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

    // drag to orbit, click to select
    const dom = renderer.domElement;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      yaw = Math.max(-1, Math.min(1, yaw - dx * 0.006));
      pitch = Math.max(0.05, Math.min(1.2, pitch + dy * 0.006));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (moved > 5) return;
      const rect = dom.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(scene.children, true)[0];
      let obj: THREE.Object3D | null = hit?.object ?? null;
      while (obj && !obj.userData.id) obj = obj.parent;
      if (obj) onSelectRef.current(obj.userData.id);
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
      [frameMat, boardMat, selectedMat, boxMat].forEach((m) => m.dispose());
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
      container.removeChild(dom);
    };
  }, [shelves]);

  return <div ref={containerRef} className="h-[28rem] w-full cursor-grab rounded-xl bg-gray-50 active:cursor-grabbing dark:bg-white/5" />;
}
