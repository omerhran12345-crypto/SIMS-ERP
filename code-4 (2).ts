import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s?.companyId) return NextResponse.json([]);
  return NextResponse.json(await prisma.branch.findMany({ where: { companyId: s.companyId } }));
}
