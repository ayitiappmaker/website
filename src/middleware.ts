import { NextRequest, NextResponse } from 'next/server'
import { Configs } from './configs';
import { getUserId } from './utils/request';

const API_KEY = Configs.API_KEY;// You should store this in .env
const BASE_URL  = Configs.WEBSITE_URL;

export async function middleware(request: NextRequest) {
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

    const userId = getUserId(request);
    const res = await fetch(`${BASE_URL}/api/profiles?id=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const profile = await res.json();
    if (!profile) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  return NextResponse.next()
}
