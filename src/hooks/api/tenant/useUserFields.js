import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

// Fetch custom domains
export const useUserFields = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: ["user-fields", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tenant/tanzim/v1/userfield",
          page: page,
          page_size,
          search,
          sort,
          filters,
        });

        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response.data?.data;
      } catch (error) {
        console.error("Custom Domain Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};

export const useUseAllUserFields = () => {
  return useQuery({
    queryKey: ["all-user-fields"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/tenant/tanzim/v1/userfield/list");

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response.data.data;
      } catch (error) {
        console.error("User Fields Fetch Error:", error.message);
        throw error;
      }
    }
  });
}

export const usePostUserField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/tenant/tanzim/v1/userfield', data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-fields"]);
      toast.success("User field created successfully");
    },
    onError: (error) => {
      console.error("Failed to create user field:", error.message);
      toast.error("Failed to create user field");
    },
  });
};

export const useUpdateUserField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(`/tenant/tanzim/v1/userfield/${id}`, data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-fields"]);
      toast.success("User field updated successfully!");
    },
    onError: (error) => {
      console.error("Failed to update user field:", error.message);
      toast.error("Failed to update user field");
    }
  })
}


export const useDeleteUserField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await axiosInstance.delete(`/tenant/tanzim/v1/userfield/${id}`);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-fields"]);
      toast.success("User field deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete user field:", error.message);
      toast.error("Failed to delete user field");
    }
  })
}