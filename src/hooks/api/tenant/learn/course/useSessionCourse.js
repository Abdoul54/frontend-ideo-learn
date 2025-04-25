import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

/**
 * Hook to fetch a session by ID
 */
export const useSession = (sessionId) => {
    return useQuery({
        queryKey: ["session", sessionId],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/taallum/v1/sessions/${sessionId}`);
                return response.data.data;
            } catch (error) {
                console.error("Session Fetch Error:", error.message);
                throw error;
            }
        },
        enabled: !!sessionId, // Only fetch when sessionId is provided
        staleTime: 5000,
    });
};

/**
 * Hook to update a session
 */
export const useUpdateSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sessionId, data }) => {
            // Debug log to check what's being sent
            console.log("Sending session update data:", data);
            const response = await axiosInstance.put(`/tenant/taallum/v1/sessions/${sessionId}`, data);
            return response.data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["session", variables.sessionId]);
            // Also invalidate course sessions if courseId is known
            if (variables.data.course_id) {
                queryClient.invalidateQueries(["courseSessions", variables.data.course_id]);
            }
            toast.success("Session updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update session:", error);
            // Extract and display error message if available
            const errorMsg = error.response?.data?.message || "Failed to update session";
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    });
};