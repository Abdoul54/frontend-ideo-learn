import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const usePartners = () => {
    return useQuery({
        queryKey: ["partners"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/partners/v1/partners");

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Partners Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const usePartner = (name) => {
    return useQuery({
        queryKey: ["partner", { id: name }],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/partners/v1/partners/${name}`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data.data;
            } catch (error) {
                console.error("Partner Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};


export const useUpdatePartner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (partner) => {
            const url = `/tenant/partners/v1/partners/${partner?.id}`;
            const response = await axiosInstance.put(url, partner?.data);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while updating partner");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("partners");
            toast.success("Partner updated successfully");

        },
        onError: (error) => {
            console.error("Failed to update partner:", error);
            toast.error("Failed to update partner");
        }
    });
}

export const useActivatePartner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const url = `/tenant/partners/v1/partners/${id}/toggle-active`;
            const response = await axiosInstance.post(url);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while activating partner");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("partners");
            toast.success("Partner activated successfully");
        },
        onError: (error) => {
            console.error("Failed to activate partner:", error);
            toast.error("Failed to activate partner");
        }
    });
}

///tenant/partners/v1/partners/{partner_id}/regenerate-keys

export const useRegeneratePartnerKeys = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const url = `/tenant/partners/v1/partners/${id}/regenerate-keys`;
            const response = await axiosInstance.post(url);

            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure while regenerating partner keys");
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("partners");
            toast.success("Partner keys regenerated successfully");
        },
        onError: (error) => {
            console.error("Failed to regenerate partner keys:", error);
            toast.error("Failed to regenerate partner keys");
        }
    });
}


export const useUserProvisioningFields = () => {
    return useQuery({
        queryKey: ["user-provisioning-fields"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/tanzim/v1/users/importer_fields");

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                // Extract only value and header from each field
                const fields = Object.values(response.data.data).map(item => ({
                    value: item?.value,
                    label: item?.header
                }));

                return fields;
            } catch (error) {
                console.error("User Provisioning Fields Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};