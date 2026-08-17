import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.produk.findMany({
      orderBy: { nama: "asc" },
    });
    // Map to frontend expected format
    const mapped = products.map((p) => ({
      id: p.id,
      nama: p.nama,
      deskripsi: p.deskripsi,
      harga: p.hargaDefault,
      foto: p.foto,
      kategori: p.kategori,
      aktif: p.isActive,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const product = await prisma.produk.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || "",
        hargaDefault: data.harga,
        foto: data.foto || "",
        kategori: data.kategori || "single",
        isActive: data.aktif ?? true,
      },
    });
    return NextResponse.json({
      id: product.id,
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.hargaDefault,
      foto: product.foto,
      kategori: product.kategori,
      aktif: product.isActive,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
