// src/app/api/inventory/settle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { productId, diff } = await req.json();

  await prisma.product.update({ where: { id: productId }, data: { quantity: { increment: diff } } });
  await prisma.stockMove.create({
    data: { type: "ADJUST", quantity: Math.abs(diff), productId, userId: s.sub, reference: "INVENTORY_SETTLE" },
  });
  return NextResponse.json({ ok: true });
}
