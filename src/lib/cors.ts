import { NextRequest, NextResponse } from 'next/server'

export function corsResponse(request: NextRequest, body?: unknown, status = 200): NextResponse {
  const origin = request.headers.get('origin') || ''
  const response = NextResponse.json(body, { status })
  
  // Allow from any origin for installer app
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
}

export function corsPreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || ''
  const response = new NextResponse(null, { status: 204 })
  
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}
