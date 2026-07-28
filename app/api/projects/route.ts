import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, description, type, technologies, keywords,
      year, supervisors, participants, mediaUrls,
      zipUrl, videoUrl, githubUrl, userId,
    } = body;

    if (!name || !type || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        type,
        status: "PENDING",
        technologies: technologies || [],
        keywords: keywords || [],
        year: year || new Date().getFullYear(),
        supervisors: supervisors || [],
        participants: participants || [],
        mediaUrls: mediaUrls || [],
        zipUrl: zipUrl || null,
        videoUrl: videoUrl || null,
        githubUrl: githubUrl || null,
        userId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const projects = await prisma.project.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status ? { status: status as "DRAFT" | "PENDING" | "PUBLISHED" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
