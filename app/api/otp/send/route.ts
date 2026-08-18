import { NextResponse } from "next/server";

// Menggunakan in-memory cache sementara untuk menyimpan OTP
// Dalam production nyata, gunakan Redis atau Database
const otpCache = (global as any).otpCache || new Map<string, { otp: string; expires: number }>();
if (process.env.NODE_ENV !== 'production') (global as any).otpCache = otpCache;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ success: false, message: "Nomor handphone wajib diisi" }, { status: 400 });
    }

    // Generate 6 digit OTP acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // Berlaku 5 menit

    // Simpan ke cache
    otpCache.set(phone, { otp, expires });

    const message = `Halo! Ini adalah pesan dari Risol Mayones.\n\nKode OTP Anda adalah: *${otp}*\n\nBerlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`;

    const token = process.env.FONNTE_TOKEN;

    if (token) {
      // Mengirim via Fonnte jika token tersedia
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": token,
        },
        body: new URLSearchParams({
          target: phone,
          message: message,
          delay: "1",
        }),
      });
      const data = await res.json();
      if (!data.status) {
         console.log("Fonnte API response:", data);
         return NextResponse.json({ success: false, message: "Gagal mengirim WhatsApp. Cek token Fonnte." }, { status: 500 });
      }
      console.log(`[OTP] Dikirim via Fonnte ke ${phone}`);
    } else {
      // Hanya log di server jika token belum di set (untuk testing gratis)
      console.log("\n==============================================");
      console.log(`[SIMULASI WHATSAPP] Pesan untuk: ${phone}`);
      console.log(message);
      console.log("==============================================\n");
    }

    return NextResponse.json({ success: true, message: "OTP berhasil dikirim" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
