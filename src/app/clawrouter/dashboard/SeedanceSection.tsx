"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type SeedanceSummary = {
  totalPurchased: number;
  totalRemaining: number;
  totalUsed: number;
  activeKeys: number;
} | null;

export type SeedanceKey = {
  id: string;
  key_name: string;
  key_prefix: string;
  status: string;
  max_uses: number;
  remaining_uses: number;
  model_scope: string[] | null;
  created_at: string;
  last_used_at: string | null;
};

export type SeedanceUsage = {
  id: string;
  model_name: string;
  status: string;
  used_units: number;
  created_at: string;
  external_task_id: string | null;
};

export function SeedanceSection({
  seedanceSummary,
  seedanceKeys,
  seedanceUsage,
  videoTopupState,
  videoOrderId,
  creatingSeedanceKey,
  createdSeedanceKey,
  seedanceActionError,
  revokingSeedanceKey,
  onCreateKey,
  onRevokeKey,
}: {
  seedanceSummary: SeedanceSummary;
  seedanceKeys: SeedanceKey[];
  seedanceUsage: SeedanceUsage[];
  videoTopupState: string | null;
  videoOrderId: string | null;
  creatingSeedanceKey: boolean;
  createdSeedanceKey: string | null;
  seedanceActionError: string | null;
  revokingSeedanceKey: string | null;
  onCreateKey: () => void;
  onRevokeKey: (licenseId: string) => void;
}) {
  return (
    <Card className="rounded-[28px] border border-accent/30 bg-white/90 p-6 shadow-none">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Video / Seedance 2</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">Independent video credits and API keys</h2>
          <p className="mt-2 text-sm text-stone-600">Keep video billing separate from routing credits. 1 credit = 1 second at 720p, text-to-video only, no video input.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-white"><Link href="/clawrouter/dashboard/video/add-credits">Add Video Credits</Link></Button>
      </div>

      {videoTopupState === "success" ? (
        <div className="mt-5 rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-sm font-semibold text-stone-950">Video credits added successfully</p>
          <p className="mt-2 text-sm text-stone-700">Your Seedance credits are ready. Create a video key now to start generating videos.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={onCreateKey} disabled={creatingSeedanceKey || !videoOrderId}>{creatingSeedanceKey ? "Creating key..." : "Create video key"}</Button>
            <Button asChild variant="secondary"><Link href="/clawrouter/dashboard/video/add-credits">Buy more video credits</Link></Button>
          </div>
          {createdSeedanceKey ? (
            <div className="mt-4 rounded-2xl border border-stone-300 bg-white/90 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Your new video key</p>
              <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-800 break-all">{createdSeedanceKey}</div>
            </div>
          ) : null}
          {seedanceActionError ? <p className="mt-3 text-sm text-rose-700">{seedanceActionError}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Video credits</p><p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.totalRemaining : 0}</p><p className="mt-1 text-sm text-stone-500">Remaining video credits</p></Card>
        <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Purchased</p><p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.totalPurchased : 0}</p><p className="mt-1 text-sm text-stone-500">All purchased credits</p></Card>
        <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Used</p><p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.totalUsed : 0}</p><p className="mt-1 text-sm text-stone-500">Credits already consumed</p></Card>
        <Card className="rounded-[22px] border border-stone-200 bg-[rgba(248,244,237,0.7)] p-4 shadow-none"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Active keys</p><p className="mt-2 text-2xl font-semibold text-stone-950">{seedanceSummary ? seedanceSummary.activeKeys : 0}</p><p className="mt-1 text-sm text-stone-500">Seedance resale keys</p></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[24px] border border-stone-300/60 bg-white p-5 shadow-none">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-stone-950">Video API keys</p><p className="mt-1 text-sm text-stone-500">Manage your Seedance 2 resale keys.</p></div></div>
          <div className="mt-4 space-y-3">
            {seedanceKeys.length ? seedanceKeys.map((key) => (
              <div key={key.id} className="rounded-2xl border border-stone-200 bg-[rgba(248,244,237,0.55)] p-4">
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-stone-950">{key.key_name}</p><p className="mt-1 font-mono text-xs text-stone-500">{key.key_prefix}••••••••••••••••</p><p className="mt-2 text-xs text-stone-500">Remaining {key.remaining_uses}/{key.max_uses} · {key.status}</p></div><Button variant="secondary" onClick={() => onRevokeKey(key.id)} disabled={revokingSeedanceKey === key.id || key.status !== "active"}>{revokingSeedanceKey === key.id ? "Revoking..." : "Revoke"}</Button></div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-6 text-sm text-stone-500">No video keys yet.</div>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[24px] border border-stone-300/60 bg-white p-5 shadow-none"><p className="text-sm font-semibold text-stone-950">Quickstart</p><div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs text-stone-700 whitespace-pre-wrap break-all">{`curl -X POST https://clawlite.ai/api/seedance/resale/use-key \\
  -H "Authorization: Bearer <clawrouter_access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "seedanceLicense": "sdc_live_xxx",
    "model": "doubao-seedance-2-0-260128",
    "prompt": "A cinematic neon blue claw mark materializing from particles",
    "ratio": "16:9",
    "resolution": "720p",
    "duration": 5
  }'`}</div></Card>
          <Card className="rounded-[24px] border border-stone-300/60 bg-white p-5 shadow-none"><p className="text-sm font-semibold text-stone-950">Recent video usage</p><div className="mt-4 space-y-3">{seedanceUsage.length ? seedanceUsage.slice(0,5).map((row) => <div key={row.id} className="rounded-2xl border border-stone-200 bg-[rgba(248,244,237,0.55)] p-4"><p className="text-sm font-semibold text-stone-950">{row.model_name || "Seedance task"}</p><p className="mt-1 text-xs text-stone-500">Status: {row.status} · Credits used: {row.used_units}</p><p className="mt-1 text-xs text-stone-400">Task: {row.external_task_id || "pending"}</p></div>) : <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-6 text-sm text-stone-500">No video usage yet.</div>}</div></Card>
        </div>
      </div>
    </Card>
  );
}
