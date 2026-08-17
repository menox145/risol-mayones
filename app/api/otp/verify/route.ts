import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    
    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
    }

    const otpCache = (global as any).otpCache;
    if (!otpCache) {
      return NextResponse.json({ success: false, message: "Sesi OTP tidak ditemukan, silakan minta ulang" }, { status: 400 });
    }

    const data = otpCache.get(phone);
    if (!data) {
      return NextResponse.json({ success: false, message: "Nomor ini belum meminta OTP" }, { status: 400 });
    }

    if (Date.now() > data.expires) {
      otpCache.delete(phone);
      return NextResponse.json({ success: false, message: "Kode OTP sudah kedaluwarsa" }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ success: false, message: "Kode OTP salah" }, { status: 400 });
    }

    // Jika berhasil, hapus otp dari cache
    otpCache.delete(phone);
    return NextResponse.json({ success: true, message: "OTP valid" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
