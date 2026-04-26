import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = [
    'https://clawlite.ai',
    'http://localhost:3000',
    'http://localhost:5173',
    // Electron renderer origin patterns
    'file://',
  ]

  // Allow requests from clawlite.ai and localhost dev servers
  const isAllowed =
    origin.includes('clawlite.ai') ||
    origin.includes('localhost') ||
    origin === '' ||
    origin === 'null'

  const response = NextResponse.next()

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : 'https://clawlite.ai')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
