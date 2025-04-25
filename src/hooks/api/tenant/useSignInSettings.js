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
            // Create FormData object instead of sending JSON
            const formData = new FormData();

            // Append the type
            formData.append('type', data.type);

            // Handle color type
            if (data.type === 'color' && data.color_data) {
                formData.append('color_data', data.color_data);
            }

            // Handle image type
            if (data.type === 'image') {
                // Only append bg_data if it's a File object
                if (data.bg_data?.file instanceof File) {
                    formData.append('bg_data', data.bg_data.file);
                } else {
                    // If no file is provided but we're in image mode,
                    // throw an error that will be shown to the user
                    throw new Error('Please select an image file. The existing image cannot be reused without uploading it again.');
                }
            }

            // Handle video type
            if (data.type === 'video' && data.bg_video_data) {
                // Video file - only append if it's a File object
                if (data.bg_video_data.video?.file instanceof File) {
                    formData.append('bg_video_data[video]', data.bg_video_data.video.file);
                } else {
                    throw new Error('Please select a video file. The existing video cannot be reused without uploading it again.');
                }

                // Fallback image - only append if it's a File object
                if (data.bg_video_data.fallback_image?.file instanceof File) {
                    formData.append('bg_video_data[fallback_image]', data.bg_video_data.fallback_image.file);
                } else {
                    throw new Error('Please select a fallback image. The existing image cannot be reused without uploading it again.');
                }
            }

            // Log what we're sending to help debug
            console.log('Sending sign-in form data:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            const response = await axiosInstance.post(
                "/tenant/brandings/v1/signin",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (!response?.data) {
                throw new Error('No response data received');
            }
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update sign-in settings');
            }

            if (refreshSettings) {
                refreshSettings();
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['signInSettings']);
            toast.success('Sign-in settings updated successfully');
        },
        onError: (error) => {
            console.error('Update Failed:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to update sign-in settings');
        },
    });
};