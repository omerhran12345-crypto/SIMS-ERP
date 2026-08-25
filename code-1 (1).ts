// داخل completeSaleAction، استبدل سطر number المعطوب بـ:
const year = new Date().getFullYear();
const number = `INV-year−{year}-year−{String(count + 1).padStart(5, "0")}`;

// ثم في create:
const invoice = await prisma.invoice.create({
  data: {
    companyId, branchId, userId: session.sub,
    number, customerName, customerPhone, paymentMethod,
    subtotal, tax, total, status: paymentMethod === "CREDIT" ? "UNPAID" : "PAID",
    lines: { create: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice, total: l.quantity * l.unitPrice })) },
  },
  include: { lines: { include: { product: true } } },
});
