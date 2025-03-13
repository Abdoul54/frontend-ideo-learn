import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";

// Simulated API call to fetch SMTP configurations
export const useSSL = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  
  return useQuery({
    queryKey: ["SSL", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      // Simulate an API call
      const url = urlParamsBuilder({
        prefix: "/central/manage/v1/ssl",
        page,
        page_size,
        search,
        sort,
        filters,
      });
      const { data } = await axiosInstance.get(url);
      return data;
    },
  });
};

// Simulated API call to add a new SMTP configuration
export const useAddSSLConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configData) => {
      // Simulate an API call
      const { data } = await axiosInstance.post("/central/manage/v1/ssl", configData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["SSL"] });
    },
  });
};
