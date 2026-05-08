// Legacy re-export layer.
// All blog content now lives in content/blog/<slug>.ts.
// Prefer importing from '@/lib/blog' in new code.

export type { FAQ, BlogPostData as BlogPost } from '@/lib/blog';
export { blogPosts, blogStaticParams } from '@/lib/blog';
