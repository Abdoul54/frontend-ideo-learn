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

/**
 * Custom hook for fetching courses and learning plans with filtering and sorting
 */
export const useMyCoursesAndLearningPlans = ({
  page = 1,
  page_size = 20,
  sort_attr = "enrollment_date",
  sort_dir = "desc",
  search_text = "",
  type = [],
  status = [],
  deadline = "all",
  duration_min = null,
  duration_max = null,
  language = [],
  dateRange = null,
  enabled = true,
  extra_filters = null,
  price = null
}) => {
  return useQuery({
    queryKey: ["myCoursesAndLearningPlans", {
      page,
      page_size,
      sort_attr,
      sort_dir,
      search_text,
      type,
      status,
      deadline,
      duration_min,
      duration_max,
      language,
      dateRange,
      price
    }],
    queryFn: async () => {
      try {
        // Prepare query parameters
        const params = {
          prefix: "/tenant/taallum/v1/learn/my-courses-and-learning-plans",
          page,
          page_size,
          sort_attr,
          sort_dir,
          ...(search_text && { search_text }),
          ...(Array.isArray(status) && status.length && { status }),
          ...(Array.isArray(type) && type.length && { type }),
          ...(deadline && deadline !== 'all' && { deadline }),
          ...(duration_min && { duration_min }),
          ...(duration_max && { duration_max }),
          ...(Array.isArray(language) && language.length && { language }),
          ...(price && price !== 'all' && { price }),
        };

        // Add extra_filters for date range if provided
        if (dateRange) {
          params.extra_filters = JSON.stringify({
            date_range: {
              start: dateRange.start,
              end: dateRange.end
            }
          });
        } else if (extra_filters) {
          params.extra_filters = typeof extra_filters === 'string'
            ? extra_filters
            : JSON.stringify(extra_filters);
        }

        const url = urlParamsBuilder(params);
        const response = await axiosInstance.get(url);

        if (!response.data || !response.data.success) {
          throw new Error("Failed to fetch courses and learning plans");
        }

        // Process the response to transform it into the format expected by the components
        const items = response.data.data.map(item => ({
          id: item.id,
          title: item.name,
          type: mapTypeToDisplayType(item.type, item.content_type),
          rawType: item.type,
          contentType: item.content_type,
          thumbnail: item.image || '/images/courses/default.jpg',
          lang_code: item.language,
          enrollement_status: mapStatusToDisplayStatus(item.status, item.progress),
          rawStatus: item.status,
          // Add additional fields that might be needed
          progress: item.progress,
          courseCount: item.content_type === "LEARNING_PLAN" ? (item.course_count || 0) : undefined,
          description: item.description,
          startDate: item.validity_start_date,
          endDate: item.validity_end_date,
          enrollmentDate: item.enrollment_date,
          canUnenroll: item.can_self_unenroll,
          language: item.language,
          duration: item.duration
        }));

        return {
          items,
          pagination: {
            total: response.data.data.length,
            per_page: page_size,
            current_page: page,
            last_page: Math.ceil(response.data.data.length / page_size),
            has_more: response.data.data.length > page * page_size
          }
        };
      } catch (error) {
        console.error("Courses Fetch Error:", error.message);
        toast.error("Failed to load your courses");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled
  });
};

/**
 * Maps API type values to display-friendly values
 */
function mapTypeToDisplayType(type, contentType) {
  if (contentType === "LEARNING_PLAN") {
    return "Learning Plan";
  }

  switch (type) {
    case "ELEARNING":
      return "E-learning";
    case "CLASSROOM":
      return "ILT";
    case "VIRTUAL_CLASSROOM":
      return "VILT";
    default:
      return type;
  }
}

/**
 * Maps API status values to display-friendly status values
 */
function mapStatusToDisplayStatus(status, progress) {
  if (status === "completed" || progress === 100) {
    return "Terminé";
  }
  if (status === "enrolled") {
    if (progress > 0) {
      return "En cours";
    }
    return "Non débuté";
  }
  return status;
}

export const useMyCourses = ({
  search_text = "",
  page = 1,
  page_size = 20,
  sort_attr = "enrollment_date",
  sort_dir = "desc",
  status = [],
  type = [],
  deadline = "all",
  duration_min = null,
  duration_max = null,
  language = [],
  extra_filters = null
}) => {
  return useQuery({
    queryKey: ["myCourses", {
      search_text,
      page,
      page_size,
      sort_attr,
      sort_dir,
      status: status.join(','),
      type: type.join(','),
      deadline,
      duration_min,
      duration_max,
      language: language.join(','),
      extra_filters
    }],
    queryFn: async () => {
      try {
        // Build query parameters manually to ensure correct array format
        let params = new URLSearchParams();

        // Add basic parameters
        if (search_text) params.append('search_text', search_text);
        params.append('page', page);
        params.append('page_size', page_size);
        params.append('sort_attr', sort_attr);
        params.append('sort_dir', sort_dir);

        // Add array parameters with proper indexing
        if (status && status.length > 0) {
          status.forEach((item, index) => {
            params.append(`status[${index}]`, item);
          });
        }

        if (type && type.length > 0) {
          type.forEach((item, index) => {
            params.append(`type[${index}]`, item);
          });
        }

        if (language && language.length > 0) {
          language.forEach((item, index) => {
            params.append(`language[${index}]`, item);
          });
        }

        // Add deadline if not default
        if (deadline && deadline !== 'all') {
          params.append('deadline', deadline);
        }

        // Explicitly add duration parameters if they exist
        if (duration_min) {
          params.append('duration_min', duration_min);
          console.log('Adding duration_min:', duration_min);
        }

        if (duration_max) {
          params.append('duration_max', duration_max);
          console.log('Adding duration_max:', duration_max);
        }

        // Add extra filters if they exist
        if (extra_filters) {
          params.append('extra_filters', JSON.stringify(extra_filters));
        }

        // Log the complete URL for debugging
        const url = `/tenant/taallum/v1/learn/my-courses-and-learning-plans`;
        const fullUrl = `${url}?${params.toString()}`;
        console.log('API Request URL:', fullUrl);

        // Make the API request
        const response = await axiosInstance.get(fullUrl);

        if (!response.data || !response.data.success) {
          throw new Error("Failed to fetch courses and learning plans");
        }

        // Transform the response to match the expected format in the application
        return {
          items: response.data.data || [],
        };
      } catch (error) {
        console.error("My Courses Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000, // Data will be considered fresh for 5 seconds
    retry: 2, // Will retry failed requests 2 times
  });
};