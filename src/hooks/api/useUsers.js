import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { urlParamsBuilder } from '@/utils/urlParamsBuilder';
import toast from 'react-hot-toast';

export const useGetListUsers = ({
    search_text = '',
    page = 1,
    page_size = 100,
    sort_attr = 'username',
    sort_dir = 'asc',
    branch_id = 1,
    selection_status = 2,
    filters
}) => {
    return useQuery({
        queryKey: ['users', {
            search_text, page, page_size, sort_attr, sort_dir, branch_id, selection_status, filters,
        }],
        queryFn: async () => {
            const url = urlParamsBuilder({
                prefix: '/tenant/tanzim/v1/users',
                search: search_text,
                page,
                page_size,
                sort_attr,
                sort_dir,
                filters,
                branch_id: branch_id, // Explicitly include branch_id
                selection_status: selection_status // Explicitly include selection_status
            });

            console.log('Fetching users with URL:', url);

            const response = await axiosInstance.get(url);

            if (!response.data?.success) {
                throw new Error('Failed to fetch users');
            }

            const data = response.data.data;

            // Add a direct reference to items for backward compatibility
            // This makes the data object both iterable (similar to an array)
            // and also provides access to pagination and other properties
            return Object.assign(data.items, data);
        },
        staleTime: 30000, // 30 seconds refresh interval
        keepPreviousData: true,
    });
};

export const useCreateUser = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData) => {
            const response = await axiosInstance.post('/tenant/tanzim/v1/users', userData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            onSuccess();
            toast.success('User created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    });
};

//update user status
export const useUpdateUserStatus = (onSuccess) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userIds, status }) => {
            const response = await axiosInstance.put('/tenant/tanzim/v1/users/change_status', {
                user_ids: userIds,
                status: status.toString(),
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            if (onSuccess) onSuccess();
            toast.success('User status updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        },
    });
};

//get user info by id
export const useGetUser = (userId) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/tenant/tanzim/v1/users/${userId}`);
            return response.data.data;
        },
        enabled: !!userId,
    });
};

// update user
export const useUpdateUser = (onSuccess) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, userData }) => {
            const response = await axiosInstance.put(`/tenant/tanzim/v1/users/${userId}`, userData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onSuccess();
            toast.success('User updated successfully');
        },
        onError: (error) => {
            console.error(error);
            console.log(error.response);
            toast.error(error.response?.data?.message || 'Failed to update user');
        },
    });
};

export const useAddUsersToBranches = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userIds, branchIds }) => {
            const payload = {
                user_ids: userIds,
                branch_ids: branchIds,
            };
            const response = await axiosInstance.post('/tenant/tanzim/v1/users/add-to-haykal', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            if (onSuccess) onSuccess();
            toast.success('Users added to branches successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to add users to branches');
        },
    });
};

export const useRemoveUsersFromBranches = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userIds, branchIds }) => {
            const payload = {
                user_ids: userIds,
                branch_ids: branchIds,
            };
            const response = await axiosInstance.delete('/tenant/tanzim/v1/users/remove-from-haykal', {
                data: payload, // DELETE requests with a body need the payload in the `data` field
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            if (onSuccess) onSuccess();
            toast.success('Users removed from branches successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to remove users from branches');
        },
    });
};

export const useBatchDeleteUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userIds) => {
            const payload = {
                items: userIds, // Array of user IDs as per the API spec
            };
            const response = await axiosInstance.delete('/tenant/tanzim/v1/users/batch-delete', {
                data: payload, // DELETE requests with a body require the payload in the `data` field
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            toast.success('Users deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete users');
        },
    });
};

export const useMoveUsersToBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userIds, branchId }) => {
            const payload = {
                user_ids: userIds,
                branch_id: branchId,
            };
            const response = await axiosInstance.put('/tenant/tanzim/v1/users/move-to-haykal', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            queryClient.invalidateQueries({ queryKey: ['haykal'] });
            toast.success('Users moved to branch successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to move users to branch');
        },
    });
};


// Updated useMassUpdateUsers hook with better error handling
export const useMassUpdateUsers = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updateData) => {
            // Validate that user_ids is present and not empty
            if (!updateData.user_ids || !Array.isArray(updateData.user_ids) || updateData.user_ids.length === 0) {
                throw new Error('At least one user ID must be provided');
            }

            console.log('Sending mass update request with data:', JSON.stringify(updateData));
            const response = await axiosInstance.put('/tenant/tanzim/v1/users/mass-update', updateData);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['haykalUsers'] });
            if (onSuccess) onSuccess();
            toast.success(data?.message || 'Users updated successfully');
        },
        onError: (error) => {
            let errorMessage = 'Failed to update users';

            // Handle different error scenarios
            if (error.response) {
                // Server responded with an error status
                if (Array.isArray(error.response.data?.message)) {
                    errorMessage = error.response.data.message.join(', ');
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
                console.error('Update API error response:', error.response.data);
            } else if (error.message) {
                // Local validation or network error
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            console.error('Mass update error:', error);
        },
    });
};