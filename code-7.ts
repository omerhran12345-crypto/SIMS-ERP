import { prisma } from "./prisma";

/** ينشئ قيداً متوازناً: مجموع المدين = مجموع الدائن */
export async function createJournalEntry(opts: {
  description: string;
  companyId?: string;
  lines: { code: string; debit?: number; credit?: number; description?: string }[];
}) {
  const totalDebit = opts.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = opts.lines.reduce((s, l) => s + (l.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`UNBALANCED_ENTRY: D=totalDebitC={totalDebit} C=totalDebitC={totalCredit}`);
  }

  const accounts = await prisma.account.findMany({
    where: { code: { in: opts.lines.map((l) => l.code) } },
  });
  const accMap = new Map(accounts.map((a) => [a.code, a.id]));

  const count = await prisma.journalEntry.count();
  return prisma.journalEntry.create({
    data: {
      number: `JE-${String(count + 1).padStart(6, "0")}`,
      description: opts.description,
      companyId: opts.companyId,
      lines: {
        create: opts.lines.map((l) => ({
          accountId: accMap.get(l.code)!,
          debit: l.debit || 0,
          credit: l.credit || 0,
          description: l.description,
        })),
      },
    },
  });
}

/** قيد البيع: مدين النقدية/العملاء، دائن الإيرادات + ضريبة، وقيد COGS */
export async function postSaleEntries(invoice: {
  id: string; total: number; subtotal: number; tax: number;
  paymentMethod: string; companyId?: string;
}, cogs: number) {
  const cashAcc = invoice.paymentMethod === "CASH" ? "1100" : invoice.paymentMethod === "CARD" ? "1200" : "1400";

  await createJournalEntry({
    description: `فاتورة بيع ${invoice.id}`,
    companyId: invoice.companyId,
    lines: [
      { code: cashAcc, debit: invoice.total },
      { code: "4100", credit: invoice.subtotal },
      ...(invoice.tax > 0 ? [{ code: "2100", credit: invoice.tax }] : []),
    ],
  });

  if (cogs > 0) {
    await createJournalEntry({
      description: `تكلفة بضاعة مباعة ${invoice.id}`,
      companyId: invoice.companyId,
      lines: [
        { code: "5100", debit: cogs },
        { code: "1300", credit: cogs },
      ],
    });
  }
}

/** قيد شراء منتج: مدين المخزون، دائن النقدية */
export async function postPurchaseEntry(amount: number, companyId?: string, ref?: string) {
  return createJournalEntry({
    description: `شراء مخزون ${ref || ""}`,
    companyId,
    lines: [
      { code: "1300", debit: amount },
      { code: "1100", credit: amount },
    ],
  });
}

/** قيد تسوية جرد: عجز أو زيادة */
export async function postAdjustmentEntry(diffValue: number, companyId?: string) {
  if (diffValue === 0) return;
  const shortage = diffValue < 0;
  return createJournalEntry({
    description: shortage ? "تسوية عجز جرد" : "تسوية زيادة جرد",
    companyId,
    lines: shortage
      ? [{ code: "5200", debit: Math.abs(diffValue) }, { code: "1300", credit: Math.abs(diffValue) }]
      : [{ code: "1300", debit: diffValue }, { code: "4100", credit: diffValue }],
  });
}
