import { NextResponse } from "next/server";
import { scanMenuImage } from "@/actions/ai";

export async function POST(req: Request) {
  const formData = await req.formData();
  const result = await scanMenuImage(formData);
  return NextResponse.json(result);
}
