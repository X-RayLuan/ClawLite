import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getInstallerUrl } from '@/lib/installer-links'

function getReleaseLink(os: string) {
  return getInstallerUrl(os)
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
      const macSafetyText =
        os === 'macos'
          ? `\n\nIf macOS blocks ClawLite:\n1) Open Finder and locate ClawLite.app (or drag it to Applications first).\n2) Right-click ClawLite.app -> Open.\n3) In the dialog, click Open again.\n\nIf still blocked:\n- System Settings -> Privacy & Security\n- Find \"ClawLite was blocked...\"\n- Click Open Anyway\n\nTerminal (advanced):\nxattr -dr com.apple.quarantine /Applications/ClawLite.app\nopen /Applications/ClawLite.app`
          : ''

      const macSafetyHtml =
        os === 'macos'
          ? `<div style="margin-top:16px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;"><p style="margin:0 0 8px;font-weight:600;">If macOS blocks ClawLite</p><ol style="margin:0 0 8px 18px;padding:0;"><li>Open Finder and locate <code>ClawLite.app</code> (or drag it to Applications first).</li><li>Right-click <code>ClawLite.app</code> → <strong>Open</strong>.</li><li>In the dialog, click <strong>Open</strong> again.</li></ol><p style="margin:8px 0 4px;">If still blocked:</p><ul style="margin:0 0 8px 18px;padding:0;"><li>System Settings → Privacy & Security</li><li>Find “ClawLite was blocked...”</li><li>Click <strong>Open Anyway</strong></li></ul><p style="margin:8px 0 4px;">Terminal (advanced):</p><pre style="margin:0;padding:8px;border-radius:8px;background:#111827;color:#e5e7eb;overflow:auto;">xattr -dr com.apple.quarantine /Applications/ClawLite.app\nopen /Applications/ClawLite.app</pre></div>`
          : ''

      const resend = new Resend(process.env.RESEND_API_KEY)
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: [email],
        subject: 'Your ClawLite Installer Download Link',
        text: `Thanks for trying ClawLite.\n\nDownload your installer here:\n${releaseLink}${macSafetyText}\n\n- ClawLite Team`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height:1.6; color:#111827;"><h2>Your ClawLite Installer Link</h2><p>Thanks for trying ClawLite.</p><p><a href="${releaseLink}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;">Download Installer</a></p>${macSafetyHtml}<p style="font-size:13px;color:#6b7280; margin-top:12px;">- ClawLite Team</p></div>`
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
