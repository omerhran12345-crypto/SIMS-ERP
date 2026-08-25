export async function getForecastAction(): Promise<{
  result: {
    runningOut14: { name: string; daysLeft: number }[];
    nextMonthForecast: number;
    stagnant: { name: string; lastMoveDays: number }[];
  };
  aiSummary?: string;
}> {
  const session = await getSession();
  if (!session?.companyId) throw new Error("UNAUTHORIZED");

  const since = new Date(Date.now() - 90 * 864e5);
  const [sales, products] = await Promise.all([
    prisma.invoiceLine.findMany({
      where: { invoice: { companyId: session.companyId, createdAt: { gte: since } } },
      include: { product: true, invoice: true },
    }),
    prisma.product.findMany({ where: { companyId: session.companyId } }),
  ]);

  // معدل البيع اليومي لكل منتج
  const dailyRate = new Map<string, number>();
  for (const s of sales) {
    dailyRate.set(s.productId, (dailyRate.get(s.productId) ?? 0) + s.quantity / 90);
  }

  const runningOut14 = products
    .filter((p) => (dailyRate.get(p.id) ?? 0) > 0 && p.quantity / dailyRate.get(p.id)! <= 14)
    .map((p) => ({ name: p.name, daysLeft: Math.floor(p.quantity / dailyRate.get(p.id)!) }));

  const lastMonthTotal = sales
    .filter((s) => s.invoice.createdAt >= new Date(Date.now() - 30 * 864e5))
    .reduce((sum, s) => sum + s.total, 0);
  const nextMonthForecast = Math.round(lastMonthTotal * 1.1);

  const stagnant = products
    .filter((p) => !dailyRate.has(p.id))
    .map((p) => ({ name: p.name, lastMoveDays: 90 }));

  let aiSummary: string | undefined;
  try {
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "محلل مبيعات ERP. حلل البيانات باختصار بالعربية." },
          { role: "user", content: JSON.stringify({ runningOut14, nextMonthForecast, stagnant }) },
        ],
      });
      aiSummary = res.choices[0].message.content ?? undefined;
    }
  } catch { /* AI اختياري */ }

  return { result: { runningOut14, nextMonthForecast, stagnant }, aiSummary };
}
