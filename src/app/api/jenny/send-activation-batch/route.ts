import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 60

type ActivationRecipient = {
  userId: string
  email: string
  firstName?: string | null
}

type ActivationBatchRequest = {
  campaignId: string
  subject: string
  ctaUrl: string
  dryRun?: boolean
  mode?: 'probe' | 'batch'
  recipients: ActivationRecipient[]
}

type ProbeState = {
  date: string
  runtime: string
  lastProbeAt?: string | null
  lastProbePassedAt?: string | null
  lastProbeFailedAt?: string | null
  lastProbeRecipientCount?: number
  circuitBreakerState: 'open' | 'closed'
  blocker?: string | null
  copySentToOps?: boolean
  copySentAt?: string | null
}

const SEND_DELAY_MS = 250
const MAX_RATE_LIMIT_RETRIES = 3
const OFFICIAL_JENNY_RUNTIME = 'local-node-direct-resend'
const OFFICIAL_JENNY_SEND_PATH = 'clawlite-api -> resend-node-sdk'
const PROBE_MAX_RECIPIENTS = 3
const PROBE_FRESHNESS_MS = 30 * 60 * 1000
const SHANGHAI_TIME_ZONE = 'Asia/Shanghai'
const DATA_DIR = path.resolve(process.cwd(), '..', 'mission-control', 'data')
const EMAIL_DELIVERY_DIR = path.join(DATA_DIR, 'email-delivery')

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ensureDeliveryDir() {
  fs.mkdirSync(EMAIL_DELIVERY_DIR, { recursive: true })
}

function getShanghaiDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHANGHAI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date)
}

function getProbeStatePath(date = getShanghaiDate()) {
  return path.join(EMAIL_DELIVERY_DIR, `jenny-probe-state-${date}.json`)
}

function readProbeState(date = getShanghaiDate()): ProbeState {
  const fallback: ProbeState = {
    date,
    runtime: OFFICIAL_JENNY_RUNTIME,
    circuitBreakerState: 'closed',
    blocker: null,
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(fs.readFileSync(getProbeStatePath(date), 'utf8')),
      date,
    }
  } catch {
    return fallback
  }
}

function writeProbeState(state: ProbeState) {
  ensureDeliveryDir()
  fs.writeFileSync(getProbeStatePath(state.date), JSON.stringify(state, null, 2))
}

function hasFreshPassedProbe(state: ProbeState) {
  if (!state.lastProbePassedAt || state.circuitBreakerState === 'open') return false
  const ts = new Date(state.lastProbePassedAt).getTime()
  if (Number.isNaN(ts)) return false
  return Date.now() - ts <= PROBE_FRESHNESS_MS
}

function isCircuitBreakerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return /cloudflare\s*1010|http\s*403|403\s*forbidden|browser_signature_banned|path_blocked/i.test(message)
}

function sameDayLaneLocked(date = getShanghaiDate()) {
  try {
    ensureDeliveryDir()
    const files = fs.readdirSync(EMAIL_DELIVERY_DIR)
    return files
      .filter((file) => file.startsWith(`jenny-acceptance-${date}-`) && file.endsWith('.json'))
      .some((file) => {
        try {
          const json = JSON.parse(fs.readFileSync(path.join(EMAIL_DELIVERY_DIR, file), 'utf8'))
          const verdict = String(json.verdict || '').trim()
          const accepted = Number(json.acceptedCount || 0)
          const writebackUpdated = Number(json.writebackUpdatedCount || 0)
          const runtime = String(json?.evidence?.runtime || '').trim()
          return (
            verdict === 'DELIVERED' &&
            accepted > 0 &&
            writebackUpdated >= accepted &&
            runtime === OFFICIAL_JENNY_RUNTIME
          )
        } catch {
          return false
        }
      })
  } catch {
    return false
  }
}

function isRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '')
  return /too many requests|rate limit|429/i.test(message)
}

async function sendWithRetry({
  resend,
  from,
  email,
  subject,
  html,
  campaignId,
  userId,
  copyToOps,
}: {
  resend: Resend
  from: string
  email: string
  subject: string
  html: string
  campaignId: string
  userId: string
  copyToOps: boolean
}) {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await resend.emails.send({
      from,
      to: [email],
      cc: copyToOps ? ['aiagentautomation@gmail.com'] : undefined,
      subject,
      html,
      headers: {
        'X-Campaign-Id': campaignId,
        'X-User-Id': userId,
      },
    })

    if (!response.error && response.data?.id) {
      return { messageId: response.data.id }
    }

    const error = new Error(response.error?.message || 'Resend rejected send')
    lastError = error

    if (!isRateLimitError(error) || attempt === MAX_RATE_LIMIT_RETRIES) {
      break
    }

    await sleep(1000 * (attempt + 1))
  }

  throw lastError || new Error('Unknown send failure')
}

