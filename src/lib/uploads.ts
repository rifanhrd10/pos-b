import path from "path";

export function resolveUploadDir() {
  const configuredDir = process.env.UPLOAD_DIR?.trim() || "public/uploads";

  return path.isAbsolute(configuredDir)
    ? configuredDir
    : path.join(process.cwd(), configuredDir);
}

export function resolveUploadPath(filename: string) {
  const uploadDir = resolveUploadDir();
  const safeFilename = path.basename(filename);
  const filepath = path.join(uploadDir, safeFilename);

  if (!filepath.startsWith(uploadDir + path.sep)) {
    throw new Error("Invalid upload path");
  }

  return { uploadDir, filepath, filename: safeFilename };
}

