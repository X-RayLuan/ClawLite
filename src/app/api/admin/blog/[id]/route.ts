import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/admin/blog/[id] - 更新博客文章
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseAdminClient();
    const body = await request.json();
    const { slug, title, excerpt, content, faqs, published_at } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ ok: false, error: "slug, title, and content are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        slug,
        title,
        excerpt: excerpt || null,
        content,
        faqs: faqs || [],
        published_at: published_at ?? null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: false, error: "slug already exists" }, { status: 409 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_update_post" }, { status: 400 });
  }
}

// DELETE /api/admin/blog/[id] - 软删除博客文章
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("blog_posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", params.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_delete_post" }, { status: 400 });
  }
}
