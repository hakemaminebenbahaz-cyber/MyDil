import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@mydil.fr" },
    update: {},
    create: {
      email: "admin@mydil.fr",
      password,
      firstName: "Admin",
      lastName: "myDiL",
      role: "ADMIN",
    },
  });

  console.log("Admin créé : admin@mydil.fr / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
