import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const outlet = await prisma.outlet.update({
      where: { id: params.id },
      data: {
        nama: data.nama,
        alamat: data.alamat,
        kota: data.kota,
        isActive: data.aktif,
      },
    });
    return NextResponse.json({
      id: outlet.id,
      nama: outlet.nama,
      alamat: outlet.alamat,
      kota: outlet.kota,
      aktif: outlet.isActive,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update outlet" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.outlet.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus outlet" }, { status: 500 });
  }
}
