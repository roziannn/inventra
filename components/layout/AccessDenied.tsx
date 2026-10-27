import Link from "next/link";
import { IconLock } from "@tabler/icons-react";

/** Shown instead of a page when the active role has no "Lihat" right for it. */
export default function AccessDenied({ menuName }: { menuName?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-100/20">
      <IconLock size={36} className="text-gray-300" />
      <h2 className="text-lg font-bold text-gray-900">Akses ditolak</h2>
      <p className="max-w-sm text-sm text-gray-500">Role kamu tidak punya hak untuk membuka{menuName ? ` menu ${menuName}` : " halaman ini"}. Hubungi admin bila perlu akses.</p>
      <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
        Kembali ke dashboard
      </Link>
    </div>
  );
}
