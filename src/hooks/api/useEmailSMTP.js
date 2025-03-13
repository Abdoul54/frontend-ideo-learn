import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";

// Simulated API call to fetch SMTP configurations
export const useEmailSMTP = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
}) => {
  return useQuery({
    queryKey: ["emailSMTP", { page, page_size, search, sort, filters }],
    queryFn: async () => {
      // Simulate an API call
      const url = urlParamsBuilder({
        prefix: "/email-smtp",
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
export const useAddSMTPConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configData) => {
      // Simulate an API call
      const { data } = await axiosInstance.post("/email-smtp", configData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emailSMTP"] });
    },
  });
};
