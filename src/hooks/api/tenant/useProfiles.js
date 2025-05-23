import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

export const useProfiles = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
    filters = [],
}) => {
    return useQuery({
        queryKey: ["profiles", { page, page_size, search, sort, filters }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/hakimuser/v1/profiles",
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
                console.error("Profiles Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useProfile = ({ id }) => {
    return useQuery({
        queryKey: ["profile", { id }],
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

export const usePostProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const url = `/tenant/hakimuser/v1/profiles`;
            const response = await axiosInstance.post(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while adding profile");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("profiles");
            toast.success("Profile added successfully");
        },
        onError: (error) => {
            console.error("Failed to add profile:", error);
            toast.error("Failed to add profile");
        }
    });
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const url = `/tenant/hakimuser/v1/profiles/${id}`;
            const response = await axiosInstance.put(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while updating profile");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("profiles");
            toast.success("Profile updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        }
    });
}

export const useBatchDeleteProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.delete("/tenant/hakimuser/v1/profiles", {
                data: data // This passes the data as the request body
            });

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while batch deleting profiles");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("profiles");
            toast.success("Profiles deleted successfully");
        },
        onError: (error) => {
            console.error("Failed to delete profiles:", error);
            toast.error("Failed to delete profiles");
        }
    });
}


export const useProfilePowerUsers = ({
    id,
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
    filters = [],
}) => {
    return useQuery({
        queryKey: ["profile-power-users", { id, page, page_size, search, sort, filters }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/hakimuser/v1/profiles/${id}/hakimusers`,
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
                console.error("Power Users Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}

export const useAssignPorfilePowerUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const url = `/tenant/hakimuser/v1/powerusers/profiles`;
            const response = await axiosInstance.put(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while assigning power users to profile");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("profiles");
            toast.success("Power users assigned to profile successfully");
        },
        onError: (error) => {
            console.error("Failed to assign power users to profile:", error);
            toast.error("Failed to assign power users to profile");
        }
    });
}

export const useUnassignProfilePowerUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const url = `/tenant/hakimuser/v1/powerusers/profiles`;
            const response = await axiosInstance.delete(url, { data });

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while unassigning power users from profile");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("profiles");
            toast.success("Power users unassigned from profile successfully");
        },
        onError: (error) => {
            console.error("Failed to unassign power users from profile:", error);
            toast.error("Failed to unassign power users from profile");
        }
    });
}

export const useProfileByIds = ({ ids = [] }) => {
    // Filter out any null/undefined/empty IDs
    const validIds = ids?.filter(Boolean) || [];

    const queries = useQueries({
        queries: validIds.map(id => ({
            queryKey: ["profile", { id }],
            queryFn: async () => {
                try {
                    const response = await axiosInstance.get(`/tenant/hakimuser/v1/profiles/${id}`);

                    if (!response.data || !response.data.success) {
                        throw new Error("Invalid response structure");
                    }

                    return response.data?.data;
                } catch (error) {
                    console.error(`Profile Fetch Error for ID ${id}:`, error);
                    throw error;
                }
            },
            staleTime: 5000,
            retry: 2,
            enabled: !!id,
        }))
    });

    // Combine results into a friendly format matching what's used in your component
    const isLoading = queries.some(query => query.isLoading);
    const isError = queries.some(query => query.isError);
    const error = queries.find(query => query.error)?.error;

    // Only return data when all queries are finished and successful
    const data = !isLoading && !isError
        ? queries.map(query => query.data).filter(Boolean)
        : undefined;

    return {
        data,
        isLoading,
        isError,
        error,
        // Include the raw queries in case advanced usage is needed
        queries
    };
};