import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const outlets = await prisma.outlet.findMany({
      orderBy: { nama: "asc" },
    });
    const mapped = outlets.map((o) => ({
      id: o.id,
      nama: o.nama,
      alamat: o.alamat,
      kota: o.kota,
      aktif: o.isActive,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data outlet" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const outlet = await prisma.outlet.create({
      data: {
        nama: data.nama,
        alamat: data.alamat,
        kota: data.kota,
        isActive: data.aktif ?? true,
        kode: data.nama.substring(0, 3).toUpperCase() + Date.now().toString().substring(8),
      },
    });
    return NextResponse.json({
      id: outlet.id,
      nama: outlet.nama,
      alamat: outlet.alamat,
      kota: outlet.kota,
      aktif: outlet.isActive,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat outlet" }, { status: 500 });
  }
}
