"use client";
import React, { useState } from "react";
import { LogIn } from "lucide-react";

type Karyawan = { id: string; nama: string; email: string; outletId: string; role: "admin" | "karyawan" };

function LoginFormInline({ onLogin }: { onLogin: (e:string,p:string)=>void }){
  const [email,setEmail]=useState("admin@risol.com");
  const [pass,setPass]=useState("admin123");
  return (
    <form onSubmit={e=>{e.preventDefault(); onLogin(email,pass)}} className="space-y-3">
      <div>
        <label className="text-[11px] font-bold tracking-wide opacity-60">EMAIL</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30" placeholder="email@risol.com"/>
      </div>
      <div>
        <label className="text-[11px] font-bold tracking-wide opacity-60">PASSWORD</label>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="mt-1 w-full rounded-full border bg-[#FFF8E8] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]/30" placeholder="••••••••"/>
      </div>
      <button type="submit" className="w-full bg-[#4A2C2A] text-white rounded-full py-3 font-bold flex items-center justify-center gap-2"><LogIn className="w-4 h-4"/> Masuk</button>
    </form>
  );
}

export function LoginPage({ 
  onLogin, 
  onBackToCustomer,
  karyawans 
}: { 
  onLogin: (email:string, pass:string)=>void;
  onBackToCustomer: ()=>void;
  karyawans: Karyawan[];
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-[440px] rounded-[28px] bg-white border shadow-xl p-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6B35] grid place-items-center text-white font-black text-xl">R</div>
        <h2 className="serif text-[30px] leading-none mt-4">Masuk ke Dashboard</h2>
        <p className="text-sm opacity-70 mt-2">Gunakan akun dummy untuk demo kasir.</p>
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl bg-[#FFF8E8] border p-3 text-[12px] leading-relaxed">
            <div className="font-bold">Akun Demo:</div>
            <div>Admin: <b>admin@risol.com</b> / admin123</div>
            <div>Karyawan: <b>karyawan@risol.com</b> / karyawan123</div>
          </div>
          <LoginFormInline onLogin={onLogin} />
        </div>
        <button onClick={onBackToCustomer} className="mt-4 w-full text-sm opacity-70 hover:opacity-100">← Kembali ke toko</button>
      </div>
    </div>
  );
}
