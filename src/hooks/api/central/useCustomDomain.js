import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";

// Fetch custom domains
export const useCustomDomain = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: ["customDomains", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/central/manage/v1/domains",
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

        return response.data;
      } catch (error) {
        console.error("Custom Domain Fetch Error:", error);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};

// Add a new custom domain
export const useAddCustomDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainData) => {
      const { data } = await axiosInstance.post("/central/manage/v1/domains", domainData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customDomains"] });
    },
  });
};
