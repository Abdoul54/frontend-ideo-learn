import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Initial mock data for folders
const mockFolders = {
  1: [
    {
      folder_id: 101,
      code: "TRAINING",
      name: "Training Materials",
      children_count: 3,
      can_manage: true,
      can_manage_all_children: true
    },
    {
      folder_id: 102,
      code: "ONBOARDING",
      name: "Onboarding Resources",
      children_count: 2,
      can_manage: true,
      can_manage_all_children: true
    },
    {
      folder_id: 103,
      code: "COMPLIANCE",
      name: "Compliance Courses",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    },
    {
      folder_id: 104,
      code: "SALES",
      name: "Sales Training",
      children_count: 1,
      can_manage: true,
      can_manage_all_children: true
    }
  ],
  101: [
    {
      folder_id: 1011,
      code: "TECH",
      name: "Technical Training",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    },
    {
      folder_id: 1012,
      code: "SOFT",
      name: "Soft Skills",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    },
    {
      folder_id: 1013,
      code: "MGMT",
      name: "Management Training",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    }
  ],
  102: [
    {
      folder_id: 1021,
      code: "NEW",
      name: "New Employee Orientation",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    },
    {
      folder_id: 1022,
      code: "POLICY",
      name: "Policy Overview",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    }
  ],
  104: [
    {
      folder_id: 1041,
      code: "PITCH",
      name: "Sales Pitch Training",
      children_count: 0,
      can_manage: true,
      can_manage_all_children: true
    }
  ]
};

// Folder parent relationships for navigation
const folderParents = {
  101: { folder_id: 1, name: "IDEO", code: "IDEO" },
  102: { folder_id: 1, name: "IDEO", code: "IDEO" },
  103: { folder_id: 1, name: "IDEO", code: "IDEO" },
  104: { folder_id: 1, name: "IDEO", code: "IDEO" },
  1011: { folder_id: 101, name: "Training Materials", code: "TRAINING" },
  1012: { folder_id: 101, name: "Training Materials", code: "TRAINING" },
  1013: { folder_id: 101, name: "Training Materials", code: "TRAINING" },
  1021: { folder_id: 102, name: "Onboarding Resources", code: "ONBOARDING" },
  1022: { folder_id: 102, name: "Onboarding Resources", code: "ONBOARDING" },
  1041: { folder_id: 104, name: "Sales Training", code: "SALES" }
};

export const useRepositoryFolders = ({
  page = 1,
  page_size = 10,
  search = "",
  sort_attr = "name",
  sort_dir = "asc",
  folder_id = 1,
  search_type = 1
}) => {
  return useQuery({
    queryKey: ["repositoryFolders", { page, page_size, search, sort_attr, sort_dir, folder_id, search_type }],
    queryFn: async () => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let items = mockFolders[folder_id] || [];
      
      // Apply search if provided
      if (search) {
        items = items.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      // Apply sorting
      items = [...items].sort((a, b) => {
        const valueA = sort_attr === 'name' ? a.name : a.code || '';
        const valueB = sort_attr === 'name' ? b.name : b.code || '';
        
        if (sort_dir === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * page_size;
      const paginatedItems = items.slice(startIndex, startIndex + page_size);
      
      return {
        data: {
          items: paginatedItems,
          total_count: items.length,
          current_page: page,
          current_page_size: page_size,
          total_page_count: Math.ceil(items.length / page_size),
          sort: [
            {
              sort_attr,
              sort_dir
            }
          ]
        },
        extra_data: {
          current_folder: {
            folder_id,
            code: folder_id === 1 ? "IDEO" : undefined,
            name: folder_id === 1 ? "IDEO" : undefined,
            can_manage: true
          },
          parent_folder: folder_id !== 1 ? folderParents[folder_id] : null
        }
      };
    },
    staleTime: 5000,
    retry: 2,
  });
};

export const useAddFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ parentFolderId, name, code }) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a unique ID for the new folder
      const newFolderId = Date.now();
      
      // Add the new folder to our mock data
      const newFolder = {
        folder_id: newFolderId,
        code: code || null,
        name,
        children_count: 0,
        can_manage: true,
        can_manage_all_children: true
      };
      
      // Update mock data
      if (!mockFolders[parentFolderId]) {
        mockFolders[parentFolderId] = [];
      }
      mockFolders[parentFolderId].push(newFolder);
      
      // Set parent relationship
      folderParents[newFolderId] = {
        folder_id: parentFolderId,
        name: parentFolderId === 1 ? "IDEO" : mockFolders[folderParents[parentFolderId].folder_id].find(f => f.folder_id === parentFolderId)?.name,
        code: parentFolderId === 1 ? "IDEO" : mockFolders[folderParents[parentFolderId].folder_id].find(f => f.folder_id === parentFolderId)?.code
      };
      
      return newFolder;
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
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get parent ID
      const parentId = folderParents[folderId]?.folder_id;
      
      if (!parentId) {
        throw new Error("Folder not found");
      }
      
      // Remove folder from mock data
      mockFolders[parentId] = mockFolders[parentId].filter(f => f.folder_id !== folderId);
      
      return { success: true };
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
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get parent ID
      const parentId = folderParents[folderId]?.folder_id;
      
      if (!parentId) {
        throw new Error("Folder not found");
      }
      
      // Update folder in mock data
      const folderIndex = mockFolders[parentId].findIndex(f => f.folder_id === folderId);
      
      if (folderIndex === -1) {
        throw new Error("Folder not found");
      }
      
      mockFolders[parentId][folderIndex] = {
        ...mockFolders[parentId][folderIndex],
        name,
        code: code || null
      };
      
      return mockFolders[parentId][folderIndex];
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