export type SkillFaq = {
  question: string;
  answer: string;
};

export type SkillPage = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  cluster: string;
  intro: string;
  quickAnswer: string[];
  content: string;
  faqs: SkillFaq[];
  relatedPages: { label: string; href: string }[];
  primaryKeyword: string;
  secondaryKeywords: string[];
};

export const skillPages: SkillPage[] = [
  {
    slug: "geo-optimization",
    title: "GEO Optimization Skill for AI Search Visibility | ClawLite",
    metaDescription:
      "Use ClawLite's GEO Optimization skill to audit citation readiness, improve AI search visibility, and turn pages into quotable assets across ChatGPT, Google AI Overviews, Claude, and Perplexity.",
    h1: "GEO Optimization skill for AI search visibility",
    cluster: "GEO / content quality",
    intro:
      "The ClawLite GEO Optimization skill helps teams turn normal landing pages into pages that AI engines can quote, summarize, and trust. Instead of hand-waving about 'AI SEO', it gives you a repeatable audit, concrete rewrite moves, and a workflow you can reuse across product pages, comparison pages, and help docs.",
    quickAnswer: [
      "Best for teams that want AI engines to cite their pages, not just crawl them.",
      "Outputs a GEO audit, rewrite priorities, quote-ready statements, schema recommendations, and an action plan.",
      "Works especially well with Content Quality Auditor, On-Page SEO Auditor, and GEO Content Optimizer."
    ],
    content: `## Why teams use a GEO Optimization skill instead of generic SEO advice

**GEO optimization** means improving a page so large language models and AI search systems can understand it, quote it, and use it as a trustworthy answer source. Traditional SEO still matters, but GEO adds another layer: answer extraction, citation worthiness, entity clarity, and evidence structure.

For ClawLite users, this matters because many high-intent searches now end before a click. A buyer asks ChatGPT, Perplexity, Claude, or Google AI Overviews for the best tool, workflow, or vendor. If your page is vague, fluffy, or structurally weak, it may still rank in classic search and yet fail to get quoted in AI answers. That gap is expensive.

This skill exists to close that gap. It helps you audit whether a page actually answers the target question, whether claims are backed by sources, whether your statements are quotable, and whether the page has the structure that AI systems tend to extract reliably.

According to [Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), helpful content should primarily serve people, provide original value, and demonstrate expertise. According to [Schema.org FAQPage](https://schema.org/FAQPage), structured FAQ markup helps search systems understand question-answer pairs. According to [Google's structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), structured markup improves machine-readable understanding even when it does not guarantee a specific result. That is exactly the operating environment this skill is built for.

## What the GEO Optimization skill actually produces

The output is not just a score. A useful run should give you five practical deliverables:

1. **A citation-readiness audit** that tells you where the page is weak.
2. **A rewrite plan** that prioritizes the highest-leverage changes first.
3. **Quotable statements** with precise language and supporting evidence.
4. **Schema and structure recommendations** so answer engines can parse the page more reliably.
5. **A next-step workflow** so the page can move from draft to publish to refresh without getting lost.

That makes it different from a generic content critique. The point is not to say a page is "good" or "bad." The point is to turn the page into an asset that is easier to extract, cite, compare, and trust.

## When to use GEO Optimization inside ClawLite

Use this skill when you are working on any of these page types:

- product or feature landing pages
- comparison pages
- use-case pages
- documentation that should answer a decision question
- pricing explainer pages
- glossary or educational pages that need AI citations

It is especially strong when a page already has some traffic or some topical relevance but is failing to show up in AI-generated answers. In that situation, the page often does not need a full rewrite. It needs structural cleanup, evidence density, clearer claims, and sharper answer formatting.

## Quick GEO scoring framework you can reuse

Below is a simple 10-point framework that works well for ClawLite pages and is usable by operators, not just SEO specialists.

| Dimension | What good looks like | Score range |
| --- | --- | --- |
| Direct answer | The page answers the main question in the first 150 words | 0-2 |
| Evidence | Claims use named sources, numbers, or examples | 0-2 |
| Structure | H1/H2/H3 hierarchy is clear and scannable | 0-1 |
| Quotable statements | Key claims are concise, precise, and citable | 0-1 |
| Entity clarity | Product, audience, and competitors are explicitly named | 0-1 |
| Internal links | The page points to related decision-support pages | 0-1 |
| External authority | The page cites trustworthy external sources | 0-1 |
| FAQ schema readiness | FAQ questions are specific and answer intent cleanly | 0-1 |

A page scoring below **6/10** is usually too weak for strong AI visibility. A page at **7 to 8/10** is often good enough to compete. A page at **9/10** usually has clear answer structure, evidence, and machine-readable organization.

## GEO Optimization prompt library

These prompt patterns are the real skill-content layer. They are what makes this page usable instead of ornamental.

### Prompt 1: citation-readiness audit

\`\`\`
Audit this page for GEO optimization.
Primary question: "[target query]"
Audience: [buyer / operator / founder / marketer]
Return:
1. direct-answer quality score out of 10
2. top 5 reasons AI engines may not cite this page
3. missing evidence or source gaps
4. 3 quotable statements to add
5. FAQ questions that should exist but do not
\`\`\`

### Prompt 2: rewrite priorities

\`\`\`
Review this landing page as a GEO Optimization skill.
Give me a prioritized rewrite plan using this format:
- fix
- why it matters for AI visibility
- exact section to rewrite
- example replacement copy
Only include the highest leverage changes first.
\`\`\`

### Prompt 3: compare-page upgrade

\`\`\`
Turn this comparison page into a page that AI engines can cite.
Focus on:
- a direct recommendation in the opening section
- a comparison table with named dimensions
- source-backed claims
- FAQ schema candidates
- internal links to supporting pages
\`\`\`

### Prompt 4: quote extraction

\`\`\`
From this draft, extract 5 quotable statements that are precise enough for AI answer engines.
Each quote should:
- be 20 to 40 words
- include the product or entity name
- avoid vague adjectives
- mention the audience or use case when relevant
\`\`\`

## Practical workflow for shipping a GEO-improved page

### Step 1: define the answer target

Start with one question, not ten. For example:

- what is GEO optimization
- best GEO optimization tool
- how to improve AI search visibility
- content quality audit for AI search

The skill works best when the page has a single clear answer target and a small set of supporting questions.

### Step 2: run the first audit

Feed the existing draft or live page into the skill. Ask for the top reasons it may fail to earn citations. This creates the truth baseline. Do not jump straight to rewriting before you know which structural failure is actually hurting the page.

### Step 3: patch the answer layer first

The first paragraph should contain a plain answer, a target audience, and the page's promise. That alone often fixes a lot of weak GEO behavior.

### Step 4: add proof and authority

Every 400 to 500 words, add something verifiable: a named source, a concrete number, a cited best practice, or a specific workflow artifact. Pages without proof often sound competent but remain uncitable.

### Step 5: install extraction helpers

These include:

- tables with named dimensions
- bullet lists with one idea per bullet
- FAQ blocks with short answers
- internal links to the next decision page
- external links to official documentation or recognized authorities

### Step 6: rerun the skill and compare deltas

Ask the skill to rescore the page. You want a clear delta, not a vague sense that the page feels better. This is where ClawLite's workflow discipline matters. Keep the before-and-after logic visible.

## GEO Optimization workflow template for operators

Use this template when you want consistent execution across a team.

\`\`\`
Page URL or draft:
Primary query:
Primary audience:
Decision stage: awareness / evaluation / purchase
Current weak points:

Required output:
- GEO score out of 10
- missing evidence list
- missing FAQ list
- 3 rewrite recommendations
- 3 quotable statements
- 2 internal link recommendations
- 2 external authority recommendations
\`\`\`

That template is simple enough for marketers and precise enough for operators.

## Example GEO audit artifact

Here is the kind of output you should expect from a strong run:

\`\`\`
Page: /skills/geo-optimization
Primary query: geo optimization skill
Score: 7.4/10

Top blockers:
1. opening paragraph explains the category but does not answer the query directly
2. no named external sources in the first half of the page
3. FAQ answers are too broad and not extractable
4. comparison language is missing specific dimensions
5. internal links do not support cluster depth

Highest leverage fixes:
- rewrite intro into a direct definition plus who it is for
- add source-backed GEO best-practice section
- add workflow prompts and audit template
- link to /skills/content-quality-auditor and /skills/on-page-seo-auditor
- add FAQ schema with 5 decision-stage questions
\`\`\`

That is useful because it tells the operator what to do next, not just what is wrong.

## Internal links that strengthen this cluster

A real GEO page should not sit alone. Link this page to:

- [Content Quality Auditor](/skills/content-quality-auditor) for deeper quality scoring
- [On-Page SEO Auditor](/skills/on-page-seo-auditor) for title, heading, and link hygiene
- [GEO Content Optimizer](/skills/geo-content-optimizer) for quote-friendly rewrites after the audit

That internal graph matters because AI systems and users both benefit when related decision-support pages are clearly connected.

## External sources worth citing on GEO pages

These are reliable anchors for this topic:

- [Google Search Central helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Schema.org FAQPage](https://schema.org/FAQPage)
- [Google structured data documentation](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

Use them to support claims about content quality, structure, and machine readability. Do not pretend there is a secret GEO rulebook. There isn't. There is a set of observable behaviors and good publishing habits.

## Who this skill is best for

This page is for:

- SEO and GEO operators who need a repeatable audit workflow
- founders who want category pages that AI engines can cite
- content teams refreshing underperforming landing pages
- agencies that need a structured audit artifact to hand back to clients

It is not ideal if all you want is a one-click meta description generator. This skill is about decision pages, evidence, and visibility across answer engines.

## Recommended ClawLite operating recipe

If you want the cleanest workflow, run the pages in this order:

1. GEO Optimization for the first diagnosis
2. Content Quality Auditor for depth and trust signals
3. On-Page SEO Auditor for page mechanics
4. GEO Content Optimizer for rewrite execution

That sequence keeps the work grounded. Diagnose first, sharpen second, execute third.

## Final take

If your page can rank but still fails to get cited in AI answers, the problem is usually not more keyword stuffing. It is weak answer structure, poor evidence density, missing schema readiness, or unclear quotes. The GEO Optimization skill is valuable because it turns that fuzzy problem into a repeatable operating workflow with prompts, scores, rewrite priorities, and output structure.

For ClawLite, that means more than vanity SEO. It means building pages that survive the shift from blue links to answer engines.`,
    faqs: [
      {
        question: "What does the GEO Optimization skill do?",
        answer:
          "It audits pages for AI citation readiness, identifies weak answer structure, recommends rewrite priorities, and helps teams create pages that are easier for answer engines to quote and trust."
      },
      {
        question: "How is GEO Optimization different from normal SEO?",
        answer:
          "Normal SEO focuses on rankings, crawlability, and classic search signals. GEO Optimization also focuses on answer extraction, quotable statements, evidence density, and machine-readable structure for AI systems."
      },
      {
        question: "When should I use GEO Optimization inside ClawLite?",
        answer:
          "Use it when a landing page, comparison page, or help page needs to win visibility in ChatGPT, Perplexity, Claude, or AI Overviews, especially if the page is informative but not getting cited."
      },
      {
        question: "What pages does this skill work best on?",
        answer:
          "It works best on product pages, comparison pages, decision-stage landing pages, documentation that answers clear questions, and evergreen educational pages with strong buyer intent."
      },
      {
        question: "What should a good GEO Optimization output include?",
        answer:
          "A strong output includes a score, missing evidence list, rewrite priorities, quotable statements, schema recommendations, internal links, and a practical action plan for the next revision."
      }
    ],
    relatedPages: [
      { label: "Content Quality Auditor", href: "/skills/content-quality-auditor" },
      { label: "On-Page SEO Auditor", href: "/skills/on-page-seo-auditor" },
      { label: "GEO Content Optimizer", href: "/skills/geo-content-optimizer" }
    ],
    primaryKeyword: "geo optimization skill",
    secondaryKeywords: ["ai search visibility", "citation readiness", "geo audit"]
  },
  {
    slug: "content-quality-auditor",
    title: "Content Quality Auditor Skill for CORE-EEAT Reviews | ClawLite",
    metaDescription:
      "Use ClawLite's Content Quality Auditor skill to run a structured CORE-EEAT review, score landing pages and articles, and produce fix plans that improve trust, clarity, and AI citation readiness.",
    h1: "Content Quality Auditor skill for CORE-EEAT reviews",
    cluster: "GEO / content quality",
    intro:
      "The Content Quality Auditor skill helps you decide whether a page is actually good, not just finished. It reviews clarity, evidence, structure, usefulness, and trust signals, then turns that review into a prioritized fix plan you can hand to a writer, editor, founder, or SEO operator.",
    quickAnswer: [
      "Best for auditing whether content deserves to rank, convert, and get cited.",
      "Outputs a structured quality score, high-risk weaknesses, and a prioritized remediation plan.",
      "Pairs naturally with GEO Optimization, On-Page SEO Auditor, and GEO Content Optimizer."
    ],
    content: `## What a Content Quality Auditor is supposed to catch

A lot of content fails for boring reasons. The page may technically exist, the keywords may be present, and the layout may look polished, but the actual content is thin, repetitive, unsupported, or confused about who it serves. That is where a **Content Quality Auditor** earns its keep.

This skill is designed for **CORE-EEAT-style reviews**. In plain English, it looks for the things that separate helpful, credible content from padded marketing copy: direct answers, useful structure, evidence, specificity, audience fit, semantic consistency, and practical next steps.

The reason this matters for ClawLite is simple. If a page is weak, every downstream system suffers. SEO suffers because the page does not satisfy search intent. GEO suffers because AI systems do not find enough trustworthy, quotable material. Conversion suffers because users do not leave with a clear recommendation or action path.

Google's helpful content guidance emphasizes people-first content that demonstrates expertise and delivers original value. The [Google Search quality guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) is not a secret formula, but it is a strong direction-of-travel signal. Likewise, structured quality audits help teams avoid publishing pages that are visually complete but strategically weak.

## The main job of this skill

The main job is to answer one brutal question: **should this page stay as-is, get revised, or get rebuilt?**

A good audit should not drown the operator in 80 tiny observations. It should surface the highest-risk failures first. For example:

- the page does not answer the main question early enough
- the audience is not defined
- claims are not supported
- the page uses generic language instead of precise statements
- the structure makes extraction difficult for humans and AI systems
- there is no practical tool, example, or artifact that proves the page is useful

The ClawLite angle here is systems over vibes. The audit should create a fix plan that another person can execute without guesswork.

## What a strong Content Quality Auditor output looks like

A useful output includes:

1. **Overall quality score** with a brief justification
2. **Failing dimensions** ranked by impact
3. **Examples of weak copy** and replacement guidance
4. **Evidence gaps** with source suggestions
5. **Audience and intent diagnosis**
6. **Remediation plan** ordered by highest leverage fixes

This turns the audit into an execution tool, not a pile of commentary.

## Core audit criteria you can reuse

Use this lightweight rubric when evaluating a ClawLite page.

| Criterion | What to look for | Why it matters |
| --- | --- | --- |
| Intent alignment | Does the page answer the searcher's actual question? | Prevents traffic mismatch |
| Direct answer | Is the main answer visible in the first section? | Helps both users and AI systems |
| Evidence | Are key claims supported by sources, numbers, or examples? | Builds trust and quote-worthiness |
| Structure | Are headings, lists, and tables used well? | Improves readability and extraction |
| Audience fit | Is it obvious who the page is for? | Increases relevance and conversion |
| Practical value | Does the page contain prompts, templates, recipes, or checklists? | Proves usefulness |
| Internal linkage | Does it connect to related decisions? | Strengthens cluster depth |
| Conclusion quality | Does the page close with a recommendation and next step? | Reduces dead-end pages |

A page with weak performance in more than **3 of these 8 dimensions** probably needs meaningful revision.

## Prompt library for Content Quality Auditor

### Prompt 1: full audit

\`\`\`
Audit this page as a Content Quality Auditor.
Return:
- overall score out of 10
- top 5 quality failures
- sections that feel generic or weak
- missing proof or evidence
- missing practical content layer
- prioritized fix plan
Use concise operator language, not academic commentary.
\`\`\`

### Prompt 2: landing-page quality review

\`\`\`
Review this landing page for content quality.
Judge it on:
- clarity
- trust
- specificity
- practical value
- buyer usefulness
Then tell me whether to keep, revise, or rebuild the page.
\`\`\`

### Prompt 3: content thinness detector

\`\`\`
Find signs of thin content in this page.
Flag:
- sections that repeat the same idea
- vague claims
- unsupported statements
- headings with weak payload underneath
- missing examples, prompts, templates, or workflows
\`\`\`

### Prompt 4: editor handoff

\`\`\`
Turn this audit into an editor handoff.
For each major fix, give:
- the problem
- why it matters
- the exact section to rewrite
- an example of stronger replacement copy
\`\`\`

## A practical audit workflow for ClawLite content

### Step 1: identify the page type

Audit a skill page differently from a blog post. Audit a comparison page differently from a glossary page. A useful review starts with the right frame. For skill pages, practical utility matters more than narrative elegance. For comparison pages, decision clarity matters more than breadth.

### Step 2: score the page fast before scoring it deeply

Start with a top-line pass:

- Does it answer the question?
- Does it sound credible?
- Is there proof?
- Is there a practical content layer?
- Would a buyer or operator know what to do next?

That quick pass surfaces whether you are dealing with a minor polish issue or a structural failure.

### Step 3: mark the highest-risk sections

Common failure sections include:

- intros that ramble instead of answering
- feature sections with no examples
- FAQ sections that ask low-value questions
- conclusions that summarize but do not recommend

### Step 4: diagnose missing usefulness

A page can be factually fine and still useless. The easiest way to test usefulness is to ask: **what can the reader steal from this page and use today?**

If the answer is "not much," the page needs a stronger content layer. That might be a prompt set, audit checklist, workflow template, before-and-after example, or acceptance criteria.

### Step 5: write the remediation plan

A good remediation plan is prioritized, not encyclopedic. It should often look like this:

1. rewrite the intro for direct answer
2. add source-backed proof section
3. install a practical template or prompt block
4. replace vague FAQ with decision-stage FAQ
5. strengthen internal links to the cluster

That order helps the page improve fast.

## Reusable content audit template

\`\`\`
Page URL or draft:
Page type:
Target audience:
Primary query:
Primary CTA:

Audit output required:
- score out of 10
- keep / revise / rebuild verdict
- top 5 quality failures
- weak sections with exact notes
- missing evidence list
- missing practical content layer
- prioritized fix plan
\`\`\`

This template works well in a daily editorial operating loop.

## Example audit artifact

\`\`\`
Page: /skills/content-quality-auditor
Verdict: revise
Score: 6.9/10

Top quality failures:
1. opening section explains the skill but does not define the user outcome fast enough
2. no explicit scoring rubric early in the page
3. practical audit template appears too late
4. FAQ is informative but not decision-oriented
5. no before-and-after example of weak vs strong content

Highest leverage fixes:
- tighten the intro into a direct promise
- add a visible scoring rubric near the top
- move prompt library above theory sections
- add a thin-content detector example
- add internal links to GEO Optimization and On-Page SEO Auditor
\`\`\`

This is the kind of artifact that makes the skill operationally useful.

## Audit criteria for skill pages specifically

Skill pages need a higher bar than simple introduction pages. At minimum, a strong skill page should include:

- a direct explanation of the outcome
- a visible practical content layer
- prompts or workflows the user can copy
- clarity about when to use the skill and when not to
- related internal links to supporting pages

If those are missing, the page may be well-written but it is still not complete.

## Internal links that make this page stronger

This page should sit in a cluster, not a silo. Strong related links include:

- [GEO Optimization](/skills/geo-optimization) for citation-readiness diagnosis
- [On-Page SEO Auditor](/skills/on-page-seo-auditor) for technical on-page issues
- [GEO Content Optimizer](/skills/geo-content-optimizer) for rewrite execution after the audit

Those links matter because a quality audit usually leads to either a structure fix, an SEO fix, or a GEO rewrite.

## External authority links worth keeping in scope

When you need to support quality guidance, these are solid anchors:

- [Google helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google structured data overview](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Schema.org FAQPage](https://schema.org/FAQPage)

These do not replace judgment, but they help support claims about trust, clarity, and machine readability.

## Who should use Content Quality Auditor

This skill is for:

- content leads reviewing drafts before publish
- founders who want a brutal but useful quality check
- agencies handing back prioritized audits instead of vague comments
- GEO operators who need stronger trust and evidence before asking for citations

It is especially useful when a team has writers producing volume but not enough consistency.

## Recommended operating recipe inside ClawLite

The most effective sequence is often:

1. run Content Quality Auditor first
2. use On-Page SEO Auditor to catch mechanical issues
3. use GEO Optimization to assess citation readiness
4. use GEO Content Optimizer to execute rewrites

That keeps the work honest. First determine whether the page is worth improving. Then fix the page at the right level.

## Final take

A content quality audit is not just proofreading with a fancy label. It is a decision system for whether the page is helpful, credible, and useful enough to deserve distribution. The Content Quality Auditor skill is valuable because it turns messy editorial judgment into a structured review, a fix plan, and a set of reusable prompts. That makes it a strong foundation for any ClawLite content cluster that cares about rankings, conversions, and AI visibility.`,
    faqs: [
      {
        question: "What does the Content Quality Auditor skill review?",
        answer:
          "It reviews whether a page is clear, useful, trustworthy, evidence-backed, well-structured, and aligned with the audience and search intent it claims to serve."
      },
      {
        question: "How is this different from a copy edit?",
        answer:
          "A copy edit improves wording and grammar. A content quality audit decides whether the page is strategically strong, practically useful, and credible enough to rank, convert, and get cited."
      },
      {
        question: "What should a good audit output include?",
        answer:
          "A strong audit output includes a score, keep-versus-revise verdict, top failures, weak sections, missing evidence, and a prioritized remediation plan that another operator can execute."
      },
      {
        question: "When should I use Content Quality Auditor in ClawLite?",
        answer:
          "Use it before publishing new pages, when refreshing underperforming content, when validating vendor or agency drafts, or when a page feels polished but still weak in performance."
      },
      {
        question: "Does this skill help with GEO too?",
        answer:
          "Yes. Stronger quality, specificity, evidence, and structure also improve citation readiness for AI answer engines, especially when paired with GEO Optimization."
      }
    ],
    relatedPages: [
      { label: "GEO Optimization", href: "/skills/geo-optimization" },
      { label: "On-Page SEO Auditor", href: "/skills/on-page-seo-auditor" },
      { label: "GEO Content Optimizer", href: "/skills/geo-content-optimizer" }
    ],
    primaryKeyword: "content quality auditor skill",
    secondaryKeywords: ["core-eeat audit", "content quality review", "landing page quality audit"]
  },
  {
    slug: "on-page-seo-auditor",
    title: "On-Page SEO Auditor Skill for Landing Page Reviews | ClawLite",
    metaDescription:
      "Use ClawLite's On-Page SEO Auditor skill to review titles, headings, internal links, metadata, and page structure, then turn the audit into a fix plan for stronger rankings and cleaner GEO performance.",
    h1: "On-Page SEO Auditor skill for landing page reviews",
    cluster: "GEO / content quality",
    intro:
      "The On-Page SEO Auditor skill is the practical mechanic in this cluster. It checks whether your page is structurally optimized for discoverability, readability, and crawlable clarity, then gives you a concrete page-level fix list instead of generic SEO platitudes.",
    quickAnswer: [
      "Best for finding page-level SEO issues that quietly suppress rankings and weaken GEO outcomes.",
      "Outputs title, meta, heading, content, linking, and structure fixes in operator-ready format.",
      "Ideal after a quality audit and before final rewrite or publish."
    ],
    content: `## Why an On-Page SEO Auditor still matters in an AI-search world

There is a lazy story floating around that GEO replaces SEO. It does not. AI answer engines still rely on pages that are understandable, structured, indexable, and internally coherent. If your page title is muddy, your headings drift off topic, your internal links are weak, and your metadata is careless, both classic search and answer engines get worse inputs.

That is why an **On-Page SEO Auditor** still matters. It looks at the boring page mechanics that compound over time: titles, meta descriptions, heading hierarchy, keyword alignment, internal links, external references, and structural readability.

This skill is useful because many teams have content problems that are partly strategic and partly mechanical. A page can have a strong idea but a weak title. A page can have a decent body but no internal links. A page can have solid FAQ answers but poor heading structure that makes extraction harder. The right response is not a full rewrite. It is a disciplined page audit.

Google documentation continues to emphasize well-structured pages, descriptive titles, and helpful content. See [Google title link guidance](https://developers.google.com/search/docs/appearance/title-link), [Google meta description guidance](https://developers.google.com/search/docs/appearance/snippet), and [Google helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Those fundamentals remain highly relevant.

## What this skill checks

A strong On-Page SEO Auditor run should review at least these dimensions:

- title tag clarity and keyword alignment
- meta description usefulness
- H1 uniqueness and accuracy
- H2 and H3 hierarchy
- first-100-word keyword placement
- internal link coverage
- external authority links
- FAQ presence and snippet readiness
- table, list, and scannability structure
- conclusion and CTA clarity

This skill is not only about compliance. It is about removing avoidable friction so a good page can behave like a good page.

## Quick on-page checklist

Use this before you publish any ClawLite landing page.

| Element | Minimum bar | Why it matters |
| --- | --- | --- |
| Title tag | Clear, specific, primary keyword included | Helps search understanding and CTR |
| Meta description | 150 to 160 characters, useful, specific | Improves snippet quality |
| H1 | One clear H1 aligned to query | Prevents topic confusion |
| Intro | Primary keyword and direct answer in first section | Supports relevance and extraction |
| H2s | Keyword-adjacent subtopics, not filler | Improves scan path |
| Internal links | At least 2 to 3 relevant links | Builds topic graph |
| External links | At least 2 credible sources | Supports trust |
| FAQ | Decision-stage questions with concise answers | Supports snippets and GEO |
| Conclusion | Summary plus next step | Prevents dead-end experience |

If a page misses **4 or more** of those elements, do not call it finished.

## Prompt library for On-Page SEO Auditor

### Prompt 1: full page audit

\`\`\`
Audit this page for on-page SEO.
Return:
- score out of 10
- title tag issues
- meta description issues
- heading hierarchy problems
- internal link gaps
- FAQ/snippet opportunities
- exact fixes in priority order
\`\`\`

### Prompt 2: title and heading fix pass

\`\`\`
Review the title, H1, H2s, and H3s for this page.
Tell me:
- whether the keyword alignment is strong
- whether the heading sequence is clean
- which headings feel vague or duplicate
- better replacement options
\`\`\`

### Prompt 3: internal link audit

\`\`\`
Audit this page's internal links.
Recommend:
- missing related pages to link to
- better anchor text
- where to place links for maximum clarity
Use only links that improve decision support.
\`\`\`

### Prompt 4: publish gate

\`\`\`
Act as an On-Page SEO Auditor and decide whether this page is publish-ready.
Use PASS / REVISE / FAIL.
Support the verdict with:
- 5 strongest positives
- 5 highest-risk weaknesses
- the smallest set of fixes needed to publish safely
\`\`\`

## Example operator workflow

### Step 1: run mechanical audit after the strategic draft exists

Do not ask an on-page skill to solve a page with no strategy. This skill is strongest when the page already knows what question it answers and who it serves.

### Step 2: fix the title and intro first

These two sections often carry the biggest relevance load. If the title is vague or the intro stalls, the rest of the page has to work harder than it should.

### Step 3: repair heading hierarchy

A very common issue is headings that look nice visually but do poor semantic work. Strong headings should help a crawler, an AI system, and a skimming human understand the page's logic.

### Step 4: clean up internal linking

Many sites treat internal links as decoration. They are not. Good internal links connect the current decision to the next useful decision. On a skill page, that usually means linking to adjacent skills that naturally continue the workflow.

### Step 5: install snippet helpers

This includes:

- FAQs with concise answers
- tables for dimensions and comparisons
- bullet lists for steps or criteria
- a conclusion with a clear recommendation

These small structural upgrades make pages easier to surface and easier to quote.

## Reusable audit template

\`\`\`
Page URL or draft:
Primary keyword:
Secondary keywords:
Target audience:
Target intent:

Required output:
- on-page SEO score out of 10
- title tag review
- meta description review
- heading hierarchy review
- internal link recommendations
- FAQ opportunities
- publish verdict: PASS / REVISE / FAIL
\`\`\`

This is compact enough to use in a real editorial queue.

## Example audit artifact

\`\`\`
Page: /skills/on-page-seo-auditor
Score: 7.1/10
Verdict: REVISE

Main issues:
1. title tag is descriptive but could include stronger query intent
2. intro mentions the skill but delays the exact user outcome
3. one H2 is too generic and should be keyword-adjacent
4. only one internal cluster link appears before the FAQ
5. FAQ answers are useful but slightly too long for snippet extraction

Priority fixes:
- tighten title tag around landing page review intent
- rewrite intro for direct answer
- rename generic H2 into a use-case heading
- add links to GEO Optimization and Content Quality Auditor earlier
- shorten FAQ answers to 40 to 60 words where possible
\`\`\`

That is the right shape. Small, precise, actionable.

## Internal link recommendations for this cluster

The best internal links for this page are:

- [GEO Optimization](/skills/geo-optimization)
- [Content Quality Auditor](/skills/content-quality-auditor)
- [GEO Content Optimizer](/skills/geo-content-optimizer)

Those links work because on-page fixes often sit between a strategic diagnosis and an execution rewrite.

## External authority links to keep handy

Use these sources when you want to support on-page guidance with official documentation:

- [Google title links documentation](https://developers.google.com/search/docs/appearance/title-link)
- [Google meta descriptions and snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Google helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

These are useful because they reinforce that on-page optimization is not superstition. It is a set of observable, documented page-quality practices.

## Common page failures this skill is good at catching

This skill reliably catches:

- title tags that chase the wrong query
- missing or weak meta descriptions
- multiple or confused H1 logic
- intros that bury the main answer
- H2 sections that repeat instead of expand
- internal link deserts
- FAQ blocks that are too shallow to matter

Those are not glamorous problems, but they are often the reason decent pages underperform.

## Who should use this skill

This page is for:

- SEO operators doing pre-publish checks
- founders reviewing new landing pages
- content teams refreshing old pages without rebuilding from scratch
- GEO operators who want cleaner page mechanics before AI visibility work

It is less useful if you are still trying to figure out the core topic or audience. For that, run a quality or GEO diagnosis first.

## Recommended ClawLite recipe

Use the cluster in this order when possible:

1. Content Quality Auditor to judge whether the page is worth improving
2. On-Page SEO Auditor to fix page mechanics
3. GEO Optimization to test citation readiness
4. GEO Content Optimizer to execute rewrite improvements

That order reduces rework because you fix the right problems at the right layer.

## Publish-day acceptance criteria for this skill

Use this checklist before you mark an audited page as ready:

- title tag reflects the real query, not a vague topic bucket
- meta description is useful enough that a human would want to click it
- H1 and intro answer the same core question
- at least 2 internal links support the next decision in the cluster
- at least 2 external authority links support important claims
- FAQ answers are concise, specific, and non-duplicative
- conclusion gives a recommendation instead of fading out

This kind of acceptance bar matters because teams often call a page done when it is merely less broken than before. The point of the On-Page SEO Auditor skill is to create a repeatable publish gate. If the page still has a weak title, muddy headings, or dead internal linking, publishing it early just creates future cleanup work. A small deterministic checklist is cheaper than months of underperformance.

It also gives teams a shared language for review. Instead of arguing about whether the page "feels SEO-friendly," operators can point to the exact broken element and fix it quickly.

## Final take

The On-Page SEO Auditor skill matters because even strong ideas can get buried under weak page mechanics. By turning titles, headings, links, FAQs, and metadata into a clear fix list, the skill helps ClawLite teams improve search performance without guessing. It is a clean bridge between content strategy and publish-ready execution, and it makes the whole GEO cluster sharper.`,
    faqs: [
      {
        question: "What does the On-Page SEO Auditor skill check?",
        answer:
          "It checks titles, meta descriptions, heading structure, keyword placement, internal links, external authority links, FAQ readiness, and general page structure that affects visibility and readability."
      },
      {
        question: "How is on-page SEO different from content quality auditing?",
        answer:
          "On-page SEO focuses on page mechanics like titles, headings, and linking. Content quality auditing focuses on usefulness, trust, specificity, and whether the page deserves attention in the first place."
      },
      {
        question: "When should I use this skill in the workflow?",
        answer:
          "Use it after the draft has a clear strategy but before publishing, or when a page seems strong conceptually but underperforms due to structural page-level issues."
      },
      {
        question: "Does this skill help with AI search too?",
        answer:
          "Yes. Cleaner headings, stronger intros, better FAQs, and more useful internal links make pages easier for both classic search engines and AI answer systems to interpret."
      },
      {
        question: "What should a good On-Page SEO Auditor output include?",
        answer:
          "A strong output includes a page score, key issues by element, exact title and heading fixes, internal link recommendations, FAQ opportunities, and a publish verdict."
      }
    ],
    relatedPages: [
      { label: "Content Quality Auditor", href: "/skills/content-quality-auditor" },
      { label: "GEO Optimization", href: "/skills/geo-optimization" },
      { label: "GEO Content Optimizer", href: "/skills/geo-content-optimizer" }
    ],
    primaryKeyword: "on-page seo auditor skill",
    secondaryKeywords: ["landing page seo audit", "page-level seo review", "metadata and headings audit"]
  },
  {
    slug: "geo-content-optimizer",
    title: "GEO Content Optimizer Skill for Quote-Ready Rewrites | ClawLite",
    metaDescription:
      "Use ClawLite's GEO Content Optimizer skill to rewrite pages for stronger AI citation odds, clearer quotable statements, better FAQ blocks, and more extractable decision-stage content.",
    h1: "GEO Content Optimizer skill for quote-ready rewrites",
    cluster: "GEO / content quality",
    intro:
      "The GEO Content Optimizer skill takes the diagnosis from your audits and turns it into better copy. It is the rewrite layer in the ClawLite GEO stack, focused on sharper answers, clearer quotes, better evidence placement, and page structures that AI systems can extract more reliably.",
    quickAnswer: [
      "Best for turning decent pages into quote-ready, citation-friendly assets.",
      "Outputs rewrites, quote candidates, FAQ improvements, and section-level upgrades.",
      "Works best after GEO Optimization or Content Quality Auditor has already found the real problems."
    ],
    content: `## Why GEO Content Optimizer exists

Most content audits tell you what is wrong. Fewer tools actually help you rewrite the page into something stronger without flattening the meaning. That is where the **GEO Content Optimizer** skill fits.

It is built for execution, not diagnosis. Once you already know the page has weak intros, vague claims, missing FAQ structure, low evidence density, or non-quotable language, this skill helps you fix the content itself. The goal is not just to sound better. The goal is to make the page easier for AI engines to cite and easier for buyers to trust.

That matters because AI answer systems often choose concise, precise, high-signal passages. A page full of broad promises and soft adjectives does not give them much to work with. A page with clear definitions, source-backed statements, structured sections, and tightly written FAQs gives them far more usable material.

## What this skill changes on the page

A strong GEO Content Optimizer run should improve:

- the opening answer block
- quotable statements throughout the page
- evidence placement and supporting references
- FAQ quality and brevity
- comparison tables and decision-support sections
- internal link context
- clarity of audience and use case

This skill should not hallucinate authority or invent citations. It should make the page more precise and more extractable using the information the team can actually support.

## The rewrite principles behind this skill

### 1. Direct beats decorative

Replace soft setup paragraphs with direct answers. If the query is "what is a GEO content optimizer," answer that question fast.

### 2. Specific beats generic

"Improves AI visibility" is fine. "Improves citation readiness by sharpening answer structure, evidence density, and FAQ extraction" is better.

### 3. Structured beats sprawling

AI systems and busy humans both respond better to sections with explicit jobs. Use tables, lists, and FAQ blocks when they clarify the material.

### 4. Evidence beats assertion

Whenever the page makes an important claim, pair it with a named source, workflow example, or observable constraint.

### 5. Reusable beats ornamental

A page with prompts, templates, recipes, and artifacts is more valuable than a page that only says the right buzzwords.

## Prompt library for GEO Content Optimizer

### Prompt 1: section rewrite

\`\`\`
Act as a GEO Content Optimizer.
Rewrite this section so it is easier for AI engines to cite.
Requirements:
- answer-first opening
- more precise language
- stronger entity clarity
- one quotable statement
- one source or evidence suggestion
\`\`\`

### Prompt 2: FAQ upgrade

\`\`\`
Rewrite these FAQ answers for better GEO performance.
Make them:
- 40 to 60 words each
- direct and extractable
- specific about audience or use case
- free of vague filler
\`\`\`

### Prompt 3: quote-generation pass

\`\`\`
From this page, create 7 quote-ready statements.
Each should:
- mention the product or page entity
- be 20 to 35 words
- contain a concrete claim
- avoid hype language
- stand alone as a citation candidate
\`\`\`

### Prompt 4: cluster rewrite handoff

\`\`\`
Optimize this page for GEO without changing its core meaning.
Return:
- rewritten intro
- improved H2 suggestions
- 5 quote-ready statements
- 5 FAQ questions and answers
- internal link suggestions to related skill pages
\`\`\`

## Practical rewrite workflow inside ClawLite

### Step 1: do not start here first

This is important. Use GEO Content Optimizer after diagnosis, not before. If you skip the audit layer, you risk polishing the wrong thing.

### Step 2: rewrite the intro for answer extraction

The first section should clearly define the skill, say who it is for, and explain the practical outcome. That opening block is one of the highest-leverage rewrite targets on the page.

### Step 3: install quotable statements

Every key section should contain at least one sentence that can stand alone as a citation candidate. That means it should be specific, self-contained, and free of context-dependent fluff.

### Step 4: tighten FAQs

Many FAQ sections fail because they answer general curiosity instead of practical decision questions. Good FAQs answer the objections a buyer or operator actually has.

### Step 5: connect the page to the cluster

A rewritten page should not be isolated. Add clear internal links to the pages that logically follow. For this GEO cluster, that usually means diagnosis pages and mechanical audit pages.

## Example before-and-after pattern

### Weak version

> This skill helps make your content better for AI and search engines while improving your ability to get noticed online.

### Stronger version

> The GEO Content Optimizer skill rewrites landing pages so they are easier for AI systems to quote, easier for buyers to scan, and more precise about claims, evidence, and next steps.

Why the second version is better:

- it names the skill
- it explains the mechanism
- it clarifies the outcome
- it avoids fuzzy marketing language

## Reusable rewrite template

\`\`\`
Page URL or draft:
Primary query:
Audience:
Known weaknesses from audit:

Rewrite output needed:
- new intro
- stronger H2 structure
- 5 quote-ready statements
- 5 FAQ Q&A pairs
- 3 evidence placements to add
- 3 internal links to related pages
\`\`\`

This gives teams a fast handoff between audit and execution.

## Example optimizer artifact

\`\`\`
Page: /skills/geo-content-optimizer
Rewrite goals:
- improve answer-first clarity
- create stronger quote candidates
- tighten FAQ structure

Outputs:
1. new intro paragraph with direct definition
2. 5 quote-ready lines for hero, proof, and conclusion sections
3. FAQ answers shortened to 45 to 55 words each
4. evidence reminders added near key claims
5. internal links added to /skills/geo-optimization and /skills/content-quality-auditor
\`\`\`

That is a good artifact because it can be executed or reviewed quickly.

## Internal links that fit naturally here

This page should link to:

- [GEO Optimization](/skills/geo-optimization), because that page identifies the citation-readiness problems first
- [Content Quality Auditor](/skills/content-quality-auditor), because weak quality often causes weak GEO output
- [On-Page SEO Auditor](/skills/on-page-seo-auditor), because page structure problems still need mechanical fixes

That internal linking logic mirrors the actual operating sequence.

## External sources that support better rewrite decisions

When you need external support for rewrite standards, these are useful:

- [Google helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google snippets documentation](https://developers.google.com/search/docs/appearance/snippet)
- [Schema.org FAQPage](https://schema.org/FAQPage)

These sources reinforce that direct answers, structured FAQs, and readable sections are not style preferences. They are machine-readable advantages.

## What this skill is best for

This page is for:

- content teams revising existing landing pages
- GEO operators improving citation readiness after an audit
- founders tightening core product pages before distribution
- agencies that need rewrite-ready outputs instead of abstract strategy notes

It is not the best first tool if you still do not know whether the page has a quality problem or a topic problem. Diagnose first.

## Recommended ClawLite workflow recipe

The cleanest operating loop looks like this:

1. run Content Quality Auditor to assess usefulness and trust
2. run On-Page SEO Auditor to catch structural page issues
3. run GEO Optimization to assess citation readiness
4. run GEO Content Optimizer to execute the rewrite
5. rerun the audits to confirm the page actually improved

That last step matters. A rewrite is not done because it exists. It is done when the page scores better and reads better.

## Rewrite recipes you can copy immediately

Here are three practical recipes that make this skill useful in real operations.

### Recipe 1: stale landing page refresh

Use when a page has traffic but weak engagement or weak AI visibility.

1. keep the topic and URL intact
2. rewrite the first 150 words for a direct answer
3. add 3 quote-ready statements in the body
4. replace generic FAQ questions with buyer objections
5. add 2 internal links to adjacent decision pages

### Recipe 2: comparison-page hardening

Use when a compare page feels broad and noncommittal.

1. open with a direct recommendation for the right audience
2. add a table with 4 to 6 explicit comparison dimensions
3. replace vague adjectives with precise claims
4. add one source-backed proof point per major section
5. install a conclusion that says when to choose each option

### Recipe 3: documentation-to-landing-page conversion

Use when a helpful docs page should also support discovery.

1. identify the main search question the doc already answers
2. tighten headings around that question and its subquestions
3. add FAQ blocks from real user objections
4. create quotable lines that mention the product and use case
5. add links to pricing, setup, and adjacent skills when relevant

These recipes matter because rewrite work often stalls at the blank-page stage. Operators know the page is weak but do not know how to sequence the fix. A good optimizer skill reduces that hesitation. It gives you a repeatable transformation pattern, not just a prettier paragraph.

That is the real leverage: faster rewrites, clearer handoffs, and fewer loops where the team keeps revising copy without improving extractability. It keeps the team moving toward stronger answers instead of prettier filler, stronger buyer clarity, and cleaner citation candidates.

## Final take

The GEO Content Optimizer skill is the execution muscle of the cluster. It takes abstract advice and turns it into sharper intros, cleaner FAQ answers, stronger quotes, and more extractable page sections. For ClawLite teams, that means less hand-wavy GEO talk and more concrete content improvements that help pages earn attention from both people and AI systems.`,
    faqs: [
      {
        question: "What does the GEO Content Optimizer skill do?",
        answer:
          "It rewrites content so it is easier for AI systems to cite, easier for readers to scan, and more precise about answers, evidence, entities, and decision-stage value."
      },
      {
        question: "How is this different from GEO Optimization?",
        answer:
          "GEO Optimization focuses on diagnosis and audit logic. GEO Content Optimizer focuses on execution, meaning section rewrites, quotable statements, FAQ upgrades, and structural copy improvements."
      },
      {
        question: "When should I use GEO Content Optimizer?",
        answer:
          "Use it after an audit has shown weak answer structure, vague language, poor quote quality, or FAQ blocks that need stronger extraction and citation potential."
      },
      {
        question: "What kind of output should I expect?",
        answer:
          "You should expect rewritten intros, improved H2 ideas, quotable statements, upgraded FAQ answers, better evidence placement suggestions, and internal link recommendations tied to the cluster."
      },
      {
        question: "Does this skill replace human editing?",
        answer:
          "No. It speeds up rewrite execution and improves consistency, but a human still needs to validate brand fit, factual accuracy, and whether the final page really says something worth publishing."
      }
    ],
    relatedPages: [
      { label: "GEO Optimization", href: "/skills/geo-optimization" },
      { label: "Content Quality Auditor", href: "/skills/content-quality-auditor" },
      { label: "On-Page SEO Auditor", href: "/skills/on-page-seo-auditor" }
    ],
    primaryKeyword: "geo content optimizer skill",
    secondaryKeywords: ["quote-ready rewrites", "ai citation optimization", "faq rewrite for ai search"]
  }
];

export const skillPageSlugs = skillPages.map((page) => page.slug);

export function getSkillPage(slug: string) {
  return skillPages.find((page) => page.slug === slug);
}
