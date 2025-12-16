import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFamily } from "@/lib/family";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ctx = await getCurrentFamily();
  if (!ctx) {
    return NextResponse.json({ error: "Family Not Selected" }, { status: 400 });
  }
  const { family, membership } = ctx;
  return NextResponse.json(
    {
      family: { id: family.id, name: family.name, currency: family.currency, ownerId: family.ownerId },
      role: membership.role,
    },
    { status: 200 },
  );
}

