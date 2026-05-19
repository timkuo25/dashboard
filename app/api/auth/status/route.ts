import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-is-admin") === "1";
  return NextResponse.json({ isAdmin });
}
