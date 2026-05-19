import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EntryType, Difficulty } from "@/app/generated/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get("weekStart");

  const where = weekStart
    ? {
        date: {
          gte: new Date(`${weekStart}T00:00:00.000Z`),
          lt: new Date(new Date(`${weekStart}T00:00:00.000Z`).getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      }
    : {};

  const entries = await prisma.workEntry.findMany({
    where,
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-is-admin") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { type, date, content } = body;

  if (!type || !EntryType[type as EntryType]) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const entryDate = date ? new Date(date) : new Date();

  if (type === "BUG") {
    if (!content?.bugUrl || !content?.description || !content?.difficulty || !content?.customer || content?.branch == null) {
      return NextResponse.json({ error: "Missing content fields" }, { status: 400 });
    }
    const entry = await prisma.workEntry.create({
      data: {
        type: EntryType.BUG,
        date: entryDate,
        bugEntry: {
          create: {
            bugUrl: content.bugUrl,
            description: content.description,
            difficulty: content.difficulty as Difficulty,
            customer: content.customer,
            branch: content.branch,
          },
        },
      },
      include: { bugEntry: true },
    });
    return NextResponse.json(entry, { status: 201 });
  }

  if (type === "UI") {
    if (!content?.clientName || !content?.figmaUrl || !content?.customer || content?.branch == null) {
      return NextResponse.json({ error: "Missing content fields" }, { status: 400 });
    }
    const entry = await prisma.workEntry.create({
      data: {
        type: EntryType.UI,
        date: entryDate,
        uiEntry: {
          create: {
            clientName: content.clientName,
            figmaUrl: content.figmaUrl,
            difficulty: content.difficulty ? (content.difficulty as Difficulty) : null,
            customer: content.customer,
            branch: content.branch,
          },
        },
      },
      include: { uiEntry: true },
    });
    return NextResponse.json(entry, { status: 201 });
  }

  if (type === "MISC") {
    if (!content?.description || !content?.customer || content?.branch == null) {
      return NextResponse.json({ error: "Missing content fields" }, { status: 400 });
    }
    const entry = await prisma.workEntry.create({
      data: {
        type: EntryType.MISC,
        date: entryDate,
        miscEntry: {
          create: {
            description: content.description,
            difficulty: content.difficulty ? (content.difficulty as Difficulty) : null,
            customer: content.customer,
            branch: content.branch,
          },
        },
      },
      include: { miscEntry: true },
    });
    return NextResponse.json(entry, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
