import { PrismaClient } from "@prisma/client";
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

async function main() {
  const map = new Map<string, string>();
  for (const a of accounts.filter((x) => !x.parent)) {
    const acc = await prisma.account.upsert({
      where: { code: a.code },
      update: {},
      create: { code: a.code, nameAr: a.nameAr, nameEn: a.nameEn, type: a.type },
    });
    map.set(a.code, acc.id);
  }
  for (const a of accounts.filter((x) => x.parent)) {
    await prisma.account.upsert({
      where: { code: a.code },
      update: {},
      create: { code: a.code, nameAr: a.nameAr, nameEn: a.nameEn, type: a.type, parentId: map.get(a.parent!) },
    });
  }

  console.log("✅ Chart of Accounts seeded");
}

main().finally(() => prisma.$disconnect());
