import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("student123", 10);

  await prisma.user.upsert({
    where: { email: "etudiant@mydil.fr" },
    update: {},
    create: {
      email: "etudiant@mydil.fr",
      password,
      firstName: "Thomas",
      lastName: "Besse",
      role: "STUDENT",
    },
  });

  console.log("Étudiant créé : etudiant@mydil.fr / student123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
