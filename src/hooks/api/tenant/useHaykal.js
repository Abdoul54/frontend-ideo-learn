// frontend/src/hooks/api/useHaykal.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

export const useHaykal = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
  haykal_id = null,
  lang = "en",
  search_type = 1,
  flattened = false,
  sort_attr = "name",
  sort_dir = "asc",
}) => {
  // Only include search_type in the queryKey if there's a search
  const searchTypeParam = search ? search_type : undefined;
  
  return useQuery({
    queryKey: ["haykal", { page, page_size, search, sort, filters, haykal_id, lang, search_type: searchTypeParam, flattened, sort_attr, sort_dir }],
    queryFn: async () => {
      const url = urlParamsBuilder({
        prefix: "/tenant/tanzim/v1/haykal",
        page,
        page_size,
        search,
        sort,
        filters,
        haykal_id,
        lang,
        search_type: searchTypeParam,
        flattened,
        sort_attr,
        sort_dir,
      });
      const { data } = await axiosInstance.get(url);
      return data;
    },
    retry: 2,
    keepPreviousData: true,
  });
};

export const useAddHaykal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (haykalData) => {
      const { data } = await axiosInstance.post("/tenant/tanzim/v1/haykal", haykalData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykal"] });
      toast.success("Haykal added successfully");
    },
  });
};

export const useMoveHaykal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ haykalId, newParentId }) => {
      const { data } = await axiosInstance.post(
        `/tenant/tanzim/v1/haykal/${haykalId}/move`,
        { id_new_parent: newParentId }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykal"] });
      queryClient.invalidateQueries({ queryKey: ["haykalUsers"] });
      toast.success("Haykal moved successfully");
    },
  });
};

export const useUpdateHaykal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ haykalId, formData }) => {
      const { data } = await axiosInstance.put(
        `/tenant/tanzim/v1/haykal/${haykalId}`,
        formData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykal"] });
      toast.success("Haykal updated successfully");
    }
  });
};

// Delete Haykal
export const useDeleteHaykal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (haykalId) => {
      const { data } = await axiosInstance.delete(`/tenant/tanzim/v1/haykal/${haykalId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykal"] });
      toast.success("Haykal deleted successfully");
    }
  });
}

//assign user to haykal
export const useAssignUserToHaykal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_org, id_users, use_secondary_identifier = false }) => {
      // Validation before API call
      if (!id_users || id_users === '') {
        throw new Error('User IDs cannot be empty');
      }
      
      const { data } = await axiosInstance.post(
        '/tenant/tanzim/v1/haykal/users/assign',
        { id_org, id_users, use_secondary_identifier }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykal"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success('User assigned to Haykal successfully');
    }
  });
}

// Assign user fields to Haykal
export const useAssignUserFieldsToHaykal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ haykalId, userFields, all = false }) => {
      const { data } = await axiosInstance.post(
        `/tenant/tanzim/v1/haykal/${haykalId}/userfields`,
        { user_fields: userFields, all }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykal"] });
      queryClient.invalidateQueries({ queryKey: ["userfields"] });
      toast.success("User fields assigned to Haykal successfully");
    },
    onError: (error) => {
      console.error("Failed to assign user fields:", error);
    },
  });
};