import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) return NextResponse.json([]);

  const entries = await prisma.workEntry.findMany({
    where: {
      OR: [
        { bugEntry: { branch:      { contains: q, mode: "insensitive" } } },
        { bugEntry: { customer:    { contains: q, mode: "insensitive" } } },
        { bugEntry: { description: { contains: q, mode: "insensitive" } } },
        { uiEntry:  { branch:      { contains: q, mode: "insensitive" } } },
        { uiEntry:  { customer:    { contains: q, mode: "insensitive" } } },
        { uiEntry:  { clientName:  { contains: q, mode: "insensitive" } } },
        { miscEntry: { branch:      { contains: q, mode: "insensitive" } } },
        { miscEntry: { customer:    { contains: q, mode: "insensitive" } } },
        { miscEntry: { description: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(entries);
}
