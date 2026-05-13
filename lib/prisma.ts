import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma";
import { Pool } from "pg";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function isNeonUrl(url: string): boolean {
  return url.includes(".neon.tech") || url.includes("neon.db");
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (isNeonUrl(url)) {
    // Neon serverless (production)
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({ adapter });
  } else {
    // Standard PostgreSQL (local Docker)
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
