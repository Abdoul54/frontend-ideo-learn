import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export const useDomainManagement = () => {
    return useQuery({
        queryKey: ["domainManagement"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/domains/v1/domain");

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
export const useTestDomain = ({ domain }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.get(`/tenant/domains/v1/test_domain_dns?domain=${domain}`);

            if (!response?.data) {
                throw new Error('No response data received');
            }

            // Check data.status from the response
            if (!response.data.data.status) {
                throw new Error(response.data.data.message || 'Domain test failed');
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: 'domainManagement' });
        },
        onError: (error) => {
            console.error('Domain test failed:', error);
            toast.error('Domain test failed');
        }
    });
};


export const useConfigureDomain = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/domains/v1/domain", data);

            if (!response?.data) {
                throw new Error('No response data received');
            }

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to configure domain');
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: 'domainManagement' });
            toast.success('Domain configured successfully');
        },
        onError: (error) => {
            console.error('Configuration Failed:', error);
            toast.error('Failed to configure domain');
        }
    });
}
