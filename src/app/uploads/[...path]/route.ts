import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { resolveUploadPath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { path: pathParts } = await context.params;
  const requestedPath = pathParts.join("/");

  if (!requestedPath || requestedPath.includes("..")) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const filename = path.basename(requestedPath);
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];

  if (!contentType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  try {
    const { filepath } = resolveUploadPath(filename);
    const file = await fs.readFile(filepath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ error: err?.message || "Failed to read file" }, { status: 500 });
  }
}

