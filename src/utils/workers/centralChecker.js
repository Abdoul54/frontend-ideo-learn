// utils/workers/centralChecker.js
export default async function centralChecker() {
    try {
        // Get the host from the window location
        const host = typeof window !== 'undefined' ? window.location.host : '';

        // Safely access the environment variable with fallback
        const mainDomains = process.env.NEXT_PUBLIC_MAIN_DOMAINES?.split(',') || [];

        // Check if the current host is in the list of main domains
        const isCentral = mainDomains.filter(Boolean).includes(host);

        return isCentral;
    } catch (error) {
        console.error('Central check failed:', error);
        // Return a default value if check fails
        return false;
    }
}