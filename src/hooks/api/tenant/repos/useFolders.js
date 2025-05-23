import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useFolders = ({
    page = 1,
    page_size = 10,
    folderId,
    lang,
    search,
    search_type,
    sort = [],
}) => {
    return useQuery({
        queryKey: ["folders", { page, page_size, search, sort, folderId, lang, search_type }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/repos/v1/folders",
                    page: page,
                    page_size,
                    search,
                    search_type,
                    sort,
                    folderId,
                    lang
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Folders Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useFolder = (id = null) => {
    return useQuery({
        queryKey: ["folders", id],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/repos/v1/folders/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Folder Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
        enabled: !!id,
    });
}

export const useCreateFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.post("/tenant/repos/v1/folders", data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Create Folder Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Folder created successfully");
            queryClient.invalidateQueries(["folders"]);
        },
        onError: (error) => {
            toast.error(`Error creating folder: ${error.message}`);
        },
    });
};

export const useUpdateFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.put(`/tenant/repos/v1/folders/${id}`, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Update Folder Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Folder updated successfully");
            queryClient.invalidateQueries(["folders"]);
        },
        onError: (error) => {
            toast.error(`Error updating folder: ${error.message}`);
        },
    });
};

export const useDeleteFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`/tenant/repos/v1/folders/${id}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Folder Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Folder deleted successfully");
            queryClient.invalidateQueries(["folders"]);
        },
        onError: (error) => {
            toast.error(`Error deleting folder: ${error.message}`);
        },
    });
}

