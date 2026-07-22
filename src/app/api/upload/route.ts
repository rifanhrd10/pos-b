import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveUploadDir } from "@/lib/uploads";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) return NextResponse.json({ error: `File too large (max ${maxMB}MB)` }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const safeName = `${baseName || "upload"}${ext}`;
    const uniqueName = `${Date.now()}-${randomUUID()}-${safeName}`;
    const uploadDir = resolveUploadDir();

    await fs.mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });
  } catch (err: any) {
    const message =
      err?.code === "EACCES"
        ? "Folder upload di server tidak punya permission tulis. Silakan cek konfigurasi volume/permission upload."
        : err?.message || "Upload failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
