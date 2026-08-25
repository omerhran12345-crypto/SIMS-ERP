// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s?.companyId) return NextResponse.json([]);
  const q = req.nextUrl.searchParams.get("q");
  return NextResponse.json(await prisma.product.findMany({
    where: { companyId: s.companyId, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) },
    take: 100,
  }));
}
