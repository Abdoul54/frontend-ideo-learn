import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import toast from "react-hot-toast";

/**
 * Hook to fetch courses for a specific category
 */
export const useCourses = ({
  search_text = "",
  page = 1,
  page_size = 20,
  sort_attr = "name",
  sort_dir = "asc",
  category_id,
  extra_filters = null,
  filters = null
}) => {
  return useQuery({
    queryKey: ["courses", { search_text, page, page_size, sort_attr, sort_dir, category_id, filters }],
    queryFn: async () => {
      try {
        const params = {
          prefix: "/tenant/taallum/v1/courses",
          search: search_text,
          page,
          page_size,
          sort_attr,
          sort_dir,
          category_id: category_id || undefined,
          ...(filters || {}),
          extra_filters: extra_filters || undefined
        };

        const url = urlParamsBuilder(params);
        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Failed to fetch courses");
        }

        // Transform the response to match the expected format
        return {
          items: response.data.data.items || [],
          pagination: {
            total: response.data.data.pagination?.total || 0,
            per_page: response.data.data.pagination?.per_page || page_size,
            current_page: response.data.data.pagination?.current_page || page,
            last_page: response.data.data.pagination?.last_page || 1,
            has_more: response.data.data.pagination?.has_more || false
          }
        };
      } catch (error) {
        console.error("Courses Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
    // We need to fetch courses even without a category_id for the root level
    // enabled: category_id !== undefined
  });
};

/**
 * Hook to get a single course by ID
 */
export const useCourse = (courseId) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/tenant/taallum/v1/courses/${courseId}`);
        return response.data.data;
      } catch (error) {
        console.error("Course Fetch Error:", error.message);
        throw error;
      }
    },
    enabled: !!courseId // Only fetch when courseId is provided
  });
};

/**
 * Hook to create a new course
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData) => {
      try {
        const response = await axiosInstance.post('/tenant/taallum/v1/courses', courseData);
        return response.data.data;
      } catch (error) {
        // Handle the error here so it doesn't get thrown again
        console.error("API error creating course:", error);

        // Extract error message
        const errorMessage = error.response?.data?.message || "Failed to create course";

        if (Array.isArray(errorMessage)) {
          toast.error(errorMessage[0]);
        } else {
          toast.error(errorMessage);
        }

        // Return a rejected promise to signal failure, but with an error object
        // that has useful information
        return Promise.reject({
          handled: true,
          original: error,
          message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Course created successfully");
      return data;
    },
    onError: (error) => {
      // Only display error if it wasn't already handled in mutationFn
      if (!error.handled) {
        console.error("Failed to create course:", error);
        toast.error("Failed to create course");
      }
    }
  });
};

/**
 * Hook to update an existing course
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, data }) => {
      const response = await axiosInstance.post(`/tenant/taallum/v1/courses/${courseId}`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course", variables.courseId]);
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update course:", error);
      toast.error("Failed to update course");
    }
  });
};

/**
 * Hook to delete course(s)
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseIds) => {
      // If single ID is passed, convert to array
      const ids = Array.isArray(courseIds) ? courseIds : [courseIds];

      const response = await axiosInstance.delete('/tenant/taallum/v1/courses/batch-delete', {
        data: {
          items: ids
        }
      });
      return response.data;  // Return the full response data, not just data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["courses"]);
      // Use the success message from the API response
      const message = data?.name || `Successfully deleted courses`;
      toast.success(message);
    },
    onError: (error) => {
      console.error("Failed to delete course(s):", error);
      toast.error("Failed to delete course(s)");
    }
  });
};

/**
 * Hook to update course status
 */
export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseIds, status }) => {
      // Convert single ID to array if needed
      const ids = Array.isArray(courseIds) ? courseIds : [courseIds];

      const response = await axiosInstance.put('/tenant/taallum/v1/courses/change_status', {
        course_ids: ids,
        status: status
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["courses"]);
      const message = data?.name || `Course status updated to ${data?.data?.new_status || 'new status'}`;
      toast.success(message);
    },
    onError: (error) => {
      console.error("Failed to update course status:", error);
      toast.error("Failed to update course status");
    }
  });
};

/**
 * Hook to move courses to different category
 */
export const useMoveCourses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseIds, targetCategoryId }) => {
      const response = await axiosInstance.post('/tenant/taallum/v1/courses/move', {
        course_ids: courseIds,
        category_id: targetCategoryId
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Courses moved successfully");
    },
    onError: (error) => {
      console.error("Failed to move courses:", error);
      toast.error("Failed to move courses");
    }
  });
};

/**
 * Hook to fetch course sessions
 */
export const useCourseSessions = ({
  courseId,
  page = 1,
  page_size = 10,
  sort_attr = "name",
  sort_dir = "desc",
  search_text = ""
}) => {
  return useQuery({
    queryKey: ["courseSessions", courseId, { page, page_size, sort_attr, sort_dir, search_text }],
    queryFn: async () => {
      try {
        const params = {
          prefix: `/tenant/taallum/v1/courses/${courseId}/sessions`,
          page,
          page_size,
          sort_attr,
          sort_dir,
          search: search_text
        };

        const url = urlParamsBuilder(params);
        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Failed to fetch course sessions");
        }

        // Transform the response to match the expected format
        return {
          items: response.data.data.items || [],
          pagination: {
            total: response.data.data.pagination?.total || 0,
            per_page: response.data.data.pagination?.per_page || page_size,
            current_page: response.data.data.pagination?.current_page || page,
            last_page: response.data.data.pagination?.last_page || 1,
            has_more: response.data.data.pagination?.has_more || false
          }
        };
      } catch (error) {
        console.error("Course Sessions Fetch Error:", error.message);
        throw error;
      }
    },
    enabled: !!courseId, // Only fetch when courseId is provided
    staleTime: 5000,
    retry: 2
  });
};

/**
 * Hook to create a new course session
 */
export const useCreateCourseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sessionData }) => {
      try {
        const response = await axiosInstance.post(`/tenant/taallum/v1/courses/${courseId}/sessions`, sessionData);
        return response.data.data;
      } catch (error) {
        console.error("API error creating session:", error);
        const errorMessage = error.response?.data?.message || "Failed to create session";
        if (Array.isArray(errorMessage)) {
          toast.error(errorMessage[0]);
        } else {
          toast.error(errorMessage);
        }
        return Promise.reject({
          handled: true,
          original: error,
          message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
        });
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["courseSessions", variables.courseId]);
      toast.success("Session created successfully");
      return data;
    },
    onError: (error) => {
      if (!error.handled) {
        console.error("Failed to create session:", error);
        toast.error("Failed to create session");
      }
    }
  });
};

/**
 * Hook to update a course session
 */
export const useUpdateCourseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sessionId, data }) => {
      const response = await axiosInstance.put(`/tenant/taallum/v1/courses/${courseId}/sessions/${sessionId}`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["courseSessions", variables.courseId]);
      toast.success("Session updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session");
    }
  });
};

/**
 * Hook to delete course session(s)
 */
export const useDeleteCourseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionIds, courseId }) => {
      // If multiple sessions, delete them one by one
      if (Array.isArray(sessionIds) && sessionIds.length > 0) {
        // Create promises for each session deletion
        const deletePromises = sessionIds.map(sessionId =>
          axiosInstance.delete(`/tenant/taallum/v1/sessions/${sessionId}`)
        );

        // Execute all deletions in parallel
        const responses = await Promise.allSettled(deletePromises);

        // Check if any deletions failed
        const failures = responses.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
          throw new Error(`Failed to delete ${failures.length} out of ${sessionIds.length} sessions`);
        }

        return { success: true, message: `Successfully deleted ${sessionIds.length} sessions` };
      }
      // If no session IDs provided or empty array
      else if (!sessionIds || (Array.isArray(sessionIds) && sessionIds.length === 0)) {
        return { success: true, message: "No sessions to delete" };
      }
      // If single session ID (not in an array)
      else {
        const response = await axiosInstance.delete(`/tenant/taallum/v1/sessions/${sessionIds}`);
        return response.data;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate the sessions list query to refresh the UI
      queryClient.invalidateQueries(["courseSessions", variables.courseId]);

      // Show success message
      const message = data?.message || "Successfully deleted session(s)";
      toast.success(message);
    },
    onError: (error) => {
      console.error("Failed to delete session(s):", error);
      const errorMessage = error?.response?.data?.message || "Failed to delete session(s)";
      toast.error(errorMessage);
    }
  });
};