import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.pengaturan.findUnique({
      where: { id: "landing_config" },
    });
    if (!settings) {
      settings = await prisma.pengaturan.create({
        data: { 
          id: "landing_config",
          heroDesc: "Kami membuat risol dengan kulit tipis crispy, isian premium melimpah, dan racikan mayones house-blend yang lumer. Digoreng dadakan, halal, tanpa pengawet."
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const settings = await prisma.pengaturan.upsert({
      where: { id: "landing_config" },
      update: {
        logoName: data.logoName,
        logoSlogan: data.logoSlogan,
        heroBadge: data.heroBadge,
        heroTitle1: data.heroTitle1,
        heroHighlight: data.heroHighlight,
        heroTitle2: data.heroTitle2,
        heroDesc: data.heroDesc,
        heroImage: data.heroImage,
      },
      create: {
        id: "landing_config",
        logoName: data.logoName,
        logoSlogan: data.logoSlogan,
        heroBadge: data.heroBadge,
        heroTitle1: data.heroTitle1,
        heroHighlight: data.heroHighlight,
        heroTitle2: data.heroTitle2,
        heroDesc: data.heroDesc,
        heroImage: data.heroImage,
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
