import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Import mock materials data from the other mock hook
// In a real implementation, you'd use a shared store, but for simplicity we'll reference it directly
import { mockMaterialsByFolder } from './useRepositoryMaterialsMock';

export const useAddMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ folderId, ...materialData }) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a unique ID for the new material
      const newMaterialId = Date.now();
      
      // Create the new material with defaults for missing fields
      const newMaterial = {
        material_id: newMaterialId,
        type: materialData.type || 'scormorg',
        status: materialData.status || 'available',
        code: materialData.code || null,
        name: materialData.name,
        thumbnail_url: null,
        versions_count: 1,
        assigned_courses_counts: {
          total: 0,
          esignature: 0
        },
        created_on: new Date().toISOString().replace('T', ' ').substring(0, 19),
        created_by: {
          id: 44001,
          fullname: "Current User"
        },
        updated_on: null,
        updated_by: null,
        csp: null
      };
      
      // Add to the mock data
      if (!mockMaterialsByFolder[folderId]) {
        mockMaterialsByFolder[folderId] = [];
      }
      
      mockMaterialsByFolder[folderId].push(newMaterial);
      
      return newMaterial;
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
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the material in our mock data
      let foundMaterial = null;
      let foundFolderId = null;
      
      for (const folderId in mockMaterialsByFolder) {
        const index = mockMaterialsByFolder[folderId].findIndex(m => m.material_id === materialId);
        if (index !== -1) {
          foundMaterial = mockMaterialsByFolder[folderId][index];
          foundFolderId = folderId;
          
          // Update the material
          mockMaterialsByFolder[folderId][index] = {
            ...foundMaterial,
            ...updateData,
            updated_on: new Date().toISOString().replace('T', ' ').substring(0, 19),
            updated_by: {
              id: 44001,
              fullname: "Current User"
            }
          };
          
          // Get the updated material
          foundMaterial = mockMaterialsByFolder[folderId][index];
          break;
        }
      }
      
      if (!foundMaterial) {
        throw new Error("Material not found");
      }
      
      return foundMaterial;
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
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find and remove the material from our mock data
      let found = false;
      
      for (const folderId in mockMaterialsByFolder) {
        const initialLength = mockMaterialsByFolder[folderId].length;
        mockMaterialsByFolder[folderId] = mockMaterialsByFolder[folderId].filter(m => m.material_id !== materialId);
        
        if (mockMaterialsByFolder[folderId].length < initialLength) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error("Material not found");
      }
      
      return { success: true };
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
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Handle array of IDs or single ID
      const ids = Array.isArray(materialIds) ? materialIds : [materialIds];
      const updatedMaterials = [];
      
      // Update each material
      for (const materialId of ids) {
        let found = false;
        
        for (const folderId in mockMaterialsByFolder) {
          const materialIndex = mockMaterialsByFolder[folderId].findIndex(m => m.material_id === materialId);
          
          if (materialIndex !== -1) {
            // Update status
            mockMaterialsByFolder[folderId][materialIndex] = {
              ...mockMaterialsByFolder[folderId][materialIndex],
              status,
              updated_on: new Date().toISOString().replace('T', ' ').substring(0, 19),
              updated_by: {
                id: 44001,
                fullname: "Current User"
              }
            };
            
            updatedMaterials.push(mockMaterialsByFolder[folderId][materialIndex]);
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new Error(`Material with ID ${materialId} not found`);
        }
      }
      
      return updatedMaterials;
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
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Validate target folder exists
      if (!mockMaterialsByFolder[targetFolderId]) {
        mockMaterialsByFolder[targetFolderId] = [];
      }
      
      const movedMaterials = [];
      
      // Move each material
      for (const materialId of materialIds) {
        let found = false;
        let material = null;
        
        // Find the material in the source folder
        for (const folderId in mockMaterialsByFolder) {
          if (folderId === targetFolderId.toString()) continue; // Skip if same folder
          
          const index = mockMaterialsByFolder[folderId].findIndex(m => m.material_id === materialId);
          
          if (index !== -1) {
            // Remove from source folder
            material = mockMaterialsByFolder[folderId][index];
            mockMaterialsByFolder[folderId].splice(index, 1);
            found = true;
            break;
          }
        }
        
        if (!found || !material) {
          throw new Error(`Material with ID ${materialId} not found`);
        }
        
        // Add to target folder
        const updatedMaterial = {
          ...material,
          updated_on: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updated_by: {
            id: 44001,
            fullname: "Current User"
          }
        };
        
        mockMaterialsByFolder[targetFolderId].push(updatedMaterial);
        movedMaterials.push(updatedMaterial);
      }
      
      return movedMaterials;
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