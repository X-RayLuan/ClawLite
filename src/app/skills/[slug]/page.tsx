import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSkillPage, skillPages, skillPageSlugs } from "@/data/skill-pages";

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|\`([^`]+)\`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (match[2]) nodes.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<em key={`em-${match.index}`}>{match[3]}</em>);
    else if (match[4] && match[5]) {
      const href = match[5];
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-coral underline underline-offset-4 hover:text-sea"
        >
          {match[4]}
        </a>
      );
    } else if (match[6]) nodes.push(<code key={`code-${match.index}`} className="rounded bg-black/5 px-1.5 py-0.5 text-[0.95em]">{match[6]}</code>);

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let bulletListBuffer: string[] = [];
  let orderedListBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;
  let tableBuffer: string[] = [];

  const parseTableRow = (row: string) => row.split("|").slice(1, -1).map((cell) => cell.trim());
  const isTableRow = (line: string) => /^\|.+\|$/.test(line);
  const isTableDivider = (line: string) => /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line);

  const flushParagraph = (key: string) => {
    if (!paragraphBuffer.length) return;
    const text = paragraphBuffer.join(" ").trim();
    if (text) {
      elements.push(
        <p key={key} className="mb-6 text-base leading-8 text-ink/80 md:text-lg">
          {renderInlineMarkdown(text)}
        </p>
      );
    }
    paragraphBuffer = [];
  };

  const flushBullets = (key: string) => {
    if (!bulletListBuffer.length) return;
    elements.push(
      <ul key={key} className="mb-6 list-disc space-y-2 pl-6 text-base leading-8 text-ink/80 md:text-lg">
        {bulletListBuffer.map((item, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    bulletListBuffer = [];
  };

  const flushOrdered = (key: string) => {
    if (!orderedListBuffer.length) return;
    elements.push(
      <ol key={key} className="mb-6 list-decimal space-y-2 pl-6 text-base leading-8 text-ink/80 md:text-lg">
        {orderedListBuffer.map((item, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ol>
    );
    orderedListBuffer = [];
  };

  const flushCode = (key: string) => {
    if (!codeBuffer.length) return;
    elements.push(
      <pre key={key} className="mb-6 overflow-x-auto rounded-2xl bg-ink px-5 py-4 text-sm leading-7 text-white shadow-soft">
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
    codeBuffer = [];
  };

  const flushTable = (key: string) => {
    if (!tableBuffer.length) return;
    const [headerLine, ...rest] = tableBuffer;
    const headers = parseTableRow(headerLine);
    const rows = rest.filter((line) => !isTableDivider(line)).map(parseTableRow);
    elements.push(
      <div key={key} className="mb-8 overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm text-ink/80">
          <thead className="bg-sand/60 text-ink">
            <tr>
              {headers.map((header, index) => (
                <th key={`${key}-h-${index}`} className="border-b border-black/10 px-4 py-3 font-semibold">
                  {renderInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${key}-r-${rowIndex}`} className="odd:bg-white even:bg-black/[0.02]">
                {row.map((cell, cellIndex) => (
                  <td key={`${key}-c-${rowIndex}-${cellIndex}`} className="border-b border-black/5 px-4 py-3 align-top">
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  const flushAll = (key: string) => {
    flushParagraph(`p-${key}`);
    flushBullets(`ul-${key}`);
    flushOrdered(`ol-${key}`);
    flushCode(`code-${key}`);
    flushTable(`table-${key}`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed === "```") {
      if (inCode) {
        flushCode(String(index));
        inCode = false;
      } else {
        flushParagraph(`p-${index}`);
        flushBullets(`ul-${index}`);
        flushOrdered(`ol-${index}`);
        flushTable(`table-${index}`);
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (!trimmed) {
      flushAll(String(index));
      return;
    }

    if (isTableRow(trimmed) || (tableBuffer.length && isTableDivider(trimmed))) {
      flushParagraph(`p-${index}`);
      flushBullets(`ul-${index}`);
      flushOrdered(`ol-${index}`);
      tableBuffer.push(trimmed);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushAll(String(index));
      elements.push(
        <h2 key={`h2-${index}`} className="mt-12 mb-5 font-display text-3xl font-semibold text-ink md:text-4xl">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushAll(String(index));
      elements.push(
        <h3 key={`h3-${index}`} className="mt-8 mb-3 text-xl font-semibold text-ink md:text-2xl">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph(`p-${index}`);
      flushOrdered(`ol-${index}`);
      flushTable(`table-${index}`);
      bulletListBuffer.push(trimmed.slice(2));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(`p-${index}`);
      flushBullets(`ul-${index}`);
      flushTable(`table-${index}`);
      orderedListBuffer.push(trimmed.replace(/^\d+\.\s+/, ""));
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushAll(String(index));
      elements.push(
        <blockquote key={`bq-${index}`} className="mb-6 rounded-r-2xl border-l-4 border-coral bg-coral/5 px-5 py-4 text-base italic leading-8 text-ink/80 md:text-lg">
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushAll("final");
  return elements;
}

export function generateStaticParams() {
  return skillPageSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getSkillPage(params.slug);
  if (!page) return { title: "Skill page not found | ClawLite" };

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: `https://clawlite.ai/skills/${page.slug}` }
  };
}

function buildFaqSchema(slug: string) {
  const page = getSkillPage(slug);
  if (!page) return "{}";
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    },
    null,
    2
  );
}

export default function SkillDetailPage({ params }: { params: { slug: string } }) {
  const page = getSkillPage(params.slug);
  if (!page) notFound();

  const faqSchema = buildFaqSchema(params.slug);
  const otherPages = skillPages.filter((item) => item.slug !== page.slug).slice(0, 3);

  return (
    <main className="gradient-bg">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-20 md:pt-24">
        <div className="inline-flex rounded-full border border-coral/20 bg-coral/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coral">
          {page.cluster}
        </div>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-ink md:text-6xl">
          {page.h1}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/75 md:text-xl">{page.intro}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {page.quickAnswer.map((item) => (
            <div key={item} className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-soft">
              <p className="text-sm leading-7 text-ink/75">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-ink/70">Primary keyword: {page.primaryKeyword}</span>
          {page.secondaryKeywords.map((item) => (
            <span key={item} className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-ink/70">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="rounded-[32px] border border-black/10 bg-white/95 p-7 shadow-soft md:p-10">
          {renderMarkdown(page.content)}

          <section className="mt-14 rounded-3xl border border-black/10 bg-sand/40 p-6">
            <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">FAQ</h2>
            <div className="mt-5 space-y-5">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl bg-white/90 p-5">
                  <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                  <p className="mt-2 text-base leading-7 text-ink/75">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
        </article>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Related skill pages</p>
            <div className="mt-4 flex flex-col gap-3">
              {page.relatedPages.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-ink/80 transition hover:border-coral/30 hover:text-coral">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">More in this cluster</p>
            <div className="mt-4 space-y-3">
              {otherPages.map((item) => (
                <Link key={item.slug} href={`/skills/${item.slug}`} className="block rounded-2xl border border-black/10 bg-white px-4 py-3 hover:border-coral/30">
                  <p className="font-medium text-ink">{item.h1}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/65">{item.metaDescription}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-coral/20 bg-coral/10 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">ClawLite angle</p>
            <p className="mt-3 text-sm leading-7 text-ink/75">
              ClawLite is the one-click OpenClaw distribution built for lower cost, easier setup, and stronger operator control. These skill pages exist to make the workflow usable, not ornamental.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/pricing" className="rounded-2xl bg-ink px-4 py-3 text-center text-sm font-medium text-white">See pricing</Link>
              <Link href="/skills" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-medium text-ink">Browse all skills</Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
