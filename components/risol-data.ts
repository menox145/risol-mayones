export type Outlet = { id: string; nama: string; alamat: string; kota: string; aktif: boolean };
export type Product = { id: string; nama: string; deskripsi: string; harga: number; foto: string; kategori: "single" | "paket"; aktif: boolean };
export type Karyawan = { id: string; nama: string; email: string; outletId: string; role: "admin" | "karyawan" };
export type OutletPrice = { outletId: string; productId: string; harga: number; stok: number };
export type Sale = { id: string; tanggal: string; outletId: string; outletNama: string; productId: string; productNama: string; qty: number; hargaSatuan: number; omzet: number };
export type CartItem = { productId: string; qty: number };
export type TransaksiStatus = "MENUNGGU" | "DIPROSES" | "SELESAI";
export type TransaksiItem = { productId: string; productNama: string; qty: number; hargaSatuan: number };
export type Transaksi = {
  id: string;
  noAntrean: string;
  tanggal: string;
  outletId: string;
  outletNama: string;
  nama: string;
  wa: string;
  waMasked: string;
  alamat: string;
  catatan?: string;
  items: TransaksiItem[];
  total: number;
  estimasi: string;
  status: TransaksiStatus;
  createdAt: string;
};

export const SEED_OUTLETS: Outlet[] = [
  { id: "o1", nama: "Risol Mayo Pusat - Kemang", alamat: "Jl. Kemang Raya No. 12", kota: "Jakarta Selatan", aktif: true },
  { id: "o2", nama: "Risol Mayo - BSD City", alamat: "AEON Mall BSD, Lt. 2", kota: "Tangerang", aktif: true },
  { id: "o3", nama: "Risol Mayo - Bekasi", alamat: "Jl. Ahmad Yani No. 45", kota: "Bekasi", aktif: true },
  { id: "o4", nama: "Risol Mayo - Depok", alamat: "Margonda Raya 88", kota: "Depok", aktif: false },
];

export const OUTLET_CODES: Record<string, string> = { o1: "KMG", o2: "BSD", o3: "BKS", o4: "DPK" };

export const SEED_PRODUCTS: Product[] = [
  { id: "p1", nama: "Risol Mayo Original", deskripsi: "Mayones lumer, smoked chicken premium, kulit crispy golden", harga: 8000, foto: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=600", kategori: "single", aktif: true },
  { id: "p2", nama: "Risol Mayo Smoked Beef", deskripsi: "Daging sapi asap + keju mozarella + mayo pedas manis", harga: 12000, foto: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600", kategori: "single", aktif: true },
  { id: "p3", nama: "Risol Mayo Sosis", deskripsi: "Sosis bratwurst, telur, mayo original lumer di mulut", harga: 10000, foto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600", kategori: "single", aktif: true },
  { id: "p4", nama: "Risol Mayo Ayam Pedas", deskripsi: "Ayam suwir pedas level 3, keju, mayo creamy", harga: 11000, foto: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?q=80&w=600", kategori: "single", aktif: true },
  { id: "p5", nama: "Paket Box 10", deskripsi: "Mix 10 pcs bebas pilih varian, free saus sambal", harga: 95000, foto: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600", kategori: "paket", aktif: true },
  { id: "p6", nama: "Paket Party 25", deskripsi: "25 pcs mix, cocok arisan & kantor, free box premium", harga: 220000, foto: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600", kategori: "paket", aktif: true },
];

export const SEED_KARYAWAN: Karyawan[] = [
  { id: "k1", nama: "Admin Pusat", email: "admin@risol.com", outletId: "o1", role: "admin" },
  { id: "k2", nama: "Siti Karyawan", email: "karyawan@risol.com", outletId: "o1", role: "karyawan" },
  { id: "k3", nama: "Budi BSD", email: "budi@risol.com", outletId: "o2", role: "karyawan" },
];

export const SEED_PRICES: OutletPrice[] = [
  { outletId: "o1", productId: "p1", harga: 8000, stok: 120 },
  { outletId: "o1", productId: "p2", harga: 12000, stok: 80 },
  { outletId: "o1", productId: "p3", harga: 10000, stok: 90 },
  { outletId: "o2", productId: "p1", harga: 9000, stok: 60 },
  { outletId: "o2", productId: "p2", harga: 13000, stok: 40 },
];

export const SEED_SALES: Sale[] = [
  { id: "s1", tanggal: new Date().toISOString().slice(0, 10), outletId: "o1", outletNama: "Risol Mayo Pusat - Kemang", productId: "p1", productNama: "Risol Mayo Original", qty: 12, hargaSatuan: 8000, omzet: 96000 },
  { id: "s2", tanggal: new Date().toISOString().slice(0, 10), outletId: "o1", outletNama: "Risol Mayo Pusat - Kemang", productId: "p2", productNama: "Risol Mayo Smoked Beef", qty: 5, hargaSatuan: 12000, omzet: 60000 },
  { id: "s3", tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), outletId: "o2", outletNama: "Risol Mayo - BSD City", productId: "p5", productNama: "Paket Box 10", qty: 2, hargaSatuan: 95000, omzet: 190000 },
];

export const SEED_TRANSAKSI: Transaksi[] = [];

export function maskWa(wa: string) {
  const clean = wa.replace(/\D/g, "");
  if (clean.length <= 7) return clean;
  return clean.slice(0, 4) + "****" + clean.slice(-3);
}

export function validateWa(wa: string) {
  const clean = wa.replace(/\D/g, "");
  if (clean.length < 10 || clean.length > 13) return false;
  return clean.startsWith("08") || clean.startsWith("62") || clean.startsWith("628");
}

export function generateNoAntrean(outletId: string) {
  const date = new Date().toISOString().slice(0, 10);
  const code = OUTLET_CODES[outletId] || outletId.slice(0, 3).toUpperCase();
  const key = `risol_counter_${outletId}_${date}`;
  let count = 0;
  try {
    const raw = localStorage.getItem(key);
    count = raw ? parseInt(raw, 10) : 0;
  } catch {}
  count += 1;
  try { localStorage.setItem(key, String(count)); } catch {}
  const num = String(count).padStart(3, "0");
  return `RM-${code}-${num}`;
}
