"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { postSaleEntries } from "@/lib/accounting";

export async function completeSaleAction(input: {
  items: { productId: string; quantity: number }[];
  customerName?: string; customerPhone?: string;
  paymentMethod: "CASH" | "CARD" | "CREDIT";
}) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) } },
  });
  const pMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0, cogs = 0;
  const linesData = input.items.map((item) => {
    const p = pMap.get(item.productId)!;
    if (p.quantity < item.quantity) throw new Error(`OUT_OF_STOCK: ${p.name}`);
    subtotal += p.salePrice * item.quantity;
    cogs += p.purchasePrice * item.quantity;
    return { productId: p.id, quantity: item.quantity, unitPrice: p.salePrice, total: p.salePrice * item.quantity };
  });

  const tax = +(subtotal * 0.15).toFixed(2); // ضريبة 15%
  const total = subtotal + tax;

  const count = await prisma.invoice.count();
  const invoice = await prisma.invoice.create({
    data: {
      number: `INV-newDate().getFullYear()−{new Date().getFullYear()}-newDate().getFullYear()−{String(count + 1).padStart(5, "0")}`,
      customerName: input.customerName, customerPhone: input.customerPhone,
      subtotal, tax, total, paymentMethod: input.paymentMethod, paid: input.paymentMethod !== "CREDIT",
      qrData: `INV-${count + 1}`,
      branchId: products[0].branchId, companyId: session.companyId!,
      lines: { create: linesData },
    },
    include: { lines: { include: { product: true } } },
  });

  // خصم المخزون + StockMove
  for (const l of linesData) {
    await prisma.product.update({ where: { id: l.productId }, data: { quantity: { decrement: l.quantity } } });
    await prisma.stockMove.create({
      data: { type: "OUT", quantity: l.quantity, productId: l.productId, userId: session.sub, reference: invoice.number },
    });
  }

  // قيدين محاسبيين
  await postSaleEntries({ id: invoice.id, total, subtotal, tax, paymentMethod: input.paymentMethod, companyId: session.companyId! }, cogs);

  await prisma.activityLog.create({
    data: { userId: session.sub, action: "SALE", entity: "Invoice", entityId: invoice.id, meta: { total } },
  });

  return invoice;
}

export async function requestDeliveryAction(invoiceId: string, destLat: number, destLng: number, address: string) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  // أقرب 3 سائقين متاحين
  const drivers = await prisma.driver.findMany({ where: { available: true } });
  const sorted = drivers
    .map((d) => ({ d, dist: d.lat && d.lng ? Math.hypot(d.lat - destLat, d.lng - destLng) : Infinity }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  const nearest = sorted[0]?.d;
  const order = await prisma.deliveryOrder.create({
    data: {
      invoiceId, destLat, destLng, address, fee: 5000,
      driverId: nearest?.id, status: nearest ? "ASSIGNED" : "PENDING",
    },
  });
  if (nearest) await prisma.driver.update({ where: { id: nearest.id }, data: { available: false } });
  return order;
}
