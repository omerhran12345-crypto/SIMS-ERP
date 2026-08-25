// src/app/api/invoices/[number]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { number: string } }) {
  const inv = await prisma.invoice.findUnique({ where: { number: params.number } });
  return NextResponse.json(inv ?? {});
}
