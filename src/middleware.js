import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'

const CENTRAL_PAGES = [
    '/custom-domain-management',
    '/dashboard',
    '/email-smtp-configuration',
    '/ssl-management',
    '/tenant-management',
    '/auth' // Added this to include /auth/login and other auth routes
]

const SHARED_PAGES = [
    '/signup',
    '/verify-email',
    '/error',
    '/404',
    '/500',
]

// Pages that need public access but only on tenant domains
const PUBLIC_TENANT_PAGES = [
    '/forgot-password',
    '/reset-password',
    '/register'
]

// First, define a standard middleware function
async function middleware(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const host = request?.headers?.get('host') || ''
    const mainDomains = (process.env.NEXT_PUBLIC_MAIN_DOMAINES?.split(',') || []).filter(Boolean)
    const isCentral = mainDomains.includes(host)
    const currentPath = request.nextUrl.pathname

    // Allow access to shared pages regardless of authentication
    if (SHARED_PAGES.some(page => currentPath.startsWith(page))) {
        return NextResponse.next()
    }

    // Handle root path
    if (currentPath === '/') {
        const redirectPath = isCentral ? '/dashboard' : '/home'
        // Check if the destination exists before redirecting
        return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // Handle login page paths without redirection - show 404 if path doesn't match domain type
    if (isCentral && currentPath === '/login') {
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    if (!isCentral && currentPath === '/auth/login') {
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    // Handle home page paths without redirection - show 404 if path doesn't match domain type
    if (isCentral && currentPath === '/home') {
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    if (!isCentral && currentPath === '/dashboard') {
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    // Allow access to public tenant pages when NOT on central domains
    if (!isCentral && PUBLIC_TENANT_PAGES.some(page => currentPath.startsWith(page))) {
        return NextResponse.next()
    }

    // If the user is unauthenticated and not on the login page, redirect to login
    const loginPath = isCentral ? '/auth/login' : '/login'
    if (!token && !currentPath.startsWith(loginPath)) {
        return NextResponse.redirect(new URL(loginPath, request.url))
    }

    // Prevent redirect loop - Allow access to login if user is unauthenticated
    if (!token && currentPath.startsWith(loginPath)) {
        return NextResponse.next()
    }

    // Central domain restrictions - only allow CENTRAL_PAGES
    if (isCentral && !CENTRAL_PAGES.some(page => currentPath.startsWith(page))) {
        return new NextResponse(null, {
            status: 403,
            statusText: 'Access Denied'
        })
    }

    // Tenant domain restrictions - block access to CENTRAL_PAGES
    if (!isCentral && CENTRAL_PAGES.some(page => currentPath.startsWith(page))) {
        return new NextResponse(null, {
            status: 403,
            statusText: 'Access Denied'
        })
    }

    return NextResponse.next()
}

// Then wrap it with withAuth
export default withAuth(middleware, {
    callbacks: {
        authorized: () => true // Let our custom middleware handle the authorization
    }
})

// More precise matcher that avoids intercepting special App Router paths
export const config = {
    matcher: [
        // Exclude system files and API routes
        '/((?!api|_next/static|_next/image|_next/data|favicon.ico|images|.*\\.svg|docs).*)',
    ]
}