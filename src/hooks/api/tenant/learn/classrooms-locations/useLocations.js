
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useLocations = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["locations", { page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/taallum/v1/locations",
                    page: page,
                    page_size,
                    search,
                    sort
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Locations Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useLocation = (id) => {
    return useQuery({
        queryKey: ["locations", id],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/taallum/v1/locations/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Location Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}

export const useCreateLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.post("/tenant/taallum/v1/locations", data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Create Location Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Location created successfully");
            queryClient.invalidateQueries(["locations"]);
        },
        onError: (error) => {
            toast.error(`Error creating location: ${error.message}`);
        },
    });
}

export const useUpdateLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.post(`/tenant/taallum/v1/locations/${id}`, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Update Location Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Location updated successfully");
            queryClient.invalidateQueries(["locations"]);
        },
        onError: (error) => {
            toast.error(`Error updating location: ${error.message}`);
        },
    });
}

export const useDeleteLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`/tenant/taallum/v1/locations/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Location Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Location deleted successfully");
            queryClient.invalidateQueries(["locations"]);
        },
        onError: (error) => {
            toast.error(`Error deleting location: ${error.message}`);
        },
    });
}

