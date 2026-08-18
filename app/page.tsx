"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import KaryawanDashboard from "@/components/KaryawanDashboard";
import { LoginPage } from "@/components/LoginPage";
import { LandingConfig, DEFAULT_LANDING } from "@/components/risol-data";
import {
  ShoppingCart,
  MapPin,
  Plus,
  Minus,
  Trash2,
  LogIn,
  LogOut,
  Store,
  UtensilsCrossed,
  Users,
  BarChart3,
  Settings,
  Clock,
  Phone,
  Star,
  Flame,
  ChefHat,
  Package,
  Search,
  Download,
  X,
  Check,
  Edit3,
  Eye,
  ArrowRight,
  ShieldCheck,
  Ticket,
  MessageCircle,
  Timer,
  BadgeCheck,
} from "lucide-react";

// Types
type Outlet = { id: string; nama: string; alamat: string; kota: string; aktif: boolean };
type Product = { id: string; nama: string; deskripsi: string; harga: number; foto: string; kategori: "single" | "paket"; aktif: boolean };
type Karyawan = { id: string; nama: string; email: string; outletId: string; role: "admin" | "karyawan" };
type OutletPrice = { outletId: string; productId: string; harga: number; stok: number };
type Sale = { id: string; tanggal: string; outletId: string; outletNama: string; productId: string; productNama: string; qty: number; hargaSatuan: number; omzet: number };
type CartItem = { productId: string; qty: number };
type TransaksiStatus = "MENUNGGU" | "DIPROSES" | "SELESAI";
type TransaksiItem = { productId: string; productNama: string; qty: number; hargaSatuan: number };
type Transaksi = {
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

const SEED_OUTLETS: Outlet[] = [
  { id: "o1", nama: "Risol Mayo Pusat - Kemang", alamat: "Jl. Kemang Raya No. 12", kota: "Jakarta Selatan", aktif: true },
  { id: "o2", nama: "Risol Mayo - BSD City", alamat: "AEON Mall BSD, Lt. 2", kota: "Tangerang", aktif: true },
  { id: "o3", nama: "Risol Mayo - Bekasi", alamat: "Jl. Ahmad Yani No. 45", kota: "Bekasi", aktif: true },
  { id: "o4", nama: "Risol Mayo - Depok", alamat: "Margonda Raya 88", kota: "Depok", aktif: false },
];

const OUTLET_CODES: Record<string, string> = { o1: "KMG", o2: "BSD", o3: "BKS", o4: "DPK" };

const SEED_PRODUCTS: Product[] = [
  { id: "p1", nama: "Risol Mayo Original", deskripsi: "Mayones lumer, smoked chicken premium, kulit crispy golden", harga: 8000, foto: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=600", kategori: "single", aktif: true },
  { id: "p2", nama: "Risol Mayo Smoked Beef", deskripsi: "Daging sapi asap + keju mozarella + mayo pedas manis", harga: 12000, foto: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600", kategori: "single", aktif: true },
  { id: "p3", nama: "Risol Mayo Sosis", deskripsi: "Sosis bratwurst, telur, mayo original lumer di mulut", harga: 10000, foto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600", kategori: "single", aktif: true },
  { id: "p4", nama: "Risol Mayo Ayam Pedas", deskripsi: "Ayam suwir pedas level 3, keju, mayo creamy", harga: 11000, foto: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?q=80&w=600", kategori: "single", aktif: true },
  { id: "p5", nama: "Paket Box 10", deskripsi: "Mix 10 pcs bebas pilih varian, free saus sambal", harga: 95000, foto: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600", kategori: "paket", aktif: true },
  { id: "p6", nama: "Paket Party 25", deskripsi: "25 pcs mix, cocok arisan & kantor, free box premium", harga: 220000, foto: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600", kategori: "paket", aktif: true },
];

const SEED_KARYAWAN: Karyawan[] = [
  { id: "k1", nama: "Admin Pusat", email: "admin@risol.com", outletId: "o1", role: "admin" },
  { id: "k2", nama: "Siti Karyawan", email: "karyawan@risol.com", outletId: "o1", role: "karyawan" },
  { id: "k3", nama: "Budi BSD", email: "budi@risol.com", outletId: "o2", role: "karyawan" },
];

const SEED_PRICES: OutletPrice[] = [
  { outletId: "o1", productId: "p1", harga: 8000, stok: 120 },
  { outletId: "o1", productId: "p2", harga: 12000, stok: 80 },
  { outletId: "o1", productId: "p3", harga: 10000, stok: 90 },
  { outletId: "o2", productId: "p1", harga: 9000, stok: 60 },
  { outletId: "o2", productId: "p2", harga: 13000, stok: 40 },
];

const SEED_SALES: Sale[] = [
  { id: "s1", tanggal: new Date().toISOString().slice(0, 10), outletId: "o1", outletNama: "Risol Mayo Pusat - Kemang", productId: "p1", productNama: "Risol Mayo Original", qty: 12, hargaSatuan: 8000, omzet: 96000 },
  { id: "s2", tanggal: new Date().toISOString().slice(0, 10), outletId: "o1", outletNama: "Risol Mayo Pusat - Kemang", productId: "p2", productNama: "Risol Mayo Smoked Beef", qty: 5, hargaSatuan: 12000, omzet: 60000 },
  { id: "s3", tanggal: new Date(Date.now() - 86400000).toISOString().slice(0, 10), outletId: "o2", outletNama: "Risol Mayo - BSD City", productId: "p5", productNama: "Paket Box 10", qty: 2, hargaSatuan: 95000, omzet: 190000 },
];

const SEED_TRANSAKSI: Transaksi[] = [];

function maskWa(wa: string) {
  const clean = wa.replace(/\D/g, "");
  if (clean.length <= 7) return clean;
  return clean.slice(0, 4) + "****" + clean.slice(-3);
}
function validateWa(wa: string) {
  const clean = wa.replace(/\D/g, "");
  if (clean.length < 10 || clean.length > 13) return false;
  return clean.startsWith("08") || clean.startsWith("62") || clean.startsWith("628");
}
function generateNoAntrean(outletId: string) {
  const code = OUTLET_CODES[outletId] || outletId.slice(0, 3).toUpperCase();
  const count = Math.floor(Math.random() * 1000) + 1;
  const num = String(count).padStart(3, "0");
  return `RM-${code}-${num}`;
}

function BarcodeVisual({ text }: { text: string }) {
  const bars = useMemo(() => {
    let seed = 0; for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);
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

export default function App() {
  const [view, setView] = useState<"customer" | "login" | "admin" | "karyawan">("customer");
  const [outlets, setOutlets] = useState<Outlet[]>(SEED_OUTLETS);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [karyawans, setKaryawans] = useState<Karyawan[]>(SEED_KARYAWAN);
  const [prices, setPrices] = useState<OutletPrice[]>(SEED_PRICES);
  const [sales, setSales] = useState<Sale[]>(SEED_SALES);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(SEED_TRANSAKSI);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING);
  const [selectedOutlet, setSelectedOutlet] = useState<string>("o1");
  const [user, setUser] = useState<{ email: string, role: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {

    // Fetch initial data from APIs
    if (typeof window !== "undefined") {
      fetch("/api/outlets").then(r => r.json()).then(data => {
        if (Array.isArray(data)) setOutlets(data);
      }).catch(console.error);
    }

    fetch("/api/products").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProducts(data);
    }).catch(console.error);

    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data && data.id === "landing_config") setLandingConfig(data);
    }).catch(console.error);
  }, []);

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
    try { if (hash) window.location.hash = hash; } catch { }
    const el = ref.current;
    if (el) {
      el.setAttribute("data-active", "true");
      (el as HTMLElement).style.outline = "2px solid #FF6B35";
      setTimeout(() => { try { el.removeAttribute("data-active"); (el as HTMLElement).style.outline = ""; } catch { } }, 900);
      try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { }
    }
  };

  const getPrice = (productId: string, outletId: string) => {
    const custom = prices.find(p => p.productId === productId && p.outletId === outletId);
    const prod = products.find(p => p.id === productId);
    return custom ? custom.harga : (prod?.harga || 0);
  };
  const getStok = (productId: string, outletId: string) => {
    const custom = prices.find(p => p.productId === productId && p.outletId === outletId);
    return custom ? custom.stok : 100;
  };

  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + getPrice(c.productId, selectedOutlet) * c.qty, 0), [cart, selectedOutlet, prices, products]);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (pid: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === pid);
      if (ex) return prev.map(i => i.productId === pid ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: pid, qty: 1 }];
    });
  };
  const updateQty = (pid: string, delta: number) => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === pid);
      if (!ex) return prev;
      const newQty = ex.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.productId !== pid);
      return prev.map(i => i.productId === pid ? { ...i, qty: newQty } : i);
    });
  };
  const openCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };
  const handleKirimOtp = () => {
    if (!validateWa(fWa)) {
      alert("No WA tidak valid. Gunakan format 08... atau 62... 10-13 digit");
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
    const outlet = outlets.find(o => o.id === selectedOutlet);
    if (!outlet) return;
    const noAntrean = generateNoAntrean(selectedOutlet);
    const now = new Date();
    const estimasiDate = new Date(now.getTime() + 30 * 60000);
    const estimasiStr = estimasiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const today = now.toISOString().slice(0, 10);
    const items: TransaksiItem[] = cart.map(ci => {
      const prod = products.find(p => p.id === ci.productId)!;
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
    setTransaksiList(prev => [newTrans, ...prev]);
    setCurrentTicket(newTrans);
    setShowCheckout(false);
    setShowETicket(true);
    setCart([]);
    setOtpSent(false);
    setOtpInput("");
  };

  const handleLogin = (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const password = pass.trim();

    let role = "";
    if (normalizedEmail === "admin@risol.com" && password === "admin123") role = "admin";
    else if (normalizedEmail === "karyawan@risol.com" && password === "karyawan123") role = "karyawan";

    if (role) {
      const userData = { email: normalizedEmail, role };
      setUser(userData);
      setShowLoginModal(false);
      setView(role as "admin" | "karyawan");
      return;
    }

    alert("Email / password salah. Gunakan admin@risol.com / admin123 atau karyawan@risol.com / karyawan123");
  };

  const handleLogout = () => {
    setUser(null);
    setView("customer");
  };

  return (
    <div className="min-h-screen bg-[#FFF8E8] text-[#4A2C2A] font-[Inter,system-ui] selection:bg-[#FF6B35]/20">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FFF8E8]/85 border-b border-[#4A2C2A]/10">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF6B35] grid place-items-center text-white font-black">R</div>
            <div className="leading-none">
              <div className="font-extrabold tracking-tight">{landingConfig.logoName}</div>
              <div className="text-[10px] tracking-[0.2em] opacity-60 -mt-1">{landingConfig.logoSlogan}</div>
            </div>
          </div>
          {view === "customer" && (
            <nav className="hidden md:flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border max-w-full overflow-hidden">
              <button onClick={() => { setView("customer"); scrollTo(aboutRef, "tentang"); }} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${view === "customer" ? "bg-[#4A2C2A] text-white" : "hover:bg-black/5"}`}>Tentang</button>
              <button onClick={() => { setView("customer"); scrollTo(menuRef, "menu"); }} className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black/5">Menu</button>
              <button onClick={() => { setView("customer"); scrollTo(profileRef, "profil"); }} className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black/5">Profil</button>
            </nav>
          )}
          <div className="flex items-center gap-2">
            {view === "customer" && (
              <div className="relative hidden md:flex items-center gap-2 bg-white border rounded-full pl-3 pr-1 py-1 shadow-sm">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                <select value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)} className="bg-transparent text-sm font-medium outline-none pr-2">
                  {outlets.filter(o => o.aktif).map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
                </select>
              </div>
            )}
            {view === "customer" && (
              <button onClick={() => scrollTo(menuRef, "keranjang")} className="relative bg-[#4A2C2A] text-white rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> <span className="hidden sm:inline">Keranjang</span>
                {cartCount > 0 && <span className="bg-[#FF6B35] text-white text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{cartCount}</span>}
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs bg-white border px-3 py-1.5 rounded-full">{user.email} • {user.role}</span>
                <button onClick={handleLogout} className="w-9 h-9 grid place-items-center bg-white border rounded-full"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-white border rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2"><LogIn className="w-4 h-4" /> Login</button>
            )}
          </div>
        </div>
      </header>

      {view === "customer" && (
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <main className="space-y-12">
            <section ref={aboutRef} className="scroll-mt-24">
              <div className="rounded-[28px] overflow-hidden bg-white border shadow-[0_12px_40px_rgba(74,44,42,0.08)] grid md:grid-cols-[1.1fr_0.9fr]">
                <div className="p-7 md:p-10">
                  <div className="inline-flex items-center gap-2 bg-[#FFF0E0] text-[#FF6B35] px-3 py-1 rounded-full text-xs font-bold tracking-wide"><Flame className="w-3.5 h-3.5" /> {landingConfig.heroBadge}</div>
                  <h1 className="serif text-[42px] md:text-[56px] leading-[0.9] mt-4 font-[400]">{landingConfig.heroTitle1}<span className="italic text-[#FF6B35]">{landingConfig.heroHighlight}</span>{landingConfig.heroTitle2}</h1>
                  <p className="mt-4 text-[15px] leading-6 opacity-80 max-w-[48ch]">{landingConfig.heroDesc}</p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      { t: "Mayones Lumer", d: "House blend creamy pedas manis", i: "🥫" },
                      { t: "Kulit Crispy", d: "Tipis, golden, tidak berminyak", i: "✨" },
                      { t: "Isian Premium", d: "Smoked beef, sosis, ayam suwir", i: "🥩" },
                    ].map(c => (
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
                    <div className="flex -space-x-2">{[1, 2, 3].map(i => <img key={i} src={`https://i.pravatar.cc/40?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />)}</div>
                    <div><div className="flex gap-1"><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /><Star className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" /></div><div className="text-xs opacity-70">4.9/5 dari 1.2k pelanggan</div></div>
                  </div>
                </div>
                <div className="relative min-h-[380px] bg-[#FFE9D2]">
                  <img src={landingConfig.heroImage} className="absolute inset-0 w-full h-full object-cover" alt="Risol" />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl p-4 border shadow-lg flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#4A2C2A] grid place-items-center text-white"><ChefHat className="w-6 h-6" /></div>
                    <div><div className="font-bold leading-tight">Dibuat fresh setiap hari</div><div className="text-xs opacity-70">06:00 - 21:00 • Halal MUI</div></div>
                    <div className="ml-auto text-right"><div className="font-black text-[#FF6B35] text-lg">100%</div><div className="text-[10px] tracking-wide font-bold opacity-60 -mt-1">FRESH</div></div>
                  </div>
                </div>
              </div>
            </section>

            <section ref={menuRef} className="scroll-mt-24">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-xs tracking-[0.2em] font-bold opacity-50">MENU PRODUK</div>
                  <h2 className="serif text-[32px] leading-none mt-1">Pilih Varian Favoritmu</h2>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white border rounded-full px-3 py-1.5">
                  <MapPin className="w-4 h-4 text-[#FF6B35]" />
                  <select value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)} className="bg-transparent text-sm font-semibold outline-none">
                    {outlets.filter(o => o.aktif).map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {products.filter(p => p.aktif).map(p => {
                  const price = getPrice(p.id, selectedOutlet);
                  const stok = getStok(p.id, selectedOutlet);
                  const inCart = cart.find(c => c.productId === p.id);
                  return (
                    <div key={p.id} className="group rounded-[22px] bg-white border shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden flex">
                      <div className="w-[112px] shrink-0 relative">
                        <img src={p.foto} alt={p.nama} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-[#4A2C2A] text-white text-[10px] font-bold px-2 py-1 rounded-full">{p.kategori.toUpperCase()}</div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold leading-tight">{p.nama}</div>
                            <div className="text-[12px] opacity-70 leading-tight mt-1 line-clamp-2">{p.deskripsi}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-[#FF6B35]">Rp {price.toLocaleString("id-ID")}</div>
                            <div className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${stok < 10 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>Stok {stok}</div>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 flex items-center gap-2">
                          {inCart ? (
                            <div className="flex items-center gap-2 bg-[#4A2C2A] text-white rounded-full px-2 py-1">
                              <button onClick={() => updateQty(p.id, -1)} className="w-7 h-7 grid place-items-center bg-white/15 rounded-full"><Minus className="w-4 h-4" /></button>
                              <span className="w-8 text-center font-bold text-sm">{inCart.qty}</span>
                              <button onClick={() => updateQty(p.id, 1)} className="w-7 h-7 grid place-items-center bg-white/15 rounded-full"><Plus className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(p.id)} className="flex-1 bg-[#FFF0E0] hover:bg-[#FF6B35] hover:text-white text-[#4A2C2A] border border-[#FF6B35]/20 rounded-full py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition"><ShoppingCart className="w-4 h-4" /> Tambah</button>
                          )}
                          <div className="text-[11px] opacity-60 ml-auto">Outlet: {outlets.find(o => o.id === selectedOutlet)?.kota}</div>
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
                    <div className="text-xs tracking-[0.2em] font-bold opacity-60">COMPANY PROFILE</div>
                    <h3 className="serif text-[36px] leading-[0.95] mt-2">Dari dapur rumahan jadi <span className="italic text-[#FF6B35]">favorit keluarga.</span></h3>
                    <p className="mt-4 text-[14px] leading-6 opacity-80">Berdiri 2018 di Kemang, Risol Mayones berkomitmen menyajikan camilan premium dengan harga merakyat. Semua risol dibuat halal, fresh, dan bisa dipesan untuk harian, arisan, hingga catering kantor.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><div className="font-bold">Visi</div><div className="text-xs opacity-80 mt-1 leading-relaxed">Menjadi brand risol mayo #1 Indonesia dengan outlet di 20 kota.</div></div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><div className="font-bold">Misi</div><div className="text-xs opacity-80 mt-1 leading-relaxed">Kualitas premium, pelayanan cepat, harga jujur.</div></div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-white text-[#4A2C2A] rounded-full px-4 py-2 font-semibold"><Phone className="w-4 h-4" /> WA 0812-3456-7890</div>
                      <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2"><Clock className="w-4 h-4" /> 06:00 - 21:00 WIB</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-[#FFF8E8] text-[#4A2C2A] p-4 border">
                      <div className="font-bold flex items-center gap-2"><Store className="w-4 h-4" /> Outlet Kami</div>
                      <div className="mt-3 space-y-2">
                        {outlets.filter(o => o.aktif).map(o => (
                          <div key={o.id} className="flex gap-2 text-[13px]"><MapPin className="w-4 h-4 mt-0.5 text-[#FF6B35] shrink-0" /><div><div className="font-semibold leading-tight">{o.nama}</div><div className="opacity-70 leading-tight">{o.alamat}, {o.kota}</div></div></div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#FF6B35] p-4 text-white">
                      <div className="font-bold">Pesan partai besar?</div>
                      <div className="text-sm opacity-90 mt-1">Diskon hingga 15% untuk 100+ pcs. Hubungi admin pusat.</div>
                      <a href="https://wa.me/6285158445278?text=Halo%20Admin%20Risol%20Mayones%20Pusat,%20saya%20mau%20pesan%20partai%20besar%20100%2B%20pcs" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex bg-white text-[#FF6B35] rounded-full px-4 py-2 font-bold text-sm items-center gap-1.5"><MessageCircle className="w-4 h-4" />Chat Admin</a>
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
                <div className="font-extrabold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#FF6B35]" /> Keranjang</div>
                <div className="text-xs bg-[#FFF0E0] px-2.5 py-1 rounded-full font-bold">{cartCount} item</div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[11px] font-bold tracking-wide opacity-60">LOKASI OUTLET</label>
                  <div className="mt-1 relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B35]" />
                    <select value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)} className="w-full bg-[#FFF8E8] border rounded-full pl-9 pr-3 py-2.5 text-sm font-semibold outline-none">
                      {outlets.filter(o => o.aktif).map(o => <option key={o.id} value={o.id}>{o.nama} - {o.kota}</option>)}
                    </select>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF0E0] grid place-items-center text-2xl">🛒</div>
                    <div className="font-bold mt-3">Keranjang kosong</div>
                    <div className="text-xs opacity-60 mt-1">Tambah risol favoritmu dulu ya</div>
                    <button onClick={() => scrollTo(menuRef)} className="mt-4 bg-[#4A2C2A] text-white rounded-full px-5 py-2 text-sm font-bold">Lihat Menu</button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
                    {cart.map(ci => {
                      const prod = products.find(p => p.id === ci.productId)!;
                      const price = getPrice(ci.productId, selectedOutlet);
                      return (
                        <div key={ci.productId} className="flex gap-3 bg-[#FFF8E8] border rounded-2xl p-2.5">
                          <img src={prod.foto} className="w-12 h-12 rounded-xl object-cover" alt={prod.nama} />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[13px] leading-tight truncate">{prod.nama}</div>
                            <div className="text-[11px] opacity-70">Rp {price.toLocaleString("id-ID")} x {ci.qty}</div>
                            <div className="mt-1 flex items-center gap-1">
                              <button onClick={() => updateQty(ci.productId, -1)} className="w-6 h-6 rounded-full bg-white border grid place-items-center"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-bold w-6 text-center">{ci.qty}</span>
                              <button onClick={() => updateQty(ci.productId, 1)} className="w-6 h-6 rounded-full bg-white border grid place-items-center"><Plus className="w-3 h-3" /></button>
                              <button onClick={() => setCart(c => c.filter(i => i.productId !== ci.productId))} className="ml-auto w-6 h-6 rounded-full bg-white border grid place-items-center text-red-500"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <div className="font-black text-sm">Rp {(price * ci.qty).toLocaleString("id-ID")}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-2xl bg-[#4A2C2A] text-white p-4">
                  <div className="flex justify-between text-sm opacity-80"><span>Subtotal</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between text-sm opacity-80 mt-1"><span>Ongkir</span><span className="text-[#FFD2BF]">Gratis (≤3km)</span></div>
                  <div className="h-px bg-white/15 my-3" />
                  <div className="flex justify-between font-black text-lg"><span>Total</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                  <button disabled={cart.length === 0} onClick={openCheckout} className="mt-4 w-full bg-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full py-3 font-bold flex items-center justify-center gap-2"><Package className="w-4 h-4" /> Checkout Sekarang</button>
                  <div className="text-[10px] opacity-60 text-center mt-2">Pembayaran COD / Transfer • Pesanan masuk ke report</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {showLoginModal && (
        <LoginPage
          onLogin={handleLogin}
          onBackToCustomer={() => setShowLoginModal(false)}
        />
      )}

      {view === "admin" && (
        <AdminDashboard
          outlets={outlets} setOutlets={setOutlets}
          products={products} setProducts={setProducts}
          karyawans={karyawans} setKaryawans={setKaryawans}
          sales={sales}
          prices={prices}
          transaksiList={transaksiList} setTransaksiList={setTransaksiList}
          landingConfig={landingConfig} setLandingConfig={setLandingConfig}
        />
      )}

      {view === "karyawan" && (
        <KaryawanDashboard
          outlets={outlets}
          products={products}
          prices={prices} setPrices={setPrices}
          sales={sales} setSales={setSales}
          transaksiList={transaksiList} setTransaksiList={setTransaksiList}
          userEmail={user?.email || "karyawan@risol.com"}
          karyawans={karyawans}
          selectedOutlet={selectedOutlet} setSelectedOutlet={setSelectedOutlet}
        />
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#4A2C2A]/40 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative w-full max-w-[560px] bg-[#FFF8E8] rounded-t-[28px] md:rounded-[28px] border shadow-[0_24px_64px_rgba(74,44,42,0.25)] overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#4A2C2A] text-[#FFF8E8] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35] grid place-items-center"><ShoppingCart className="w-5 h-5" /></div>
                <div><div className="font-extrabold leading-tight">Checkout Pesanan</div><div className="text-xs opacity-70">{cartCount} item • Rp {cartTotal.toLocaleString("id-ID")} • {outlets.find(o => o.id === selectedOutlet)?.nama}</div></div>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-auto">
              <div>
                <label className="text-[11px] font-bold tracking-[0.12em] opacity-60">NAMA LENGKAP *</label>
                <input value={fNama} onChange={e => setFNama(e.target.value)} placeholder="Contoh: Budi Santoso" className="mt-1.5 w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30" />
                {fNama && fNama.trim().length < 3 && <div className="text-[11px] text-red-600 mt-1">Minimal 3 karakter</div>}
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-[0.12em] opacity-60">NO WHATSAPP *</label>
                <div className="mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B35]" />
                    <input value={fWa} onChange={e => { setFWa(e.target.value); setWaVerified(false); setOtpSent(false); }} placeholder="08xxxxxxxxxx / 62xxxxxxxx" className="w-full rounded-full border bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30" />
                  </div>
                  <button onClick={handleKirimOtp} className="shrink-0 bg-[#4A2C2A] text-white rounded-full px-5 py-3 text-sm font-bold hover:bg-black transition flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" />Kirim OTP</button>
                </div>
                {fWa && !validateWa(fWa) && <div className="text-[11px] text-red-600 mt-1">Format 08/62, 10-13 digit</div>}
                {waVerified && <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold"><BadgeCheck className="w-4 h-4" /> WA Terverifikasi</div>}
              </div>
              {otpSent && !waVerified && (
                <div className="rounded-[20px] bg-white border p-4 space-y-3">
                  <div className="text-xs font-bold tracking-wide opacity-70">MASUKKAN OTP (demo: 123456)</div>
                  <div className="flex gap-2">
                    <input value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="123456" className="flex-1 rounded-full border bg-[#FFF8E8] px-4 py-3 text-sm tracking-[0.3em] font-mono font-bold outline-none focus:ring-2 focus:ring-[#FF6B35]/30" />
                    <button onClick={handleVerifikasiOtp} className="bg-[#FF6B35] text-white rounded-full px-5 py-3 text-sm font-bold">Verifikasi OTP</button>
                  </div>
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold tracking-[0.12em] opacity-60">ALAMAT LENGKAP *</label>
                <textarea value={fAlamat} onChange={e => setFAlamat(e.target.value)} placeholder="Jl, RT/RW, Kelurahan, Kecamatan, Patokan..." rows={3} className="mt-1.5 w-full rounded-[20px] border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30 resize-none" />
                {fAlamat && fAlamat.trim().length < 10 && <div className="text-[11px] text-red-600 mt-1">Minimal 10 karakter</div>}
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-[0.12em] opacity-60">CATATAN (OPSIONAL)</label>
                <input value={fCatatan} onChange={e => setFCatatan(e.target.value)} placeholder="Contoh: Tanpa cabe, saus extra..." className="mt-1.5 w-full rounded-full border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30" />
              </div>
              <label className="flex gap-3 bg-white border rounded-2xl p-4 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#FF6B35]" />
                <span className="text-[13px] leading-snug">Saya setuju pesanan tidak bisa dibatalkan setelah antrean dibuat</span>
              </label>
              <div className="rounded-2xl bg-[#4A2C2A] text-white p-4">
                <div className="flex justify-between text-sm opacity-80"><span>Outlet</span><span className="font-bold">{outlets.find(o => o.id === selectedOutlet)?.nama}</span></div>
                <div className="flex justify-between font-black text-lg mt-2"><span>Total</span><span>Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                <button disabled={!isFormValid} onClick={handleBuatAntrean} className="mt-4 w-full bg-[#FF6B35] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"><Ticket className="w-5 h-5" />Buat Antrean & E-Tiket</button>
                <div className="text-[10px] opacity-60 text-center mt-2">OTP wajib verifikasi • Data disimpan lokal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showETicket && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-[#4A2C2A]/50 backdrop-blur-md" onClick={() => setShowETicket(false)} />
          <div className="relative w-full max-w-[520px] bg-[#FFF8E8] rounded-t-[28px] md:rounded-[28px] border shadow-[0_24px_80px_rgba(74,44,42,0.35)] overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#4A2C2A] text-[#FFF8E8] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Ticket className="w-5 h-5 text-[#FF6B35]" /><span className="text-xs tracking-[0.2em] font-bold opacity-60">E-TIKET • ANTRIAN</span></div>
                <div className={`text-[11px] px-3 py-1 rounded-full font-bold ${currentTicket.status === "MENUNGGU" ? "bg-[#FF6B35]" : currentTicket.status === "DIPROSES" ? "bg-blue-500" : "bg-green-600"} text-white`}>{currentTicket.status}</div>
              </div>
              <div className="serif text-[36px] leading-none mt-3 tracking-tight">{currentTicket.noAntrean}</div>
              <div className="text-sm opacity-70 mt-1">{currentTicket.outletNama} • Estimasi {currentTicket.estimasi}</div>
            </div>
            <div className="p-6 space-y-4 overflow-auto">
              <div className="rounded-[20px] bg-white border border-dashed border-[#4A2C2A]/20 p-4">
                <BarcodeVisual text={currentTicket.noAntrean} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white border p-3"><div className="text-[10px] font-bold opacity-50 tracking-wide">NAMA</div><div className="font-bold text-sm mt-1">{currentTicket.nama}</div></div>
                <div className="rounded-2xl bg-white border p-3"><div className="text-[10px] font-bold opacity-50 tracking-wide">WA</div><div className="font-bold text-sm mt-1">{currentTicket.waMasked}</div></div>
                <div className="rounded-2xl bg-white border p-3 col-span-2"><div className="text-[10px] font-bold opacity-50 tracking-wide">ALAMAT</div><div className="text-sm mt-1 leading-snug">{currentTicket.alamat}</div>{currentTicket.catatan && <div className="text-xs opacity-60 mt-2">Catatan: {currentTicket.catatan}</div>}</div>
              </div>
              <div className="rounded-2xl bg-white border p-4">
                <div className="text-[11px] font-bold tracking-wide opacity-60 mb-2">RINCIAN PESANAN</div>
                <div className="space-y-2">
                  {currentTicket.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-sm"><span>{it.productNama} x{it.qty}</span><span className="font-bold">Rp {(it.hargaSatuan * it.qty).toLocaleString("id-ID")}</span></div>
                  ))}
                </div>
                <div className="h-px bg-black/10 my-3" />
                <div className="flex justify-between font-black"><span>Total</span><span className="text-[#FF6B35]">Rp {currentTicket.total.toLocaleString("id-ID")}</span></div>
                <div className="flex items-center gap-2 mt-3 text-xs bg-[#FFF0E0] border border-orange-100 rounded-full px-3 py-1.5 w-fit"><Timer className="w-4 h-4 text-[#FF6B35]" />Estimasi siap +30 menit • Status: {currentTicket.status}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowETicket(false)} className="flex-1 bg-white border rounded-full py-3 font-bold">Tutup</button>
                <a href={`https://wa.me/6285158445278?text=Halo%20Admin%20pesanan%20${encodeURIComponent(currentTicket.noAntrean)}%20nama%20${encodeURIComponent(currentTicket.nama)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#FF6B35] text-white rounded-full py-3 font-bold flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" />Chat Admin WA</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
