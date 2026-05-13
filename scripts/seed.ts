import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const base = new Date("2026-05-13T00:00:00.000Z");
  const day = (n: number) => new Date(base.getTime() + n * 86400000);

  await prisma.workEntry.create({
    data: {
      date: day(0), type: "BUG",
      bugEntry: { create: { bugUrl: "https://ebug.example.com/1234", description: "Login page crashes on Safari", difficulty: "HARD", customer: "ACME", branch: "fix/login-safari" } },
    },
  });

  await prisma.workEntry.create({
    data: {
      date: day(-1), type: "UI",
      uiEntry: { create: { clientName: "GlobalShop", figmaUrl: "https://figma.com/file/abc123", difficulty: "MEDIUM", customer: "GlobalShop", branch: "feat/checkout-redesign" } },
    },
  });

  await prisma.workEntry.create({
    data: {
      date: day(-2), type: "MISC",
      miscEntry: { create: { description: "Update translation files for zh-TW locale", difficulty: "EASY", customer: "Internal", branch: "chore/i18n-update" } },
    },
  });

  await prisma.workEntry.create({
    data: {
      date: day(-3), type: "BUG",
      bugEntry: { create: { bugUrl: "https://ebug.example.com/5678", description: "Cart total miscalculates with discount codes", difficulty: "VERY_HARD", customer: "MegaMart", branch: "fix/cart-discount" } },
    },
  });

  await prisma.workEntry.create({
    data: {
      date: day(-4), type: "UI",
      uiEntry: { create: { clientName: "FreshEats", figmaUrl: "https://figma.com/file/def456", difficulty: null, customer: "FreshEats", branch: "" } },
    },
  });

  console.log("✅ 5 entries seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());
