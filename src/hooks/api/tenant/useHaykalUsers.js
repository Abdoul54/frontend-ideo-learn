// frontend/src/hooks/api/useHaykalUsers.js
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

export const useHaykalUsers = ({
  haykal_id,
  page = 1,
  page_size = 10,
  sort_attr = "username",
  sort_dir = "asc",
}) => {
  return useQuery({
    queryKey: ["haykalUsers", { haykal_id, page, page_size, sort_attr, sort_dir }],
    queryFn: async () => {
      const url = `/tenant/tanzim/v1/haykal/${haykal_id}/users`;
      const params = {
        page,
        page_size,
        sort_attr,
        sort_dir,
      };
      const { data } = await axiosInstance.get(url, { params });
      return data;
    },
    enabled: !!haykal_id,
    retry: 2,
    keepPreviousData: true,
  });
};

export const useBatchRemoveUsersFromHaykal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items) => {
      const { data } = await axiosInstance.delete('/tenant/tanzim/v1/haykal/batch/users/remove', {
        data: { items },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["haykalUsers"] });
      toast.success("Users removed from Haykal successfully");
    },
    onError: (error) => {
      console.error("Failed to remove users from Haykal:", error);
    },
  });
};