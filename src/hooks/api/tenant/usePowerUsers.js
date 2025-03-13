import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

export const usePowerUsers = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
    filters = [],
}) => {
    return useQuery({
        queryKey: ["power-users", { page, page_size, search, sort, filters }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/hakimuser/v1/powerusers",
                    page: page,
                    page_size,
                    search,
                    sort,
                    filters,
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Power users Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const usePowerUser = ({ id }) => {
    return useQuery({
        queryKey: ["power-user", { id }],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/hakimuser/v1/profiles/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Profile Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
        enabled: !!id,
    });
};

export const usePostPowerUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const url = `/tenant/hakimuser/v1/powerusers`;
            const response = await axiosInstance.post(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while adding power user");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["power-users"]);
            toast.success("Power user added successfully");
        },
        onError: (error) => {
            console.error("Failed to add power user:", error);
            toast.error("Failed to add power user");
        }
    });
}

export const useUpdatePowerUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const url = `/tenant/hakimuser/v1/powerusers/${id}`;
            const response = await axiosInstance.put(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while updating power user");
            }

            return response.data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["power-users"]);
            toast.success("Power user updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update power user:", error);
            toast.error("Failed to update power user");
        }
    });
}

export const useRemovePowerUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.delete('/tenant/hakimuser/v1/powerusers', {
                data: data
            });

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while removing power user");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["power-users"]);
            toast.success("Power user removed successfully");
        },
        onError: (error) => {
            console.error("Failed to remove power user:", error);
            toast.error("Failed to remove power user");
        }
    });
}


export const useBatchDeletePowerUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.delete("/tenant/hakimuser/v1/powerusers", {
                data: data // This passes the data as the request body
            });

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while batch deleting power users");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["power-users"]);
            toast.success("Power users deleted successfully");
        },
        onError: (error) => {
            console.error("Failed to delete power users:", error);
            toast.error("Failed to delete power users");
        }
    });
}

export const useAssignPowerUserPorfiles = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.put("/tenant/hakimuser/v1/powerusers/profiles", data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while assigning power users to profiles");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["power-users"]);
            toast.success("Power user assigned to profiles successfully");
        },
        onError: (error) => {
            console.error("Failed to assign power user to profiles:", error);
            toast.error("Failed to assign power user to profiles");
        }
    });
}

export const useUnassignPowerUserProfiles = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.delete("/tenant/hakimuser/v1/powerusers/profiles", {
                data: data
            });

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while unassigning power users from profiles");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["power-users"]);
            toast.success("Power user unassigned from profiles successfully");
        },
        onError: (error) => {
            console.error("Failed to unassign power user from profiles:", error);
            toast.error("Failed to unassign power user from profiles");
        }
    });

}