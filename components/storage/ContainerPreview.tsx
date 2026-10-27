import React from "react";
import type { ContainerType } from "@/lib/storage/shelf-model";

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount)));
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}

/** small isometric drawing of a container, scaled by its real proportions */
export default function ContainerPreview({ container, size = 96 }: { container: Pick<ContainerType, "shape" | "width" | "height" | "depth" | "color">; size?: number }) {
  const longest = Math.max(container.width, container.depth, container.height, 0.01);
  const k = (size * 0.42) / longest;
  const w = container.width * k;
  const d = container.depth * k;
  const h = container.height * k;
  // iso projection of (x along width, y up, z along depth)
  const p = (x: number, y: number, z: number): [number, number] => [(x - z) * COS, (x + z) * SIN - y];
  const pts = (list: [number, number][]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
  const top = shade(container.color, 25);
  const left = shade(container.color, -5);
  const right = shade(container.color, -35);

  const isCylinder = container.shape === "cylinder";
  const r = (Math.min(w, d) / 2) * COS * 1.2;
  // center the drawing: boxes by their projected bounding box, cylinders around their own axis
  const cx = isCylinder ? 0 : ((w - d) * COS) / 2;
  const cy = isCylinder ? h / 2 : ((w + d) * SIN - h) / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Pratinjau ${container.shape}`}>
      <g transform={`translate(${(size / 2 - cx).toFixed(1)} ${(size / 2 - cy).toFixed(1)})`}>
        {isCylinder ? (
          <>
            <rect x={-r} y={0} width={r * 2} height={h} fill={left} />
            <ellipse cx={0} cy={h} rx={r} ry={r * 0.5} fill={left} />
            <ellipse cx={0} cy={0} rx={r} ry={r * 0.5} fill={top} />
          </>
        ) : (
          <>
            <polygon points={pts([p(0, 0, d), p(w, 0, d), p(w, h, d), p(0, h, d)])} fill={left} />
            <polygon points={pts([p(w, 0, 0), p(w, 0, d), p(w, h, d), p(w, h, 0)])} fill={right} />
            <polygon points={pts([p(0, h, 0), p(w, h, 0), p(w, h, d), p(0, h, d)])} fill={top} />
            {container.shape === "crate" && (
              <polygon points={pts([p(w * 0.08, h, d * 0.08), p(w * 0.92, h, d * 0.08), p(w * 0.92, h, d * 0.92), p(w * 0.08, h, d * 0.92)])} fill={shade(container.color, -60)} />
            )}
            {container.shape === "box" && <polygon points={pts([p(w * 0.42, h, 0), p(w * 0.58, h, 0), p(w * 0.58, h, d), p(w * 0.42, h, d)])} fill="#f3e8cc" opacity={0.9} />}
          </>
        )}
      </g>
    </svg>
  );
}
