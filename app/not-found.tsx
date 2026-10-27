import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-black text-violet-500">404</p>
      <h1 className="text-xl font-bold">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-gray-500">Alamat yang kamu buka tidak ada.</p>
      <Link href="/" className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
