import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useSettings } from "@/@core/contexts/settingsContext";

export const useSignInSettings = () => {
    return useQuery({
        queryKey: ["signInSettings"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/brandings/v1/signin");
                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Invalid response structure");
                }
                return response.data.data;
            } catch (error) {
                console.error('Sign-in settings fetch error:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useUpdateSignInSettings = () => {
    const queryClient = useQueryClient();
    const { refreshSettings } = useSettings();
    return useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();
            formData.append('type', data.type);

            switch (data.type) {
                case 'color':
                    // Handle color data
                    if (data.color_data) {
                        formData.append('color_data', data.color_data);
                    }
                    break;

                case 'image':
                    // Handle image upload
                    if (data.bg_data instanceof File) {
                        formData.append('bg_data', data.bg_data);
                    }
                    break;

                case 'video':
                    // Handle video and fallback image
                    if (data.bg_video_data) {
                        if (data.bg_video_data.video instanceof File) {
                            formData.append('bg_video_data[video]', data.bg_video_data.video);
                        }
                        if (data.bg_video_data.fallback_image instanceof File) {
                            formData.append('bg_video_data[fallback_image]', data.bg_video_data.fallback_image);
                        }
                    }
                    break;
            }

            // Log FormData contents for debugging
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await axiosInstance.post("/tenant/brandings/v1/signin", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response?.data) {
                throw new Error('No response data received');
            }
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update sign-in settings');
            }
            refreshSettings();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: 'signInSettings' });
            toast.success('Sign-in settings updated successfully');
        },
        onError: (error) => {
            console.error('Update Failed:', error);
            toast.error('Failed to update sign-in settings');
        }
    });
};