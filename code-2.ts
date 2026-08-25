import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const companyId = session.companyId;

  const [todayInvoices, allInvoices, lowStock, branches, alerts, lastInvoices] = await Promise.all([
    prisma.invoice.findMany({ where: { companyId, createdAt: { gte: todayStart } }, include: { lines: { include: { product: true } } } }),
    prisma.invoice.findMany({ where: { companyId }, include: { lines: true } }),
    prisma.product.count({ where: { companyId, quantity: { lte: 5 } } }),
    prisma.branch.findMany({ where: { companyId } }),
    prisma.product.findMany({
      where: { companyId, expiryDate: { lte: new Date(Date.now() + 30 * 864e5), gte: new Date() } },
      take: 10,
    }),
    prisma.invoice.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const todaySales = todayInvoices.reduce((s, i) => s + i.total, 0);
  const todayCogs = todayInvoices.flatMap((i) => i.lines).reduce((s, l) => s + l.quantity * (l as any).product?.purchasePrice || s, 0);

  // مبيعات 30 يوم
  const chart: { date: string; sales: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - d);
    const next = new Date(day.getTime() + 864e5);
    const sum = allInvoices.filter((i) => i.createdAt >= day && i.createdAt < next).reduce((s, i) => s + i.total, 0);
    chart.push({ date: day.toLocaleDateString("en", { month: "short", day: "numeric" }), sales: +sum.toFixed(0) });
  }

  return NextResponse.json({
    stats: { todaySales, profit: +(todaySales - todayCogs).toFixed(0), invoices: allInvoices.length, lowStock },
    chart,
    branches,
    alerts,
    invoices: lastInvoices.map((i) => ({ id: i.id, number: i.number, total: i.total, createdAt: i.createdAt, customerName: i.customerName })),
  });
}
