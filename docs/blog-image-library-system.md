# ClawLite Blog Image Library System

_Last updated: 2026-03-23_

## Why this exists

ClawLite is now targeting a much higher blog publishing volume.
That means the old pattern is no longer acceptable:
- write articles first
- scramble for screenshots later
- reuse the same 2–3 weak images across multiple posts
- patch gaps with video frame grabs

That workflow breaks at scale.

This system turns blog imagery into a reusable content infrastructure layer.

## Goal

Build a shared image library that can support:
- high-volume SEO blog publishing
- stronger proof in tutorials and comparison posts
- consistent ClawLite brand feel
- faster post production without visual quality collapse

## Brand fit

Every reusable image should strengthen at least one of these ClawLite angles:
- **one-click install**
- **cheaper tokens**
- **BYOK free**
- **lower setup friction**
- **boring reliability**
- **faster path to first useful result**

If an image does not help prove one of those, it should not be in the core library.

---

# 1. Library structure

## Root path

`ClawLite/public/blog/_library/`

This is the canonical reusable asset pool for blog images.

## Folder map

### `01-install/`
Use for:
- installer entry
- download page
- setup path
- installer launch
- OS-specific setup steps

### `02-first-run/`
Use for:
- first successful run
- first working task
- first visible result
- onboarding success state

### `03-pricing/`
Use for:
- BYOK setup
- cheaper token framing
- pricing comparisons
- cost-control visuals

### `04-reliability/`
Use for:
- stable operation
- trustworthy first value
- validation states
- retry reduction / confidence framing

### `05-comparison/`
Use for:
- OpenClaw vs ClawLite
- DIY vs one-click
- pricing comparisons
- setup complexity comparisons

### `06-checklists/`
Use for:
- setup checklist cards
- beginner checklist visuals
- decision-tree cards
- preflight requirement visuals

### `07-proof/`
Use for:
- product proof
- source-backed fact cards
- docs/GitHub/proof panels
- acceptance proof screenshots

### `08-workflows/`
Use for:
- 2–4 step workflow diagrams
- install → first run → useful result
- beginner walkthrough flow assets

### `09-brand-utility/`
Use for:
- safe brand utility graphics
- simple branded dividers
- reusable icon-backed cards
- approved mascot/light brand support assets

### `99-archive/`
Use for:
- retired images
- bad crops
- replaced screenshots
- washed-out or duplicate assets that should not be used in production

Do not delete questionable assets immediately.
Move them to archive so the team can see what failed and avoid repeating it.

---

# 2. Asset types

## Tier A — reusable core assets
These are the highest-value images.
They should be created first.

Examples:
- installer entry screenshot
- first successful run screenshot
- ClawLite pricing / BYOK screenshot
- OpenClaw vs ClawLite comparison card
- setup checklist card
- install-to-value workflow graphic

These assets should be reusable across many posts.

## Tier B — article-support assets
These support a small cluster of articles.

Examples:
- beginner walkthrough images
- OpenClaw pricing explainer visuals
- install method chooser graphic
- tutorial-step screenshots

## Tier C — article-specific assets
These only support one or two posts.

Examples:
- a screenshot tied to one exact tutorial step
- a comparison for a niche keyword
- one-off FAQ support visual

Priority rule:
- build Tier A first
- then Tier B
- only then make Tier C

---

# 3. File naming system

## Rule
Every reusable asset should communicate all 3 things in its filename:
1. category
2. message
3. version or shape only if needed

## Format
`<category>-<message>-<variant>.<ext>`

Examples:
- `install-entry-mac-windows-v1.jpg`
- `first-run-success-summary-v1.jpg`
- `pricing-byok-vs-hosted-v1.jpg`
- `comparison-openclaw-vs-clawlite-v1.jpg`
- `checklist-beginner-setup-v1.jpg`
- `workflow-install-to-first-task-v1.jpg`

## Rules
- lowercase only
- hyphen-separated
- no spaces
- no vague names like `final`, `new`, `draft2`, `frame22`
- use version suffix only when replacement history matters

---

# 4. Metadata sidecar rule

Each reusable asset should have a small adjacent metadata note, either:
- in a central inventory markdown file
- or via a sidecar `.md` entry in the asset folder when needed

