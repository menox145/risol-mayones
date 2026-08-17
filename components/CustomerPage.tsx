"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  Download,
  Flame,
  LogIn,
  LogOut,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Ticket,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import {
  type CartItem,
  type Outlet,
  type Product,
  type Transaksi,
  type TransaksiItem,
  generateNoAntrean,
  maskWa,
  validateWa,
} from "@/components/risol-data";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; sameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; sameSite=Lax`;
}

function useSession<T>(key: string, def: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = getCookie(key);
      if (!raw) return def;
      return JSON.parse(raw);
    } catch {
      return def;
    }
  });

  return [state, setState];
}

function BarcodeVisual({ text }: { text: string }) {
  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);
    return Array.from({ length: 36 }).map((_, i) => {
      const w = ((seed + i * 7) % 3) + 2;
      const h = i % 5 === 0 ? 48 : i % 3 === 0 ? 36 : 48;
      const gap = ((seed + i * 3) % 2) + 2;
      return { w, h, gap };
    });
  }, [text]);

  return (
    <div className="w-full">
      <div className="flex items-end justify-center gap-[2px] bg-white rounded-xl border p-3 overflow-hidden">
        {bars.map((b, i) => (
          <div key={i} style={{ width: b.w, height: b.h, marginRight: b.gap }} className="bg-[#1A1A1A] rounded-[1px] shrink-0" />
        ))}
      </div>
      <div className="mt-2 text-center font-mono text-[12px] tracking-[0.15em] font-bold">{text}</div>
    </div>
  );
}

export default function CustomerPage({
  outlets,
  products,
  selectedOutlet,
  setSelectedOutlet,
  cart,
  setCart,
  user,
  setUser,
  setView,
  transaksiList,
  setTransaksiList,
  prices,
}: {
  outlets: Outlet[];
  products: Product[];
  selectedOutlet: string;
  setSelectedOutlet: React.Dispatch<React.SetStateAction<string>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: { email: string; role: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ email: string; role: string } | null>>;
  setView: React.Dispatch<React.SetStateAction<"customer" | "login" | "admin" | "karyawan">>;
  transaksiList: Transaksi[];
  setTransaksiList: React.Dispatch<React.SetStateAction<Transaksi[]>>;
  prices: { outletId: string; productId: string; harga: number; stok: number }[];
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showETicket, setShowETicket] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Transaksi | null>(null);
  const [fNama, setFNama] = useState("");
  const [fWa, setFWa] = useState("");
  const [fAlamat, setFAlamat] = useState("");
  const [fCatatan, setFCatatan] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [waVerified, setWaVerified] = useState(false);
  const [agree, setAgree] = useState(false);

  const aboutRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>, hash?: string) => {
    try { if (hash) window.location.hash = hash; } catch {}
    const el = ref.current;
    if (el) {
      el.setAttribute("data-active", "true");
      (el as HTMLElement).style.outline = "2px solid #FF6B35";
      setTimeout(() => {
        try { el.removeAttribute("data-active"); (el as HTMLElement).style.outline = ""; } catch {}
      }, 900);
      try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {}
    }
  };

  const getPrice = (productId: string, outletId: string) => {
    const custom = prices.find((p) => p.productId === productId && p.outletId === outletId);
    const prod = products.find((p) => p.id === productId);
    return custom ? custom.harga : (prod?.harga || 0);
  };

  const getStok = (productId: string, outletId: string) => {
    const custom = prices.find((p) => p.productId === productId && p.outletId === outletId);
    return custom ? custom.stok : 100;
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, c) => sum + getPrice(c.productId, selectedOutlet) * c.qty, 0),
    [cart, selectedOutlet, prices, products],
  );
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (pid: string) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === pid);
      if (ex) return prev.map((i) => (i.productId === pid ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId: pid, qty: 1 }];
    });
  };

  const updateQty = (pid: string, delta: number) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === pid);
      if (!ex) return prev;
      const newQty = ex.qty + delta;
      if (newQty <= 0) return prev.filter((i) => i.productId !== pid);
      return prev.map((i) => (i.productId === pid ? { ...i, qty: newQty } : i));
    });
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const handleKirimOtp = () => {
    if (!validateWa(fWa)) {
      alert("No WA tidak valid. Gunakan format 08... atau 62...");
      return;
    }
    setOtpSent(true);
    setWaVerified(false);
    setOtpInput("");
    alert(`OTP terkirim: 123456 (demo) ke WA ${maskWa(fWa)}`);
  };

  const handleVerifikasiOtp = () => {
    if (otpInput.trim() === "123456") {
      setWaVerified(true);
    } else {
      alert("OTP salah. Gunakan 123456 untuk demo");
    }
  };

  const isFormValid = useMemo(() => {
    return fNama.trim().length >= 3 && validateWa(fWa) && fAlamat.trim().length >= 10 && waVerified && agree && cart.length > 0;
  }, [fNama, fWa, fAlamat, waVerified, agree, cart]);

  const handleBuatAntrean = () => {
    if (!isFormValid) return;
    const outlet = outlets.find((o) => o.id === selectedOutlet);
    if (!outlet) return;

    const noAntrean = generateNoAntrean(selectedOutlet);
    const now = new Date();
    const estimasiDate = new Date(now.getTime() + 30 * 60000);
    const estimasiStr = estimasiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const today = now.toISOString().slice(0, 10);

    const items: TransaksiItem[] = cart.map((ci) => {
      const prod = products.find((p) => p.id === ci.productId)!;
      const price = getPrice(ci.productId, selectedOutlet);
      return { productId: prod.id, productNama: prod.nama, qty: ci.qty, hargaSatuan: price };
    });

    const newTrans: Transaksi = {
      id: Math.random().toString(36).slice(2),
      noAntrean,
      tanggal: today,
      outletId: outlet.id,
      outletNama: outlet.nama,
      nama: fNama.trim(),
      wa: fWa.trim(),
      waMasked: maskWa(fWa.trim()),
      alamat: fAlamat.trim(),
      catatan: fCatatan.trim(),
      items,
      total: cartTotal,
      estimasi: estimasiStr,
      status: "MENUNGGU",
      createdAt: now.toISOString(),
    };

    setTransaksiList((prev) => [newTrans, ...prev]);
    setCurrentTicket(newTrans);
    setShowCheckout(false);
    setShowETicket(true);
    setCart([]);
    setOtpSent(false);
    setOtpInput("");
  };

  return (
    <div className="min-h-screen bg-[#FFF8E8] text-[#4A2C2A] font-[Inter,system-ui] selection:bg-[#FF6B35]/20">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FFF8E8]/85 border-b border-[#4A2C2A]/10">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF6B35] grid place-items-center text-white font-black">R</div>
            <div className="leading-none">
              <div className="font-extrabold tracking-tight">RISOL MAYONES</div>
              <div className="text-[10px] tracking-[0.2em] opacity-60 -mt-1">LUMER • CRISPY • PREMIUM</div>
            </div>
          </div>

          {(
            <nav className="hidden md:flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border max-w-full overflow-hidden">
              <button onClick={() => { setView("customer"); scrollTo(aboutRef, "tentang"); }} className="px-4 py-1.5 rounded-full text-sm font-medium transition bg-[#4A2C2A] text-white">Tentang</button>
              <button onClick={() => { setView("customer"); scrollTo(menuRef, "menu"); }} className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black/5">Menu</button>
              <button onClick={() => { setView("customer"); scrollTo(profileRef, "profil"); }} className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black/5">Profil</button>
            </nav>
          )}

          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center gap-2 bg-white border rounded-full pl-3 pr-1 py-1 shadow-sm">
              <MapPin className="w-4 h-4 text-[#FF6B35]" />
              <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="bg-transparent text-sm font-medium outline-none pr-2">
                {outlets.filter((o) => o.aktif).map((o) => (
                  <option key={o.id} value={o.id}>{o.nama}</option>
                ))}
              </select>
            </div>

            <button onClick={() => scrollTo(menuRef, "keranjang")} className="relative bg-[#4A2C2A] text-white rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> <span className="hidden sm:inline">Keranjang</span>
              {cartCount > 0 && <span className="bg-[#FF6B35] text-white text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{cartCount}</span>}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs bg-white border px-3 py-1.5 rounded-full">{user.email} • {user.role}</span>
                <button onClick={() => { setUser(null); setView("customer"); }} className="w-9 h-9 grid place-items-center bg-white border rounded-full"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setView("login")} className="bg-white border rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2"><LogIn className="w-4 h-4" /> Login</button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <main className="space-y-12">
          <section ref={aboutRef} className="scroll-mt-24">
            <div className="rounded-[28px] overflow-hidden bg-white border shadow-[0_12px_40px_rgba(74,44,42,0.08)] grid md:grid-cols-[1.1fr_0.9fr]">
              <div className="p-7 md:p-10">
                <div className="inline-flex items-center gap-2 bg-[#FFF0E0] text-[#FF6B35] px-3 py-1 rounded-full text-xs font-bold tracking-wide"><Flame className="w-3.5 h-3.5" /> BEST SELLER SEJAK 2018</div>
                <h1 className="serif text-[42px] md:text-[56px] leading-[0.9] mt-4 font-[400]">Risol Mayones <span className="italic text-[#FF6B35]">Lumer</span> yang Bikin Nagih.</h1>
                <p className="mt-4 text-[15px] leading-6 opacity-80 max-w-[48ch]">Kami membuat risol dengan kulit tipis crispy, isian premium melimpah, dan racikan mayones house-blend yang lumer. Digoreng dadakan, halal, tanpa pengawet.</p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { t: "Mayones Lumer", d: "House blend creamy pedas manis", i: "🥫" },
                    { t: "Kulit Crispy", d: "Tipis, golden, tidak berminyak", i: "✨" },
                    { t: "Isian Premium", d: "Smoked beef, sosis, ayam suwir", i: "🥩" },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl bg-[#FFF8E8] border p-3">
                      <div className="text-xl">{c.i}</div>
                      <div className="font-bold text-[13px] mt-1">{c.t}</div>
                      <div className="text-[11px] opacity-70 leading-tight mt-1">{c.d}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => scrollTo(menuRef)} className="bg-[#FF6B35] text-white rounded-full px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-orange-200">Pesan Sekarang <ArrowRight className="w-4 h-4" /></button>
                  <button onClick={() => scrollTo(profileRef)} className="bg-white border rounded-full px-6 py-3 font-bold">Lihat Profil</button>
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm">
                  <div className="flex -space-x-2">{[1, 2, 3].map((i) => <img key={i} src={`https://i.pravatar.cc/40?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />)}</div>
                  <div>
                    <div className="flex gap-1"><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /></div>
                    <div className="text-xs opacity-70">4.9/5 dari 1.2k pelanggan</div>
                  </div>
                </div>
              </div>
              <div className="bg-[radial-gradient(circle_at_top_left,_#FFF0E0,_#FFF8E8_40%,_white_100%)] p-7 md:p-10 flex items-center">
                <div className="w-full rounded-[28px] bg-white border p-5 shadow-lg">
                  <div className="flex items-center justify-between"><div className="font-bold">Outlet favorite</div><span className="text-[10px] bg-[#FFF0E0] text-[#FF6B35] px-2 py-1 rounded-full font-bold">Live order</span></div>
                  <div className="mt-5 space-y-4">
                    {outlets.filter((o) => o.aktif).slice(0, 3).map((o) => (
                      <div key={o.id} className="rounded-2xl border p-3 bg-[#FFF8E8]">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-sm">{o.nama}</div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Buka</span>
                        </div>
                        <div className="mt-2 text-xs opacity-70">{o.alamat}</div>
                        <div className="mt-3 flex items-center justify-between text-[11px] opacity-70">
                          <span>{o.kota}</span>
                          <span>20–30 menit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section ref={menuRef} className="scroll-mt-24">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold tracking-[0.2em] opacity-60 uppercase">Menu</div>
                <h2 className="text-3xl md:text-4xl font-black mt-1">Pilihan favorit hari ini</h2>
              </div>
              <div className="flex items-center gap-2 bg-white border rounded-full px-3 py-2 text-sm">
                <Search className="w-4 h-4 text-[#FF6B35]" />
                <span>Cari menu</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => {
                const price = getPrice(product.id, selectedOutlet);
                const stok = getStok(product.id, selectedOutlet);
                return (
                  <div key={product.id} className="overflow-hidden rounded-[24px] bg-white border shadow-sm">
                    <div className="relative h-40">
                      <img src={product.foto} alt={product.nama} className="w-full h-full object-cover" />
                      <div className="absolute left-3 top-3 bg-white/90 text-[#4A2C2A] px-2 py-1 rounded-full text-[10px] font-bold">{product.kategori}</div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-lg">{product.nama}</div>
                          <div className="text-xs opacity-70 mt-1">{product.deskripsi}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg">Rp {price.toLocaleString("id-ID")}</div>
                          <div className="text-[10px] opacity-60">Stok {stok}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-[11px] bg-[#FFF0E0] text-[#FF6B35] px-2 py-1 rounded-full font-bold">{product.aktif ? "Ready" : "Tidak aktif"}</div>
                        <button onClick={() => addToCart(product.id)} className="bg-[#4A2C2A] text-white rounded-full px-3 py-2 text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section ref={profileRef} className="scroll-mt-24 pb-10">
            <div className="rounded-[28px] bg-[#4A2C2A] text-[#FFF8E8] p-7 md:p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-[#FF6B35]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 relative">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-70">Profil</div>
                  <h3 className="text-3xl md:text-4xl font-black mt-2">Risol Mayones sejak 2018</h3>
                  <p className="mt-4 opacity-80 max-w-[50ch]">Berasal dari cinta pada jajanan pasar yang hangat dan lumer, kami hadir untuk menghadirkan rasa yang konsisten, cepat, dan nikmat di setiap gigitan.</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><div className="text-[11px] uppercase opacity-60">Cabang</div><div className="font-black text-2xl mt-2">{outlets.filter((o) => o.aktif).length}</div></div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><div className="text-[11px] uppercase opacity-60">Rasa</div><div className="font-black text-2xl mt-2">6+</div></div>
                  </div>
                </div>
                <div className="rounded-[24px] bg-white/5 border border-white/10 p-5">
                  <div className="font-bold text-lg">Kontak & jam</div>
                  <div className="mt-4 space-y-3 text-sm opacity-90">
                    <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#FF6B35]" /> +62 812-3456-7890</div>
                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[#FF6B35]" /> Kemang, Jakarta Selatan</div>
                    <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-[#FF6B35]" /> 10.00–22.00 WIB</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-[11px] tracking-wide opacity-50">© 2025 Risol Mayones • Dibuat dengan Next.js 14 • Laragon MySQL (local) & Neon Postgres (production)</div>
          </section>
        </main>

        <aside className="lg:sticky lg:top-[88px] h-fit">
          <div className="rounded-[24px] bg-white border shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="font-black text-lg">Keranjang</div>
              <div className="text-xs bg-[#FFF0E0] text-[#FF6B35] px-2 py-1 rounded-full font-bold">{cartCount} item</div>
            </div>

            <div className="p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-sm opacity-60">Belum ada item di keranjang.</div>
              ) : (
                cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  const price = getPrice(item.productId, selectedOutlet);
                  return (
                    <div key={item.productId} className="rounded-2xl border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{product.nama}</div>
                          <div className="text-[11px] opacity-60">Rp {price.toLocaleString("id-ID")}</div>
                        </div>
                        <button onClick={() => updateQty(item.productId, -999)} className="text-[#4A2C2A]/60 hover:text-[#4A2C2A]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 bg-[#FFF8E8] rounded-full p-1">
                          <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-white"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="w-5 text-center text-sm font-bold">{item.qty}</span>
                          <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-white"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="font-bold text-sm">Rp {(price * item.qty).toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="rounded-2xl bg-[#FFF8E8] border p-3">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-sm mt-1 opacity-70"><span>Biaya layanan</span><span>Rp 0</span></div>
                <div className="mt-3 border-t pt-3 flex justify-between font-black text-lg"><span>Total</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
              </div>

              <button onClick={openCheckout} disabled={cart.length === 0} className="w-full bg-[#FF6B35] text-white rounded-full py-3 font-bold disabled:opacity-40 disabled:cursor-not-allowed">Lanjut Checkout</button>
            </div>
          </div>
        </aside>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#4A2C2A]/40 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative w-full max-w-[560px] bg-[#FFF8E8] rounded-t-[28px] md:rounded-[28px] border shadow-[0_24px_64px_rgba(74,44,42,0.25)] overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b bg-white/60">
              <div>
                <div className="text-[11px] tracking-[0.2em] opacity-60 uppercase">Checkout</div>
                <div className="font-black text-xl">Buat antrean</div>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-9 h-9 rounded-full border bg-white grid place-items-center"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-auto space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input value={fNama} onChange={(e) => setFNama(e.target.value)} placeholder="Nama lengkap" className="w-full rounded-full border bg-white px-4 py-2.5 text-sm outline-none" />
                <input value={fWa} onChange={(e) => setFWa(e.target.value)} placeholder="No WA" className="w-full rounded-full border bg-white px-4 py-2.5 text-sm outline-none" />
              </div>
              <input value={fAlamat} onChange={(e) => setFAlamat(e.target.value)} placeholder="Alamat lengkap" className="w-full rounded-full border bg-white px-4 py-2.5 text-sm outline-none" />
              <textarea value={fCatatan} onChange={(e) => setFCatatan(e.target.value)} placeholder="Catatan khusus (opsional)" className="w-full min-h-[90px] rounded-[20px] border bg-white px-4 py-3 text-sm outline-none" />

              <div className="rounded-[20px] bg-white border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-sm">Verifikasi WA</div>
                  {!otpSent ? (
                    <button onClick={handleKirimOtp} className="bg-[#FFF0E0] text-[#FF6B35] px-3 py-1.5 rounded-full text-xs font-bold">Kirim OTP</button>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">OTP dikirim</span>
                  )}
                </div>

                {otpSent && (
                  <div className="mt-3 space-y-2">
                    <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Masukkan 123456" className="w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none" />
                    <button onClick={handleVerifikasiOtp} className="w-full bg-[#4A2C2A] text-white rounded-full py-2.5 text-sm font-bold">Verifikasi OTP</button>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 text-sm rounded-[20px] bg-white border p-3">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                <span>Saya setuju dengan syarat & ketentuan serta data pembelian dapat diproses.</span>
              </label>

              <div className="rounded-[20px] bg-[#4A2C2A] text-white p-4">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between text-sm mt-1 opacity-75"><span>Estimasi</span><span>30 menit</span></div>
                <div className="mt-3 border-t border-white/20 pt-3 flex justify-between font-black text-xl"><span>Total</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
              </div>

              <button disabled={!isFormValid} onClick={handleBuatAntrean} className="w-full bg-[#FF6B35] text-white rounded-full py-3 font-bold disabled:opacity-40">Buat Antrean</button>
            </div>
          </div>
        </div>
      )}

      {showETicket && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#4A2C2A]/50 backdrop-blur-md" onClick={() => setShowETicket(false)} />
          <div className="relative w-full max-w-[520px] bg-[#FFF8E8] rounded-t-[28px] md:rounded-[28px] border shadow-[0_24px_80px_rgba(74,44,42,0.35)] overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b bg-white/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] tracking-[0.2em] opacity-60 uppercase">E-Ticket</div>
                <div className="font-black text-xl">Nomor antrean Anda</div>
              </div>
              <button onClick={() => setShowETicket(false)} className="w-9 h-9 rounded-full border bg-white grid place-items-center"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-[24px] bg-white border p-4 text-center">
                <div className="text-[11px] font-bold tracking-[0.2em] opacity-60 uppercase">{currentTicket.outletNama}</div>
                <div className="mt-3 text-4xl font-black tracking-tight">{currentTicket.noAntrean}</div>
                <div className="mt-2 text-sm opacity-70">Estimasi selesai {currentTicket.estimasi}</div>
              </div>
              <BarcodeVisual text={currentTicket.noAntrean} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[18px] bg-white border p-3"><div className="text-[10px] uppercase opacity-60">Nama</div><div className="mt-1 font-bold">{currentTicket.nama}</div></div>
                <div className="rounded-[18px] bg-white border p-3"><div className="text-[10px] uppercase opacity-60">WA</div><div className="mt-1 font-bold">{currentTicket.waMasked}</div></div>
              </div>
              <div className="rounded-[18px] bg-white border p-3 text-sm">
                <div className="text-[10px] uppercase opacity-60">Alamat</div>
                <div className="mt-1 font-bold">{currentTicket.alamat}</div>
              </div>
              <div className="rounded-[18px] bg-[#FFF0E0] border border-[#FF6B35]/20 p-3 text-sm">
                <div className="flex justify-between"><span>Total</span><span className="font-black">Rp {currentTicket.total.toLocaleString("id-ID")}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowETicket(false)} className="bg-white border rounded-full py-3 font-bold">Tutup</button>
                <button className="bg-[#FF6B35] text-white rounded-full py-3 font-bold">Download Tiket</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

