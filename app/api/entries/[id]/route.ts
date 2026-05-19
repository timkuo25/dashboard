import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Difficulty, EntryType } from "@/app/generated/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const entry = await prisma.workEntry.findUnique({
    where: { id },
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (req.headers.get("x-is-admin") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { type, date, content } = await req.json();

  const entry = await prisma.workEntry.findUnique({
    where: { id },
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const typeChanged = type && type !== entry.type;

  await prisma.$transaction(async (tx) => {
    await tx.workEntry.update({
      where: { id },
      data: {
        ...(date ? { date: new Date(date) } : {}),
        ...(typeChanged ? { type: type as EntryType } : {}),
      },
    });

    if (typeChanged) {
      if (entry.bugEntry) await tx.bugEntry.delete({ where: { id: entry.bugEntry.id } });
      if (entry.uiEntry) await tx.uIEntry.delete({ where: { id: entry.uiEntry.id } });
      if (entry.miscEntry) await tx.miscEntry.delete({ where: { id: entry.miscEntry.id } });

      if (type === "BUG") {
        await tx.bugEntry.create({ data: { bugUrl: content.bugUrl, description: content.description, difficulty: content.difficulty as Difficulty, customer: content.customer, branch: content.branch, workEntryId: id } });
      } else if (type === "UI") {
        await tx.uIEntry.create({ data: { clientName: content.clientName, figmaUrl: content.figmaUrl, difficulty: content.difficulty ? (content.difficulty as Difficulty) : null, customer: content.customer, branch: content.branch, workEntryId: id } });
      } else if (type === "MISC") {
        await tx.miscEntry.create({ data: { description: content.description, difficulty: content.difficulty ? (content.difficulty as Difficulty) : null, customer: content.customer, branch: content.branch, workEntryId: id } });
      }
    } else {
      if (entry.type === "BUG" && entry.bugEntry) {
        await tx.bugEntry.update({ where: { id: entry.bugEntry.id }, data: { bugUrl: content.bugUrl, description: content.description, difficulty: content.difficulty as Difficulty, customer: content.customer, branch: content.branch } });
      } else if (entry.type === "UI" && entry.uiEntry) {
        await tx.uIEntry.update({ where: { id: entry.uiEntry.id }, data: { clientName: content.clientName, figmaUrl: content.figmaUrl, difficulty: content.difficulty ? (content.difficulty as Difficulty) : null, customer: content.customer, branch: content.branch } });
      } else if (entry.type === "MISC" && entry.miscEntry) {
        await tx.miscEntry.update({ where: { id: entry.miscEntry.id }, data: { description: content.description, difficulty: content.difficulty ? (content.difficulty as Difficulty) : null, customer: content.customer, branch: content.branch } });
      }
    }
  });

  const updated = await prisma.workEntry.findUnique({
    where: { id },
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (req.headers.get("x-is-admin") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const entry = await prisma.workEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.workEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
