import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

/**
 * Hook to fetch categories data
 */
export const useCategories = ({
    page = 1,
    page_size = 10,
    search = "",
    sort_attr = "title",
    sort_dir = "asc",
    category_id, // This will now be used as parent_id
    search_type = 1,
}) => {
    return useQuery({
        queryKey: ["categories", { page, page_size, search, sort_attr, sort_dir, category_id, search_type }],
        queryFn: async () => {
            try {
                let url = "/tenant/taallum/v1/categories";

                // Create params with parent_id instead of modifying the URL path
                const params = {
                    prefix: url,
                    page,
                    page_size,
                    search: search || undefined,
                    sort_attr,
                    sort_dir,
                    search_type: search ? search_type : undefined,
                    parent_id: category_id !== undefined ? category_id : undefined
                };
                
                params.with_extra_data = 1;

                const finalUrl = urlParamsBuilder(params);
                const response = await axiosInstance.get(finalUrl);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                // The response now has a consistent format - no need for special mapping
                return response.data;
            } catch (error) {
                console.error("Categories Fetch Error:", error.message);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
        placeholderData: {
            success: true,
            data: {
                items: [],
                pagination: {
                    total: 0,
                    per_page: page_size,
                    current_page: page,
                    last_page: 1,
                    has_more: false
                },
                extra_data: null  // Include extra_data in placeholder
            }
        }
    });
};

/**
 * Hook to add a new category
 */
export const useAddCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post('/tenant/taallum/v1/categories', data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["categories"]);
            toast.success("Category created successfully");
        },
        onError: (error) => {
            console.error("Failed to create category:", error.message);
            toast.error("Failed to create category");
        },
    });
};

/**
 * Hook to update a category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await axiosInstance.put(`/tenant/taallum/v1/categories/${id}`, data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["categories"]);
            toast.success("Category updated successfully!");
        },
        onError: (error) => {
            console.error("Failed to update category:", error.message);
            toast.error("Failed to update category");
        }
    });
};

/**
 * Hook to fetch details of a specific category
*/

export const useCategoryDetails = (categoryId) => {
    return useQuery({
        queryKey: ["category", categoryId],
        queryFn: async () => {
            if (!categoryId) {
                return null;
            }

            try {
                const response = await axiosInstance.get(`/tenant/taallum/v1/categories/${categoryId}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data.data;
            } catch (error) {
                console.error("Category Details Fetch Error:", error.message);
                throw error;
            }
        },
        enabled: !!categoryId, // Only run query if categoryId is provided
        staleTime: 5000,
        retry: 2,
    });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/tenant/taallum/v1/categories/${id}`);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["categories"]);
            toast.success("Category deleted successfully!");
        },
        onError: (error) => {
            console.error("Failed to delete category:", error.message);
            toast.error("Failed to delete category");
        }
    });
};