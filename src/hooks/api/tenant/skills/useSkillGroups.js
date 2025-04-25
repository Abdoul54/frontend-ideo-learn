import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useSkillGroups = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["skill-groups", { page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/skill/v1/skillgroups",
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
                console.error("Skills sets Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};


// get /tenant/skill/v1/skillgroups/{skillgroup_id}
export const useSkillGroup = ({
    skillGroupId,
}) => {
    return useQuery({
        queryKey: ["skill-group", { skillGroupId }],
        queryFn: async () => {
            try {
                const url = `/tenant/skill/v1/skillgroups/${skillGroupId}`;

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2
    });
};

// post /tenant/skill/v1/skillgroups

export const useCreateSkillGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/skill/v1/skillgroups`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group creation Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Skill group created successfully");
            queryClient.invalidateQueries(["skill-groups"]);
        },
        onError: (error) => {
            toast.error(`Error creating skill group: ${error.message}`);
        },
    });
}

// put /tenant/skill/v1/skillgroups/{skillgroup_id}

export const useUpdateSkillGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const url = `/tenant/skill/v1/skillgroups/${id}`;

                const response = await axiosInstance.put(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group update Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Skill group updated successfully");
            queryClient.invalidateQueries(["skill-groups"]);
        },
        onError: (error) => {
            toast.error(`Error updating skill group: ${error.message}`);
        },
    });
}

// delete /tenant/skill/v1/skillgroups/batch

export const useDeleteSkillGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/skill/v1/skillgroups/batch`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group delete Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Skill group deleted successfully");
            queryClient.invalidateQueries(["skill-groups"]);
        },
        onError: (error) => {
            toast.error(`Error deleting skill group: ${error.message}`);
        },
    });
}


// get /tenant/skill/v1/skillgroups/{skillgroup_id}/skills

export const useSkillGroupSkills = ({
    skillGroupId,
    page = 1,
    page_size = 10,
    search = "",
}) => {
    return useQuery({
        queryKey: ["skill-group-skills", { skillGroupId, page, page_size, search }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/skill/v1/skillgroups/${skillGroupId}/skills`,
                    page: page,
                    page_size,
                    search
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group skills Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}



export const useAssignedSkillsToSkillGroup = ({
    skillGroupId,
    page = 1,
    page_size = 10,
    search = "",
}) => {
    return useQuery({
        queryKey: ["assigned-skills-to-skill-group", { skillGroupId, page, page_size, search }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: `/tenant/skill/v1/skillgroups/skills`,
                    page: page,
                    page_size,
                    search
                });

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Assigned skills to skill group Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
}


export const useAssignSkillsToSkillGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/skill/v1/skillgroups/skills`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group assign skills Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Skills assigned to skill group successfully");
            queryClient.invalidateQueries(["skill-groups"]);
        },
        onError: (error) => {
            toast.error(`Error assigning skills to skill group: ${error.message}`);
        },
    });
}

// unassign skills from skill group /tenant/skill/v1/skillgroups/{skillgroup_id}/skills
export const useUnassignSkillsFromSkillGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ data, skillgroup_id }) => {
            try {
                const url = `/tenant/skill/v1/skillgroups/${skillgroup_id}/skills`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill group unassign skills Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Skills unassigned from skill group successfully");
            queryClient.invalidateQueries(["skill-groups"]);
        },
        onError: (error) => {
            toast.error(`Error unassigning skills from skill group: ${error.message}`);
        },
    });
}
