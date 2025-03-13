import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export const usePassword = () => {
    return useQuery({
        queryKey: ["passwordSettings"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/advanced-settings/v1/password");
                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Invalid response structure");
                }
                return response.data.data;
            } catch (error) {
                console.error('Password fetch error:', error.message);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};


// post a password

export const usePostPasswordSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/advanced-settings/v1/password", data);
            if (!response.data?.success) {
                throw new Error(response.data?.message || "Invalid response structure");
            }
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["passwordSettings"] });
            toast.success("Password settings added successfully");
        },
        onError: (error) => {
            console.error("Password add error:", error.message);
            toast.error('Failed to add password settings');
        }
    });
}
