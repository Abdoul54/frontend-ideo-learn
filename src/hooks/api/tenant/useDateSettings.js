// frontend/src/hooks/api/useDateSettings.js
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDateSettings = () => {
    return useQuery({
        queryKey: ["dateSettings"],
        queryFn: async () => {
            const response = await axiosInstance.get("/tenant/advanced-settings/v1/date");
            return response.data.data || {};
        },
    });
};

export const useUpdateDateSettings = () => {
    return useMutation({
        mutationFn: async (settingsData) => {
            const response = await axiosInstance.post("/tenant/advanced-settings/v1/date", settingsData);
            return response.data;
        },
        onSuccess: () => toast.success('Date settings updated successfully'),
        onError: (error) => toast.error(error.response?.data?.message || 'Update failed'),
    });
};