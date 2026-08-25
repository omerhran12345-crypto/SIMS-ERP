import { NextRequest, NextResponse } from "next/server";
import { createInventoryAdjustment } from "@/lib/accounting";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { productId, diff } = await req.json();
  const product = await prisma.product.update({
    where: { id: productId },
    data: { quantity: { increment: diff } },
  });
  await createInventoryAdjustment(product.purchasePrice * diff, product.companyId, s.sub);
  return NextResponse.json({ ok: true, newQuantity: product.quantity });
}
