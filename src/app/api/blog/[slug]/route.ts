import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

// GET /api/blog/[slug] - 获取单篇已发布文章（公开）
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, faqs, published_at, created_at")
      .eq("slug", slug)
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "post not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_get_post" }, { status: 400 });
  }
}
