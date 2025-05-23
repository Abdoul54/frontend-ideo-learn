import { withAuth } from 'next-auth/middleware'
import { handler } from './utils/middleware/handler'

/**
 * Middleware Handler for Domain-Aware Routing and Authentication
 * ---------------------------------------------------------------
 * This middleware handles routing logic and access control for a multi-tenant Next.js app.
 * It supports:
 * - Central domain vs. tenant subdomain distinction
 * - Route-based access restrictions
 * - Token-based authentication using NextAuth
 * - Redirection/rewrites for root and login paths
 * - Public, shared, and protected route handling
 *
 * Request Flow:
 * 1. Determine if request is from a central domain (vs. tenant)
 * 2. Allow:
 *    - Shared pages (`/signup`, `/verify-email`, etc.)
 *    - Public tenant-only pages (like `/register`) if from tenant domain
 *    - Tenant requests with valid SSO auth params
 * 3. Handle special redirects/restrictions:
 *    - `/` → redirects to `/dashboard` or `/home`
 *    - Authenticated users are **not allowed** to access login pages again
 *    - Incompatible routes (e.g., `/dashboard` on tenant domain) get rewritten to 404
 * 4. Auth check:
 *    - Unauthenticated users get redirected to the appropriate login page
 * 5. Domain access rules:
 *    - Central domains can only access central pages
 *    - Tenant domains cannot access central-only pages
 *
 * Dependencies:
 * - `@/utils/middleware/auth.js`: Domain + token utils
 * - `@/utils/middleware/routes.js`: Route path definitions and matchers
 *
 * Assumptions:
 * - `NEXTAUTH_SECRET` and `NEXT_PUBLIC_MAIN_DOMAINES` are correctly configured
 * - Paths like `/auth/login` and `/login` are used appropriately per domain type
 *
 * Maintenance Notes:
 * - Keep `CENTRAL_PAGES`, `SHARED_PAGES`, `PUBLIC_TENANT_PAGES` in `routes.js` synced with route file structure
 * - If you add more login flows, update the loginPath logic
 * - Any new public routes should be categorized properly to avoid over-restricting
 */


export default withAuth(handler, {
    callbacks: {
        authorized: () => true,
    },
})

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|_next/data|favicon.ico|images|.*\\.svg|docs).*)',
    ],
}
