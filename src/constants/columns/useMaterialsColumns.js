import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { generateColumns, generateInitialVisibility } from "@/utils/columnsGenerator";

export const useMaterialsColumns = ({ actionColumn = {} }) => {
  return useQuery({
    queryKey: ["materialsColumns", { actionColumn }],
    queryFn: async () => {
      try {
        // In a real implementation, you might want to fetch the column definitions from an API
        // For now, we'll hardcode them based on the sample data structure
        const columnDefinitions = [
          {
            id: 'name',
            name: 'Name',
            field: 'name',
            type: 'text',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 250,
            flex: 1
          },
          {
            id: 'type',
            name: 'Type',
            field: 'type',
            type: 'text',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 120
          },
          {
            id: 'status',
            name: 'Status',
            field: 'status',
            type: 'text',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 120
          },
          {
            id: 'versions_count',
            name: 'Versions',
            field: 'versions_count',
            type: 'number',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 100
          },
          {
            id: 'assigned_courses_counts.total',
            name: 'Courses',
            field: 'assigned_courses_counts.total',
            type: 'number',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 100
          },
          {
            id: 'created_on',
            name: 'Created On',
            field: 'created_on',
            type: 'date',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 150
          },
          {
            id: 'created_by.fullname',
            name: 'Created By',
            field: 'created_by.fullname',
            type: 'text',
            required: true,
            visible: true,
            sortable: true,
            filterable: true,
            width: 180
          }
        ];

        // Custom cell renderers for specific field types
        const customCellRenderers = {
          'status': (params) => {
            const value = params.value;
            const color = value === 'available' ? 'success' : 'error';
            const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
            
            return {
              type: 'chip',
              value: formattedValue,
              color
            };
          },
          'type': (params) => {
            const typeMap = {
              'scormorg': 'SCORM',
              'document': 'Document',
              'video': 'Video',
              'assessment': 'Assessment'
            };
            
            return {
              type: 'text',
              value: typeMap[params.value] || params.value
            };
          },
          'created_on': (params) => {
            return {
              type: 'date',
              value: params.value
            };
          }
        };

        // Generate columns with the custom renderers
        const columns = generateColumns(columnDefinitions, {
          actionColumn,
          customCellRenderers
        });
        
        // Generate initial visibility state
        const initialVisibility = generateInitialVisibility(columnDefinitions);
        
        return {
          columns,
          initialVisibility
        };
      } catch (error) {
        console.error("Materials Columns Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};