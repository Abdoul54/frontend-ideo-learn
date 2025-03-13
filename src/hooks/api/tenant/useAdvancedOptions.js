import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useAdvancedOptions = () => {
    return useQuery({
        queryKey: ["advancedOptions"],
        queryFn: async () => {
            const { data } = await axiosInstance.get("/tenant/advanced-settings/v1/options");
            return data.data;
        },
    });
};

export const useUpdateAdvancedOptions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settingsData) => {
            const { data } = await axiosInstance.post("/tenant/advanced-settings/v1/options", settingsData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advancedOptions"] });
            toast.success('Advanced options updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Update failed');
        },
    });
};