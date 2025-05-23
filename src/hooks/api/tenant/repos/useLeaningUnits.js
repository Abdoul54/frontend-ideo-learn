import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useLearningUnits = ({
    page = 1,
    page_size = 10,
    folderId,
    lang,
    search,
    sort = [],
    type,
    exclude_learningunit_ids,
    extra_filters,
    last_updated_from,
    created_from,
    created_to,
    updated_from,
    updated_to,
    get_total_count

}) => {
    return useQuery({
        queryKey: ["learningunits", {
            page,
            page_size,
            search,
            sort,
            folderId,
            lang,
            type,
            exclude_learningunit_ids,
            extra_filters,
            last_updated_from,
            created_from,
            created_to,
            updated_from,
            updated_to,
            get_total_count
        }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/repos/v1/learningunits",
                    page: page,
                    page_size,
                    search,
                    sort,
                    folderId,
                    lang,
                    type,
                    exclude_learningunit_ids,
                    extra_filters,
                    last_updated_from,
                    created_from,
                    created_to,
                    updated_from,
                    updated_to,
                    get_total_count
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

export const useCreateLearningUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.post("/tenant/repos/v1/learningunits", data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Create Learning Unit Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Learning Unit created successfully");
            queryClient.invalidateQueries(["learningunits"]);
        },
        onError: (error) => {
            toast.error(`Error creating learning unit: ${error.message}`);
        },
    });
};

export const useUpdateLearningUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.post(`/tenant/repos/v1/learningunits/${id}`, data);

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
            toast.success("Learning Unit updated successfully");
            queryClient.invalidateQueries(["learningunits"]);
        },
        onError: (error) => {
            toast.error(`Error updating learning unit: ${error.message}`);
        },
    });
};

export const useDeleteLearningUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`/tenant/repos/v1/learningunits/${id}`);

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
            toast.success("Learning Unit deleted successfully");
            queryClient.invalidateQueries(["learningunits"]);
        },
        onError: (error) => {
            toast.error(`Error deleting learning unit: ${error.message}`);
        },
    });
}

export const useAssignLearningUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.post(`/tenant/repos/v1/learningunits/${id}/assign`, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Assign Learning Unit Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Learning Unit assigned successfully");
            queryClient.invalidateQueries(["learningunits"]);
        },
        onError: (error) => {
            toast.error(`Error assigning learning unit: ${error.message}`);
        },
    });
}


// get /tenant/repos/v1/learningunits/{learningunit_id}/versions

export const useLearningUnitVersions = (learningunit_id) => {
    return useQuery({
        queryKey: ["learningunitversions", learningunit_id],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/repos/v1/learningunits/${learningunit_id}/versions`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Learning Unit Versions Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}


// get /tenant/repos/v1/learningunits/{learningunit_id}/scos

export const useLearningUnitScos = ({ learningUnitId, version }) => {
    return useQuery({
        queryKey: ["learningunitscos", { learningUnitId, version }],
        queryFn: async () => {
            try {
                const url = `/tenant/repos/v1/learningunits/${learningUnitId}/scos` + (version ? `?version=${version}` : "");

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Learning Unit Scos Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}

