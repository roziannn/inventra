"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// All recharts code lives here so the dashboard can load it lazily (see app/(app)/page.tsx).

const tooltipStyle = { borderRadius: "8px", border: "1px solid rgba(135,127,193,0.25)", background: "#222026" };
const tooltipLabel = { color: "#DBD3F5", fontWeight: 700 };
const tooltipItem = { color: "#F5F6FA", fontWeight: 700, fontSize: "12px" };
const axisTick = { fill: "#94a3b8", fontSize: 10, fontWeight: 700 };

export interface ColoredPoint {
  status: string;
  total: number;
  color: string;
}

export function InventoryStatusChart({ data }: { data: ColoredPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="status" axisLine={false} tickLine={false} tick={axisTick} dy={8} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={axisTick} />
        <Tooltip
          cursor={false}
          contentStyle={{ ...tooltipStyle, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.3)", padding: "8px 10px" }}
          labelStyle={{ ...tooltipLabel, marginBottom: 6 }}
          itemStyle={tooltipItem}
          formatter={(value) => [`${value ?? 0} Pcs`, "Total"]}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={28}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryReportChart({ data }: { data: { category: string; reports: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={axisTick} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={axisTick} />
        <Tooltip
          cursor={false}
          contentStyle={{ ...tooltipStyle, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.3)", padding: "8px 10px" }}
          labelStyle={{ ...tooltipLabel, marginBottom: 6 }}
          itemStyle={tooltipItem}
          formatter={(value) => [`${value ?? 0} Reports`, "Total"]}
        />
        <Bar dataKey="reports" radius={[4, 4, 0, 0]} barSize={26} fill="#877FC1" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServicePieChart({ data }: { data: { name: string; total: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={4} stroke="none">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip cursor={false} contentStyle={tooltipStyle} labelStyle={tooltipLabel} itemStyle={tooltipItem} formatter={(value) => [`${value ?? 0} Reports`, "Total"]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ReportStatusChart({ data }: { data: ColoredPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="status" axisLine={false} tickLine={false} tick={axisTick} />
        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={axisTick} />
        <Tooltip cursor={false} contentStyle={tooltipStyle} labelStyle={tooltipLabel} itemStyle={tooltipItem} formatter={(value) => [`${value ?? 0} Reports`, "Total"]} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={38}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
