import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check for the "auth" cookie
    const authCookie = request.cookies.get('rfrncs_session')

    // If no cookie and trying to access protected pages, redirect to Login
    if (!authCookie && request.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
