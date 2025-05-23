import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Hook to fetch a specific catalog by ID
 * @param {Object} params - Query parameters including catalog ID
 * @returns {Object} Query result containing catalog data
 */
export const useCatalog = (params) => {
    // If params is just an ID string/number, convert to object format
    const queryParams = typeof params === 'object' ? params : { id: params };

    return useQuery({
        queryKey: ['catalog', queryParams.id],
        queryFn: async () => {
            try {
                // Handle specific catalog fetch by ID
                if (queryParams.id) {
                    const response = await axiosInstance.get(`/tenant/taallum/v1/catalogs/${queryParams.id}`);

                    if (!response.data || !response.data.success) {
                        throw new Error(response.data?.message || "Failed to fetch catalog");
                    }

                    return response.data?.data;
                }

                // Handle catalog listing with filters
                const url = urlParamsBuilder({
                    ...queryParams,
                    prefix: '/tenant/taallum/v1/catalogs',
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to fetch catalogs");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalog fetch error:", error);
                throw error;
            }
        },
        enabled: !!queryParams.id,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch catalogs listing with pagination and filtering
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Object} Query result containing catalogs data
 */
export const useCatalogs = (params) => {
    return useQuery({
        queryKey: ['catalogs', params],
        queryFn: async () => {
            const url = urlParamsBuilder({
                ...params,
                prefix: '/tenant/taallum/v1/catalogs',
            });

            try {
                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to fetch catalogs");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalogs fetch error:", error);
                throw error;
            }
        },
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch courses assigned to a catalog
 * @param {Object} params - Query parameters including catalogId
 * @returns {Object} Query result containing assigned courses data
 */
export const useCatalogContents = (params) => {
    const { catalogId, ...queryParams } = params;

    return useQuery({
        queryKey: ['catalog-contents', catalogId, queryParams],
        queryFn: async () => {
            if (!catalogId) {
                throw new Error("Catalog ID is required");
            }

            const url = urlParamsBuilder({
                ...queryParams,
                prefix: `/tenant/taallum/v1/catalogs/${catalogId}/contents`,
            });

            try {
                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to fetch catalog contents");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalog contents fetch error:", error);
                throw error;
            }
        },
        enabled: !!catalogId,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to fetch users assigned to a catalog
 * @param {Object} params - Query parameters including catalogId
 * @returns {Object} Query result containing assigned users data
 */
export const useCatalogUsers = (params) => {
    const { catalogId, ...queryParams } = params;

    return useQuery({
        queryKey: ['catalog-users', catalogId, queryParams],
        queryFn: async () => {
            if (!catalogId) {
                throw new Error("Catalog ID is required");
            }

            const url = urlParamsBuilder({
                ...queryParams,
                prefix: `/tenant/taallum/v1/catalogs/${catalogId}/users`,
            });

            try {
                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to fetch catalog users");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalog users fetch error:", error);
                throw error;
            }
        },
        enabled: !!catalogId,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to create a new catalog
 * @returns {Object} Mutation object for creating catalogs
 */
export const useCreateCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (catalogData) => {
            try {
                const url = '/tenant/taallum/v1/catalogs';
                const response = await axiosInstance.post(url, catalogData);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to create catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalog creation error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate catalogs query to refresh data
            queryClient.invalidateQueries(['catalogs']);
            queryClient.invalidateQueries(['catalog']);
            toast.success("Catalog created successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create catalog");
        }
    });
};

/**
 * Hook to update an existing catalog
 * @returns {Object} Mutation object for updating catalogs
 */
export const useUpdateCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const url = `/tenant/taallum/v1/catalogs/${id}`;
                const response = await axiosInstance.put(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to update catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalog update error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalogs']);
            queryClient.invalidateQueries(['catalog', variables.id]);
            toast.success("Catalog updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update catalog");
        }
    });
};

/**
 * Hook to delete a catalog
 * @returns {Object} Mutation object for deleting catalogs
 */
export const useDeleteCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (catalogId) => {
            try {
                const url = `/tenant/taallum/v1/catalogs/${catalogId}`;
                const response = await axiosInstance.delete(url);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to delete catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Catalog deletion error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate catalogs query to refresh data
            queryClient.invalidateQueries(['catalogs']);
            queryClient.invalidateQueries(['catalog']);
            toast.success("Catalog deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete catalog");
        }
    });
};

/**
 * Hook to assign content (courses/learning plans) to a catalog
 * @returns {Object} Mutation object for assigning content to a catalog
 */
export const useAssignContentsToCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catalogId, contents }) => {
            try {
                if (!catalogId) {
                    throw new Error('Catalog ID is required');
                }

                if (!contents || !Array.isArray(contents) || contents.length === 0) {
                    throw new Error('At least one content item is required');
                }

                const url = `/tenant/taallum/v1/catalogs/${catalogId}/contents`;
                const response = await axiosInstance.post(url, { contents });

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to assign content to catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Content assignment error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalog-contents', variables.catalogId]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to assign content");
        }
    });
};

