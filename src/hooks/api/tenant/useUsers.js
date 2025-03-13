import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";
import { generateColumns, generateInitialVisibility } from "@/utils/columnsGenerator";
import { customCellRenderers } from "@/constants/Users";

export const useUsers = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: ["users", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tenant/tanzim/v1/users",
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
        console.error("Users Fetch Error:", error.message);
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
    queryKey: ["groups", { page, page_size, search, sort, filters }],
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


export const useUsersColumns = ({ actionColumn = {} }) => {
  return useQuery({
    queryKey: ["usersColumns", { actionColumn }],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/tenant/tanzim/v1/users/importer_fields");

        if (!response?.data || !response?.data?.success) {
          throw new Error("Invalid response structure");
        }

        const initialVisibility = generateInitialVisibility(response?.data?.data);
        const columns = generateColumns(response?.data.data, {
          actionColumn,
          customCellRenderers
        });

        console.log("Columns:", columns);
        
        //setColumns(columns)
        //setColumnVisibility(initialVisibility);
        return {
          columns,
          initialVisibility,
        };
      } catch (error) {
        console.error("Users Columns Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
}


export const useUsersAndColumns = (setColumns, setColumnVisibility, {
  search_text, page, page_size, sort_attr, sort_dir, branch_id, selection_status,
  actionColumn = {},
}) => {
  return useQueries({
    queries: [
      {
        queryKey: ["usersColumns", { actionColumn }],
        queryFn: async () => {
          try {

            const response = await axiosInstance.get("/tenant/tanzim/v1/users/importer_fields");

            if (!response?.data || !response?.data?.success) {
              throw new Error("Invalid response structure");
            }

            const initialVisibility = generateInitialVisibility(response?.data?.data);
            const columns = generateColumns(response?.data.data, {
              actionColumn,
            });
            setColumns(columns)
            setColumnVisibility(initialVisibility);
            return {
              columns,
              initialVisibility,
            };
          } catch (error) {
            console.error("Users Columns Fetch Error:", error.message);
            throw error;
          }
        },
        staleTime: 5000,
      },
      {
        queryKey: ["users", { search_text, page, page_size, sort_attr, sort_dir, branch_id, selection_status }],
        queryFn: async () => {
          try {
            const url = urlParamsBuilder({
              prefix: '/tenant/tanzim/v1/users',
              search: search_text,
              page,
              page_size,
              sort_attr,
              sort_dir,
              branch_id: branch_id,
              selection_status: selection_status
            });

            const response = await axiosInstance.get(url);

            if (!response.data || !response.data.success) {
              throw new Error("Invalid response structure");
            }

            return response.data?.data;
          } catch (error) {
            console.error("Users Fetch Error:", error.message);
            throw error;
          }
        },
        staleTime: 5000,
        retry: 2,
      }
    ]
  })
}
