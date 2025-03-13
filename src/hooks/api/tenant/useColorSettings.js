import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useSettings } from "@/@core/contexts/settingsContext";

export const useColorSettings = () => {
    return useQuery({
        queryKey: ["colorSettings"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/brandings/v1/colors");
                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Invalid response structure");
                }
                return response.data.data;
            } catch (error) {
                console.error('Color settings fetch error:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useUpdateColorSettings = () => {
    const queryClient = useQueryClient();
    const { refreshSettings } = useSettings();
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/brandings/v1/colors", data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response?.data) {
                throw new Error('No response data received');
            }
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update color settings');
            }
            refreshSettings();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: 'colorSettings' });
            toast.success('Color settings updated successfully');
        },
        onError: (error) => {
            console.error('Update Failed:', error);
            toast.error('Failed to update color settings');
        }
    });
};