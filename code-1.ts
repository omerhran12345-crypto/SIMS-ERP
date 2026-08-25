import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const accounts = [
  { code: "1000", nameAr: "الأصول", nameEn: "Assets", type: "ASSET" },
  { code: "1100", nameAr: "النقدية بالصندوق", nameEn: "Cash on Hand", type: "ASSET", parent: "1000" },
  { code: "1200", nameAr: "البنك", nameEn: "Bank", type: "ASSET", parent: "1000" },
  { code: "1300", nameAr: "المخزون", nameEn: "Inventory", type: "ASSET", parent: "1000" },
  { code: "1400", nameAr: "ذمم العملاء (آجل)", nameEn: "Accounts Receivable", type: "ASSET", parent: "1000" },
  { code: "2000", nameAr: "الالتزامات", nameEn: "Liabilities", type: "LIABILITY" },
  { code: "2100", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT Payable", type: "LIABILITY", parent: "2000" },
  { code: "2200", nameAr: "ذمم الموردين", nameEn: "Accounts Payable", type: "LIABILITY", parent: "2000" },
  { code: "3000", nameAr: "حقوق الملكية", nameEn: "Equity", type: "EQUITY" },
  { code: "3100", nameAr: "رأس المال", nameEn: "Capital", type: "EQUITY", parent: "3000" },
  { code: "4000", nameAr: "الإيرادات", nameEn: "Revenue", type: "REVENUE" },
  { code: "4100", nameAr: "إيرادات المبيعات", nameEn: "Sales Revenue", type: "REVENUE", parent: "4000" },
  { code: "5000", nameAr: "المصروفات", nameEn: "Expenses", type: "EXPENSE" },
  { code: "5100", nameAr: "تكلفة البضاعة المباعة", nameEn: "COGS", type: "EXPENSE", parent: "5000" },
  { code: "5200", nameAr: "عجز الجرد", nameEn: "Inventory Shortage", type: "EXPENSE", parent: "5000" },
];

const companies = [
  { name: "صيدلية الشفاء", sector: "PHARMACY", city: "الخرطوم", state: "الخرطوم" },
  { name: "سوبرماركت النيل", sector: "SUPERMARKET", city: "بحري", state: "الخرطوم" },
  { name: "مصانع السودان للأغذية", sector: "FACTORY", city: "بورتسودان", state: "البحر الأحمر" },
  { name: "أثاث الخرطوم الحديث", sector: "FURNITURE", city: "الخرطوم", state: "الخرطوم" },
  { name: "مغالق الجزيرة", sector: "HARDWARE", city: "ود مدني", state: "الجزيرة" },
  { name: "أزياء أم درمان", sector: "CLOTHING", city: "أم درمان", state: "الخرطوم" },
];

async function main() {
  // دليل الحسابات
  const map = new Map<string, string>();
  for (const a of accounts.filter((x) => !x.parent)) {
    const acc = await prisma.account.upsert({
      where: { code: a.code }, update: {},
      create: { code: a.code, nameAr: a.nameAr, nameEn: a.nameEn, type: a.type },
    });
    map.set(a.code, acc.id);
  }
  for (const a of accounts.filter((x) => x.parent)) {
    await prisma.account.upsert({
      where: { code: a.code }, update: {},
      create: { code: a.code, nameAr: a.nameAr, nameEn: a.nameEn, type: a.type, parentId: map.get(a.parent!) },
    });
  }

  // مستخدم admin
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sims.sd" }, update: {},
    create: {
      fullName: "مدير النظام", companyName: "SIMS", country: "السودان",
      phone: "+249111396212", email: "admin@sims.sd", password: hash,
      role: "admin", kycStatus: "APPROVED",
    },
  });

  // 6 شركات + فرع لكل شركة
  for (const c of companies) {
    const company = await prisma.company.create({ data: { name: c.name, sector: c.sector as any } });
    await prisma.branch.create({
      data: { name: `فرع ${c.city}`, city: c.city, state: c.state, companyId: company.id,
        lat: 15.5 + Math.random(), lng: 32.5 + Math.random() },
    });
    await prisma.user.create({
      data: {
        fullName: `مدير ${c.name}`, companyName: c.name, country: "السودان",
        phone: "+2499" + Math.floor(10000000 + Math.random() * 89999999),
        email: `manager${company.id.slice(-6)}@sims.sd`, password: hash,
        role: "branch_manager", sector: c.sector as any, companyId: company.id, kycStatus: "APPROVED",
      },
    });
  }

  console.log("✅ Seed done: accounts + admin + 6 companies");
}

main().finally(() => prisma.$disconnect());
