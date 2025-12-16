import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { PrismaClient } from "@prisma/client";

export const FAMILY_COOKIE_NAME = "familyledger_family";

function familyCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function setFamilyCookie(res: NextResponse, familyId: string) {
  res.cookies.set(FAMILY_COOKIE_NAME, familyId, familyCookieOptions());
}

export async function getCurrentFamily() {
  const user = await getCurrentUser();
  if (!user) return null;
  const cookieStore = await cookies();
  const familyId = cookieStore.get(FAMILY_COOKIE_NAME)?.value;
  if (!familyId) return null;
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, familyId },
    include: { family: true },
  });
  if (!membership || !membership.family) return null;
  return { family: membership.family, membership };
}

export async function getDefaultFamilyId(userId: string) {
  const family = await prisma.family.findFirst({
    where: { memberships: { some: { userId } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return family?.id ?? null;
}

export async function canAddMember(client: PrismaClient, familyId: string) {
  void client;
  void familyId;
  return true;
}

export async function requireCanAddMember(client: PrismaClient, familyId: string) {
  void client;
  void familyId;
  return null;
}
