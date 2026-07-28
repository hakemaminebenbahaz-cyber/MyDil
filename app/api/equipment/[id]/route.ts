import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.imageUrl   !== undefined) data.imageUrl   = body.imageUrl;
  if (body.status     !== undefined) data.status     = body.status;
  if (body.name       !== undefined) data.name       = body.name;
  if (body.brand      !== undefined) data.brand      = body.brand;
  if (body.model      !== undefined) data.model      = body.model;
  if (body.reference  !== undefined) data.reference  = body.reference;
  if (body.internalId !== undefined) data.internalId = body.internalId;
  if (body.category   !== undefined) data.category   = body.category;
  if (body.condition  !== undefined) data.condition  = body.condition;
  if (body.location   !== undefined) data.location   = body.location;
  if (body.quantity   !== undefined) data.quantity   = body.quantity;
  if (body.description !== undefined) data.description = body.description;
  if (body.loanable   !== undefined) data.loanable   = body.loanable;

  const updated = await prisma.equipment.update({ where: { id }, data });
  return NextResponse.json(updated);
}
