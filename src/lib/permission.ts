import { NextResponse } from "next/server";
import type { MembershipRole } from "@prisma/client";

export function isOwner(membership: { role: MembershipRole }) {
  return membership.role === "OWNER";
}

export function requireOwner(membership: { role: MembershipRole }) {
  if (!isOwner(membership)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

