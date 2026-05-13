import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekStartParam = searchParams.get("weekStart");
  const allTime = searchParams.get("all") === "true";

  if (allTime) {
    const [allEntries, allBugEntries, allUIEntries, allMiscEntries] = await Promise.all([
      prisma.workEntry.findMany({ select: { type: true } }),
      prisma.bugEntry.findMany({ select: { difficulty: true } }),
      prisma.uIEntry.findMany({ select: { difficulty: true } }),
      prisma.miscEntry.findMany({ select: { difficulty: true } }),
    ]);

    const byType = { BUG: 0, UI: 0, MISC: 0 };
    for (const e of allEntries) byType[e.type]++;

    const difficultyCount: Record<string, number> = {};
    for (const e of [...allBugEntries, ...allUIEntries, ...allMiscEntries]) {
      if (e.difficulty) difficultyCount[e.difficulty] = (difficultyCount[e.difficulty] ?? 0) + 1;
    }

    return NextResponse.json({
      week: { total: allEntries.length, byType, daily: [] },
      month: { total: allEntries.length, byType },
      bugDifficulty: difficultyCount,
    });
  }

  let weekStart: Date;
  let weekEnd: Date;

  if (weekStartParam) {
    weekStart = new Date(`${weekStartParam}T00:00:00.000Z`);
    weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    const now = new Date();
    weekStart = new Date(now);
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setUTCDate(now.getUTCDate() + diff);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const startOfMonth = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), 1));

  const [weekEntries, monthEntries, weekBugEntries, weekUIEntries, weekMiscEntries] = await Promise.all([
    prisma.workEntry.findMany({
      where: { date: { gte: weekStart, lt: weekEnd } },
      select: { type: true, date: true },
    }),
    prisma.workEntry.findMany({
      where: { date: { gte: startOfMonth, lt: weekEnd } },
      select: { type: true },
    }),
    prisma.bugEntry.findMany({
      where: { workEntry: { date: { gte: weekStart, lt: weekEnd } } },
      select: { difficulty: true },
    }),
    prisma.uIEntry.findMany({
      where: { workEntry: { date: { gte: weekStart, lt: weekEnd } } },
      select: { difficulty: true },
    }),
    prisma.miscEntry.findMany({
      where: { workEntry: { date: { gte: weekStart, lt: weekEnd } } },
      select: { difficulty: true },
    }),
  ]);

  const weekByType = { BUG: 0, UI: 0, MISC: 0 };
  for (const e of weekEntries) weekByType[e.type]++;

  const monthByType = { BUG: 0, UI: 0, MISC: 0 };
  for (const e of monthEntries) monthByType[e.type]++;

  const difficultyCount: Record<string, number> = {};
  for (const e of [...weekBugEntries, ...weekUIEntries, ...weekMiscEntries]) {
    if (e.difficulty) difficultyCount[e.difficulty] = (difficultyCount[e.difficulty] ?? 0) + 1;
  }

  const weekDailyMap: Record<string, number> = {};
  for (const e of weekEntries) {
    const day = e.date.toISOString().split("T")[0];
    weekDailyMap[day] = (weekDailyMap[day] ?? 0) + 1;
  }
  const weekDaily = Object.entries(weekDailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    week: { total: weekEntries.length, byType: weekByType, daily: weekDaily },
    month: { total: monthEntries.length, byType: monthByType },
    bugDifficulty: difficultyCount,
  });
}
