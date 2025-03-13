// frontend/src/hooks/api/useUpdateSettings.js
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUpdateRegistrationSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settingsData) => {
            const response = await axiosInstance.post("/tenant/advanced-settings/v1/register", settingsData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["registrationSettings"] });
        },
    });
};

export const useRegistrationSettings = () => {
    return useQuery({
        queryKey: ["registrationSettings"],
        queryFn: async () => {
            const response = await axiosInstance.get("/tenant/advanced-settings/v1/register");
            return response.data.data || {};
        },
        staleTime: 60000
    });
};