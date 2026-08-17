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
  onBackToCustomer
}: { 
  onLogin: (email:string, pass:string)=>void;
  onBackToCustomer: ()=>void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#4A2C2A]/40 backdrop-blur-sm" onClick={onBackToCustomer} />
      <div className="relative w-[400px] max-w-[95vw] min-h-[400px] flex flex-col justify-center rounded-[24px] bg-white border shadow-2xl p-7">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B35] grid place-items-center text-white font-black text-lg">R</div>
        <h2 className="serif text-[26px] leading-tight mt-4">Masuk ke Dashboard</h2>
        <p className="text-[12px] opacity-70 mt-1.5">Gunakan akun dummy untuk demo kasir.</p>
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-[#FFF8E8] border p-3 text-[11px] leading-relaxed">
            <div className="font-bold">Akun Demo:</div>
            <div className="mt-1">Admin: <b>admin@risol.com</b> / admin123</div>
            <div>Karyawan: <b>karyawan@risol.com</b> / karyawan123</div>
          </div>
          <LoginFormInline onLogin={onLogin} />
        </div>
        <button onClick={onBackToCustomer} className="mt-4 w-full text-[12px] opacity-60 hover:opacity-100 transition">Batal</button>
      </div>
    </div>
  );
}