function renderActivationEmail({
  firstName,
  ctaUrl,
}: {
  firstName?: string | null
  ctaUrl: string
}) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;">
      <p>${greeting}</p>
      <p>You already started with ClawLite, but your setup is not finished yet.</p>
      <p>You can complete it in about 3 minutes and get back into your install flow here:</p>
      <p>
        <a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
          Finish Setup
        </a>
      </p>
      <p>If the button above does not work, open this link directly:</p>
      <p><a href="${ctaUrl}">${ctaUrl}</a></p>
      <p style="margin-top:24px;color:#6b7280;">— ClawLite</p>
    </div>
  `
}

export async function POST(req: NextRequest) {
  try {
    const incomingSecret = req.headers.get('x-jenny-secret')
    const expectedSecret = process.env.JENNY_SEND_SECRET || process.env.JENNY_SEND_ENDPOINT_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Missing JENNY_SEND_SECRET' },
        { status: 500 }
      )
    }

    if (incomingSecret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as ActivationBatchRequest
    const { campaignId, subject, ctaUrl, dryRun = false, mode = 'batch', recipients = [] } = body

    if (!campaignId || !subject || !ctaUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing campaignId, subject, or ctaUrl' },
        { status: 400 }
      )
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients required' },
        { status: 400 }
      )
    }

    if (recipients.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Batch size exceeds limit (100)' },
        { status: 400 }
      )
    }

    if (mode === 'probe' && recipients.length > PROBE_MAX_RECIPIENTS) {
      return NextResponse.json(
        { success: false, error: `Probe size exceeds limit (${PROBE_MAX_RECIPIENTS})` },
        { status: 400 }
      )
    }

    const today = getShanghaiDate()
    const probeState = readProbeState(today)
    const laneLocked = sameDayLaneLocked(today)

    if (!dryRun && laneLocked && mode !== 'probe') {
      return NextResponse.json(
        {
          success: false,
          error: 'Jenny lane is locked for today because a same-day delivered batch already exists',
          laneLocked: true,
        },
        { status: 409 }
      )
    }

    if (!dryRun && probeState.circuitBreakerState === 'open' && mode !== 'probe') {
      return NextResponse.json(
        {
          success: false,
          error: probeState.blocker || 'Jenny circuit breaker is open for today',
          circuitBreakerState: probeState.circuitBreakerState,
        },
        { status: 409 }
      )
    }

    if (!dryRun && mode !== 'probe' && !hasFreshPassedProbe(probeState)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fresh Jenny batch requires a passed probe within the last 30 minutes',
          probeRequired: true,
          probeState,
        },
        { status: 409 }
      )
    }

    const from = process.env.RESEND_FROM
    if (!dryRun && (!process.env.RESEND_API_KEY || !from)) {
      return NextResponse.json(
        { success: false, error: 'Missing RESEND_API_KEY or RESEND_FROM' },
        { status: 500 }
      )
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    const results: Array<{
      userId: string
      email: string
      accepted: boolean
      messageId?: string
      error?: string
    }> = []
    let breakerReason: string | null = null
    const nextProbeState: ProbeState = {
      ...probeState,
      date: today,
      runtime: OFFICIAL_JENNY_RUNTIME,
      copySentToOps: Boolean(probeState.copySentToOps),
      copySentAt: probeState.copySentAt || null,
    }

    for (let i = 0; i < recipients.length; i += 1) {
      const recipient = recipients[i]
      const email = recipient.email?.trim()

      const shouldCopyToOps = !dryRun && !nextProbeState.copySentToOps && i === 0

      if (!email) {
        results.push({
          userId: recipient.userId,
          email: recipient.email,
          accepted: false,
          error: 'Missing email',
        })
        continue
      }

      if (dryRun) {
        results.push({
          userId: recipient.userId,
          email,
          accepted: true,
          messageId: 'dry-run',
        })
        continue
      }

      try {
        const { messageId } = await sendWithRetry({
          resend: resend!,
          from: from!,
          email,
          subject,
          html: renderActivationEmail({ firstName: recipient.firstName, ctaUrl }),
          campaignId,
          userId: recipient.userId,
          copyToOps: shouldCopyToOps,
        })

        if (shouldCopyToOps && !nextProbeState.copySentToOps) {
          nextProbeState.copySentToOps = true
          nextProbeState.copySentAt = new Date().toISOString()
        }

        results.push({
          userId: recipient.userId,
          email,
          accepted: true,
          messageId,
        })
      } catch (err: any) {
        const errorMessage = err?.message || 'Unknown send failure'
        results.push({
          userId: recipient.userId,
          email,
          accepted: false,
          error: errorMessage,
        })

        if (!breakerReason && isCircuitBreakerError(errorMessage)) {
          breakerReason = errorMessage
          break
        }
      }

      if (!dryRun) {
        await sleep(SEND_DELAY_MS)
      }
    }

    const accepted = results.filter((item) => item.accepted).length
    const failed = results.length - accepted

    if (!dryRun) {
      if (mode === 'probe') {
        nextProbeState.lastProbeAt = new Date().toISOString()
        nextProbeState.lastProbeRecipientCount = recipients.length
        if (accepted > 0 && !breakerReason) {
          nextProbeState.lastProbePassedAt = new Date().toISOString()
          nextProbeState.circuitBreakerState = 'closed'
          nextProbeState.blocker = null
        } else {
          nextProbeState.lastProbeFailedAt = new Date().toISOString()
          nextProbeState.blocker = breakerReason || 'Probe failed without accepted sends'
        }
      }

      if (breakerReason) {
        nextProbeState.circuitBreakerState = 'open'
        nextProbeState.blocker = breakerReason
      }

      writeProbeState(nextProbeState)
    }

    return NextResponse.json({
      success: true,
      campaignId,
      attempted: results.length,
      accepted,
      failed,
      mode,
      laneLocked,
      runtime: OFFICIAL_JENNY_RUNTIME,
      sendPath: OFFICIAL_JENNY_SEND_PATH,
      circuitBreakerTripped: Boolean(breakerReason),
      breakerReason,
      results,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
