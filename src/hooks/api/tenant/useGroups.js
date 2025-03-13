import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

export const useGroups = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: ["groups", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tenant/tanzim/v1/group",
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
        console.error("Groups Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};

export const useGroup = (id) => {
  return useQuery({
    queryKey: ["group", { id }],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/tenant/tanzim/v1/group/${id}`);

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response.data.data;
      } catch (error) {
        console.error("Group Fetch Error:", error.message);
        throw error;
      }
    }
  });
};


export const usePostGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/tenant/tanzim/v1/group', data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"]);
      toast.success("Group created successfully");
    },
    onError: (error) => {
      console.error("Failed to create group:", error.message);
      toast.error("Failed to create group");
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(`/tenant/tanzim/v1/group/${id}`, data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["group"]);
      toast.success("Group updated successfully!");
    },
    onError: (error) => {
      console.error("Failed to update group:", error.message);
      toast.error("Failed to update group");
    }
  })
}


export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await axiosInstance.delete(`/tenant/tanzim/v1/group/${id}`);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["group"]);
      toast.success("Group deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete group:", error.message);
      toast.error("Failed to delete group");
    }
  })
}


export const useUsersGroup = ({
  id,
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: ["users-group", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: `/tenant/tanzim/v1/group/${id}/users`,
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
        console.error("Group's users fetch failed:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};


export const useAddUsersToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(`/tenant/tanzim/v1/group/${id}/users`, data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["group"]);
      toast.success("Users Added to group successfully!");
    },
    onError: (error) => {
      console.error("Failed to add users to group:", error.message);
      toast.error("Failed to add users to group");
    }
  })
}

export const useRemoveUsersFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.delete(`/tenant/tanzim/v1/group/${id}/users`, { data });

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("group");
      toast.success("Users removed from group successfully!");
    },
    onError: (error) => {
      console.error("Failed to remove users from group:", error.message);
      toast.error("Failed to remove users from group");
    }
  })
}


export const useExportGroup = ({ id }) => {
  return useQuery({
    queryKey: ["export-group", { id }],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/tenant/tanzim/v1/group/${id}/export-users`);

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response.data.data;
      } catch (error) {
        console.error("Group export failed:", error.message);
        throw error
      }
    }
  })
}
