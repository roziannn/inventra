/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { IconChevronLeft, IconChevronRight, IconInbox } from "@tabler/icons-react";

interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  density?: "dense" | "normal";
}

export default function DataTable<T extends { id?: string | number }>({ data, columns, pageSize = 10, density = "normal" }: DataTableProps<T>) {
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

  const getVisiblePages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages] as const;
    if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages] as const;
  };

  const isDense = density === "dense";
  const headCellClass = isDense ? "px-3 py-2.5" : "px-4 py-3";
  const bodyCellClass = isDense ? "px-3 py-2" : "px-4 py-2.5";

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="overflow-x-auto rounded-sm">
        <table className="w-full text-left table-auto border-collapse border-0 [&_tr]:border-0 [&_th]:border-0 [&_td]:border-0">
          <thead className="border-0">
            <tr className="bg-gray-50/60 dark:bg-white/6 text-xs font-bold text-gray-400 uppercase tracking-wide border-0">
              {columns.map((col, i) => (
                <th key={`head-${i}`} className={`${headCellClass} ${col.className || ""} border-0`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {/* BODY */}
          <tbody className="text-sm border-0 divide-y-0">
            {currentData.length > 0 ? (
              currentData.map((item, rowIndex) => (
                <tr key={item.id || `row-${rowIndex}`} className="hover:bg-violet-50/60 dark:hover:bg-white/6 transition-colors border-0">
                  {columns.map((col, colIndex) => (
                    <td key={`cell-${colIndex}`} className={`${bodyCellClass} align-middle ${col.className || ""} border-0`}>
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

      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
          <p className="text-xs text-gray-500 font-semibold">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, data.length)} of {data.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <IconChevronLeft size={16} />
            </button>

            {getVisiblePages().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-gray-300 select-none">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => goToPage(page)}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all ${currentPage === page ? "bg-violet-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 dark:hover:bg-white/6"}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
