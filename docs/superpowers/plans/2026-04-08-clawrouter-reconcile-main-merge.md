# ClawRouter Reconcile Main Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely move the post-checkout ClawRouter balance reconcile fix from `deploy-stripe` onto `origin/main` without pulling in unrelated local edits, then reduce the operational risk of ad hoc production reset scripts.

**Architecture:** Treat the production fix as a narrow hotfix and integrate it onto a fresh branch cut from `origin/main` via `cherry-pick`, not merge from the current dirty workspace. After the app fix is landed, harden production operations by moving reset tooling into an explicit, reviewable workflow with environment-scoped commands and documented guardrails.

**Tech Stack:** Git, GitHub, Next.js 14, Node `node:test`, Vercel, Postgres/Supabase, local operational scripts in `/tmp/codex-pg`

---

### Task 1: Capture Repo Truth And Isolate The Hotfix

**Files:**
- Modify: `docs/superpowers/plans/2026-04-08-clawrouter-reconcile-main-merge.md`
- Inspect: `src/app/api/clawrouter/account/route.ts`
- Inspect: `src/app/clawrouter/dashboard/page.tsx`
- Inspect: `src/lib/clawrouter-account-reconcile.ts`
- Inspect: `src/lib/clawrouter-account-reconcile.test.js`

- [ ] **Step 1: Verify the hotfix commit is the exact change to integrate**

Run:

```bash
git -C /Users/m1/.openclaw/workspace/ClawLite show --stat --summary 2ddd2b5
git -C /Users/m1/.openclaw/workspace/ClawLite show 2ddd2b5 -- \
  src/app/api/clawrouter/account/route.ts \
  src/app/clawrouter/dashboard/page.tsx \
  src/lib/clawrouter-account-reconcile.ts \
  src/lib/clawrouter-account-reconcile.test.js
```

Expected:
- Commit `2ddd2b5` contains only the reconcile hotfix.
- No unrelated homepage, pricing, or activation edits appear in this diff.

- [ ] **Step 2: Verify current branch topology before touching `main`**

Run:

```bash
git -C /Users/m1/.openclaw/workspace/ClawLite branch -vv
git -C /Users/m1/.openclaw/workspace/ClawLite log --oneline --decorate -n 12 --all
```

Expected:
- `origin/main` remains behind the deployed hotfix.
- `deploy-stripe` contains `2ddd2b5`.
- Local `main` is ignored as an integration source if it is diverged.

- [ ] **Step 3: Create a fresh integration worktree from remote main**

Run:

```bash
git -C /Users/m1/.openclaw/workspace/ClawLite fetch origin
git -C /Users/m1/.openclaw/workspace/ClawLite worktree add /private/tmp/clawlite-main-hotfix origin/main -b hotfix/clawrouter-reconcile-main
```

Expected:
- A clean worktree exists at `/private/tmp/clawlite-main-hotfix`.
- Branch `hotfix/clawrouter-reconcile-main` starts from `origin/main`, not local `main`.

- [ ] **Step 4: Confirm the fresh worktree is clean**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix status --short --branch
```

Expected:
- Output shows a clean branch based on `hotfix/clawrouter-reconcile-main`.

- [ ] **Step 5: Commit checkpoint**

```bash
git -C /Users/m1/.openclaw/workspace/ClawLite rev-parse --short HEAD
git -C /private/tmp/clawlite-main-hotfix rev-parse --short HEAD
```

Expected:
- Original workspace stays on `deploy-stripe`.
- New worktree is isolated for integration.

### Task 2: Apply The Hotfix Onto Remote Main Cleanly

**Files:**
- Modify: `src/app/api/clawrouter/account/route.ts`
- Modify: `src/app/clawrouter/dashboard/page.tsx`
- Create: `src/lib/clawrouter-account-reconcile.ts`
- Create: `src/lib/clawrouter-account-reconcile.test.js`

- [ ] **Step 1: Cherry-pick the hotfix commit onto the clean worktree**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix cherry-pick 2ddd2b5
```

Expected:
- Cherry-pick applies without unrelated files.
- If conflicts appear, they should be limited to the four hotfix files above.

- [ ] **Step 2: Verify the cherry-picked diff is still narrow**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix diff HEAD~1 -- \
  src/app/api/clawrouter/account/route.ts \
  src/app/clawrouter/dashboard/page.tsx \
  src/lib/clawrouter-account-reconcile.ts \
  src/lib/clawrouter-account-reconcile.test.js
