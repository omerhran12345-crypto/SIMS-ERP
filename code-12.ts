import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s?.companyId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const report = req.nextUrl.searchParams.get("report") ?? "COA";

  switch (report) {
    case "COA": {
      const accounts = await prisma.account.findMany({ where: { companyId: s.companyId }, orderBy: { code: "asc" } });
      const entries = await prisma.journalEntry.findMany({ where: { companyId: s.companyId } });
      const bal = (code: string) =>
        entries.filter((e) => e.debitAccount === code).reduce((a, e) => a + e.amount, 0)
        - entries.filter((e) => e.creditAccount === code).reduce((a, e) => a + e.amount, 0);
      return NextResponse.json(accounts.map((a) => ({ ...a, balance: bal(a.code) })));
    }
    case "JE":
      return NextResponse.json(await prisma.journalEntry.findMany({ where: { companyId: s.companyId }, orderBy: { date: "desc" } }));
    case "TB": {
      const accounts = await prisma.account.findMany({ where: { companyId: s.companyId }, orderBy: { code: "asc" } });
      const entries = await prisma.journalEntry.findMany({ where: { companyId: s.companyId } });
      return NextResponse.json(accounts.map((a) => ({
        code: a.code, name: a.name,
        debit: entries.filter((e) => e.debitAccount === a.code).reduce((x, e) => x + e.amount, 0),
        credit: entries.filter((e) => e.creditAccount === a.code).reduce((x, e) => x + e.amount, 0),


> ⚠️ The response reached the length limit. Reply **continue** to get the rest.
