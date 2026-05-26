import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_IMAGE_UPLOAD_SIZE = 8 * 1024 * 1024;

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

  if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
    throw new Error("Image uploads must be 8MB or smaller.");
  }

  const extension = getFileExtension(file);
  const filename = `${prefix}-${Date.now()}-${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
    });

    return blob.url;
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const filePath = path.join(UPLOADS_DIR, filename);

  await writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}
