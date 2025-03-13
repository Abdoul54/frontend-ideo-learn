import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export const useLangsTenant = () => {
    return useQuery({
        queryKey: ["langs"],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/tenant/helpers/v1/languages');
            return data?.data;
        },
    });
};

export const useTimezonesTenant = () => {
    return useQuery({
        queryKey: ["timezones"],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/tenant/helpers/v1/timezones');
            return data?.data;
        },
    });
};