import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export const useUsers = () => {
    return useQuery({
        queryKey: ["usersSettings"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/advanced-settings/v1/users");
                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Invalid response structure");
                }
                return response.data.data;
            } catch (error) {
                console.error('Users fetch error:', error.message);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};


// post a user

export const usePostUserSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post("/tenant/advanced-settings/v1/users", data);
            if (!response.data?.success) {
                throw new Error(response.data?.message || "Invalid response structure");
            }
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usersSettings"] });
            toast.success("User settings added successfully");
        },
        onError: (error) => {
            console.error("User add error:", error.message);
            toast.error('Failed to add user settings');
        }
    });
}
