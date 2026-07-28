import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GOOGLE_AI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${key}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
