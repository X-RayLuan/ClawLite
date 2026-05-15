import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = "blog-images";

// Ensure bucket exists (idempotent)
async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase.storage.getBucket(BUCKET).catch(() => ({ data: null, error: { message: "network" } }));
  if (!data && !error) {
    // Bucket doesn't exist — create it (public-read)
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_SIZE_BYTES,
    }).catch(() => {/* already created by another concurrent call */});
  }
}

// POST /api/admin/blog/upload – Upload blog image to Supabase Storage
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

    const supabase = createClient();
    await ensureBucket(supabase);

    // Unique storage path: blog-images/YYYYMM/slug.[ext]
    const now = new Date();
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${month}/${uniqueName}`;

    const buffer = Buffer.from(await blob.arrayBuffer());
    const contentType = blob.type || `image/${ext === "svg" ? "svg+xml" : ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      ok: true,
      url: urlData.publicUrl,
      path: storagePath,
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