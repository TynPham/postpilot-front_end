import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  // Redirect to app mobile with code
  return NextResponse.redirect(`postpilot://connect?tab=X&code=${code}`)
}