git -C /private/tmp/clawlite-main-hotfix status --short
```

Expected:
- Only the intended four files are part of the hotfix.
- No unrelated dirty files appear.

- [ ] **Step 3: Re-read the account route after cherry-pick**

Check that the route still contains this behavior:

```ts
await maybeReconcileClawRouterAccount({
  shouldReconcile: shouldForceClawRouterAccountReconcile(request.nextUrl.searchParams),
  supabase,
  accountId: userId,
  email,
  reconcileTopups: reconcileTopupsFromStripe,
  reconcileInventoryAccess: reconcileInventoryAccessFromStripe,
});
```

Expected:
- Reconcile only runs on `topup=success` or `refreshBilling=1`.
- There is no unconditional Stripe side effect on every account load.

- [ ] **Step 4: Re-read the dashboard trigger after cherry-pick**

Check that the dashboard still contains this behavior:

```ts
const refreshBilling = params?.get("topup") === "success";
await loadDashboardData(accessToken, { refreshBilling });
```

Expected:
- The client explicitly requests one reconcile after successful Stripe return.

- [ ] **Step 5: Commit checkpoint**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix log --oneline -n 3
```

Expected:
- Top commit is `fix(clawrouter): restore post-checkout balance reconcile`.

### Task 3: Verify The Hotfix In Isolation

**Files:**
- Test: `src/lib/clawrouter-account-reconcile.test.js`
- Inspect: `src/app/layout.tsx`

- [ ] **Step 1: Run the regression test**

Run:

```bash
node --test --experimental-strip-types /private/tmp/clawlite-main-hotfix/src/lib/clawrouter-account-reconcile.test.js
```

Expected:
- `3` tests pass.
- No failures or skipped tests.

- [ ] **Step 2: Run a production build in the clean worktree**

Run:

```bash
npm run build
```

Workdir:

```bash
/private/tmp/clawlite-main-hotfix
```

Expected:
- `next build` succeeds.
- If local sandbox font fetch fails, rerun with network access and document that the failure was environmental, not code-related.

- [ ] **Step 3: Record the exact verification output**

Capture:

```bash
git -C /private/tmp/clawlite-main-hotfix rev-parse --short HEAD
```

Expected:
- A specific verified commit SHA exists for the integration branch.

- [ ] **Step 4: Confirm no new unintended file changes were introduced by verification**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix status --short
```

Expected:
- Clean worktree after test/build, or only known generated files that can be excluded before push.

- [ ] **Step 5: Push the integration branch**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix push -u origin hotfix/clawrouter-reconcile-main
```

Expected:
- Remote branch exists and is reviewable without unrelated commits.

### Task 4: Merge To Main And Deploy From The Integrated Branch

**Files:**
- Inspect: `.vercel/project.json`
- Inspect: `vercel.json`

- [ ] **Step 1: Compare integration branch against remote main**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix log --oneline origin/main..HEAD
git -C /private/tmp/clawlite-main-hotfix diff --stat origin/main...HEAD
```

Expected:
- The branch contains only the reconcile hotfix.

- [ ] **Step 2: Merge the branch into `main` using a non-interactive command**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix checkout main
git -C /private/tmp/clawlite-main-hotfix reset --hard origin/main
git -C /private/tmp/clawlite-main-hotfix merge --ff-only hotfix/clawrouter-reconcile-main
git -C /private/tmp/clawlite-main-hotfix push origin main
```

Expected:
- `main` fast-forwards to include the hotfix.
- No merge commit is created.

Note:
- Only do this in the fresh integration worktree, never in the original dirty workspace.

- [ ] **Step 3: Deploy `main` to production**

Run:

```bash
vercel --prod --yes
```

Workdir:

```bash
/private/tmp/clawlite-main-hotfix
```

Expected:
- Production deployment reaches `READY`.
- `clawlite.ai` aliases to the new deployment.

- [ ] **Step 4: Verify production deploy status**

Run:

```bash
vercel ls clawlite
```

Expected:
- The newest production deployment corresponds to the just-pushed `main`.

- [ ] **Step 5: Commit checkpoint**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix rev-parse --short main
```

Expected:
- A final `main` SHA is recorded for rollback/reference.

### Task 5: Remove The Ad Hoc Production Reset Risk

**Files:**
- Create: `scripts/ops/reset-clawrouter-account.mjs`
- Create: `scripts/ops/check-clawrouter-account.mjs`
- Create: `docs/operations/clawrouter-account-reset.md`
- Modify: `package.json`

- [ ] **Step 1: Write the failing operational tests for script argument safety**

Create `scripts/ops/reset-clawrouter-account.test.mjs` with this behavior:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseResetArgs } from './reset-clawrouter-account.mjs';

test('rejects reset without explicit email and confirm flag', () => {
  assert.throws(() => parseResetArgs([]), /email is required/);
  assert.throws(() => parseResetArgs(['--email', 'user@example.com']), /confirm-reset is required/);
});

test('accepts reset only with explicit email and confirm flag', () => {
  assert.deepEqual(
    parseResetArgs(['--email', 'user@example.com', '--confirm-reset']),
    { email: 'user@example.com', confirm: true }
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test /private/tmp/clawlite-main-hotfix/scripts/ops/reset-clawrouter-account.test.mjs
```

