/**
 * scripts/migrate-blog-posts.ts
 *
 * 读取 src/data/blog/posts.ts 中的所有文章，迁移到 Supabase blog_posts 表。
 * 使用 curl（exec）调用 Supabase Management API 避免 Node.js fetch 超时问题。
 * 用法: npx tsx scripts/migrate-blog-posts.ts
 */

import { blogPosts } from '../src/data/blog/posts';
import { execSync } from 'child_process';

const PROJECT_REF = 'lryjqxoudbqpwugfseyg';
const MANAGEMENT_PAT = process.env.SUPABASE_MANAGEMENT_PAT;
if (!MANAGEMENT_PAT) throw new Error('SUPABASE_MANAGEMENT_PAT env var is required');
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

function curlQuery(sql: string): any {
  const escaped = sql.replace(/'/g, "'\"'\"'");
  const cmd = `curl -s --max-time 30 -X POST "${API_BASE}" ` +
    `-H "Authorization: Bearer ${MANAGEMENT_PAT}" ` +
    `-H "Content-Type: application/json" ` +
    `-d '${JSON.stringify({ query: sql }).replace(/'/g, "'\"'\"'")}'`;

  const output = execSync(cmd, { timeout: 35000 }).toString().trim();
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Failed to parse response: ${output}`);
  }
}

function generateExcerpt(content: string): string {
  const plain = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  const truncated = plain.slice(0, 160) + (plain.length > 160 ? '…' : '');
  return truncated;
}

function escapeStr(s: unknown): string {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

async function migrate() {
  const entries = Object.entries(blogPosts);
  console.log(`📦 开始迁移 ${entries.length} 篇文章到 Supabase...\n`);

  // Check existing slugs
  let existing: any[] = [];
  try {
    existing = curlQuery(`SELECT slug FROM blog_posts`);
  } catch (e) {
    console.warn(`⚠️  无法获取已存在文章列表，继续全部插入: ${e}`);
  }
  const existingSlugs = new Set(Array.isArray(existing) ? existing.map((r: any) => r.slug) : []);
  console.log(`🔍 当前已存在 ${existingSlugs.size} 篇\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const [slug, post] of entries) {
    if (existingSlugs.has(slug)) {
      console.log(`⏭️  跳过（已存在）: ${slug}`);
      skipCount++;
      continue;
    }

    const p = post as any;
    const title = escapeStr(p.title);
    const excerpt = escapeStr(p.excerpt || generateExcerpt(p.content));
    const content = escapeStr(p.content);
    const faqs = escapeStr(JSON.stringify(p.faqs || []));
    const publishedAt = p.date ? escapeStr(new Date(p.date).toISOString()) : 'NULL';

    const sql = `INSERT INTO blog_posts (slug, title, excerpt, content, faqs, published_at) VALUES (${escapeStr(slug)}, ${title}, ${excerpt}, ${content}, ${faqs}, ${publishedAt})`;

    try {
      const result = curlQuery(sql);
      // Management API returns [] on success for DML
      if (Array.isArray(result) && result.length === 0) {
        console.log(`✅ 已迁移: ${slug} (${post.date ?? '未发布'})`);
        successCount++;
      } else {
        console.log(`✅ 已迁移: ${slug}`);
        successCount++;
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('23505') || msg.includes('duplicate')) {
        console.log(`⏭️  跳过（已存在）: ${slug}`);
        skipCount++;
      } else {
        console.error(`❌ 插入失败 [${slug}]: ${msg}`);
        errorCount++;
      }
    }

    // Rate limit: wait 1.5s between requests
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n📊 迁移完成: 成功 ${successCount}, 跳过 ${skipCount}, 失败 ${errorCount}`);
  if (errorCount > 0) process.exit(1);
}

migrate().catch((err) => {
  console.error('❌ 迁移脚本异常:', err);
  process.exit(1);
});
