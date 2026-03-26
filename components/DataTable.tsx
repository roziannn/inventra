/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { IconChevronLeft, IconChevronRight, IconInbox } from "@tabler/icons-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export default function DataTable<T extends { id?: string | number }>({ data, columns, pageSize = 10 }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-112.5 flex flex-col">
        <div className="overflow-x-auto grow">
          <table className="w-full text-left border-separate border-spacing-0 table-fixed min-w-200">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {columns.map((col, i) => (
                  <th key={`head-${i}`} className={`px-6 py-4 border-b border-gray-100 whitespace-nowrap ${i === 0 ? "w-[30%]" : ""} ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {currentData.length > 0 ? (
                currentData.map((item, rowIndex) => (
                  <tr key={item.id || `row-${rowIndex}`} className="hover:bg-gray-50/30 transition-colors group">
                    {columns.map((col, colIndex) => (
                      <td key={`cell-${colIndex}`} className={`px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis ${col.className || ""}`}>
                        {typeof col.accessor === "function" ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-20">
                    <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                      <IconInbox size={48} stroke={1.5} />
                      <p className="text-xs font-bold uppercase tracking-tighter">Data tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] text-gray-400 font-bold uppercase">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-20 transition-all">
              <IconChevronLeft size={16} />
            </button>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-20 transition-all">
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
