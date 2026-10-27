import Link from "next/link";
import { IconMapOff } from "@tabler/icons-react";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-100/20">
      <IconMapOff size={36} className="text-gray-300" />
      <h2 className="text-lg font-bold text-gray-900">Halaman tidak ditemukan</h2>
      <p className="max-w-sm text-sm text-gray-500">Alamat yang kamu buka tidak ada atau datanya sudah dihapus.</p>
      <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
        Kembali ke dashboard
      </Link>
    </div>
  );
}
