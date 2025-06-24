import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.API_KEY // You should store this in .env

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect specific routes
  if (pathname.startsWith('/api/secure/')) {
    const apiKey = request.headers.get('x-api-key')

    if (apiKey !== API_KEY) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized: Invalid API key' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  return NextResponse.next()
}
