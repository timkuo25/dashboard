import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "";

  if (url.includes("neon.tech")) {
    const { neon } = require("@neondatabase/serverless");
    const { PrismaNeonHTTP } = require("@prisma/adapter-neon");
    const sql = neon(url);
    const adapter = new PrismaNeonHTTP(sql);
    return new PrismaClient({ adapter });
  }

  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
