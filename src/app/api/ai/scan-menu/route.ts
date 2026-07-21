import { NextResponse } from "next/server";
import { scanMenuImage } from "@/actions/ai";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type harus multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const result = await scanMenuImage(formData);
    const status = result.error === "Unauthorized" ? 401 : result.error ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Scan menu API error", error);
    return NextResponse.json(
      { error: "Gagal membaca form upload menu" },
      { status: 400 }
    );
  }
}
