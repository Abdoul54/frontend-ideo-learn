import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export const useLangs = () => {
    return useQuery({
        queryKey: ["langs"],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/central/helpers/v1/languages');
            return data?.data;
        },
    });
};

export const useTimezones = () => {
    return useQuery({
        queryKey: ["timezones"],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/central/helpers/v1/timezones');
            return data?.data;
        },
    });
};

export const useAppDomain = () => {
    return useQuery({
        queryKey: ["app_domain"],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/api/getters/app-domain');
            return data?.appDomain;
        },
    });
}