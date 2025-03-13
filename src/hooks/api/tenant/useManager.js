import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Fetch subordinates
export const useSubordinates = ({
  search_text = "",
  relation_ids = [],
  subordinate_ids = [],
  manager_ids = [],
  manager_type_ids = [],
  manager_type_status = [],
  page = 1,
  page_size = 10,
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: [
      "managers",
      {
        search_text,
        relation_ids,
        subordinate_ids,
        manager_ids,
        manager_type_ids,
        manager_type_status,
        page,
        page_size,
        sort,
        filters,
      },
    ],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix:
            "/tenant/tanzim/v1/managers/subordinates",
          search_text,
          relation_ids,
          subordinate_ids,
          manager_ids,
          manager_type_ids,
          manager_type_status,
          page,
          page_size,
          sort,
          filters,
        });

        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
            throw new Error("Invalid response structure");
            }

        return response.data?.data;
        } catch (error) {
            console.error("Subordinates Fetch Error:", error);
            throw error;
        }
    }
    });
}

// Fetch manager types
export const useManagerTypes = ({
  sort_attr = "id",
  sort_dir = "asc",
  page = 1,
  page_size = 10,
  lang = null,
  active = null,
  get_total_count = 0,
  search_text = null,
  user_id = null,
  entire_tree = false,
  manager_type_id = [],
} = {}) => {
  return useQuery({
    queryKey: [
      "managers",
      {
        sort_attr,
        sort_dir,
        page,
        page_size,
        lang,
        active,
        get_total_count,
        search_text,
        user_id,
        entire_tree,
        manager_type_id,
      },
    ],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix:
            "/tenant/tanzim/v1/managers/types",
          sort_attr,
          sort_dir,
          page,
          page_size,
          lang,
          active,
          get_total_count,
          search_text,
          user_id,
          entire_tree,
          manager_type_id,
        });

        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
            throw new Error("Invalid response structure");
            }

        return response.data?.data;
        } catch (error) {
            console.error("Manager Types Fetch Error:", error);
            throw error;
        }
    }
    });
}

// Create manager typeK
export const useCreateManagerType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/tenant/tanzim/v1/managers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      toast.success('Manager type created successfully');
    }
  });
};

// Update an existing manager type
export const useUpdateManagerType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(`/tenant/tanzim/v1/managers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      toast.success('Manager type updated successfully');
    }
  });
};

// Delete a manager type
export const useDeleteManagerType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ids) => {
      // Handle both single ID and array of IDs
      const manager_type_ids = Array.isArray(ids) ? ids : [ids];
      
      const response = await axiosInstance.delete('/tenant/tanzim/v1/managers', {
        data: { manager_type_ids }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      toast.success('Manager type(s) deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete manager type(s)');
      console.error('Delete error:', error);
    }
  });
};

// Fetch details of a specific manager type
export const useManagerTypeDetails = (id, options = {}) => {
  return useQuery({
    queryKey: ["manager-type-detail", id],
    queryFn: async () => {
      try {
        if (!id) return null;
        
        const response = await axiosInstance.get(`/tenant/tanzim/v1/managers/${id}`);
        
        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }
        
        return response.data?.data;
      } catch (error) {
        console.error("Manager Type Details Fetch Error:", error);
        throw error;
      }
    },
    enabled: !!id && (options.enabled !== false),
  });
};