"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function aiChatAction(message: string): Promise<string> {
  const session = await getSession();
  if (!session?.companyId) throw new Error("UNAUTHORIZED");

  // سياق الداتابيز
  const [products, invoices] = await Promise.all([
    prisma.product.findMany({ where: { companyId: session.companyId }, take: 50 }),
    prisma.invoice.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const context = JSON.stringify({
    products: products.map((p) => ({ name: p.name, qty: p.quantity, price: p.salePrice, expiry: p.expiryDate })),
    recentInvoices: invoices.map((i) => ({ number: i.number, total: i.total, date: i.createdAt })),
  });

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "أنت مساعد ERP ذكي. أجب بالعربية بناءً على بيانات الشركة التالية:\n" + context },
      { role: "user", content: message },
    ],
  });
  return res.choices[0].message.content ?? "";
}
