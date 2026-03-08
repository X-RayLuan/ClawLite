import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function getReleaseLink(os: string) {
  if (os === 'windows') {
    return 'https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite-setup.exe'
  }
  return 'https://github.com/X-RayLuan/ClawLite-Installer/releases/latest/download/clawlite.dmg'
}

export async function POST(request: NextRequest) {
  try {
    const { email, os = 'macos' } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const releaseLink = getReleaseLink(os)

    // If email env is missing, return success with direct link fallback
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      return NextResponse.json({ success: true, sent: false, downloadUrl: releaseLink })
    }

    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: [email],
        subject: 'Your ClawLite Installer Download Link',
        text: `Thanks for trying ClawLite.\n\nDownload your installer here:\n${releaseLink}\n\n- ClawLite Team`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#111827;"><h2>Your ClawLite Installer Link</h2><p>Thanks for trying ClawLite.</p><p><a href="${releaseLink}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;">Download Installer</a></p><p style="font-size:13px;color:#6b7280;">- ClawLite Team</p></div>`
      })
      return NextResponse.json({ success: true, sent: true, id: result.data?.id })
    } catch (mailError: any) {
      console.error('Resend send-installer-link failed:', mailError)
      // Fallback: do not block user, provide direct download URL
      return NextResponse.json({
        success: true,
        sent: false,
        downloadUrl: releaseLink,
        warning: mailError?.message || 'Email send failed'
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to process request' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
