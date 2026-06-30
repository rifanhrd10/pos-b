import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File gambar wajib diisi." }, { status: 400 });
  }

  if (!allowed.has(file.type)) {
    return NextResponse.json({ message: "Format gambar harus JPG, JPEG, PNG, atau WebP." }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ message: "Ukuran file maksimal 2MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const relativePath = `/uploads/products/${fileName}`;
  const fullPath = path.join(process.cwd(), "public", relativePath);

  await fs.writeFile(fullPath, buffer);

  return NextResponse.json({ imageUrl: relativePath });
}
