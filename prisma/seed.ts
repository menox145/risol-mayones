import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Outlets
  const outlets = await Promise.all([
    prisma.outlet.upsert({
      where: { kode: "KMG" },
      update: {},
      create: {
        nama: "Risol Mayo Pusat - Kemang",
        kode: "KMG",
        alamat: "Jl. Kemang Raya No. 12",
        kota: "Jakarta Selatan",
        isActive: true,
      },
    }),
    prisma.outlet.upsert({
      where: { kode: "BSD" },
      update: {},
      create: {
        nama: "Risol Mayo - BSD City",
        kode: "BSD",
        alamat: "AEON Mall BSD, Lt. 2",
        kota: "Tangerang",
        isActive: true,
      },
    }),
    prisma.outlet.upsert({
      where: { kode: "BKS" },
      update: {},
      create: {
        nama: "Risol Mayo - Bekasi",
        kode: "BKS",
        alamat: "Jl. Ahmad Yani No. 45",
        kota: "Bekasi",
        isActive: true,
      },
    }),
    prisma.outlet.upsert({
      where: { kode: "DPK" },
      update: {},
      create: {
        nama: "Risol Mayo - Depok",
        kode: "DPK",
        alamat: "Margonda Raya 88",
        kota: "Depok",
        isActive: false,
      },
    }),
  ]);

  console.log(`✅ Seeded ${outlets.length} outlets`);

  // Seed Produk
  const products = [
    {
      nama: "Risol Mayo Original",
      deskripsi: "Mayones lumer, smoked chicken premium, kulit crispy golden",
      hargaDefault: 8000,
      foto: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=600",
      kategori: "single",
    },
    {
      nama: "Risol Mayo Smoked Beef",
      deskripsi: "Daging sapi asap + keju mozarella + mayo pedas manis",
      hargaDefault: 12000,
      foto: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600",
      kategori: "single",
    },
    {
      nama: "Risol Mayo Sosis",
      deskripsi: "Sosis bratwurst, telur, mayo original lumer di mulut",
      hargaDefault: 10000,
      foto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600",
      kategori: "single",
    },
    {
      nama: "Risol Mayo Ayam Pedas",
      deskripsi: "Ayam suwir pedas level 3, keju, mayo creamy",
      hargaDefault: 11000,
      foto: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?q=80&w=600",
      kategori: "single",
    },
    {
      nama: "Paket Box 10",
      deskripsi: "Mix 10 pcs bebas pilih varian, free saus sambal",
      hargaDefault: 95000,
      foto: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600",
      kategori: "paket",
    },
    {
      nama: "Paket Party 25",
      deskripsi: "25 pcs mix, cocok arisan & kantor, free box premium",
      hargaDefault: 220000,
      foto: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600",
      kategori: "paket",
    },
  ];

  const seededProducts = [];
  for (const p of products) {
    // Check if already exists by name to avoid duplicates
    const existing = await prisma.produk.findFirst({ where: { nama: p.nama } });
    if (!existing) {
      const created = await prisma.produk.create({ data: { ...p, isActive: true } });
      seededProducts.push(created);
    } else {
      seededProducts.push(existing);
    }
  }

  console.log(`✅ Seeded ${seededProducts.length} products`);

  // Seed Pengaturan (Landing Config)
  await prisma.pengaturan.upsert({
    where: { id: "landing_config" },
    update: {},
    create: {
      id: "landing_config",
      logoName: "RISOL MAYONES",
      logoSlogan: "LUMER • CRISPY • PREMIUM",
      heroBadge: "BEST SELLER SEJAK 2018",
      heroTitle1: "Risol Mayones ",
      heroHighlight: "Lumer",
      heroTitle2: " yang Bikin Nagih.",
      heroDesc: "Kami membuat risol dengan kulit tipis crispy, isian premium melimpah, dan racikan mayones house-blend yang lumer. Digoreng dadakan, halal, tanpa pengawet.",
      heroImage: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?q=80&w=800",
    },
  });

  console.log("✅ Seeded landing config");
  console.log("\n🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
