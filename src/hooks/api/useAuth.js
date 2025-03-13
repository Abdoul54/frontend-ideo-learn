import { axiosInstance } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

export const useAuth = (options) => {
    const signInMutation = useMutation({
        mutationFn: async (credentials) => {
            const response = await signIn('credentials', {
                ...credentials,
                redirect: false,
            });

            if (response?.error) {
                throw new Error(response.error);
            }

            return response;
        },
        onSuccess: options?.onSuccess,
    });

    return {
        signIn: signInMutation.mutate,
        isLoading: signInMutation.isPending,
        error: signInMutation.error,
    };
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/auth/v1/password/reset", data);
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || "Invalid response structure");
            }
            return response?.data?.data;
        },
        onError: (error) => {
            console.error("Password reset error:", error.message);
        }
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/auth/v1/password/forgot", data);
            if (!response.data?.success) {
                throw new Error(response?.data?.message || "Invalid response structure");
            }
            return response?.data?.data;
        },
        onError: (error) => {
            console.error("Password reset failed", error.message);
        }
    });
}

export const useResendVerificationEmail = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/auth/v1/email/resend", data);
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || "Invalid response structure");
            }
            return response?.data?.data;
        },
        onError: (error) => {
            console.error("Verification email failed", error.message);
        }
    });
}

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/auth/v1/register", data);
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || "Invalid response structure");
            }
            return response?.data?.data;
        },
        onError: (error) => {
            console.error("Registration failed", error.message);
        }
    });
}