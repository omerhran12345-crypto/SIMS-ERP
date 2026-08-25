import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s?.companyId || s.role !== "ADMIN")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const body = await req.json();
  const branch = await prisma.branch.create({
    data: { name: body.name, city: body.city, lat: body.lat ?? null, lng: body.lng ?? null, companyId: s.companyId },
  });
  return NextResponse.json(branch);
}

export async function PUT(req: NextRequest) {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const body = await req.json();
  const branch = await prisma.branch.update({
    where: { id: body.id, companyId: s.companyId },
    data: { ...(body.name !== undefined && { name: body.name }), ...(body.city !== undefined && { city: body.city }), ...(body.lat !== undefined && { lat: body.lat }), ...(body.lng !== undefined && { lng: body.lng }) },
  });
  return NextResponse.json(branch);
}
