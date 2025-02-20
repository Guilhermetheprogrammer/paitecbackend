/* eslint-disable prefer-const */
/* eslint-disable import/no-mutable-exports */
import "dotenv/config";
import { execSync } from "child_process";
import { randomUUID } from "crypto";

import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

const schemaId = randomUUID();
const databaseUrl = generateUniqueDatabaseUrl(schemaId);
process.env.DATABASE_URL = databaseUrl;

prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

function generateUniqueDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("schema", `e2e-${schema}`);
  return url.toString();
}

beforeAll(async () => {
  execSync("yarn prisma migrate deploy");
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "e2e-${schemaId}" CASCADE`
  );
  await prisma.$disconnect();
});

export { prisma };
