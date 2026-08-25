"use server";
import { prisma } from "@/lib/prisma";
import { signToken, comparePassword, hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtp(email: string, code: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "SIMS OTP",
    html: `<h2>رمز التحقق: <b>${code}</b></h2>`,
  });
}

export async function loginAction(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password)))
    throw new Error("INVALID_CREDENTIALS");
  if (user.kycStatus !== "APPROVED") throw new Error("KYC_PENDING");

  const token = signToken({ sub: user.id, role: user.role, companyId: user.companyId });
  cookies().set("sims_token", token, { httpOnly: true, maxAge: 604800, path: "/" });
  return { ok: true, role: user.role };
}

export async function registerAction(data: {
  fullName: string; companyName: string; country: string;
  phone: string; email: string; password: string; sector: string;
}) {
  const exists = await prisma.user.findFirst({ where: { OR: [{ email: data.email }, { phone: data.phone }] } });
  if (exists) throw new Error("USER_EXISTS");

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const user = await prisma.user.create({
    data: {
      ...data,
      password: await hashPassword(data.password),
      sector: data.sector as any,
      otpCode: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  await sendOtp(user.email, otp);
  return { ok: true, userId: user.id };
}

export async function verifyOtpAction(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.otpCode !== code || !user.otpExpiresAt || user.otpExpiresAt < new Date())
    throw new Error("INVALID_OTP");
  await prisma.user.update({ where: { id: userId }, data: { otpCode: null } });
  return { ok: true };
}

export async function forgotPasswordAction(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("NOT_FOUND");
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });
  await sendOtp(email, otp);
  return { ok: true };
}

export async function resetPasswordAction(email: string, code: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.otpCode !== code) throw new Error("INVALID_OTP");
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(newPassword), otpCode: null },
  });
  return { ok: true };
}

export async function submitKycAction(input: {
  userId: string; passportImg: string; selfieImg: string; faceMatch: number;
  docName?: string; docNumber?: string; nationality?: string; birthDate?: string; expiryDate?: string;
}) {
  await prisma.kycRequest.create({ data: input });
  return { ok: true };
}

export async function reviewKycAction(kycId: string, approve: boolean, adminId: string) {
  const kyc = await prisma.kycRequest.update({
    where: { id: kycId },
    data: { status: approve ? "APPROVED" : "REJECTED", reviewedBy: adminId },
  });
  await prisma.user.update({ where: { id: kyc.userId }, data: { kycStatus: kyc.status } });
  return { ok: true };
}
