// utils/workers/centralChecker.js
export default async function centralChecker() {
    try {
        // Get the host from the window location
        const host = typeof window !== 'undefined' ? window.location.host : '';

        // make a request to http://localhost/api/getters/central-domains
        const response = await fetch('/api/getters/central-domains');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        const mainDomains = data.centralDomains || [];

        // Check if the current host is in the list of main domains
        const isCentral = mainDomains.filter(Boolean).includes(host);

        return isCentral;
    } catch (error) {
        console.error('Central check failed:', error);
        // Return a default value if check fails
        return false;
    }
}