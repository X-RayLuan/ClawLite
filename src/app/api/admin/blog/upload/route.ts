import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Extensions allowlist
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// POST /api/admin/blog/upload – Upload blog image
export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    const blob = file as Blob;
    const name = (file as File).name || "upload";

    // Validate extension
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported file type: .${ext}. Allowed: ${[...ALLOWED_EXT].join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size
    if (blob.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `File too large: ${(blob.size / 1024 / 1024).toFixed(1)} MB. Max 10 MB.` },
        { status: 400 }
      );
    }

    // Build storage path: public/blog/uploads/
    const uploadDir = path.join(process.cwd(), "public", "blog", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Unique filename: timestamp-random.xxx
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    const buffer = Buffer.from(await blob.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicUrl = `/blog/uploads/${uniqueName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      filename: uniqueName,
      size: blob.size,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "upload failed" },
      { status: 500 }
    );
  }
}