import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = "blog-images";

async function ensureBucket(supabase: AnySupabase) {
  const { data } = await supabase.storage.getBucket(BUCKET).catch(() => ({ data: null }));
  if (!data) {
    await supabase.storage
      .createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE_BYTES,
      })
      .catch(() => {/* already created concurrently */});
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

    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported file type: .${ext}. Allowed: ${[...ALLOWED_EXT].join(", ")}` },
        { status: 400 }
      );
    }

    if (blob.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `File too large: ${(blob.size / 1024 / 1024).toFixed(1)} MB. Max 10 MB.` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    await ensureBucket(supabase);

    const now = new Date();
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${month}/${uniqueName}`;

    const buffer = Buffer.from(await blob.arrayBuffer());
    const contentType = blob.type || (ext === "svg" ? "image/svg+xml" : `image/${ext}`);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `upload failed: ${error.message}` },
        { status: 500 }
      );
    }

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