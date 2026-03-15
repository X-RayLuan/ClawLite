import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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
  recipients: ActivationRecipient[]
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
    const expectedSecret = process.env.JENNY_SEND_ENDPOINT_SECRET
    if (expectedSecret && incomingSecret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as ActivationBatchRequest
    const { campaignId, subject, ctaUrl, dryRun = false, recipients = [] } = body

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

    for (const recipient of recipients) {
      const email = recipient.email?.trim()
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
        const response = await resend!.emails.send({
          from: from!,
          to: [email],
          subject,
          html: renderActivationEmail({ firstName: recipient.firstName, ctaUrl }),
          headers: {
            'X-Campaign-Id': campaignId,
            'X-User-Id': recipient.userId,
          },
        })

        if (response.error) {
          results.push({
            userId: recipient.userId,
            email,
            accepted: false,
            error: response.error.message || 'Resend rejected send',
          })
          continue
        }

        const messageId = response.data?.id
        if (!messageId) {
          results.push({
            userId: recipient.userId,
            email,
            accepted: false,
            error: 'Resend accepted request but returned no message id',
          })
          continue
        }

        results.push({
          userId: recipient.userId,
          email,
          accepted: true,
          messageId,
        })
      } catch (err: any) {
        results.push({
          userId: recipient.userId,
          email,
          accepted: false,
          error: err?.message || 'Unknown send failure',
        })
      }
    }

    const accepted = results.filter((item) => item.accepted).length
    const failed = results.length - accepted

    return NextResponse.json({
      success: true,
      campaignId,
      attempted: results.length,
      accepted,
      failed,
      results,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
