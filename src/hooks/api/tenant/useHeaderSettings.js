import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useSettings } from "@/@core/contexts/settingsContext";

export const useHeaderSettings = () => {
    return useQuery({
        queryKey: ["headerSettings"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/brandings/v1/headers");
                if (!response.data?.success) {
                    throw new Error(response.data?.message || "Invalid response structure");
                }
                return response.data.data;
            } catch (error) {
                console.error('Header settings fetch error:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

export const useUpdateHeaderSettings = () => {
    const queryClient = useQueryClient();
    const { refreshSettings } = useSettings();
    return useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();

            // Append text fields
            formData.append('page_title', data.page_title);
            formData.append('header_message[status]', data.header_message.status);
            formData.append('header_message[content]', data.header_message.content || '');

            // Handle logo
            if (data.logo?.file instanceof File) {
                // If a new file was uploaded
                formData.append('logo', data.logo.file);
            } else if (data.logo?.url) {
                // If we have an existing URL and want to keep it
                formData.append('logo_url', data.logo.url);
            }

            // Handle favicon
            if (data.favicon?.file instanceof File) {
                // If a new file was uploaded
                formData.append('favicon', data.favicon.file);
            } else if (data.favicon?.url) {
                // If we have an existing URL and want to keep it
                formData.append('favicon_url', data.favicon.url);
            }

            // Log what we're sending to help debug
            console.log('Sending header form data:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            const response = await axiosInstance.post(
                "/tenant/brandings/v1/headers",
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
                throw new Error(response.data.message || 'Failed to update header settings');
            }
            refreshSettings();
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['headerSettings']);
            toast.success('Header settings updated successfully');
        },
        onError: (error) => {
            console.error('Update Failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update header settings');
        },
    });
};