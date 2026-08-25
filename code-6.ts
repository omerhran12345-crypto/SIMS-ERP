import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SECRET = process.env.JWT_SECRET!;
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { sub: string; role: string; companyId?: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = cookies().get("sims_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireRole(roles: string[]) {
  return async () => {
    const session = await getSession();
    if (!session || !roles.includes(session.role)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return session;
  };
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}
