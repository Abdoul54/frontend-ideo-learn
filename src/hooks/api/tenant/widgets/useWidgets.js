// frontend/src/hooks/api/tenant/widgets/useWidgets.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

// Base URL for banner endpoints
const API_URL = '/tenant/widgets/v1/banners';

// Hook to fetch slider settings
export const useSliders = () => {
    return useQuery({
        queryKey: ["widgets", "sliders"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/tenant/widgets/v1/sliders');
                return response.data.data.content || [];
            } catch (error) {
                console.error('Error fetching slider data:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

// Hook to add a new slider image
export const useAddSlider = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('slider', file);

            const response = await axiosInstance.post('/tenant/widgets/v1/sliders', formData);
            return response.data.data.content;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "sliders"]);
            toast.success("Banner image added successfully");
        },
        onError: (error) => {
            console.error('Error adding slider image:', error);
            toast.error("Failed to add banner image");
        }
    });
};

// Hook to update slider order
export const useUpdateSliders = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sliders) => {
            const response = await axiosInstance.put('/tenant/widgets/v1/sliders', {
                content: sliders
            });
            return response.data.data.content;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "sliders"]);
            toast.success("Banner order updated successfully");
        },
        onError: (error) => {
            console.error('Error updating slider order:', error);
            toast.error("Failed to update banner order");
        }
    });
};

// Hook to fetch welcome section settings
export const useWelcome = () => {
    return useQuery({
        queryKey: ["widgets", "welcome"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/tenant/widgets/v1/welcome');
                return response.data.data || {};
            } catch (error) {
                console.error('Error fetching welcome data:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

// Hook to update welcome section
export const useUpdateWelcome = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post('/tenant/widgets/v1/welcome', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "welcome"]);
            toast.success("Welcome section updated successfully");
        },
        onError: (error) => {
            console.error('Error updating welcome section:', error);
            toast.error("Failed to update welcome section");
        }
    });
};

// Hook to fetch welcome section in default language
export const useWelcomeDefault = () => {
    return useQuery({
        queryKey: ["widgets", "welcome", "default"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/tenant/widgets/v1/welcome/default');
                return response.data.data || {};
            } catch (error) {
                console.error('Error fetching default welcome data:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

// Hook to fetch news
export const useNews = () => {
    return useQuery({
        queryKey: ["widgets", "news"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/tenant/widgets/v1/news');
                return response.data.data.content || [];
            } catch (error) {
                console.error('Error fetching news data:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

// Hook to add news
export const useAddNews = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();

            // Add text fields
            for (const key in data) {
                if (key !== 'image' && key !== 'document') {
                    formData.append(`content[${key}]`, data[key]);
                }
            }

            // Add files if they exist
            if (data.image) {
                formData.append('content[image]', data.image);
            }

            if (data.document) {
                formData.append('content[document]', data.document);
            }

            const response = await axiosInstance.post('/tenant/widgets/v1/news', formData);
            return response.data.data.content;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "news"]);
            toast.success("News added successfully");
        },
        onError: (error) => {
            console.error('Error adding news:', error);
            toast.error("Failed to add news");
        }
    });
};

// Hook to update news order
export const useUpdateNews = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (news) => {
            const response = await axiosInstance.put('/tenant/widgets/v1/news', {
                content: news
            });
            return response.data.data.content;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "news"]);
            toast.success("News updated successfully");
        },
        onError: (error) => {
            console.error('Error updating news:', error);
            toast.error("Failed to update news");
        }
    });
};

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


/**
 * Custom hook to fetch footer data
 */
export const useFooter = () => {
    return useQuery({
        queryKey: ["widgets", "footer"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/tenant/widgets/v1/footer');
                return response.data.data || {};
            } catch (error) {
                console.error('Error fetching footer data:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

/**
 * Custom hook to update footer contact information
 */
export const useUpdateFooterContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contactData) => {
            const formData = new FormData();
            formData.append('contact[title]', contactData.title);
            formData.append('contact[tel]', contactData.tel);
            formData.append('contact[email]', contactData.email);

            const response = await axiosInstance.post('/tenant/widgets/v1/footer', formData);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "footer"]);
            toast.success("Footer contact information updated successfully");
        },
        onError: (error) => {
            console.error('Error updating footer contact:', error);
            toast.error("Failed to update footer contact information");
        }
    });
};

/**
 * Custom hook to update footer links
 */
export const useUpdateFooterLinks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (links) => {
            const formData = new FormData();

            // Add each link to the form data
            links.forEach((link, index) => {
                formData.append(`links[${index}][title]`, link.title);
                formData.append(`links[${index}][url]`, link.url);
                if (link.id) {
                    formData.append(`links[${index}][id]`, link.id);
                }
            });

            const response = await axiosInstance.post('/tenant/widgets/v1/footer', formData);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "footer"]);
            toast.success("Footer links updated successfully");
        },
        onError: (error) => {
            console.error('Error updating footer links:', error);
            toast.error("Failed to update footer links");
        }
    });
};

/**
 * Custom hook to upload footer logo
 */
export const useUploadFooterLogo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (logoFile) => {
            const formData = new FormData();
            formData.append('logo', logoFile);

            const response = await axiosInstance.post('/tenant/widgets/v1/footer', formData);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "footer"]);
            toast.success("Footer logo updated successfully");
        },
        onError: (error) => {
            console.error('Error updating footer logo:', error);
            toast.error("Failed to update footer logo");
        }
    });
};

/**
 * Custom hook to update complete footer in one call
 */
export const useUpdateFooter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contact, links, logo }) => {
            const formData = new FormData();

            // Add contact info
            if (contact) {
                formData.append('contact[title]', contact.title);
                formData.append('contact[tel]', contact.tel);
                formData.append('contact[email]', contact.email);
            }

            // Add links
            if (links && links.length) {
                links.forEach((link, index) => {
                    formData.append(`links[${index}][title]`, link.title);
                    formData.append(`links[${index}][url]`, link.url);
                    if (link.id) {
                        formData.append(`links[${index}][id]`, link.id);
                    }
                });
            }

            // Add logo if it's a File object
            if (logo instanceof File) {
                formData.append('logo', logo);
            }

            const response = await axiosInstance.post('/tenant/widgets/v1/footer', formData);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "footer"]);
            toast.success("Footer updated successfully");
        },
        onError: (error) => {
            console.error('Error updating footer:', error);
            toast.error("Failed to update footer");
        }
    });
};

/**
 * Hook to fetch widget visibility settings
 */
export const useWidgetSettings = () => {
    return useQuery({
        queryKey: ["widgets", "settings"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/tenant/widgets/v1/settings');
                return response.data.data || {};
            } catch (error) {
                console.error('Error fetching widget settings:', error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

/**
 * Hook to update widget visibility settings
 */
export const useUpdateWidgetSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings) => {
            const response = await axiosInstance.put('/tenant/widgets/v1/settings', settings);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["widgets", "settings"]);
            toast.success("Widget visibility settings updated successfully");
        },
        onError: (error) => {
            console.error('Error updating widget settings:', error);
            toast.error("Failed to update widget visibility settings");
        }
    });
};