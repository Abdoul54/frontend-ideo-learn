export const CENTRAL_PAGES = [
    '/custom-domain-management',
    '/dashboard',
    '/email-smtp-configuration',
    '/ssl-management',
    '/tenant-management',
    '/auth',
];

export const SHARED_PAGES = [
    '/signup',
    '/verify-email',
    '/error',
    '/404',
    '/500',
];

export const PUBLIC_TENANT_PAGES = [
    '/forgot-password',
    '/reset-password',
    '/sso',
    '/register',
];

/**
 *
 * @description Check if the path is a central page
 * @param {string} path
 * @returns {boolean}
 */
export const isCentralPage = (path) =>
    CENTRAL_PAGES.some(p => path.startsWith(p));

/**
 * Check if the path is a shared page
 * @param {string} path
 * @returns {boolean}
 */
export const isSharedPage = (path) =>
    SHARED_PAGES.some(p => path.startsWith(p));

/**
 * @description Check if the path is a public tenant page
 * @param {string} path
 * @returns {boolean}
 */
export const isPublicTenantPage = (path) =>
    PUBLIC_TENANT_PAGES.some(p => path.startsWith(p));
