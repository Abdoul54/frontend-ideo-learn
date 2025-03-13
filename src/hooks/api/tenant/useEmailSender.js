import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export const useEmailSender = () => {
    return useQuery({
        queryKey: ["emailSender"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/domains/v1/email-sender");

                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Invalid response structure");
                }

                return response.data.data;
            } catch (error) {
                console.error('Email sender fetch error:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

// Update email sender configuration
export const useUpdateEmailSender = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (emailSenderData) => {
            const { data } = await axiosInstance.post("/tenant/domains/v1/email-sender", emailSenderData);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["emailSender"] });
            toast.success('Email sender configuration updated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update email sender configuration');
        }
    });

    return mutation.mutate;
};


export const useTestEmailSender = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (recipient) => {
            const response = await axiosInstance.post("/tenant/domains/v1/test_email_sender",
                { test_recipient_address: recipient }
            );

            if (!response?.data) {
                throw new Error('No response data received');
            }

            // Check data.status from the response
            if (!response.data.data.status) {
                throw new Error(response.data.data.message || 'Email sender test failed');
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailSender'] });
            toast.success('Email sender test successful');
        },
        onError: (error) => {
            console.error('Email sender test failed:', error);
            toast.error(error?.message || 'Email sender test failed');
        }
    });

    return mutation; // Return the full mutation object instead of just mutate
}
