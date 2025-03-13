import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { useBannerStore } from '@/store/useBannerStore';

export const useBanners = () => {
    const setBanners = useBannerStore((state) => state.setBanners);

    return useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/banners');
            setBanners(data); // Sync with Zustand store
            return data;
        },
    });
};

export const useAddBanner = () => {
    const queryClient = useQueryClient();
    const addBanner = useBannerStore((state) => state.addBanner);

    return useMutation({
        mutationFn: async (bannerData) => {
            const { data } = await axiosInstance.post('/banners', bannerData);
            return data;
        },
        onSuccess: (data) => {
            addBanner(data); // Sync with Zustand store
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
    });
};
