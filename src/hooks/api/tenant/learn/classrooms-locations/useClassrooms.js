
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useClassrooms = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["classrooms", { page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/taallum/v1/classrooms",
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
                console.error("Classrooms Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useClassroom = (id) => {
    return useQuery({
        queryKey: ["classrooms", id],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/taallum/v1/classrooms/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classroom Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}

export const useCreateClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.post("/tenant/taallum/v1/classrooms", data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classroom Creation Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["classrooms"]);
            toast.success("Classroom created successfully");
        },
        onError: (error) => {
            toast.error(`Error creating classroom: ${error.message}`);
        }
    });
}

export const useUpdateClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.put(`/tenant/taallum/v1/classrooms/${id}`, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classroom Update Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["classrooms"]);
            toast.success("Classroom updated successfully");
        },
        onError: (error) => {
            toast.error(`Error updating classroom: ${error.message}`);
        }
    });
}

export const useDeleteClassroom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`/tenant/taallum/v1/classrooms/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classroom Deletion Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["classrooms"]);
            toast.success("Classroom deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error deleting classroom: ${error.message}`);
        }
    });
}

// POST /tenant/taallum/v1/classrooms/{classroom_id}/assign-location

export const useAssignLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.post(`/tenant/taallum/v1/classrooms/${id}/assign-location`, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classroom Assignment Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["classrooms"]);
            toast.success("Classroom assigned successfully");
        },
        onError: (error) => {
            toast.error(`Error assigning classroom: ${error.message}`);
        }
    });
}


export const useUnassignLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.post(`/tenant/taallum/v1/classrooms/${id}/unassign-location`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classroom Unassignment Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["classrooms"]);
            toast.success("Classroom unassigned successfully");
        },
        onError: (error) => {
            toast.error(`Error unassigning classroom: ${error.message}`);
        }
    });
}
