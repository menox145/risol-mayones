import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const product = await prisma.produk.update({
      where: { id: params.id },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi,
        hargaDefault: data.harga,
        foto: data.foto,
        kategori: data.kategori,
        isActive: data.aktif,
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
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update produk" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.produk.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
