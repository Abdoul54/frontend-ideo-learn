import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

export const usePermissions = ({
    page = null,
    page_size = null,
    search = "",
    sort = [],
    filters = [],
    noPagination,
    area
}) => {
    return useQuery({
        queryKey: ["permissions", { page, page_size, search, sort, filters, noPagination, area }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/hakimuser/v1/permissions",
                    page: page,
                    page_size,
                    search,
                    sort,
                    filters,
                    noPagination,
                    area
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Permissions Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const usePermission = ({ id }) => {
    return useQuery({
        queryKey: ["permission", { id }],
        queryFn: async () => {
            try {

                const response = await axiosInstance.get(`/tenant/hakimuser/v1/permissions/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Permission Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const usePostPermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const url = `/tenant/hakimuser/v1/permissions`;
            const response = await axiosInstance.post(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while adding permission");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("permissions");
            toast.success("Permission added successfully");
        },
        onError: (error) => {
            console.error("Failed to add permission:", error);
            toast.error("Failed to add permission");
        }
    });
}

export const useUpdatePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const url = `/tenant/hakimuser/v1/permissions/${id}`;
            const response = await axiosInstance.put(url, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while updating permission");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("permissions");
            toast.success("Permission updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update permission:", error);
            toast.error("Failed to update permission");
        }
    });
}

export const useBatchDeletePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            console.log(data);

            const response = await axiosInstance.delete("/tenant/hakimuser/v1/permissions/batch", {
                data: data // This passes the data as the request body
            });

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while batch deleting permissions");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("permissions");
            toast.success("Permissions deleted successfully");
        },
        onError: (error) => {
            console.error("Failed to delete permissions:", error);
            toast.error("Failed to delete permissions");
        }
    });
}

export const useAreas = () => {
    return useQuery(
        {
            queryKey: ['areas'],
            queryFn: async () => {
                try {
                    const response = await axiosInstance.get('/tenant/hakimuser/v1/permissions/areas');

                    if (!response.data || !response.data.success) {
                        throw new Error("Invalid response structure");
                    }

                    return response.data?.data;
                } catch (error) {
                    console.error("Areas Fetch Error:", error);
                    throw error;
                }
            },
            staleTime: 5000,
            retry: 2,
        }
    )
}
