"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Check, Download, Edit3, Eye, Package, Settings, ShieldCheck, Store, Ticket, Trash2, Users, X, Layout } from "lucide-react";

import {
  type Karyawan,
  type Outlet,
  type OutletPrice,
  type Product,
  type Sale,
  type Transaksi,
  type TransaksiStatus,
  type LandingConfig,
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
  landingConfig,
  setLandingConfig,
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
  landingConfig: LandingConfig;
  setLandingConfig: any;
}) {
  const [tab, setTab] = useState<"outlet" | "menu" | "karyawan" | "pesanan" | "report" | "schema" | "tampilan">("pesanan");
  const [filterOutlet, setFilterOutlet] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchPesanan, setSearchPesanan] = useState("");
  const [filterOutletPesanan, setFilterOutletPesanan] = useState<string>("all");
  // Bug 6 fix: state untuk modal detail pesanan
  const [selectedPesanan, setSelectedPesanan] = useState<Transaksi | null>(null);

  // Auto-sync landing config antar browser (polling setiap 5 detik)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id === "landing_config") {
            setLandingConfig(data);
          }
        }
      } catch (err) {
        console.error("Sync landing config error:", err);
      }
    }, 5000); // Poll setiap 5 detik
    return () => clearInterval(syncInterval);
  }, [setLandingConfig]);

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
            { value: "tampilan", label: "Tampilan", icon: Layout },
            { value: "schema", label: "DB Schema", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => setTab(item.value as any)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  tab === item.value ? "bg-[#FF6B35] text-white shadow-sm" : "text-[#4A2C2A] hover:bg-[#FFF8E8]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== TAB PESANAN ===== */}
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
              <table className="w-full text-sm text-left">
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
                  {filteredPesanan.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm opacity-50">Belum ada pesanan masuk</td></tr>
                  )}
                  {filteredPesanan.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-4 py-3 font-bold">{t.noAntrean}</td>
                      <td className="px-4 py-3">{t.outletNama}</td>
                      <td className="px-4 py-3">{t.nama}<div className="text-[11px] opacity-60">{t.waMasked}</div></td>
                      <td className="px-4 py-3">Rp {t.total.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          t.status === "MENUNGGU" ? "bg-[#FFF0E0] text-[#FF6B35]" :
                          t.status === "DIPROSES" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-700"
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {/* Bug 6 fix: Eye button sekarang buka modal detail */}
                          <button
                            onClick={() => setSelectedPesanan(t)}
                            title="Lihat detail pesanan"
                            className="w-8 h-8 grid place-items-center rounded-full bg-[#FFF8E8] border text-[#4A2C2A] hover:opacity-80"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {t.status !== "SELESAI" && (
                            <button
                              onClick={() => setTransaksiList((prev: Transaksi[]) => prev.map((x) => x.id === t.id ? { ...x, status: "SELESAI" as TransaksiStatus } : x))}
                              title="Tandai Selesai"
                              className="w-8 h-8 grid place-items-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 hover:opacity-80"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB OUTLET ===== */}
      {tab === "outlet" && (
        <div className="mt-6 flex items-start gap-6">
          <div className="w-[320px] shrink-0">
            {/* Bug 3 fix: pakai OutletForm component, bukan inline form */}
            <OutletForm onAdd={(o: Outlet) => setOutlets((prev: Outlet[]) => [o, ...prev])} />
          </div>

          <div className="flex-1 rounded-[20px] bg-white border shadow-sm overflow-hidden w-full">
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
                    {/* Bug 4 fix: Edit button toggle aktif outlet */}
                    <button
                      title={o.aktif ? "Nonaktifkan outlet" : "Aktifkan outlet"}
                      onClick={async () => {
                        const res = await fetch(`/api/outlets/${o.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...o, aktif: !o.aktif })
                        });
                        if (res.ok) {
                          setOutlets((prev: Outlet[]) => prev.map((x) => x.id === o.id ? { ...x, aktif: !x.aktif } : x));
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A2C2A]/20 bg-white text-[#4A2C2A] hover:bg-[#FFF8E8]"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {/* Bug 4 fix: Delete button hapus outlet */}
                    <button
                      title="Hapus outlet"
                      onClick={async () => { 
                        if (confirm(`Hapus outlet "${o.nama}"?`)) {
                          const res = await fetch(`/api/outlets/${o.id}`, { method: "DELETE" });
                          if (res.ok) setOutlets((prev: Outlet[]) => prev.filter((x) => x.id !== o.id));
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB MENU ===== */}
      {tab === "menu" && (
        <div className="mt-6 flex items-start gap-6">
          <div className="w-[320px] shrink-0">
            <ProductForm onAdd={(p: Product) => setProducts((prev: Product[]) => [p, ...prev])} />
          </div>

          <div className="flex-1 rounded-[20px] bg-white border shadow-sm overflow-hidden w-full">
            <div className="border-b bg-[#FFF8E8] p-4">
              <div className="text-[18px] font-bold">Menu Produk • {products.length} items</div>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              {products.map((p) => (
                <div key={p.id} className={`flex items-center gap-4 rounded-[18px] border border-[#E7DDCB] bg-[#F9F5EF] p-3 ${!p.aktif ? "opacity-60" : ""}`}>
                  <img src={p.foto} alt={p.nama} className="h-16 w-16 rounded-xl object-cover" />

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[18px] leading-tight">{p.nama}</div>
                    <div className="line-clamp-2 text-xs text-[#4A2C2A]/70">{p.deskripsi}</div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[18px] font-black text-[#FF6B35]">Rp {p.harga.toLocaleString("id-ID")}</span>
                      <span className="rounded-full border border-[#E7DDCB] bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-[#4A2C2A]">{p.kategori}</span>
                      {!p.aktif && <span className="rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-[10px] font-bold">Nonaktif</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bug 5 fix: Check button toggle aktif produk */}
                    <button
                      title={p.aktif ? "Nonaktifkan produk" : "Aktifkan produk"}
                      onClick={async () => {
                        const res = await fetch(`/api/products/${p.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...p, aktif: !p.aktif })
                        });
                        if (res.ok) {
                          setProducts((prev: Product[]) => prev.map((x) => x.id === p.id ? { ...x, aktif: !x.aktif } : x));
                        }
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${p.aktif ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    {/* Bug 5 fix: Trash button hapus produk */}
                    <button
                      title="Hapus produk"
                      onClick={async () => { 
                        if (confirm(`Hapus produk "${p.nama}"?`)) {
                          const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                          if (res.ok) setProducts((prev: Product[]) => prev.filter((x) => x.id !== p.id));
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB KARYAWAN ===== */}
      {tab === "karyawan" && (
        <div className="mt-6 flex items-start gap-6">
          <div className="w-[320px] shrink-0">
            <KaryawanForm outlets={outlets} onAdd={(k: Karyawan) => setKaryawans((prev: Karyawan[]) => [k, ...prev])} />
          </div>

          <div className="flex-1 rounded-[20px] bg-white border shadow-sm overflow-hidden w-full">
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

                    {/* Bug 4 fix: Delete button hapus karyawan */}
                    <button
                      title="Hapus karyawan"
                      onClick={() => { if (confirm(`Hapus karyawan "${k.nama}"?`)) setKaryawans((prev: Karyawan[]) => prev.filter((x) => x.id !== k.id)); }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB REPORT ===== */}
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

      {tab === "tampilan" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-[20px] bg-white border p-6 shadow-sm max-w-2xl">
            <div className="font-bold text-lg mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-[#FF6B35]" /> Edit Tampilan Dashboard</div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold opacity-60">LOGO (NAMA PERUSAHAAN)</label>
                <input value={landingConfig.logoName} onChange={(e) => setLandingConfig({...landingConfig, logoName: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-60">LOGO SLOGAN</label>
                <input value={landingConfig.logoSlogan} onChange={(e) => setLandingConfig({...landingConfig, logoSlogan: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
              </div>
              <hr className="my-2" />
              <div>
                <label className="text-[11px] font-bold opacity-60">BADGE TEXT</label>
                <input value={landingConfig.heroBadge} onChange={(e) => setLandingConfig({...landingConfig, heroBadge: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-60">JUDUL (BAGIAN 1)</label>
                <input value={landingConfig.heroTitle1} onChange={(e) => setLandingConfig({...landingConfig, heroTitle1: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-60">JUDUL (HIGHLIGHT)</label>
                <input value={landingConfig.heroHighlight} onChange={(e) => setLandingConfig({...landingConfig, heroHighlight: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-60">JUDUL (BAGIAN 2)</label>
                <input value={landingConfig.heroTitle2} onChange={(e) => setLandingConfig({...landingConfig, heroTitle2: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-60">DESKRIPSI (KATA-KATA)</label>
                <textarea value={landingConfig.heroDesc} onChange={(e) => setLandingConfig({...landingConfig, heroDesc: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" rows={3} />
              </div>
              <hr className="my-2" />
              <div>
                <label className="text-[11px] font-bold opacity-60">FOTO DASHBOARD (URL GAMBAR)</label>
                <input value={landingConfig.heroImage} onChange={(e) => setLandingConfig({...landingConfig, heroImage: e.target.value})} className="w-full mt-1 p-2 border rounded-xl" />
                {landingConfig.heroImage && <img src={landingConfig.heroImage} className="mt-2 w-full max-h-48 object-cover rounded-xl border" />}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    const res = await fetch("/api/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(landingConfig)
                    });
                    if (res.ok) {
                      // Fetch ulang data terbaru dari server untuk sync ke semua browser
                      const getRes = await fetch("/api/settings");
                      if (getRes.ok) {
                        const data = await getRes.json();
                        if (data && data.id === "landing_config") {
                          setLandingConfig(data);
                        }
                      }
                      alert("Pengaturan Tampilan Berhasil Disimpan!");
                    } else {
                      alert("Gagal menyimpan pengaturan!");
                    }
                  }}
                  className="bg-[#FF6B35] text-white px-6 py-2 rounded-full font-bold hover:bg-[#e55e2d]"
                >
                  Simpan Tampilan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DETAIL PESANAN (Bug 6 fix) ===== */}
      {selectedPesanan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#4A2C2A]/40 backdrop-blur-sm" onClick={() => setSelectedPesanan(null)} />
          <div className="relative w-full max-w-[520px] bg-[#FFF8E8] rounded-[28px] border shadow-[0_24px_64px_rgba(74,44,42,0.25)] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#4A2C2A] text-[#FFF8E8] p-5 flex items-center justify-between">
              <div>
                <div className="text-xs tracking-[0.2em] font-bold opacity-60">DETAIL PESANAN</div>
                <div className="font-black text-xl mt-0.5">{selectedPesanan.noAntrean}</div>
                <div className="text-xs opacity-70 mt-0.5">{selectedPesanan.outletNama}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-3 py-1 rounded-full font-bold text-white ${
                  selectedPesanan.status === "MENUNGGU" ? "bg-[#FF6B35]" :
                  selectedPesanan.status === "DIPROSES" ? "bg-blue-500" : "bg-emerald-600"
                }`}>{selectedPesanan.status}</span>
                <button onClick={() => setSelectedPesanan(null)} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white border p-3"><div className="text-[10px] font-bold opacity-50 tracking-wide">NAMA</div><div className="font-bold text-sm mt-1">{selectedPesanan.nama}</div></div>
                <div className="rounded-2xl bg-white border p-3"><div className="text-[10px] font-bold opacity-50 tracking-wide">WA</div><div className="font-bold text-sm mt-1">{selectedPesanan.waMasked}</div></div>
                <div className="rounded-2xl bg-white border p-3 col-span-2">
                  <div className="text-[10px] font-bold opacity-50 tracking-wide">ALAMAT</div>
                  <div className="text-sm mt-1 leading-snug">{selectedPesanan.alamat}</div>
                  {selectedPesanan.catatan && <div className="text-xs opacity-60 mt-2">Catatan: {selectedPesanan.catatan}</div>}
                </div>
                <div className="rounded-2xl bg-white border p-3"><div className="text-[10px] font-bold opacity-50 tracking-wide">ESTIMASI</div><div className="font-bold text-sm mt-1">{selectedPesanan.estimasi}</div></div>
                <div className="rounded-2xl bg-white border p-3"><div className="text-[10px] font-bold opacity-50 tracking-wide">TANGGAL</div><div className="font-bold text-sm mt-1">{selectedPesanan.tanggal}</div></div>
              </div>
              <div className="rounded-2xl bg-white border p-4">
                <div className="text-[11px] font-bold tracking-wide opacity-60 mb-2">RINCIAN PESANAN</div>
                <div className="space-y-2">
                  {selectedPesanan.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{it.productNama} x{it.qty}</span>
                      <span className="font-bold">Rp {(it.hargaSatuan * it.qty).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-black/10 my-3" />
                <div className="flex justify-between font-black">
                  <span>Total</span>
                  <span className="text-[#FF6B35]">Rp {selectedPesanan.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              {selectedPesanan.status !== "SELESAI" && (
                <div className="flex gap-3">
                  {selectedPesanan.status === "MENUNGGU" && (
                    <button
                      onClick={() => {
                        setTransaksiList((prev: Transaksi[]) => prev.map((x) => x.id === selectedPesanan.id ? { ...x, status: "DIPROSES" as TransaksiStatus } : x));
                        setSelectedPesanan((p) => p ? { ...p, status: "DIPROSES" as TransaksiStatus } : null);
                      }}
                      className="flex-1 bg-blue-500 text-white rounded-full py-3 font-bold text-sm hover:bg-blue-600 transition"
                    >Proses Pesanan</button>
                  )}
                  <button
                    onClick={() => {
                      setTransaksiList((prev: Transaksi[]) => prev.map((x) => x.id === selectedPesanan.id ? { ...x, status: "SELESAI" as TransaksiStatus } : x));
                      setSelectedPesanan((p) => p ? { ...p, status: "SELESAI" as TransaksiStatus } : null);
                    }}
                    className="flex-1 bg-emerald-600 text-white rounded-full py-3 font-bold text-sm hover:bg-emerald-700 transition"
                  >Tandai Selesai</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bug 3 fix: OutletForm sekarang digunakan (bukan didefinisikan tapi tidak dipakai)
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
        <button
          onClick={async () => {
            if (!nama || !alamat || !kota) return;
            const payload = { nama, alamat, kota, aktif: true };
            const res = await fetch("/api/outlets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const o = await res.json();
              onAdd(o);
              setNama(""); setAlamat(""); setKota("");
            } else {
              alert("Gagal menyimpan outlet");
            }
          }}
          className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm"
        >Simpan Outlet</button>
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
    if (!isImage) { alert("Format foto harus PNG, JPG, atau JPEG"); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setFoto(reader.result); };
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
          <input type="number" value={harga} onChange={(e) => setHarga(Number(e.target.value))} placeholder="Harga" className="flex-1 rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none" />
          <select value={kat} onChange={(e) => setKat(e.target.value as "single" | "paket")} className="rounded-full border border-[#E7DDCB] bg-[#F2EBDD] px-4 py-3 text-sm text-[#4A2C2A] outline-none">
            <option value="single">Single</option>
            <option value="paket">Paket</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-[0.15em] text-[#4A2C2A]/60 uppercase">Foto Produk</label>
          <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFotoChange} className="block w-full text-sm text-[#4A2C2A] file:mr-3 file:rounded-full file:border-0 file:bg-[#FFF0E0] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#4A2C2A]" />
          <img src={foto} alt="Preview foto produk" className="h-24 w-full rounded-2xl border border-[#E7DDCB] object-cover" />
        </div>
        <button
          onClick={async () => {
            if (!nama) return alert("Nama wajib");
            const payload = { nama, deskripsi: desk || "Risol premium", harga, foto, kategori: kat, aktif: true };
            const res = await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const p = await res.json();
              onAdd(p);
              setNama(""); setDesk(""); setHarga(10000); setKat("single");
              setFoto("https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=600");
            } else {
              alert("Gagal menyimpan produk");
            }
          }}
          className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm"
        >Simpan Produk</button>
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
        <button
          onClick={() => {
            if (!nama || !email || !outletId) return;
            onAdd({ id: "k" + Date.now(), nama, email, outletId, role });
            setNama(""); setEmail(""); setOutletId(outlets[0]?.id || ""); setRole("karyawan");
          }}
          className="w-full rounded-full bg-[#4A2C2A] py-3 text-[16px] font-bold text-white shadow-sm"
        >Simpan Karyawan</button>
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
          <pre className="mt-3 text-[12px] whitespace-pre-wrap">{`datasource db {\n  provider = "mysql"\n  url = env("DATABASE_URL_LOCAL")\n}`}</pre>
        </div>
        <div className="rounded-[20px] bg-white border p-5 shadow-sm">
          <div className="font-bold text-sm">Schema informasi</div>
          <pre className="mt-3 text-[12px] whitespace-pre-wrap">{`model Outlet { ... }\nmodel Produk { ... }\nmodel User { ... }`}</pre>
        </div>
      </div>
    </div>
  );
}
