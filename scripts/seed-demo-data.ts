import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findUnique({ where: { email: "etudiant@mydil.fr" } });
  if (!student) throw new Error("Étudiant de démo introuvable, lance d'abord scripts/seed-student.ts");

  const equipments = await prisma.equipment.findMany({ take: 5 });
  if (equipments.length === 0) throw new Error("Aucun équipement, lance d'abord scripts/seed-equipment.ts");

  // Emprunts de démo
  const now = new Date();
  const inDays = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  await prisma.loan.createMany({
    data: [
      { userId: student.id, equipmentId: equipments[0].id, startDate: inDays(-2), endDate: inDays(3), status: "APPROVED" },
      { userId: student.id, equipmentId: equipments[1].id, startDate: inDays(0), endDate: inDays(5), status: "PENDING" },
      { userId: student.id, equipmentId: equipments[2].id, startDate: inDays(-10), endDate: inDays(-3), status: "RETURNED", returnedAt: inDays(-3) },
    ],
  });

  // Projets de démo
  await prisma.project.createMany({
    data: [
      {
        name: "Station météo connectée",
        description: "Capteurs IoT + dashboard temps réel pour suivre température et humidité du lab.",
        type: "ACADEMIC",
        status: "PUBLISHED",
        technologies: ["ESP32", "MQTT", "React"],
        keywords: ["iot", "meteo"],
        year: 2026,
        supervisors: ["M. Dupont"],
        participants: [`${student.firstName} ${student.lastName}`],
        userId: student.id,
      },
      {
        name: "Bras robotique pick & place",
        description: "Programmation du bras Niryo Ned2 pour trier des pièces par couleur.",
        type: "WORKSHOP",
        status: "PENDING",
        technologies: ["Python", "Niryo Ned2"],
        keywords: ["robotique"],
        year: 2026,
        supervisors: ["Mme Martin"],
        participants: [`${student.firstName} ${student.lastName}`],
        userId: student.id,
      },
    ],
  });

  console.log("✅ Emprunts et projets de démo créés.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
