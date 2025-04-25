import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";

/**
 * Hook to fetch events for a session
 */
export const useSessionEvents = (sessionId, options = {}) => {
    const { page = 1, page_size = 15, sort_attr = "day", sort_dir = "asc", search = "" } = options;

    return useQuery({
        queryKey: ["sessionEvents", sessionId, { page, page_size, sort_attr, sort_dir, search }],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(
                    `/tenant/taallum/v1/sessions/${sessionId}/events`,
                    {
                        params: {
                            page,
                            page_size,
                            sort_attr,
                            sort_dir,
                            search
                        }
                    }
                );
                return response.data.data;
            } catch (error) {
                console.error("Session Events Fetch Error:", error.message);
                throw error;
            }
        },
        enabled: !!sessionId, // Only fetch when sessionId is provided
        staleTime: 5000,
    });
};

/**
 * Hook to fetch a single event by ID
 */
export const useSessionEvent = (sessionId, eventId) => {
    return useQuery({
        queryKey: ["sessionEvent", sessionId, eventId],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/taallum/v1/sessions/${sessionId}/events/${eventId}`);
                return response.data.data;
            } catch (error) {
                console.error("Session Event Fetch Error:", error.message);
                throw error;
            }
        },
        enabled: !!sessionId && !!eventId, // Only fetch when both IDs are provided
        staleTime: 5000,
    });
};

/**
 * Hook to create a session event
 */
export const useCreateSessionEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sessionId, data }) => {
            console.log("Creating event with data:", data);
            const response = await axiosInstance.post(`/tenant/taallum/v1/sessions/${sessionId}/events`, data);
            return response.data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["sessionEvents", variables.sessionId]);
            queryClient.invalidateQueries(["session", variables.sessionId]);
            toast.success("Event created successfully");
        },
        onError: (error) => {
            console.error("Failed to create event:", error);
            const errorMsg = error.response?.data?.message || "Failed to create event";
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    });
};

/**
 * Hook to update a session event
 */
export const useUpdateSessionEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sessionId, eventId, data }) => {
            console.log("Updating event with data:", data);
            const response = await axiosInstance.put(`/tenant/taallum/v1/sessions/${sessionId}/events/${eventId}`, data);
            return response.data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["sessionEvents", variables.sessionId]);
            queryClient.invalidateQueries(["sessionEvent", variables.sessionId, variables.eventId]);
            toast.success("Event updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update event:", error);
            const errorMsg = error.response?.data?.message || "Failed to update event";
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    });
};

/**
 * Hook to delete a session event
 */
export const useDeleteSessionEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId }) => { // Only eventId is needed for the API call
            const response = await axiosInstance.delete(`/tenant/taallum/v1/events/${eventId}`);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Use sessionId from variables to invalidate the session's events list
            queryClient.invalidateQueries(["sessionEvents", variables.sessionId]);
            toast.success("Event deleted successfully");
        },
        onError: (error) => {
            console.error("Failed to delete event:", error);
            const errorMsg = error.response?.data?.message || "Failed to delete event";
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    });
};

export const useClassroomsByLocation = (locationId) => {
    return useQuery({
        queryKey: ["classroomsByLocation", locationId],
        queryFn: async () => {
            try {
                if (!locationId) return { items: [] };

                const response = await axiosInstance.get(`/tenant/taallum/v1/locations/${locationId}/classrooms`);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Classrooms by Location Fetch Error:", error);
                throw error;
            }
        },
        enabled: !!locationId, // Only fetch when locationId is provided
        staleTime: 5000,
        retry: 2,
    });
};

/**
 * Hook to fetch a single event by ID directly from events endpoint
 */
export const useEvent = (eventId) => {
    return useQuery({
        queryKey: ["event", eventId],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/tenant/taallum/v1/events/${eventId}`);
                return response.data.data;
            } catch (error) {
                console.error("Event Fetch Error:", error.message);
                throw error;
            }
        },
        enabled: !!eventId, // Only fetch when eventId is provided
        staleTime: 5000,
    });
};

/**
 * Hook to update an event directly
 */
export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, data }) => {
            console.log("Updating event with data:", data);
            const response = await axiosInstance.put(`/tenant/taallum/v1/events/${eventId}`, data);
            return response.data.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate both the direct event query and the session events list
            queryClient.invalidateQueries(["event", variables.eventId]);

            // If we know the session ID, also invalidate the session's events list
            if (data.lsession_id) {
                queryClient.invalidateQueries(["sessionEvents", data.lsession_id]);
            }
        },
        onError: (error) => {
            console.error("Failed to update event:", error);
            const errorMsg = error.response?.data?.message || "Failed to update event";

            // Handle array of error messages
            if (Array.isArray(errorMsg)) {
                // Extract and display field-specific errors
                const errorMessages = errorMsg.map(err =>
                    `${err.field}: ${err.message}`
                ).join(', ');
                toast.error(errorMessages);
            } else {
                toast.error(errorMsg);
            }
        }
    });
};

/**
 * Hook to fetch attendances for an event
 */
export const useEventAttendances = (eventId, options = {}) => {
    const { page = 1, page_size = 50, sort_attr = "user_name", sort_dir = "asc", search = "" } = options;

    return useQuery({
        queryKey: ["eventAttendances", eventId, { page, page_size, sort_attr, sort_dir, search }],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(
                    `/tenant/taallum/v1/events/${eventId}/attendances`,
                    {
                        params: {
                            page,
                            page_size,
                            sort_attr,
                            sort_dir,
                            search
                        }
                    }
                );
                return response.data.data;
            } catch (error) {
                console.error("Event Attendances Fetch Error:", error.message);
                throw error;
            }
        },
        enabled: !!eventId, // Only fetch when eventId is provided
        staleTime: 5000,
    });
};

/**
 * Hook to update an attendance status
 */
export const useUpdateAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, attendanceId, status }) => {
            const response = await axiosInstance.put(`/tenant/taallum/v1/events/${eventId}/attendances/${attendanceId}`, {
                status
            });
            return response.data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["eventAttendances", variables.eventId]);
            toast.success("Attendance status updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update attendance status:", error);
            const errorMsg = error.response?.data?.message || "Failed to update attendance status";
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    });
};