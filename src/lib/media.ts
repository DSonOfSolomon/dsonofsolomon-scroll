import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function getFileExtension(file: File) {
  const fromType = file.type.split("/")[1]?.toLowerCase().split("+")[0];

  if (fromType === "jpeg") {
    return "jpg";
  }

  if (fromType) {
    return fromType;
  }

  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName || "bin";
}

export async function saveUploadedImage(
  file: FormDataEntryValue | null,
  prefix: string,
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const extension = getFileExtension(file);
  const filename = `${prefix}-${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}
