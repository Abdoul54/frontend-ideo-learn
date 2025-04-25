import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


export const useSkills = ({
    page = 1,
    page_size = 10,
    search = "",
    sort = [],
}) => {
    return useQuery({
        queryKey: ["skills", { page, page_size, search, sort }],
        queryFn: async () => {
            try {
                const url = urlParamsBuilder({
                    prefix: "/tenant/skill/v1/skills/catalog",
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
                console.error("Skills Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
    });
};

// get /tenant/skill/v1/skills/{skill_id}

export const useSkill = ({
    skillId,
    enabled = !!skillId,
}) => {
    return useQuery({
        queryKey: ["skill", { skillId }],
        queryFn: async () => {
            try {
                const url = `/tenant/skill/v1/skills/${skillId}`;

                const response = await axiosInstance.get(url);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Skill Fetch Error:", error);
                throw error;
            }
        },
        staleTime: 5000,
        retry: 2,
        enabled
    });
}

// post /tenant/skill/v1/skills/custom

export const useCreateSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/skill/v1/skills`;

                const response = await axiosInstance.post(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Create Skill Error:", error);
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(["skills"]);
            console.log("Skill Created Successfully:", data);
            toast.success("Skill Created successfully");
        },
        onError: (error) => {
            console.error("Skill Creation Error:", error);
            toast.error("Error creating skill");
        },
        mutationKey: ["create-skill"],
    });
}

// post /tenant/skill/v1/skills/custom/{skill_id}
export const useUpdateSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const url = `/tenant/skill/v1/skills/${id}`;

                const response = await axiosInstance.put(url, data);

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Update Skill Error:", error);
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(["skills"]);
            console.log("Skill Updated Successfully:", data);
            toast.success("skill updated successfully");
        },
        onError: (error) => {
            console.error("Skill Update Error:", error);
            toast.error("Error updating skill");
        },
        mutationKey: ["update-skill"],
    });
}

// delete /tenant/skill/v1/skills

export const useDeleteSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const url = `/tenant/skill/v1/skills`;

                const response = await axiosInstance.delete(url, { data });

                if (!response.data || !response.data.success) {
                    throw new Error("Invalid response structure");
                }

                return response.data?.data;
            } catch (error) {
                console.error("Delete Skill Error:", error);
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(["skills"]);
            console.log("Skill Deleted Successfully:", data);
            toast.success("Skill deleted successfully");
        },
        onError: (error) => {
            console.error("Skill Deletion Error:", error);
            toast.error("Error deleting skill");
        },
        mutationKey: ["delete-skill"],
    });
}
