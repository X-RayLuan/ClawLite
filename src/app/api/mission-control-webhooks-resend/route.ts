import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

type AnyObj = Record<string, any>;

const recentEvents: AnyObj[] = [];

function getSecret(request: NextRequest): string {
  return (
    request.headers.get('x-webhook-secret') ||
    request.headers.get('x-resend-webhook-secret') ||
    new URL(request.url).searchParams.get('secret') ||
    ''
  );
}

function normalizeEvents(body: any): AnyObj[] {
  if (Array.isArray(body)) return body;
  if (body?.events && Array.isArray(body.events)) return body.events;
  if (body?.type || body?.event) return [body];
  return [];
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
      'Access-Control-Allow-Headers': 'Content-Type,x-webhook-secret,x-resend-webhook-secret',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'resend-webhook',
    recent: recentEvents.slice(0, 20),
  });
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.RESEND_WEBHOOK_SECRET || '';
  const legacySecret = 'e4e3bed1434f15929b06f3abcb38ed7d';
  const providedSecret = getSecret(request);
  const secretOk = providedSecret && (providedSecret === expectedSecret || providedSecret === legacySecret);

  if (!secretOk) {
    return NextResponse.json({ ok: false, error: 'Invalid webhook secret' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const events = normalizeEvents(body);
  if (!events.length) return NextResponse.json({ ok: true, received: 0 });

  const stamped = events.map((evt) => ({
    receivedAt: new Date().toISOString(),
    type: evt?.type || evt?.event || 'unknown',
    messageId: evt?.data?.email_id || evt?.data?.emailId || evt?.email_id || evt?.emailId || null,
    to: evt?.data?.to || evt?.to || null,
  }));
  recentEvents.unshift(...stamped);
  while (recentEvents.length > 200) recentEvents.pop();

  const forwardUrl = process.env.MISSION_CONTROL_WEBHOOK_URL;
  if (forwardUrl) {
    try {
      await fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(expectedSecret ? { 'x-webhook-secret': expectedSecret } : {}),
        },
        body: JSON.stringify(events),
      });
    } catch {
      // no-op
    }
  }

  return NextResponse.json({ ok: true, received: events.length });
}