/**
 * Hook to remove content from a catalog
 * @returns {Object} Mutation object for removing content from a catalog
 */
export const useRemoveContentFromCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catalogId, contentId }) => {
            try {
                const url = `/tenant/taallum/v1/catalogs/${catalogId}/contents/${contentId}`;
                const response = await axiosInstance.delete(url);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to remove content from catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Content removal error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalog-contents', variables.catalogId]);
            toast.success("Content removed from catalog successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to remove content");
        }
    });
};

/**
 * Hook to assign users to a catalog
 * @returns {Object} Mutation object for assigning users to a catalog
 */
export const useAssignUsersToCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catalogId, users_ids, groups_ids, branches_ids }) => {
            try {
                if (!catalogId) {
                    throw new Error('Catalog ID is required');
                }

                // At least one of the arrays must have values
                if ((!users_ids || users_ids.length === 0) &&
                    (!groups_ids || groups_ids.length === 0) &&
                    (!branches_ids || branches_ids.length === 0)) {
                    throw new Error('At least one user, group, or branch must be selected');
                }

                const url = `/tenant/taallum/v1/catalogs/${catalogId}/assign`;

                // Build the payload with only non-empty arrays
                const payload = {};
                if (users_ids && users_ids.length > 0) payload.users_ids = users_ids;
                if (groups_ids && groups_ids.length > 0) payload.groups_ids = groups_ids;
                if (branches_ids && branches_ids.length > 0) payload.branches_ids = branches_ids;

                const response = await axiosInstance.post(url, payload);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to assign users to catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("User assignment error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalog-users', variables.catalogId]);
            toast.success("Users assigned to catalog successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to assign users");
        }
    });
};

/**
 * Hook to unassign users, groups, and branches from a catalog
 * @returns {Object} Mutation object for unassigning from a catalog
 */
export const useUnassignFromCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catalogId, users_ids, groups_ids, branches_ids }) => {
            try {
                if (!catalogId) {
                    throw new Error('Catalog ID is required');
                }

                // At least one of the arrays must have values
                if ((!users_ids || users_ids.length === 0) &&
                    (!groups_ids || groups_ids.length === 0) &&
                    (!branches_ids || branches_ids.length === 0)) {
                    throw new Error('At least one user, group, or branch must be selected');
                }

                const url = `/tenant/taallum/v1/catalogs/${catalogId}/unassign`;

                // Build the payload with only non-empty arrays
                const payload = {};
                if (users_ids && users_ids.length > 0) payload.users_ids = users_ids;
                if (groups_ids && groups_ids.length > 0) payload.groups_ids = groups_ids;
                if (branches_ids && branches_ids.length > 0) payload.branches_ids = branches_ids;

                const response = await axiosInstance.post(url, payload);

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to unassign from catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Unassignment error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalog-users', variables.catalogId]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to unassign from catalog");
        }
    });
};

/**
 * Hook to remove users from a catalog
 * @returns {Object} Mutation object for removing users from a catalog
 */
export const useRemoveUsersFromCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catalogId, userIds }) => {
            try {
                if (!catalogId) {
                    throw new Error('Catalog ID is required');
                }

                if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                    throw new Error('At least one user ID is required');
                }

                const url = `/tenant/taallum/v1/catalogs/${catalogId}/users/remove`;
                const response = await axiosInstance.post(url, { user_ids: userIds });

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to remove users from catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("User removal error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalog-users', variables.catalogId]);
            toast.success("Users removed from catalog successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to remove users");
        }
    });
};

/**
 * Hook to unassign multiple contents from a catalog
 * @returns {Object} Mutation object for unassigning multiple contents from a catalog
 */
export const useUnassignContentsFromCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ catalogId, contentIds }) => {
            try {
                if (!catalogId) {
                    throw new Error('Catalog ID is required');
                }

                if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
                    throw new Error('At least one content ID is required');
                }

                const url = `/tenant/taallum/v1/catalogs/${catalogId}/contents`;
                const response = await axiosInstance.delete(url, {
                    data: { content_ids: contentIds }
                });

                if (!response.data || !response.data.success) {
                    throw new Error(response.data?.message || "Failed to unassign contents from catalog");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Content unassignment error:", error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries(['catalog-contents', variables.catalogId]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to remove contents");
        }
    });
};