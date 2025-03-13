// frontend/src/hooks/api/useSettingsMetadata.js
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useSettingsMetadata = () => {
    return useQuery({
        queryKey: ["settingsMetadata"],
        queryFn: async () => {
            const response = await axiosInstance.get("/tenant/advanced-settings/v1/groups");
            return response.data.data;
        },
        staleTime: 60000, // Cache for 1 minute
    });
};