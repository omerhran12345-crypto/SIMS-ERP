"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateBarcode, blockchainHash } from "@/lib/barcode";
import { postPurchaseEntry } from "@/lib/accounting";

async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export async function createProductAction(input: {
  name: string; category: string; purchasePrice: number; salePrice: number;
  quantity: number; expiryDate: string; imageUrl?: string; branchId: string;
}) {
  const session = await requireSession();
  const barcode = generateBarcode();
  const blockchainHashValue = blockchainHash({ name: input.name, barcode, ts: Date.now() });

  const product = await prisma.product.create({
    data: {
      ...input,
      expiryDate: new Date(input.expiryDate),
      barcode, blockchainHash: blockchainHashValue,
      companyId: session.companyId!,
    },
  });

  await prisma.stockMove.create({
    data: { type: "IN", quantity: input.quantity, productId: product.id, userId: session.sub, reference: "INITIAL" },
  });

  await postPurchaseEntry(input.purchasePrice * input.quantity, session.companyId!, product.barcode);
  return product;
}

export async function updateProductAction(id: string, input: Partial<{
  name: string; category: string; purchasePrice: number; salePrice: number;
  quantity: number; expiryDate: string; imageUrl: string;
}>) {
  await requireSession();
  return prisma.product.update({
    where: { id },
    data: { ...input, ...(input.expiryDate ? { expiryDate: new Date(input.expiryDate) } : {}) },
  });
}

export async function deleteProductAction(id: string) {
  await requireSession();
  return prisma.product.delete({ where: { id } });
}

export async function searchProductsAction(q: string, branchId?: string) {
  await requireSession();
  return prisma.product.findMany({
    where: {
      AND: [
        { name: { contains: q, mode: "insensitive" } },
        ...(branchId ? [{ branchId }] : []),
      ],
    },
    take: 20,
  });
}
