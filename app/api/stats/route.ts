import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      equipmentCount,
      activeLoans,
      overdueLoans,
      pendingLoans,
      publishedProjects,
      pendingProjects,
      recentLoans,
      recentProjects,
      loansByStatus,
      projectsByType,
      equipmentByCategory,
      topEquipment,
      allLoans,
    ] = await Promise.all([
      prisma.equipment.count(),
      prisma.loan.count({ where: { status: "APPROVED" } }),
      prisma.loan.count({ where: { status: "OVERDUE" } }),
      prisma.loan.count({ where: { status: "PENDING" } }),
      prisma.project.count({ where: { status: "PUBLISHED" } }),
      prisma.project.count({ where: { status: "PENDING" } }),
      prisma.loan.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "PENDING" },
        include: {
          equipment: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.project.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        where: { status: "PENDING" },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.loan.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.project.groupBy({
        by: ["type"],
        _count: { type: true },
      }),
      prisma.equipment.groupBy({
        by: ["category"],
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
      }),
      prisma.equipment.findMany({
        orderBy: { loanCount: "desc" },
        take: 5,
        select: { name: true, loanCount: true, category: true },
      }),
      prisma.loan.findMany({
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Group loans by month (last 6 months)
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      const count = allLoans.filter(l => {
        const ld = new Date(l.createdAt);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, count });
    }

    return NextResponse.json({
      equipmentCount,
      activeLoans,
      overdueLoans,
      pendingLoans,
      publishedProjects,
      pendingProjects,
      recentLoans,
      recentProjects,
      loansByStatus,
      projectsByType,
      equipmentByCategory,
      topEquipment,
      loansByMonth: months,
      totalLoans: allLoans.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
