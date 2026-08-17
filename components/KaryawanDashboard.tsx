"use client";

import { useMemo, useState } from "react";
import { BarChart3, Check, Download, Edit3, Eye, LogOut, Package, Search, Settings, ShoppingCart, Store, Ticket, Trash2, Users } from "lucide-react";

import { type CartItem, type Outlet, type OutletPrice, type Product, type Sale, type Transaksi, type TransaksiStatus } from "@/components/risol-data";

export default function KaryawanDashboard({
  outlets,
  products,
  prices,
  setPrices,
  sales,
  setSales,
  transaksiList,
  setTransaksiList,
  userEmail,
  karyawans,
  selectedOutlet,
  setSelectedOutlet,
}: {
  outlets: Outlet[];
  products: Product[];
  prices: OutletPrice[];
  setPrices: any;
  sales: Sale[];
  setSales: any;
  transaksiList: Transaksi[];
  setTransaksiList: any;
  userEmail: string;
  karyawans: { id: string; nama: string; email: string; outletId: string; role: "admin" | "karyawan" }[];
  selectedOutlet: string;
  setSelectedOutlet: any;
}) {
  const [tab, setTab] = useState<"pesanan" | "pos" | "harga" | "report">("pesanan");
  const myOutletId = useMemo(() => {
    const me = karyawans.find((k) => k.email === userEmail);
    return me?.outletId || selectedOutlet || outlets[0]?.id;
  }, [karyawans, userEmail, selectedOutlet, outlets]);

  const myOutlet = outlets.find((o) => o.id === myOutletId);
  const mySales = sales.filter((s) => s.outletId === myOutletId);
  const myTransaksi = transaksiList.filter((t) => t.outletId === myOutletId);
  const myTransaksiSelesai = myTransaksi.filter((t) => t.status === "SELESAI");
  const [posCart, setPosCart] = useState<CartItem[]>([]);

  const posTotal = posCart.reduce((sum, c) => {
    const custom = prices.find((p) => p.productId === c.productId && p.outletId === myOutletId);
    const prod = products.find((p) => p.id === c.productId);
    const price = custom ? custom.harga : prod?.harga || 0;
    return sum + price * c.qty;
  }, 0);

  const addPos = (pid: string) => {
    setPosCart((prev) => {
      const ex = prev.find((i) => i.productId === pid);
      if (ex) return prev.map((i) => i.productId === pid ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: pid, qty: 1 }];
    });
  };

  const checkoutPos = () => {
    if (posCart.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const newSales: Sale[] = posCart.map((ci) => {
      const prod = products.find((p) => p.id === ci.productId)!;
      const custom = prices.find((p) => p.productId === ci.productId && p.outletId === myOutletId);
      const price = custom ? custom.harga : prod.harga;
      return { id: Math.random().toString(36).slice(2), tanggal: today, outletId: myOutletId, outletNama: myOutlet?.nama || myOutletId, productId: prod.id, productNama: prod.nama, qty: ci.qty, hargaSatuan: price, omzet: price * ci.qty };
    });

    setSales((s: Sale[]) => [...newSales, ...s]);
    setPrices((prev: OutletPrice[]) => prev.map((op) => {
      const inCart = posCart.find((c) => c.productId === op.productId && op.outletId === myOutletId);
      if (inCart) return { ...op, stok: Math.max(0, op.stok - inCart.qty) };
      return op;
    }));
    setPosCart([]);
    alert("Transaksi POS berhasil!");
  };

  const updateStatus = (id: string, status: TransaksiStatus) => {
    setTransaksiList((prev: Transaksi[]) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;

      if (status === "SELESAI" && target.status !== "SELESAI") {
        setSales((prevSales: Sale[]) => [
          ...target.items.map((item) => ({
            id: `s${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            tanggal: new Date().toISOString().slice(0, 10),
            outletId: target.outletId,
            outletNama: target.outletNama,
            productId: item.productId,
            productNama: item.productNama,
            qty: item.qty,
            hargaSatuan: item.hargaSatuan,
            omzet: item.hargaSatuan * item.qty,
          })),
          ...prevSales,
        ]);
      }

      return prev.map((t) => t.id === id ? { ...t, status } : t);
    });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#4A2C2A] text-white rounded-full px-4 py-2 font-bold"><Settings className="w-4 h-4" /> Karyawan Dashboard</div>
        <div className="flex gap-1 bg-white border rounded-full p-1 shadow-sm">
          {[
            { value: "pesanan", label: "Pesanan" },
            { value: "pos", label: "POS" },
            { value: "harga", label: "Harga" },
            { value: "report", label: "Report" },
          ].map((item) => (
            <button key={item.value} onClick={() => setTab(item.value as any)} className={`px-4 py-2 rounded-full text-sm font-medium ${tab === item.value ? "bg-[#4A2C2A] text-white" : "text-[#4A2C2A]"}`}>{item.label}</button>
          ))}
        </div>
      </div>

      {tab === "pesanan" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-[20px] bg-white border p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold tracking-[0.15em] opacity-60 uppercase">Outlet aktif</div>
              <div className="font-black text-xl">{myOutlet?.nama || "-"}</div>
            </div>
            <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none">
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </select>
          </div>

          <div className="rounded-[20px] bg-white border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#FFF8E8]">
                  <tr><th className="text-left px-4 py-3">No Antrean</th><th className="text-left px-4 py-3">Nama</th><th className="text-left px-4 py-3">Total</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Aksi</th></tr>
                </thead>
                <tbody>
                  {myTransaksi.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-4 py-3 font-bold">{t.noAntrean}</td>
                      <td className="px-4 py-3">{t.nama}</td>
                      <td className="px-4 py-3">Rp {t.total.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3"><span className="bg-[#FFF0E0] text-[#FF6B35] px-2 py-1 rounded-full text-[10px] font-bold">{t.status}</span></td>
                      <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => updateStatus(t.id, "DIPROSES")} className="text-[#4A2C2A] hover:opacity-80">Proses</button><button onClick={() => updateStatus(t.id, "SELESAI")} className="text-emerald-600 hover:opacity-80">Selesai</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "pos" && (
        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-[20px] bg-white border p-4 shadow-sm">
            <div className="font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-[#FF6B35]" /> POS Outlet</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {products.map((product) => (
                <button key={product.id} onClick={() => addPos(product.id)} className="rounded-[18px] border bg-[#FFF8E8] p-3 text-left">
                  <div className="font-bold text-sm">{product.nama}</div>
                  <div className="text-[11px] opacity-60">Rp {product.harga.toLocaleString("id-ID")}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-white border p-4 shadow-sm">
            <div className="font-bold">Keranjang POS</div>
            <div className="mt-4 space-y-3">
              {posCart.length === 0 ? <div className="text-sm opacity-60">Belum ada item</div> : posCart.map((item) => {
                const product = products.find((p) => p.id === item.productId)!;
                const price = prices.find((p) => p.productId === item.productId && p.outletId === myOutletId)?.harga || product.harga;
                return (
                  <div key={item.productId} className="rounded-[18px] border p-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-sm">{product.nama}</span>
                      <span className="font-bold">Rp {(price * item.qty).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] opacity-60">Qty {item.qty}</span>
                      <button onClick={() => setPosCart((prev) => prev.filter((i) => i.productId !== item.productId))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-[18px] bg-[#FFF8E8] p-3">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rp {posTotal.toLocaleString("id-ID")}</span></div>
              <div className="mt-4 flex justify-between font-black text-lg"><span>Total</span><span>Rp {posTotal.toLocaleString("id-ID")}</span></div>
            </div>
            <button onClick={checkoutPos} className="mt-4 w-full bg-[#4A2C2A] text-white rounded-full py-3 font-bold">Checkout POS</button>
          </div>
        </div>
      )}

      {tab === "harga" && (
        <div className="mt-6 rounded-[20px] bg-white border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF8E8]"><tr><th className="text-left px-4 py-3">Produk</th><th className="text-left px-4 py-3">Harga</th><th className="text-left px-4 py-3">Stok</th></tr></thead>
              <tbody>
                {products.map((product) => {
                  const item = prices.find((p) => p.productId === product.id && p.outletId === myOutletId);
                  return (
                    <tr key={product.id} className="border-t"><td className="px-4 py-3 font-bold">{product.nama}</td><td className="px-4 py-3">Rp {(item?.harga || product.harga).toLocaleString("id-ID")}</td><td className="px-4 py-3">{item?.stok ?? 100}</td></tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="mt-6 rounded-[20px] bg-white border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF8E8]"><tr><th className="text-left px-4 py-3">Tanggal</th><th className="text-left px-4 py-3">Produk</th><th className="text-left px-4 py-3">Qty</th><th className="text-left px-4 py-3">Omzet</th></tr></thead>
              <tbody>
                {mySales.map((sale) => (
                  <tr key={sale.id} className="border-t"><td className="px-4 py-3">{sale.tanggal}</td><td className="px-4 py-3">{sale.productNama}</td><td className="px-4 py-3">{sale.qty}</td><td className="px-4 py-3">Rp {sale.omzet.toLocaleString("id-ID")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
