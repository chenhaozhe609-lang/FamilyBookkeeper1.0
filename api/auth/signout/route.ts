import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { FAMILY_COOKIE_NAME } from "@/lib/family";

export async function POST() {
  await destroySession();
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.delete("familyledger_session");
  res.cookies.delete(FAMILY_COOKIE_NAME);
  return res;
}
