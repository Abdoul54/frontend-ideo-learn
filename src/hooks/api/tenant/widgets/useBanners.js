import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

// Base URL for banner endpoints
const API_URL = '/tenant/widgets/v1/banners';

/**
 * Custom hook to fetch all banners
 */
export const useBanners = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await axiosInstance.get(API_URL, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      return response.data?.data?.content || [];
    },
    enabled: !!session?.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Custom hook to add a new banner
 */
export const useAddBanner = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ banner, url }) => {
      const formData = new FormData();
      formData.append('banner', banner);
      formData.append('url', url || '#');

      const response = await axiosInstance.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner added successfully');
    },
    onError: (error) => {
      console.error('Error adding banner:', error);
      toast.error(error?.response?.data?.message || 'Failed to add banner');
    }
  });
};

/**
 * Custom hook to update banner ordering or remove banners
 */
export const useUpdateBanners = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (banners) => {
      const response = await axiosInstance.put(API_URL, {
        content: banners
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating banners:', error);
      toast.error(error?.response?.data?.message || 'Failed to update banners');
    }
  });
};

export default {
  useBanners,
  useAddBanner,
  useUpdateBanners
};