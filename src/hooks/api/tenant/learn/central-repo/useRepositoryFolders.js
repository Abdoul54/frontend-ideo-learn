import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { urlParamsBuilder } from "@/utils/urlParamsBuilder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useRepositoryFolders = ({
  page = 1,
  page_size = 10,
  search = "",
  sort_attr = "name",
  sort_dir = "asc",
  folder_id,
  search_type = 1
}) => {
  return useQuery({
    queryKey: ["repositoryFolders", { page, page_size, search, sort_attr, sort_dir, folder_id, search_type }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tmrepo/v1/folders/children",
          page,
          page_size,
          search,
          sort_attr,
          sort_dir,
          folder_id: folder_id || undefined,
          search_type
        });

        const response = await axiosInstance.get(url);
        return response.data;
      } catch (error) {
        console.error("Repository Folders Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};

export const useAddFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ parentFolderId, name, code }) => {
      const response = await axiosInstance.post('/tmrepo/v1/folders', {
        parent_folder_id: parentFolderId,
        name,
        code: code || null
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryFolders"]);
      toast.success("Folder created successfully");
    },
    onError: (error) => {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folderId) => {
      const response = await axiosInstance.delete(`/tmrepo/v1/folders/${folderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryFolders"]);
      toast.success("Folder deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  });
};

export const useEditFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ folderId, name, code }) => {
      const response = await axiosInstance.put(`/tmrepo/v1/folders/${folderId}`, {
        name,
        code: code || null
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryFolders"]);
      toast.success("Folder updated successfully");
    },
    onError: (error) => {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  });
};

export const useRepositoryMaterials = ({
  search_text = "",
  page = 1,
  page_size = 15,
  sort_attr = "created_on",
  sort_dir = "desc",
  folder_id,
  filters
}) => {
  return useQuery({
    queryKey: ["repositoryMaterials", { search_text, page, page_size, sort_attr, sort_dir, folder_id, filters }],
    queryFn: async () => {
      try {
        const url = urlParamsBuilder({
          prefix: "/tmrepo/v1/folders/materials",
          search: search_text,
          page,
          page_size,
          sort_attr,
          sort_dir,
          folder_id: folder_id || undefined,
          ...filters
        });

        const response = await axiosInstance.get(url);
        return response.data;
      } catch (error) {
        console.error("Repository Materials Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};

export const useGetMaterial = (materialId, options = {}) => {
  return useQuery({
    queryKey: ["material", materialId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tmrepo/v1/materials/${materialId}`);
      return response.data;
    },
    ...options,
    enabled: !!materialId && (options.enabled !== false)
  });
};

export const useAddMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ folderId, ...materialData }) => {
      const response = await axiosInstance.post('/tmrepo/v1/materials', {
        folder_id: folderId,
        ...materialData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryMaterials"]);
      toast.success("Material added successfully");
    },
    onError: (error) => {
      console.error('Error adding material:', error);
      toast.error('Failed to add material');
    }
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, ...updateData }) => {
      const response = await axiosInstance.put(`/tmrepo/v1/materials/${materialId}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryMaterials"]);
      queryClient.invalidateQueries(["material"]);
      toast.success("Material updated successfully");
    },
    onError: (error) => {
      console.error('Error updating material:', error);
      toast.error('Failed to update material');
    }
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (materialId) => {
      const response = await axiosInstance.delete(`/tmrepo/v1/materials/${materialId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryMaterials"]);
      toast.success("Material deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  });
};

export const useUpdateMaterialStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialIds, status }) => {
      // If we're updating multiple materials
      if (Array.isArray(materialIds) && materialIds.length > 1) {
        const response = await axiosInstance.put('/tmrepo/v1/materials/batch-update-status', {
          material_ids: materialIds,
          status
        });
        return response.data;
      } 
      // Single material update
      else {
        const materialId = Array.isArray(materialIds) ? materialIds[0] : materialIds;
        const response = await axiosInstance.put(`/tmrepo/v1/materials/${materialId}/status`, {
          status
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryMaterials"]);
      toast.success("Material status updated successfully");
    },
    onError: (error) => {
      console.error('Error updating material status:', error);
      toast.error('Failed to update material status');
    }
  });
};

export const useMoveMaterials = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialIds, targetFolderId }) => {
      const response = await axiosInstance.post('/tmrepo/v1/materials/move', {
        material_ids: materialIds,
        target_folder_id: targetFolderId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["repositoryMaterials"]);
      toast.success("Materials moved successfully");
    },
    onError: (error) => {
      console.error('Error moving materials:', error);
      toast.error('Failed to move materials');
    }
  });
};


