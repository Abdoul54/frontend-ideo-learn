import { NextResponse } from 'next/server'
import { isCentralHost, getUserToken, hasTenantAuthParams } from './auth'
import { isCentralPage, isSharedPage, isPublicTenantPage } from './routes'

export async function handler(request) {
    // Get user's session token if available (from NextAuth JWT)
    const token = await getUserToken(request)

    // Determine the host from request headers
    const host = request.headers.get('host') || ''

    // Determine if the current request is from a central domain
    const isCentral = isCentralHost(host)

    // Current request path (e.g. /dashboard, /login, etc.)
    const path = request.nextUrl.pathname

    // Extract search query parameters
    const searchParams = request.nextUrl.searchParams

    // Determine the correct login path based on domain type
    const loginPath = isCentral ? '/auth/login' : '/login'

    // ✅ 1. Allow access if tenant request contains full external auth params (used for SSO)
    if (!isCentral && hasTenantAuthParams(searchParams)) return NextResponse.next()

    // ✅ 2. Allow shared pages without auth (like /signup, /error, etc.)
    if (isSharedPage(path)) return NextResponse.next()

    // 🔀 3. Redirect root (/) to the correct dashboard/home depending on domain type
    if (path === '/') {
        const redirect = isCentral ? '/dashboard' : '/home'
        return NextResponse.redirect(new URL(redirect, request.url))
    }

    // 🔄 4. Redirect central login route (/login) to /auth/login
    if (isCentral && path === '/login')
        return NextResponse.redirect(new URL('/auth/login', request.url))

    // 🔄 5. Redirect tenant login route (/auth/login) to /login
    if (!isCentral && path === '/auth/login')
        return NextResponse.redirect(new URL('/login', request.url))

    // ⛔ 6. Prevent access to /home from central domains (should only exist on tenant side)
    if (isCentral && path === '/home')
        return NextResponse.rewrite(new URL('/404', request.url))

    // ⛔ 7. Prevent access to /dashboard from tenants (central-only route)
    if (!isCentral && path === '/dashboard')
        return NextResponse.rewrite(new URL('/404', request.url))

    // ✅ 8. Allow public tenant-specific pages on tenant domains (e.g. /register)
    if (!isCentral && isPublicTenantPage(path)) return NextResponse.next()

    // 🔐 9. Redirect unauthenticated users to login (if not already there)
    if (!token && !path.startsWith(loginPath))
        return NextResponse.redirect(new URL(loginPath, request.url))

    // 🚫 10. If user is on login page but already authenticated, redirect away to app
    if (path.startsWith(loginPath)) {
        if (!token) return NextResponse.next() // allow access to login
        const redirectPath = isCentral ? '/dashboard' : '/home'
        return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // 🔐 11. Block access to any non-allowed page for central domains
    if (isCentral && !isCentralPage(path))
        return new NextResponse(null, { status: 403, statusText: 'Access Denied' })

    // 🔐 12. Block access to central-only pages for tenant domains
    if (!isCentral && isCentralPage(path))
        return new NextResponse(null, { status: 403, statusText: 'Access Denied' })

    // ✅ 13. Default allow access if nothing blocked it earlier
    return NextResponse.next()
}
