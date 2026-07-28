import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file     = formData.get("file") as File | null;
  const type     = formData.get("type") as string | null; // "zip" | "video"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext      = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const folder   = type === "equipment" ? "equipment" : "projects";
  const dir      = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${folder}/${filename}`, name: file.name, type });
}
