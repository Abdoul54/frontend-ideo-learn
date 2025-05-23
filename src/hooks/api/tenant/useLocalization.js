import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

// Fetch custom domains
export const useLocalization = ({
  page = 1,
  page_size = 10,
  search = "",
  sort = [],
  filters = [],
  with_pagination = true
}) => {
  return useQuery({
    queryKey: ["localization", { page, page_size, search, sort, filters, with_pagination }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tenant/localization/v1/languages",
          page: page,
          page_size,
          search,
          sort,
          filters,
          with_pagination
        });

        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response.data?.data;
      } catch (error) {
        console.error("Custom Domain Fetch Error:", error);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};


// Change Localization status using patch
export const useChangeLocalizationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const url = `/tenant/localization/v1/languages/${id}/toggle-status`;
      const response = await axiosInstance.patch(url);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure while changing localization status");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["localization"]);
      toast.success("Localization status changed successfully");
    },
    onError: (error) => {
      console.error("Change Localization Status Error:", error);
      toast.error("Failed to change localization status");
    },
  });
};

export const useUpdateLocalizationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const url = `/tenant/localization/v1/languages/${id}`;
      const response = await axiosInstance.put(url, data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure while updating localization settings");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["localization"]);
      toast.success("Localization settings updated successfully");
    },
    onError: (error) => {
      console.error("Update Localization Settings Error:", error);
      toast.error("Failed to update localization settings");
    },
  });
};

export const useActiveLanguages = () => {
  return useQuery({
    queryKey: ["active-languages"],
    queryFn: async () => {
      try {
        const url = "/tenant/localization/v1/languages/active";
        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response?.data?.data;
      } catch (error) {
        console.error("Active Languages Fetch Error:", error);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};

// get /tenant/localization/v1/translations

export const useTranslations = (params) => {
  return useQuery({
    queryKey: ["translations", params],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tenant/localization/v1/translations",
          ...params,
        });

        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Invalid response structure");
        }

        return response.data?.data;
      } catch (error) {
        console.error("Translations Fetch Error:", error);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
}


// put /tenant/localization/v1/translations/{id}/locale
export const useUpdateTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const url = `/tenant/localization/v1/translations/${id}/locale`;
      const response = await axiosInstance.put(url, data);

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response structure while updating translation");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["translations"]);
      toast.success("Translation updated successfully");
    },
    onError: (error) => {
      console.error("Update Translation Error:", error);
      toast.error("Failed to update translation");
    },
  });
}
