import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.workEntry.findMany({
    orderBy: { date: "desc" },
    take: 300,
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
  });

  const seen = new Set<string>();
  const branches: { branch: string; date: string; type: string; entryId: string }[] = [];

  for (const e of entries) {
    const sub = e.bugEntry ?? e.uiEntry ?? e.miscEntry;
    if (!sub || !sub.branch) continue;

    if (!seen.has(sub.branch)) {
      seen.add(sub.branch);
      branches.push({
        branch: sub.branch,
        date: e.date.toISOString().split("T")[0],
        type: e.type,
        entryId: e.id,
      });
    }

    if (branches.length >= 10) break;
  }

  return NextResponse.json(branches);
}
