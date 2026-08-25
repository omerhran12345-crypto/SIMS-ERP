import crypto from "crypto";

export function generateBarcode(): string {
  return "SIMS" + Date.now().toString() + Math.floor(Math.random() * 900 + 100);
}

export function blockchainHash(data: Record<string, unknown>): string {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}
