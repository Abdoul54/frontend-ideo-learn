import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { urlParamsBuilder } from '@/utils/urlParamsBuilder';

/**
 * Hook for enrolling users in courses
 * @param {Function} onSuccess - Optional callback function to execute on successful enrollment
 * @returns {Object} Mutation object with mutate function
 */
export const useEnrollUser = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, userId, enrollmentData }) => {
            const response = await axiosInstance.post(
                `/tenant/taallum/v1/enrollments/${courseId}/${userId}`,
                enrollmentData
            );
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Show success toast
            toast.success(`Successfully enrolled user in course`);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries(['course-enrollments', variables.courseId]);

            // If a session was specified, invalidate that query too
            if (variables.enrollmentData.session_id) {
                queryClient.invalidateQueries(['session-enrollments', variables.enrollmentData.session_id]);
            }

            // Execute callback if provided
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            console.error('Enrollment error:', error);

            // Extract error message from response if available
            const errorMessage = error.response?.data?.message || 'Failed to enroll user. Please try again.';

            // Show error toast
            toast.error(errorMessage);
        }
    });
};

/**
 * Hook for fetching course enrollments
 * @param {Object} params - Query parameters
 * @returns {Object} Query result with enrollments data
 */
export const useCourseEnrollments = (courseId, params = {}) => {
    return useQuery({
        queryKey: ['course-enrollments', courseId, params],
        queryFn: async () => {
            const response = await axiosInstance.get(`/tenant/taallum/v1/enrollments/${courseId}`, { params });
            return response.data;
        },
        enabled: !!courseId
    });
};

// /**
//  * Hook for fetching session enrollments
//  * @param {number} sessionId - Session ID
//  * @param {Object} params - Query parameters
//  * @returns {Object} Query result with enrollments data
//  */
// export const useSessionEnrollments = (sessionId, params = {}) => {
//     return useQuery({
//         queryKey: ['session-enrollments', sessionId, params],
//         queryFn: async () => {
//             const response = await axiosInstance.get(`/tenant/taallum/v1/sessions/${sessionId}/enrollments`, { params });
//             return response.data;
//         },
//         enabled: !!sessionId
//     });
// };

/**
 * Hook for removing a user enrollment
 * @param {Function} onSuccess - Optional callback function to execute on successful removal
 * @returns {Object} Mutation object with mutate function
 */
export const useRemoveEnrollment = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, userId }) => {
            const response = await axiosInstance.delete(`/tenant/taallum/v1/enrollments/${courseId}/${userId}`);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Show success toast
            toast.success(`Successfully removed enrollment`);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries(['course-enrollments', variables.courseId]);

            // Execute callback if provided
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error) => {
            console.error('Enrollment removal error:', error);

            // Extract error message from response if available
            const errorMessage = error.response?.data?.message || 'Failed to remove enrollment. Please try again.';

            // Show error toast
            toast.error(errorMessage);
        }
    });
};

/**
 * Hook for bulk enrolling users to multiple courses
 * @param {Function} onSuccess - Optional callback function to execute on successful enrollment
 * @returns {Object} Mutation object with mutate function
 */
export const useBulkEnroll = (onSuccess) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (enrollmentData) => {
            try {
                // Ensure branches data is in the correct format
                if (enrollmentData.branches) {
                    // Filter out any branch entries that don't have branch_id
                    enrollmentData.branches = enrollmentData.branches
                        .filter(branch => branch && (branch.branch_id || branch.id))
                        .map(branch => {
                            // If branch has id but no branch_id, use id as branch_id
                            if (!branch.branch_id && branch.id) {
                                return {
                                    branch_id: branch.id,
                                    // Make sure selected_status is explicitly set and kept as provided
                                    // Don't default to 1 if it's already set in the branch data
                                    selected_status: branch.selected_status !== undefined ? branch.selected_status : 1
                                };
                            }
                            // Keep the branch as is, preserving its selected_status
                            return branch;
                        });

                    // If branches array is empty after filtering, remove it
                    if (enrollmentData.branches.length === 0) {
                        delete enrollmentData.branches;
                    }
                }

                console.log("Sending bulk enrollment data:", enrollmentData);

                const response = await axiosInstance.post(
                    `/tenant/taallum/v1/enrollments`,
                    enrollmentData
                );
                return response.data;
            } catch (error) {
                console.error('Bulk enrollment error:', error);
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            // Get success count from API response
            const successCount = data?.data?.success_count || 0;
            const totalCount = data?.data?.total_requested || 0;

            // Show success toast
            toast.success(`Successfully enrolled users (${successCount}/${totalCount} operations completed)`);

            // Invalidate relevant queries to refresh data
            if (variables.course_ids) {
                variables.course_ids.forEach(courseId => {
                    queryClient.invalidateQueries(['course-enrollments', courseId]);
                });
            }

            // If a session was specified, invalidate that query too
            if (variables.session_id) {
                queryClient.invalidateQueries(['session-enrollments', variables.session_id]);
                if (variables.course_ids) {
                    variables.course_ids.forEach(courseId => {
                        queryClient.invalidateQueries(['course-sessions', courseId]);
                    });
                }
            }

            // Execute callback if provided
            if (onSuccess) {
                onSuccess(data);
            }
        },
        onError: (error) => {
            // Extract error message from response if available
            const errorMessage = error.response?.data?.message || 'Failed to enroll users. Please try again.';

            // Show error toast
            toast.error(errorMessage);
        }
    });
};

export const useEnrollments = ({
    courseId,
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["enrollments", { courseId, page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/taallum/v1/courses/${courseId}/enrollments`,
                    page: page,
                    page_size,
                    search,
                    sort
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Enrollments Fetch Error:", error);
                throw error;
            }
        },
        enabled: !!courseId,
        staleTime: 5000,
        retry: 2,
    });
};

export const useUnenrollUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/taallum/v1/enrollments`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Unenrollment error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Users unenrolled successfully");
            queryClient.invalidateQueries(["enrollments"]);
        },
        onError: (error) => {
            toast.error(`Error unenrolling users: ${error.message}`);
        },
    });
}

// GET /tenant/taallum/v1/sessions/{session_id}/enrollments

export const useSessionEnrollments = ({
    sessionId,
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["enrollments", { sessionId, page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/taallum/v1/sessions/${sessionId}/enrollments`,
                    page: page,
                    page_size,
                    search,
                    sort
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Enrollments Fetch Error:", error);
                throw error;
            }
        },
        enabled: !!sessionId,
        staleTime: 5000,
        retry: 2,
    });
};

// delete /tenant/taallum/v1/enrollments/sessions/batch

export const useUnEnrollSessionUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/taallum/v1/enrollments/sessions/batch`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Unenrollment error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Users unenrolled successfully");
            queryClient.invalidateQueries(["enrollments"]);
        },
        onError: (error) => {
            toast.error(`Error unenrolling users: ${error.message}`);
        },
    });
}


export const useUnEnrollSessionUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            courseId,
            userId,
            sessionId
        }) => {
            try {
                const url = `/tenant/taallum/v1/enrollments/${courseId}/${userId}/session/${sessionId}`;

                const response = await axiosInstance.delete(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Unenrollment error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("User unenrolled successfully");
            queryClient.invalidateQueries(["enrollments"]);
        },
        onError: (error) => {
            toast.error(`Error unenrolling user: ${error.message}`);
        },
    });
}
