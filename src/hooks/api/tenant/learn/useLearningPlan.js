
import { axiosInstance } from "@/lib/axios";
import { generateColumns, generateInitialVisibility } from "@/utils/columnsGenerator";
import { customCellRenderers } from "@/constants/LearningPlan";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useLearningPlans = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["learning-plans", { page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/taallum/v1/learningplans",
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
                console.error("Learning Plans Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

// get a learning plan by id
export const useLearningPlan = ({
    learningPlanId,
}) => {
    return useQuery({
        queryKey: ["learning-plan", { learningPlanId }],
        queryFn: async () => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}`;

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Learning Plan Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
        enabled: !!learningPlanId // Only fetch when learningPlanId is provided
    });
};


// create a learning plan

export const useCreateLearningPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Create Learning Plan Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Learning Plan created successfully");
            queryClient.invalidateQueries(["learning-plans"]);
        },
        onError: (error) => {
            console.error("Learning Plan Create Error:", error);
            toast.error("Error creating Learning Plan");
        },
    });
}

// update a learning plan
export const useUpdateLearningPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Update Learning Plan Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Learning Plan updated successfully");
            queryClient.invalidateQueries(["learning-plans"]);
        },
        onError: (error) => {
            console.error("Learning Plan Update Error:", error);
            toast.error("Error updating Learning Plan");
        },
    });
}

// delete a learning plan

export const useDeleteLearningPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/batch-delete`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Learning Plan Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Learning Plan deleted successfully");
            queryClient.invalidateQueries(["learning-plans"]);
        },
        onError: (error) => {
            console.error("Learning Plan Delete Error:", error);
            toast.error("Error deleting Learning Plan");
        },
    });
}
// delete many learning plans
export const useDeleteManyLearningPlans = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/taallum/v1/learningplans`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Learning Plans Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Learning Plans deleted successfully");
            queryClient.invalidateQueries(["learning-plans"]);
        },
        onError: (error) => {
            console.error("Learning Plans Delete Error:", error);
            toast.error("Error deleting Learning Plans");
        },
    });
}

export const useLearningPlansColumns = ({ actionColumn = {} }) => {
    return useQuery({
        queryKey: ["learning-plans-column", { actionColumn }],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/tenant/taallum/v1/learningplans/importer_fields");

                if (!response?.data || !response?.data?.success) {
                    throw new Error("Invalid response structure");
                }

                const initialVisibility = generateInitialVisibility(response?.data?.data);
                const columns = generateColumns(response?.data.data, {
                    actionColumn,
                    customCellRenderers
                });

                //setColumns(columns)
                //setColumnVisibility(initialVisibility);
                return {
                    columns,
                    initialVisibility,
                };
            } catch (error) {
                console.error("Users Columns Fetch Error:", error.message);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}

// add course to learning plan /tenant/taallum/v1/learningplans/{learningplan_id}/courses
export const useAddCoursesToLearningPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/courses`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Add Courses to Learning Plan Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Courses added to Learning Plan successfully");
            queryClient.invalidateQueries(["learning-plans"]);
        },
        onError: (error) => {
            console.error("Add Courses to Learning Plan Error:", error);
            toast.error("Error adding Courses to Learning Plan");
        },
    });
}

// get assigned courses to learning plan /tenant/taallum/v1/learningplans/{learningplan_id}/courses


export const useAssignedCourses = ({
    learningPlanId,
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["assigned-courses", { learningPlanId, page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/taallum/v1/learningplans/${learningPlanId}/courses`,
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
                console.error("Assigned Courses Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}

// /tenant/taallum/v1/learningplans/{learningplan_id}/courses
export const useDeleteAssignedCourses = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/courses`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Assigned Courses Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Assigned Courses deleted successfully");
            queryClient.invalidateQueries(["assigned-courses"]);
        },
        onError: (error) => {
            console.error("Assigned Courses Delete Error:", error);
            toast.error("Error deleting Assigned Courses");
        },
    });
}

