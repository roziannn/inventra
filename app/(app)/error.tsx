"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import Button from "@/components/ui/Button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-100/20">
      <IconAlertTriangle size={36} className="text-amber-500" />
      <h2 className="text-lg font-bold text-gray-900">Terjadi kesalahan</h2>
      <p className="max-w-sm text-sm text-gray-500">{error.message || "Halaman gagal dimuat. Coba lagi sebentar."}</p>
      <Button variant="page-primary" onClick={reset}>
        Coba lagi
      </Button>
    </div>
  );
}
