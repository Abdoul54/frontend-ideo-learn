import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 5000,
    validateStatus: status => status < 500
});

// Helper function to get API path based on host
const getApiPath = (host) => {
    const centralDomains = process.env.MAIN_DOMAINES.split(',');
    return centralDomains?.includes(host) ? "central" : "tenant";
};

// Helper function to refresh token
async function refreshAccessToken(token, req) {
    try {
        const host = req.headers.get('host');
        const path = getApiPath(host);

        const response = await axiosInstance.post(`/${path}/auth/v1/refresh`, {}, {
            headers: {
                'Authorization': `Bearer ${token.accessToken}`,
                host: host
            }
        });

        if (!response.data?.success) {
            throw new Error('Refresh token failed');
        }

        const newToken = response.data.data;
        const decodedToken = jwtDecode(newToken.access_token);

        return {
            ...token,
            accessToken: newToken.access_token,
            refreshToken: newToken.refresh_token,
            accessTokenExpires: newToken.expires_in,
        };
    } catch (error) {
        console.error('RefreshAccessToken Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        // Return null or an empty token to indicate the refresh failed
        return {
            ...token,
            error: "RefreshAccessTokenError",
            accessToken: null,
            refreshToken: null,
            accessTokenExpires: null,
        };
    }
}


export const authOptions = (req) => {
    return ({
        providers: [
            CredentialsProvider({
                name: "Credentials",
                credentials: {
                    username: { label: 'username', type: 'text' },
                    password: { label: 'password', type: 'password' },
                    issue_refresh_token: { label: 'issue_refresh_token', type: 'boolean' }
                },
                async authorize(credentials, req) {
                    try {
                        const host = req.headers.host;
                        const centralDomains = process.env.MAIN_DOMAINES.split(',');
                        const path = centralDomains?.includes(host) ? "central" : "tenant";

                        const requestConfig = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Host': host
                            }
                        };
                        const issue_refresh_token = credentials.issue_refresh_token === 'true' || credentials.issue_refresh_token === true;

                        const response = await axiosInstance.post(`/${path}/auth/v1/login`, {
                            username: credentials.username,
                            password: credentials.password,
                            issue_refresh_token: issue_refresh_token
                        }, requestConfig);

                        console.log('Authorization Response:', response.data);

                        // Check both the outer success flag AND inner data status
                        if (!response.data?.success || response.data?.data?.status === 'error') {
                            throw new Error(response.data?.data?.message || response.data?.message || 'Sign in failed');
                        }

                        return response.data?.data;

                    } catch (error) {
                        console.error('Authorization Error:', {
                            message: error.message,
                            response: error.response?.data,
                            status: error.response?.status
                        });
                        throw new Error(error.response?.data?.message || error.message || 'Authentication failed');
                    }
                }
            })
        ],
        callbacks: {
            async jwt({ token, user, trigger, session }) {
                if (user) {
                    try {
                        const decodedToken = jwtDecode(user.access_token);

                        token.accessToken = user.access_token;
                        token.refreshToken = user.refresh_token;
                        token.accessTokenExpires = Math.floor(Date.now() / 1000) + user.expires_in;
                        token.user = {
                            id: user.user_id,
                            email: decodedToken.sub,
                            role_id: decodedToken.role_id,
                            role: decodedToken.role_label,
                            level_id: decodedToken.level_id,
                            level: decodedToken.level_label,
                            permissions: decodedToken.permissions,
                        };
                    } catch (error) {
                        console.error('Token processing error:', error);
                        throw new Error('Invalid token received');
                    }
                }

                if (token.accessTokenExpires) {
                    const currentUnixTimestamp = Math.floor(Date.now() / 1000);

                    if (currentUnixTimestamp < token.accessTokenExpires - 30) {
                        return token;
                    }
                }


                const refreshedToken = await refreshAccessToken(token, req);
                if (!refreshedToken.accessToken) {
                    // Clear token and session data on failure
                    console.warn('Token refresh failed, clearing session.');
                    return {
                        ...refreshedToken,
                        error: 'SessionExpired',
                        accessToken: null,
                        refreshToken: null,
                        accessTokenExpires: null,
                        user: null,
                    };
                }

                return refreshedToken;
            },

            async session({ session, token }) {
                if (token) {
                    session.accessToken = token.accessToken;
                    session.accessTokenExpires = token.accessTokenExpires;
                    session.refreshToken = token.refreshToken;
                    session.user = token.user;
                    session.error = token.error;

                    if (token.error === 'SessionExpired') {
                        // Optionally, set a flag or message for the user that their session expired
                        session.errorMessage = "Your session has expired. Please log in again.";
                    }
                }
                return session;
            }
        },
        pages: {
            signIn: '/login',
            error: '/auth/error',
        },
        session: {
            strategy: "jwt",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        },
        secret: process.env.NEXTAUTH_SECRET,
        trustHost: true
    })
}

// Add request interceptor for logging
axiosInstance.interceptors.request.use(request => {
    console.log('Request Config:', {
        method: request.method,
        url: request.url,
        headers: request.headers,
        data: request.data
    });
    return request;
});

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
    response => {
        console.log('Response:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('Response Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return Promise.reject(error);
    }
);

const authHandler = (req, res) => NextAuth(req, res, authOptions(req));
export { authHandler as GET, authHandler as POST };