// PUT /tenant/taallum/v1/learningplans/{learningplan_id}/courses/status

export const useUpdateAssignedCoursesStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/courses/status`;

                const response = await axiosInstance.put(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Update Assigned Courses Status Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Assigned Courses status updated successfully");
            queryClient.invalidateQueries(["assigned-courses"]);
        },
        onError: (error) => {
            console.error("Assigned Courses status Update Error:", error);
            toast.error("Error updating Assigned Courses status");
        },
    });
}


// Delete /tenant/taallum/v1/learningplans/{learningplan_id}/courses/{course_id}/prerequisites reset prerequisites
export const useResetPrerequisites = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, courseId }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/courses/${courseId}/prerequisites`;

                const response = await axiosInstance.delete(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Prerequisites Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Prerequisites deleted successfully");
            queryClient.invalidateQueries(["assigned-courses"]);
        },
        onError: (error) => {
            console.error("Prerequisites Delete Error:", error);
            toast.error("Error deleting Prerequisites");
        },
    });
}

// PUT /tenant/taallum/v1/learningplans/{learningplan_id}/courses/{course_id}/prerequisites

export const useUpdatePrerequisites = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, courseId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/courses/${courseId}/prerequisites`;

                const response = await axiosInstance.put(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Update Prerequisites Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Prerequisites updated successfully");
            queryClient.invalidateQueries(["assigned-courses"]);
        },
        onError: (error) => {
            console.error("Prerequisites Update Error:", error);
            toast.error("Error updating Prerequisites");
        },
    });
}


// GET /tenant/taallum/v1/learningplans/{learningplan_id}/courses/{course_id}/prerequisites/selected

export const useGetSelectedPrerequisites = ({ learningPlanId, courseId,
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["selected-prerequisites", learningPlanId, courseId],
        queryFn: async () => {
            try {

                const url = urlParamsBuilder({
                    prefix: `/tenant/taallum/v1/learningplans/${learningPlanId}/courses/${courseId}/prerequisites/selected`,
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
                console.error("Selected Prerequisites Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}


// GET /tenant/taallum/v1/learningplans/{learningplan_id}/enrollments

export const useEnrollments = (params) => {
    return useQuery({
        queryKey: ["enrollments", params],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/taallum/v1/learningplans/${params?.learningPlanId}/enrollments`,
                    ...params
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
        staleTime: 5000,
        retry: 2,
    });
}

// POST /tenant/taallum/v1/learningplans/{learningplan_id}/enrollments

export const useEnrollUsers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ learningPlanId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/enrollments`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Enroll Users Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Users enrolled successfully");
            queryClient.invalidateQueries(["enrollments"]);
        },
        onError: (error) => {
            console.error("Enroll Users Error:", error);
            toast.error("Error enrolling users");
        },
    });
}

// DELETE /tenant/taallum/v1/learningplans/{learningplan_id}/enrollments/{user_id}

export const useUnenrollUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ learningPlanId, userId }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/enrollments/${userId}`;

                const response = await axiosInstance.delete(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Unenroll User Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("User unenrolled successfully");
            queryClient.invalidateQueries(["enrollments"]);
        },
        onError: (error) => {
            console.error("Unenroll User Error:", error);
            toast.error("Error unenrolling user");
        },
    });
}


// DELETE /tenant/taallum/v1/learningplans/{learningplan_id}/enrollments/bulk

export const useUnenrollUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ learningPlanId, data }) => {
            try {
                const url = `/tenant/taallum/v1/learningplans/${learningPlanId}/enrollments/bulk`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Unenroll Users Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Users unenrolled successfully");
            queryClient.invalidateQueries(["enrollments"]);
        },
        onError: (error) => {
            console.error("Unenroll Users Error:", error);
            toast.error("Error unenrolling users");
        },
    });
}