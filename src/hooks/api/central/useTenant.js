import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

// Fetch tenants
export const useTenant = ({
  page = 1,
  page_size = 8,
  search = "",
  sort = [],
  filters = [],
}) => {

  return useQuery({
    queryKey: ["tenants", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      const url = urlParamsBuilder({
        prefix: "/central/manage/v1/tenants",
        page: page - 1,
        page_size,
        search,
        sort,
        filters,
      });
      const { data } = await axiosInstance.get(url);
      return data;
    },
    staleTime: 30000,
  });
};

// Add a new tenant
export const useAddTenant = (handleClose) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantData) => {
      const response = await axiosInstance.post("/central/manage/v1/tenants", tenantData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure while creating tenant");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant added successfully");
      handleClose(); // Move handleClose here
    },
    onError: (error) => {
      console.error("Add Tenant Error:", error.message);
      toast.error("Failed to add tenant");
    }
  })
};

// Delete a tenant
export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId) => {
      const { data } = await axiosInstance.delete(`/central/manage/v1/tenants/${tenantId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};

// Destroy a tenant
export const useDestroyTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId) => {
      const { data } = await axiosInstance.delete(`/central/manage/v1/tenants/${tenantId}/destroy`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};

// Move a tenant up(enabling the tenant)
export const useMoveTenantUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId) => {
      const { data } = await axiosInstance.put(`/central/manage/v1/tenants/${tenantId}/up`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};

// Move a tenant down (disabling the tenant)
export const useMoveTenantDown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenantId) => {
      const { data } = await axiosInstance.put(`/central/manage/v1/tenants/${tenantId}/down`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};
