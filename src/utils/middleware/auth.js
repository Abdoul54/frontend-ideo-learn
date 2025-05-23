import { getToken } from 'next-auth/jwt'

/**
 *
 * @description Get the user token from the request
 * @param {Request} request
 * @returns {Promise<string|null>}
 */
export async function getUserToken(request) {
    return getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
}

/**
 * @description Check if the host is a central host
 * @param {string} host
 * @returns {boolean}
 */
export function isCentralHost(host) {
    const domains = process.env.NEXT_PUBLIC_MAIN_DOMAINES?.split(',') || []
    return domains.includes(host)
}

/**
 * @description Check if the path is a central page
 * @param {string} path
 * @returns {boolean}
 */
export function hasTenantAuthParams(searchParams) {
    return (
        searchParams.has('login_user') &&
        searchParams.has('token') &&
        searchParams.has('time') &&
        searchParams.has('api_key') &&
        searchParams.has('external_user_id')
    );
}
