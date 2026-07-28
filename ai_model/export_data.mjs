import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/index.js";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const equipment = await prisma.equipment.findMany({
  select: {
    id: true, name: true, brand: true, model: true,
    category: true, description: true, status: true, loanable: true,
  },
});

const loans = await prisma.loan.findMany({
  where: { status: { in: ["APPROVED", "RETURNED"] } },
  select: { equipmentId: true, userId: true },
});

await prisma.$disconnect();

const out = { equipment, loans };
writeFileSync(join(__dirname, "data.json"), JSON.stringify(out, null, 2));
console.log(`Exported: ${equipment.length} equipments, ${loans.length} loans -> data.json`);
