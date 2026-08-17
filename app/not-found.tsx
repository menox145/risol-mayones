import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8E8] text-[#4A2C2A] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-[28px] border bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#FF6B35] text-2xl font-black text-white">R</div>
        <h1 className="text-3xl font-black">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm opacity-70">
          Route yang Anda buka tidak tersedia atau sudah berpindah.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#4A2C2A] px-5 py-3 text-sm font-bold text-white"
        >
          Kembali ke halaman utama
        </Link>
      </div>
    </div>
  );
}