Minimum metadata fields:
- file name
- category
- visual message
- best use cases
- article types supported
- source of screenshot / origin
- quality status: approved / provisional / archived

---

# 5. Production quality bar

An image enters the reusable library only if it passes all of these:

## Message quality
- proves a real claim
- useful within 2 seconds
- supports ClawLite positioning

## Visual quality
- not blank
- not washed out
- not transitional
- not tiny-UI
- readable on mobile
- tightly cropped to useful content

## Reusability quality
- can support at least 2 posts, unless intentionally article-specific
- caption can be written clearly
- not over-fitted to one paragraph unless necessary

## Brand quality
- practical, calm, trustworthy
- not generic AI illustration filler
- not hype-first

---

# 6. Minimum asset pack for 12-post/day blog ops

To support a 12-post/day system, the library should maintain at least these core reusable assets.

## Install cluster
- installer entry
- installer launch
- download page
- setup path chooser
- Mac install visual
- Windows install visual

## First-run cluster
- first successful run
- first simple task result
- first tool-backed action
- setup complete state

## Pricing cluster
- BYOK entry
- cheaper token positioning card
- pricing comparison visual
- cost-per-successful-workflow card

## Reliability cluster
- boring reliability card
- setup confidence card
- activation-friction reducer visual
- repeatable workflow proof visual

## Comparison cluster
- OpenClaw direct vs ClawLite
- DIY vs one-click
- cost clarity vs setup complexity
- beginner route chooser

## Checklist cluster
- beginner setup checklist
- preflight checklist
- choose-your-path checklist
- first-run validation checklist

## Proof cluster
- docs + GitHub proof image
- product fact card
- source-backed quote/proof card
- live workflow proof card

## Workflow cluster
- install → connect provider → first result
- install → BYOK → first useful task
- beginner walkthrough 4-step visual

This means the real minimum library target is not 10 images.
It is a structured pool of roughly **30–40 approved reusable assets**.

---

# 7. How articles should use the library

## Default image plan per article
Every production blog post should try to use:
- 1 hero image
- 2 supporting body images
- 1 comparison/checklist/proof image when relevant

That means each article should map to **3–4 image slots**.

## Slot planning rule
Before writing a post, define:
- what claim the hero must prove
- which 2 body sections most need image support
- whether a checklist/comparison/proof card is needed

Do not write the whole article first and improvise imagery afterward.

---

# 8. Capture workflow

## Capture order
1. define image slot and claim
2. search reusable library first
3. only create a new image if no approved reusable asset fits
4. if creating new asset, decide whether it belongs in reusable core library or article-specific folder
5. archive weak or replaced versions immediately

## Screenshot capture rules
- use real product UI when possible
- prefer stable static screenshots over video frame extraction
- if source is video, manually recreate the key frame instead of sampling blindly
- crop immediately after capture
- reject low-signal frames

---

# 9. Separation of reusable library vs article-local assets

## Reusable library
Path:
`public/blog/_library/`

Use for assets that can support multiple posts.

## Article-local assets
Path:
`public/blog/<slug>/`

Use for assets that belong only to one article or one cluster.

## Decision rule
If the image can support 2 or more future posts, move it into `_library/`.
If not, keep it under the article slug.

---

# 10. Maintenance rule

Every time an image is replaced due to poor quality:
- move the old asset to `99-archive/`
- add a one-line note to the backlog or inventory about why it failed

This prevents the team from repeating the same mistakes.

---

# 11. Current operating policy

For ClawLite blog ops:
- image scarcity is now a production bottleneck
- reusable screenshot assets are part of the publishing system, not an optional design extra
- Tony output volume must not outrun screenshot proof quality

If content volume and image volume conflict, do not patch the gap with weak video grabs.
Build or reuse better assets.

---

## ASSET_CHECK
- angle: one-click install / cheaper tokens / lower setup friction / boring reliability
- hook source: /Users/m1/Desktop/obsidianvault/ClawLite/marketing-assets/01-hooks/blog-titles.md
- cta source: /Users/m1/Desktop/obsidianvault/ClawLite/marketing-assets/07-cta/blog-cta.md
- proof/source: /Users/m1/Desktop/obsidianvault/ClawLite/brand-positioning-tony.md and /Users/m1/Desktop/obsidianvault/ClawLite/marketing-assets/03-proof-points/product-facts.md
