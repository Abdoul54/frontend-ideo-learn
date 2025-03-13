import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export const useAdvancedSettings = (type) => {
    return useQuery({
        queryKey: ["advanced-settings", { type }],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/helpers/v1/advanced-settings${type ? `?type=${type}` : ""}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                
                return response.data?.data;
            } catch (error) {
                console.error("Error occured while getting advanced settings", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};