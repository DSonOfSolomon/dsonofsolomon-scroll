import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_IMAGE_UPLOAD_SIZE = 8 * 1024 * 1024;
const IMAGE_CONTENT_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export class ImageUploadError extends Error {
  constructor(
    message: string,
    readonly code: "type" | "size" | "storage" | "blob",
  ) {
    super(message);
    this.name = "ImageUploadError";
  }
}

function getFileExtension(file: File) {
  const fromType = file.type.startsWith("image/")
    ? file.type.split("/")[1]?.toLowerCase().split("+")[0]
    : null;

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

  const extension = getFileExtension(file);
  const contentType = file.type.startsWith("image/")
    ? file.type
    : IMAGE_CONTENT_TYPES[extension];

  if (!contentType) {
    throw new ImageUploadError("Only image uploads are supported.", "type");
  }

  if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
    throw new ImageUploadError("Image uploads must be 8MB or smaller.", "size");
  }

  const filename = `${prefix}-${Date.now()}-${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken) {
    try {
      const blob = await put(`uploads/${filename}`, buffer, {
        access: "public",
        contentType,
        token: blobToken,
      });

      return blob.url;
    } catch (error) {
      throw new ImageUploadError(
        error instanceof Error ? error.message : "Blob upload failed.",
        "blob",
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new ImageUploadError(
      "BLOB_READ_WRITE_TOKEN is required for production image uploads.",
      "storage",
    );
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const filePath = path.join(UPLOADS_DIR, filename);

  await writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}
