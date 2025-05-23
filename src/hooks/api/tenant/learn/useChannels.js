
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/*
GET /tenant/taallum/v1/channels
POST /tenant/taallum/v1/channels
GET /tenant/taallum/v1/channels/available-contents
GET /tenant/taallum/v1/channels/{channel_id}
PUT /tenant/taallum/v1/channels/{channel_id}
DELETE /tenant/taallum/v1/channels/{channel_id}
POST /tenant/taallum/v1/channels/{channel_id}/contents
DELETE /tenant/taallum/v1/channels/{channel_id}/contents
GET /tenant/taallum/v1/channels/{channel_id}/contents
*/

export const useChannels = (params) => {
    return useQuery({
        queryKey: ['channels', params],
        queryFn: async () => {
            const url = urlParamsBuilder({
                ...params,
                prefix: '/tenant/taallum/v1/channels',
            });
            const response = await axiosInstance.get(url);
            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }

            return response.data?.data;
        }
    });
}

export const useChannel = (channelId) => {
    return useQuery({
        queryKey: ['channels', channelId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/tenant/taallum/v1/channels/${channelId}`);
            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }
            return response.data?.data;
        }
    });
}

export const useCreateChannel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post('/tenant/taallum/v1/channels', data);
            return response.data?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['channels']);
            toast.success('Channel created successfully');
        },
        onError: () => {
            toast.error('Failed to create channel');
        }
    });
}

export const useDeleteChannel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (channelId) => {
            const response = await axiosInstance.delete(`/tenant/taallum/v1/channels/${channelId}`);
            return response.data?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['channels']);
            toast.success('Channel deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete channel');
        }
    });
}


export const useUpdateChannel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await axiosInstance.put(`/tenant/taallum/v1/channels/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['channels']);
            toast.success('Channel updated successfully');
        },
        onError: () => {
            toast.error('Failed to update channel');
        }
    });
}

export const useChannelContents = ({ channelId, ...params }) => {
    return useQuery({
        queryKey: ['channels', channelId, 'contents', params],
        queryFn: async () => {
            const url = urlParamsBuilder({
                ...params,
                prefix: `/tenant/taallum/v1/channels/${channelId}/contents`,
            });
            const response = await axiosInstance.get(url);
            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }

            return response?.data?.data;
        }
    });
}

export const useAddChannelContents = (channelId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post(`/tenant/taallum/v1/channels/${channelId}/contents`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['channels']);
            toast.success('Channel contents added successfully');
        },
        onError: () => {
            toast.error('Failed to add channel contents');
        }
    });
}

export const useDeleteChannelContents = (channelId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.delete(`/tenant/taallum/v1/channels/${channelId}/contents`, {
                data
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['channels']);
            toast.success('Channel contents deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete channel contents');
        }
    });
}

export const useAvailableContents = (params) => {
    return useQuery({
        queryKey: ['available-contents', params],
        queryFn: async () => {
            const url = urlParamsBuilder({
                ...params,
                prefix: '/tenant/taallum/v1/channels/available-contents',
            });
            const response = await axiosInstance.get(url);
            if (!response.data || !response.data.success) {
                throw new Error("Invalid response structure");
            }

            return response.data?.data;
        }
    });
}
