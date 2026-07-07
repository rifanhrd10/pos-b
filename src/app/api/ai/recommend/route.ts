import { NextResponse } from "next/server";
import { getRecommendations } from "@/actions/ai";

export async function GET() {
  const result = await getRecommendations();
  return NextResponse.json(result);
}
