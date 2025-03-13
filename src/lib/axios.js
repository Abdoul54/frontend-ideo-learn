import axios from 'axios';
import { getSession } from 'next-auth/react';

export const axiosInstance = axios.create({
    baseURL: '/'
});

// Add request interceptor for NextAuth session
axiosInstance.interceptors.request.use(
    async (config) => {
        const session = await getSession();

        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }

        // Set Content-Type based on data type
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Extract the most useful error message
        let errorMessage = 'An unexpected error occurred';

        // Handle case where error.response exists
        if (error.response) {
            // Check for error message in different common formats
            if (error.response.data?.message) {
                // Handle both string and array message formats
                if (Array.isArray(error.response.data.message)) {
                    errorMessage = error.response.data.message[0];
                } else {
                    errorMessage = error.response.data.message;
                }
            } else if (error.response.data?.error) {
                errorMessage = error.response.data.error;
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            }

            // Log the detailed error for debugging
            console.log('API Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                errorMessage,
                fullError: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'No response received from server';
            console.log('Network Error:', error.request);
        } else {
            // Error in setting up the request
            errorMessage = error.message || errorMessage;
            console.log('Request Error:', error.message);
        }

        // Create a new error object with the message
        const enhancedError = new Error(errorMessage);

        // Copy all properties from the original error
        Object.assign(enhancedError, error);

        // Override the message property to use our extracted message
        enhancedError.message = errorMessage;

        return Promise.reject(enhancedError);
    }
);
