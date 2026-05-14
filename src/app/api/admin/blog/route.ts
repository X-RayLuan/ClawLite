import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/blog - 博客文章列表（分页、搜索、返回所有）
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseAdminClient();
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") || "20")));
    const q = searchParams.get("q")?.trim() || "";
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, faqs, published_at, created_by, created_at, updated_at, deleted_at", { count: "exact" });

    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      data: {
        posts: data || [],
        pagination: {
          page,
          page_size: pageSize,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / pageSize),
        },
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_list_posts" }, { status: 400 });
  }
}

// POST /api/admin/blog - 创建博客文章
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseAdminClient();
    const body = await request.json();
    const { slug, title, excerpt, content, faqs, published_at, created_by } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ ok: false, error: "slug, title, and content are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title,
        excerpt: excerpt || null,
        content,
        faqs: faqs || [],
        published_at: published_at || null,
        created_by: created_by || authResult.admin_user_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: false, error: "slug already exists" }, { status: 409 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "failed_to_create_post" }, { status: 400 });
  }
}