Expected:
- Fail because `reset-clawrouter-account.mjs` and `parseResetArgs` do not exist yet.

- [ ] **Step 3: Implement the minimal reset/check scripts inside the repo**

`scripts/ops/reset-clawrouter-account.mjs` should:
- Require `DATABASE_URL`
- Require `--email`
- Require `--confirm-reset`
- Set `credit_balance_usd = 0`
- Revoke active deliveries
- Unassign inventory keys
- Print JSON summary

`scripts/ops/check-clawrouter-account.mjs` should:
- Require `DATABASE_URL`
- Require `--email`
- Print account balance, deliveries, inventory, and recent topups

Add `package.json` scripts:

```json
{
  "scripts": {
    "ops:clawrouter:check": "node scripts/ops/check-clawrouter-account.mjs",
    "ops:clawrouter:reset": "node scripts/ops/reset-clawrouter-account.mjs"
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
node --test /private/tmp/clawlite-main-hotfix/scripts/ops/reset-clawrouter-account.test.mjs
```

Expected:
- Safety tests pass.

- [ ] **Step 5: Commit**

```bash
git -C /private/tmp/clawlite-main-hotfix add scripts/ops/reset-clawrouter-account.mjs scripts/ops/check-clawrouter-account.mjs scripts/ops/reset-clawrouter-account.test.mjs package.json
git -C /private/tmp/clawlite-main-hotfix commit -m "chore(ops): add guarded clawrouter account reset scripts"
```

### Task 6: Document The Production Reset Workflow

**Files:**
- Create: `docs/operations/clawrouter-account-reset.md`

- [ ] **Step 1: Add a short operator runbook**

Include:

```md
# ClawRouter Account Reset

## Preconditions
- Verify the account email
- Verify whether the goal is balance reset only or full delivery reset
- Confirm this is a production action

## Read Current State
`DATABASE_URL=... npm run ops:clawrouter:check -- --email user@example.com`

## Execute Reset
`DATABASE_URL=... npm run ops:clawrouter:reset -- --email user@example.com --confirm-reset`

## Verify Reset
- Balance is `0.00`
- No assigned inventory keys remain
- No active deliveries remain
- Topup history is preserved
```

- [ ] **Step 2: Add an explicit warning section**

Include:
- Do not run scripts from `/tmp`
- Do not reset accounts without email scoping
- Do not mix local test Stripe sessions with production account cleanup without documenting why

- [ ] **Step 3: Verify the docs reflect the actual script names**

Run:

```bash
rg -n "ops:clawrouter:(check|reset)|confirm-reset" /private/tmp/clawlite-main-hotfix/docs/operations/clawrouter-account-reset.md /private/tmp/clawlite-main-hotfix/package.json /private/tmp/clawlite-main-hotfix/scripts/ops
```

Expected:
- Script names and flags match exactly.

- [ ] **Step 4: Commit**

```bash
git -C /private/tmp/clawlite-main-hotfix add docs/operations/clawrouter-account-reset.md
git -C /private/tmp/clawlite-main-hotfix commit -m "docs(ops): document clawrouter account reset workflow"
```

- [ ] **Step 5: Final verification**

Run:

```bash
git -C /private/tmp/clawlite-main-hotfix status --short
node --test /private/tmp/clawlite-main-hotfix/src/lib/clawrouter-account-reconcile.test.js
npm run build
```

Workdir:

```bash
/private/tmp/clawlite-main-hotfix
```

Expected:
- Clean worktree.
- Regression test passes.
- Production build passes.

## Self-Review

**Spec coverage:** This plan covers both requested goals: moving the deployed reconcile fix onto `main` safely, and reducing future operational risk from ad hoc reset scripts.

**Placeholder scan:** No `TODO`, `TBD`, or abstract “handle later” steps remain. Commands, files, and expected outcomes are explicit.

**Type consistency:** The reconcile hotfix uses the existing exported names `maybeReconcileClawRouterAccount` and `shouldForceClawRouterAccountReconcile`. The ops scripts use explicit `ops:clawrouter:check` and `ops:clawrouter:reset` names consistently across code and docs.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-08-clawrouter-reconcile-main-merge.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
