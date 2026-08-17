"use client";

import { useState } from "react";
import { BarChart3, Check, Download, Edit3, Eye, Package, Search, Settings, ShieldCheck, Store, Ticket, Trash2, Users } from "lucide-react";

import {
  type Karyawan,
  type Outlet,
  type OutletPrice,
  type Product,
  type Sale,
  type Transaksi,
  type TransaksiStatus,
} from "@/components/risol-data";

export default function AdminDashboard({
  outlets,
  setOutlets,
  products,
  setProducts,
  karyawans,
  setKaryawans,
  sales,
  prices,
  transaksiList,
  setTransaksiList,
}: {
  outlets: Outlet[];
  setOutlets: any;
  products: Product[];
  setProducts: any;
  karyawans: Karyawan[];
  setKaryawans: any;
  sales: Sale[];
  prices: OutletPrice[];
  transaksiList: Transaksi[];
  setTransaksiList: any;
}) {
  const [tab, setTab] = useState<"outlet" | "menu" | "karyawan" | "pesanan" | "report" | "schema">("pesanan");
  const [filterOutlet, setFilterOutlet] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchPesanan, setSearchPesanan] = useState("");
  const [filterOutletPesanan, setFilterOutletPesanan] = useState<string>("all");
  const [outletNama, setOutletNama] = useState("");
  const [outletAlamat, setOutletAlamat] = useState("");
  const [outletKota, setOutletKota] = useState("");

  const selesaiTransaksi = transaksiList.filter((t) => t.status === "SELESAI");
  const filteredReport = selesaiTransaksi.filter((s) => {
    const matchOutlet = filterOutlet === "all" || s.outletId === filterOutlet;
    const matchDate = !filterDate || s.tanggal === filterDate;
    return matchOutlet && matchDate;
  });

  const totalOmzetValid = filteredReport.reduce((a, b) => a + b.total, 0);
  const filteredPesanan = transaksiList.filter((t) => {
    const matchOutlet = filterOutletPesanan === "all" || t.outletId === filterOutletPesanan;
    const q = searchPesanan.toLowerCase();
    const matchSearch = !q || t.nama.toLowerCase().includes(q) || t.wa.toLowerCase().includes(q) || t.noAntrean.toLowerCase().includes(q) || t.alamat.toLowerCase().includes(q);
    return matchOutlet && matchSearch;
  });

  const exportCSVReport = () => {
    const header = "tanggal,noAntrean,outlet,nama,wa,alamat,total,status\n";
    const rows = filteredReport.map((s) => `${s.tanggal},${s.noAntrean},"${s.outletNama}","${s.nama}",${s.waMasked},"${s.alamat.replace(/"/g, '""')}",${s.total},${s.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-selesai-${filterDate || "all"}.csv`; a.click();
  };

  const exportCSVPesanan = () => {
    const header = "tanggal,noAntrean,outlet,nama,wa,alamat,total,status,items\n";
    const rows = filteredPesanan.map((s) => `${s.tanggal},${s.noAntrean},"${s.outletNama}","${s.nama}",${s.waMasked},"${s.alamat.replace(/"/g, '""')}",${s.total},${s.status},"${s.items.map((i) => `${i.productNama} x${i.qty}`).join("; ")}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pesanan-${filterOutletPesanan}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-center gap-3 max-w-full">
        <div className="flex items-center gap-2 bg-[#4A2C2A] text-white rounded-full px-4 py-2.5 font-bold shadow-sm">
          <Settings className="w-4 h-4" /> Admin Dashboard
        </div>

        <div className="flex flex-wrap gap-2 bg-white/80 border border-[#4A2C2A]/10 rounded-full p-1.5 shadow-sm">
          {[
            { value: "pesanan", label: "Pesanan Masuk", icon: Ticket },
            { value: "outlet", label: "Lokasi Outlet", icon: Store },
            { value: "menu", label: "Menu Produk", icon: Package },
            { value: "karyawan", label: "Karyawan", icon: Users },
            { value: "report", label: "Report", icon: BarChart3 },
            { value: "schema", label: "DB Schema", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => setTab(item.value as any)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  tab === item.value
                    ? "bg-[#FF6B35] text-white shadow-sm"
                    : "text-[#4A2C2A] hover:bg-[#FFF8E8]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "pesanan" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-[20px] bg-white border p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Outlet</label>
              <select value={filterOutletPesanan} onChange={(e) => setFilterOutletPesanan(e.target.value)} className="mt-1 w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none">
                <option value="all">Semua outlet</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Cari</label>
              <input value={searchPesanan} onChange={(e) => setSearchPesanan(e.target.value)} placeholder="Nama / WA / antrean" className="mt-1 w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none" />
            </div>
            <button onClick={exportCSVPesanan} className="bg-[#4A2C2A] text-white rounded-full px-4 py-2.5 text-sm font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
          </div>

          <div className="rounded-[20px] bg-white border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#FFF8E8] text-[#4A2C2A]">
                  <tr>
                    <th className="text-left px-4 py-3">No Antrean</th>
                    <th className="text-left px-4 py-3">Outlet</th>
                    <th className="text-left px-4 py-3">Pemesan</th>
                    <th className="text-left px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPesanan.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-4 py-3 font-bold">{t.noAntrean}</td>
                      <td className="px-4 py-3">{t.outletNama}</td>
                      <td className="px-4 py-3">{t.nama}<div className="text-[11px] opacity-60">{t.waMasked}</div></td>
                      <td className="px-4 py-3">Rp {t.total.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3"><span className="bg-[#FFF0E0] text-[#FF6B35] px-2 py-1 rounded-full text-[10px] font-bold">{t.status}</span></td>
                      <td className="px-4 py-3"><div className="flex gap-2"><button className="text-[#4A2C2A] hover:opacity-80"><Eye className="w-4 h-4" /></button><button onClick={() => setTransaksiList((prev: Transaksi[]) => prev.map((x) => x.id === t.id ? { ...x, status: "SELESAI" as TransaksiStatus } : x))} className="text-emerald-600 hover:opacity-80"><Check className="w-4 h-4" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "outlet" && (
        <div className="mt-6 grid md:grid-cols-[320px_1fr] gap-6">
          <div className="h-fit rounded-[20px] border-[3px] border-[#FF5A3C] bg-[#F7F1E7] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[20px] font-bold leading-none">
              <Store className="h-5 w-5 text-[#FF6B35]" />
              <span>Tambah Outlet Baru</span>
            </div>
            <div className="mt-5 space-y-3">
              <input value={outletNama} onChange={(e) => setOutletNama(e.target.value)} placeholder="Nama outlet" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
              <input value={outletAlamat} onChange={(e) => setOutletAlamat(e.target.value)} placeholder="Alamat lengkap" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
              <input value={outletKota} onChange={(e) => setOutletKota(e.target.value)} placeholder="Kota" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
              <button onClick={() => { if (!outletNama || !outletAlamat || !outletKota) return; setOutlets((prev: Outlet[]) => [{ id: "o" + Date.now(), nama: outletNama, alamat: outletAlamat, kota: outletKota, aktif: true }, ...prev]); setOutletNama(""); setOutletAlamat(""); setOutletKota(""); }} className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm">Simpan Outlet</button>
            </div>
          </div>

          <div className="rounded-[20px] bg-white border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b bg-[#FFF8E8] p-4">
              <div className="text-[18px] font-bold">Daftar Outlet ({outlets.length})</div>
              <span className="rounded-full bg-[#FFF0E0] px-3 py-1 text-xs font-bold text-[#4A2C2A]">{outlets.filter((o) => o.aktif).length} aktif</span>
            </div>

            <div className="space-y-3 p-3">
              {outlets.map((o) => (
                <div key={o.id} className="flex items-center gap-4 rounded-[18px] border border-[#E7DDCB] bg-[#F9F5EF] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0E0] text-[#FF6B35]">
                    <Store className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[18px] leading-tight">{o.nama}</div>
                    <div className="text-sm text-[#4A2C2A]/70">{o.alamat} • {o.kota}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex min-w-[84px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold ${o.aktif ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {o.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A2C2A]/20 bg-white text-[#4A2C2A] hover:bg-[#FFF8E8]">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div className="mt-6 grid md:grid-cols-[320px_1fr] gap-6">
          <ProductForm onAdd={(p: Product) => setProducts((prev: Product[]) => [p, ...prev])} />

          <div className="rounded-[20px] bg-white border shadow-sm overflow-hidden">
            <div className="border-b bg-[#FFF8E8] p-4">
              <div className="text-[18px] font-bold">Menu Produk • {products.length} items</div>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-[18px] border border-[#E7DDCB] bg-[#F9F5EF] p-3">
                  <img src={p.foto} alt={p.nama} className="h-16 w-16 rounded-xl object-cover" />

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[18px] leading-tight">{p.nama}</div>
                    <div className="line-clamp-2 text-xs text-[#4A2C2A]/70">{p.deskripsi}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[18px] font-black text-[#FF6B35]">Rp {p.harga.toLocaleString("id-ID")}</span>
                      <span className="rounded-full border border-[#E7DDCB] bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-[#4A2C2A]">{p.kategori}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "karyawan" && (
        <div className="mt-6 grid md:grid-cols-[320px_1fr] gap-6">
          <KaryawanForm outlets={outlets} onAdd={(k: Karyawan) => setKaryawans((prev: Karyawan[]) => [k, ...prev])} />

          <div className="rounded-[20px] bg-white border shadow-sm overflow-hidden">
            <div className="border-b bg-[#FFF8E8] p-4">
              <div className="text-[18px] font-bold">Akun Karyawan</div>
            </div>

            <div className="space-y-3 p-3">
              {karyawans.map((k) => {
                const outlet = outlets.find((o) => o.id === k.outletId);

                return (
                  <div key={k.id} className="flex items-center gap-4 rounded-[18px] border border-[#E7DDCB] bg-[#F9F5EF] p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4A2C2A] text-lg font-bold text-white">
                      {k.nama.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[18px]">{k.nama}</span>
                        <span className="rounded-full bg-[#FFF0E0] px-2 py-0.5 text-[10px] font-bold uppercase text-[#FF6B35]">{k.role}</span>
                      </div>
                      <div className="text-sm text-[#4A2C2A]/70">{k.email} • {outlet?.nama || "-"}</div>
                    </div>

                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-[20px] bg-white border p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Outlet</label>
              <select value={filterOutlet} onChange={(e) => setFilterOutlet(e.target.value)} className="mt-1 w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none">
                <option value="all">Semua outlet</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Tanggal</label>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="mt-1 w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none" />
            </div>
            <button onClick={exportCSVReport} className="bg-[#4A2C2A] text-white rounded-full px-4 py-2.5 text-sm font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-[20px] bg-white border p-5"><div className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Omzet</div><div className="mt-2 text-3xl font-black">Rp {totalOmzetValid.toLocaleString("id-ID")}</div></div>
            <div className="rounded-[20px] bg-white border p-5"><div className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Transaksi</div><div className="mt-2 text-3xl font-black">{transaksiList.length}</div></div>
            <div className="rounded-[20px] bg-white border p-5"><div className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Selesai</div><div className="mt-2 text-3xl font-black">{selesaiTransaksi.length}</div></div>
          </div>
        </div>
      )}

      {tab === "schema" && <SchemaSection />}
    </div>
  );
}

function OutletForm({ onAdd }: { onAdd: (o: Outlet) => void }) {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kota, setKota] = useState("");

  return (
    <div className="h-fit rounded-[20px] border-[3px] border-[#FF5A3C] bg-[#F7F1E7] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[20px] font-bold leading-none">
        <Store className="h-5 w-5 text-[#FF6B35]" />
        <span>Tambah Outlet Baru</span>
      </div>
      <div className="mt-5 space-y-3">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama outlet" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <input value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat lengkap" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <input value={kota} onChange={(e) => setKota(e.target.value)} placeholder="Kota" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <button onClick={() => { if (!nama || !alamat || !kota) return; onAdd({ id: "o" + Date.now(), nama, alamat, kota, aktif: true }); setNama(""); setAlamat(""); setKota(""); }} className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm">Simpan Outlet</button>
      </div>
    </div>
  );
}

function ProductForm({ onAdd }: { onAdd: (p: Product) => void }) {
  const [nama, setNama] = useState("");
  const [desk, setDesk] = useState("");
  const [harga, setHarga] = useState<number>(10000);
  const [kat, setKat] = useState<"single" | "paket">("single");
  const [foto, setFoto] = useState<string>("https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=600");

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
    if (!isImage) {
      alert("Format foto harus PNG, JPG, atau JPEG");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-fit rounded-[20px] border-[3px] border-[#FF5A3C] bg-[#F7F1E7] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[20px] font-bold leading-none">
        <Package className="h-5 w-5 text-[#FF6B35]" />
        <span>Tambah Menu Produk</span>
      </div>
      <div className="mt-5 space-y-3">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama produk" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <input value={desk} onChange={(e) => setDesk(e.target.value)} placeholder="Deskripsi singkat" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <div className="flex gap-2">
          <input type="number" value={harga} onChange={(e) => setHarga(Number(e.target.value))} placeholder="Harga" className="flex-1 rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
          <select value={kat} onChange={(e) => setKat(e.target.value as "single" | "paket")} className="rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none">
            <option value="single">Single</option>
            <option value="paket">Paket</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-[0.15em] text-[#4A2C2A]/60 uppercase">Foto Produk</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFotoChange}
            className="block w-full text-sm text-[#4A2C2A] file:mr-3 file:rounded-full file:border-0 file:bg-[#FFF0E0] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#4A2C2A]"
          />
          <img src={foto} alt="Preview foto produk" className="h-24 w-full rounded-2xl border border-[#E7DDCB] object-cover" />
        </div>
        <button onClick={() => { if (!nama) return alert("Nama wajib"); onAdd({ id: "p" + Date.now(), nama, deskripsi: desk || "Risol premium", harga, foto, kategori: kat, aktif: true }); setNama(""); setDesk(""); setHarga(10000); setKat("single"); setFoto("https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=600"); }} className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm">Simpan Produk</button>
      </div>
    </div>
  );
}

function KaryawanForm({ outlets, onAdd }: { outlets: Outlet[]; onAdd: (k: Karyawan) => void }) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [outletId, setOutletId] = useState(outlets[0]?.id || "");
  const [role, setRole] = useState<"admin" | "karyawan">("karyawan");

  return (
    <div className="h-fit rounded-[20px] border-[3px] border-[#FF5A3C] bg-[#F7F1E7] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[20px] font-bold leading-none">
        <Users className="h-5 w-5 text-[#FF6B35]" />
        <span>Tambah Karyawan</span>
      </div>
      <div className="mt-5 space-y-3">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama karyawan" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email login" className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none placeholder:text-[#4A2C2A]/45" />
        <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none">
          {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "karyawan")} className="w-full rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none">
          <option value="karyawan">Karyawan</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={() => { if (!nama || !email || !outletId) return; onAdd({ id: "k" + Date.now(), nama, email, outletId, role }); setNama(""); setEmail(""); setOutletId(outlets[0]?.id || ""); setRole("karyawan"); }} className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm">Simpan Karyawan</button>
      </div>
    </div>
  );
}

function SchemaSection() {
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-[20px] bg-white border p-6 shadow-sm">
        <div className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#FF6B35]" /> Skema Database</div>
        <div className="mt-3 text-sm opacity-70">Model utama: Pelanggan, Outlet, Produk, User, Transaksi, DetailTransaksi.</div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-[20px] bg-white border p-5 shadow-sm">
          <div className="font-bold text-sm">Prisma local Laragon</div>
          <pre className="mt-3 text-[12px] whitespace-pre-wrap">{`datasource db {
  provider = "mysql"
  url = env("DATABASE_URL_LOCAL")
}`}</pre>
        </div>
        <div className="rounded-[20px] bg-white border p-5 shadow-sm">
          <div className="font-bold text-sm">Schema informasi</div>
          <pre className="mt-3 text-[12px] whitespace-pre-wrap">{`model Outlet { ... }
model Produk { ... }
model User { ... }`}</pre>
        </div>
      </div>
    </div>
  );
}
