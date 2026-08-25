// src/app/api/quality/expiring/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.companyId) return NextResponse.json([]);
  return NextResponse.json(await prisma.product.findMany({
    where: { companyId: s.companyId, expiryDate: { lte: new Date(Date.now() + 30 * 864e5), gte: new Date() } },
  }));
}

// src/app/api/quality/checks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const b = await req.json();
  const check = await prisma.qualityCheck.create({
    data: { productId: b.productId, status: b.status, notes: b.notes, imageUrl: b.imageUrl, userId: s.sub },
  });
  return NextResponse.json(check);
}
