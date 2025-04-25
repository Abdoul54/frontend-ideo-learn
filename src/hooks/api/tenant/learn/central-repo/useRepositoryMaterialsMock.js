import { useQuery } from "@tanstack/react-query";

// Mock materials data by folder ID
const mockMaterialsByFolder = {
  1: [ // IDEO root folder
    {
      material_id: 2001,
      type: "scormorg",
      status: "available",
      code: "CORP-001",
      name: "Corporate Overview",
      thumbnail_url: null,
      versions_count: 2,
      assigned_courses_counts: {
        total: 5,
        esignature: 1
      },
      created_on: "2024-02-10 09:30:00",
      created_by: {
        id: 44001,
        fullname: "Admin User"
      },
      updated_on: "2024-03-15 14:22:10",
      updated_by: {
        id: 44001,
        fullname: "Admin User"
      },
      csp: null
    },
    {
      material_id: 2002,
      type: "document",
      status: "available",
      code: "POL-001",
      name: "Company Policies",
      thumbnail_url: null,
      versions_count: 1,
      assigned_courses_counts: {
        total: 3,
        esignature: 3
      },
      created_on: "2024-02-15 11:20:45",
      created_by: {
        id: 44002,
        fullname: "Content Manager"
      },
      updated_on: null,
      updated_by: null,
      csp: null
    }
  ],
  101: [ // Training Materials folder
    {
      material_id: 2101,
      type: "scormorg",
      status: "available",
      code: "TRN-001",
      name: "Introduction to Project Management",
      thumbnail_url: null,
      versions_count: 3,
      assigned_courses_counts: {
        total: 8,
        esignature: 0
      },
      created_on: "2024-01-05 08:45:22",
      created_by: {
        id: 44003,
        fullname: "Training Developer"
      },
      updated_on: "2024-03-20 15:10:40",
      updated_by: {
        id: 44003,
        fullname: "Training Developer"
      },
      csp: null
    },
    {
      material_id: 2102,
      type: "video",
      status: "available",
      code: "TRN-002",
      name: "Communication Skills Workshop",
      thumbnail_url: null,
      versions_count: 1,
      assigned_courses_counts: {
        total: 6,
        esignature: 0
      },
      created_on: "2024-01-10 13:25:30",
      created_by: {
        id: 44003,
        fullname: "Training Developer"
      },
      updated_on: null,
      updated_by: null,
      csp: null
    },
    {
      material_id: 2103,
      type: "assessment",
      status: "available",
      code: "TRN-003",
      name: "Leadership Skills Assessment",
      thumbnail_url: null,
      versions_count: 2,
      assigned_courses_counts: {
        total: 4,
        esignature: 0
      },
      created_on: "2024-01-15 09:12:45",
      created_by: {
        id: 44003,
        fullname: "Training Developer"
      },
      updated_on: "2024-02-28 11:40:20",
      updated_by: {
        id: 44002,
        fullname: "Content Manager"
      },
      csp: null
    }
  ],
  102: [ // Onboarding Resources folder
    {
      material_id: 2201,
      type: "scormorg",
      status: "available",
      code: "ONB-001",
      name: "Welcome to the Company",
      thumbnail_url: null,
      versions_count: 1,
      assigned_courses_counts: {
        total: 10,
        esignature: 10
      },
      created_on: "2024-02-01 10:30:00",
      created_by: {
        id: 44002,
        fullname: "Content Manager"
      },
      updated_on: null,
      updated_by: null,
      csp: null
    },
    {
      material_id: 2202,
      type: "document",
      status: "available",
      code: "ONB-002",
      name: "Employee Handbook",
      thumbnail_url: null,
      versions_count: 2,
      assigned_courses_counts: {
        total: 10,
        esignature: 10
      },
      created_on: "2024-02-01 11:45:15",
      created_by: {
        id: 44001,
        fullname: "Admin User"
      },
      updated_on: "2024-03-10 09:20:35",
      updated_by: {
        id: 44001,
        fullname: "Admin User"
      },
      csp: null
    },
    {
      material_id: 2203,
      type: "video",
      status: "unavailable",
      code: "ONB-003",
      name: "CEO Welcome Message",
      thumbnail_url: null,
      versions_count: 1,
      assigned_courses_counts: {
        total: 0,
        esignature: 0
      },
      created_on: "2024-02-05 14:20:10",
      created_by: {
        id: 44002,
        fullname: "Content Manager"
      },
      updated_on: null,
      updated_by: null,
      csp: null
    }
  ],
  103: [ // Compliance Courses folder
    {
      material_id: 2301,
      type: "scormorg",
      status: "available",
      code: "CPL-001",
      name: "Data Privacy Compliance",
      thumbnail_url: null,
      versions_count: 2,
      assigned_courses_counts: {
        total: 15,
        esignature: 15
      },
      created_on: "2024-01-20 08:30:45",
      created_by: {
        id: 44004,
        fullname: "Compliance Officer"
      },
      updated_on: "2024-03-05 10:15:30",
      updated_by: {
        id: 44004,
        fullname: "Compliance Officer"
      },
      csp: null
    },
    {
      material_id: 2302,
      type: "assessment",
      status: "available",
      code: "CPL-002",
      name: "Cybersecurity Best Practices",
      thumbnail_url: null,
      versions_count: 1,
      assigned_courses_counts: {
        total: 15,
        esignature: 0
      },
      created_on: "2024-01-25 13:45:20",
      created_by: {
        id: 44004,
        fullname: "Compliance Officer"
      },
      updated_on: null,
      updated_by: null,
      csp: null
    }
  ],
  104: [ // Sales Training folder
    {
      material_id: 2401,
      type: "scormorg",
      status: "available",
      code: "SLS-001",
      name: "Sales Techniques 101",
      thumbnail_url: null,
      versions_count: 3,
      assigned_courses_counts: {
        total: 7,
        esignature: 0
      },
      created_on: "2024-02-20 09:10:30",
      created_by: {
        id: 44005,
        fullname: "Sales Manager"
      },
      updated_on: "2024-03-18 15:30:45",
      updated_by: {
        id: 44005,
        fullname: "Sales Manager"
      },
      csp: null
    },
    {
      material_id: 2402,
      type: "video",
      status: "available",
      code: "SLS-002",
      name: "Customer Objection Handling",
      thumbnail_url: null,
      versions_count: 1,
      assigned_courses_counts: {
        total: 7,
        esignature: 0
      },
      created_on: "2024-02-22 14:25:15",
      created_by: {
        id: 44005,
        fullname: "Sales Manager"
      },
      updated_on: null,
      updated_by: null,
      csp: null
    }
  ]
};

// Default empty arrays for folders without defined materials
for (const folderId of [1011, 1012, 1013, 1021, 1022, 1041]) {
  mockMaterialsByFolder[folderId] = [];
}

export const useRepositoryMaterials = ({
  search_text = "",
  page = 1,
  page_size = 15,
  sort_attr = "created_on",
  sort_dir = "desc",
  folder_id = 1,
  filters = null
}) => {
  return useQuery({
    queryKey: ["repositoryMaterials", { search_text, page, page_size, sort_attr, sort_dir, folder_id, filters }],
    queryFn: async () => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 700));
      
      let items = mockMaterialsByFolder[folder_id] || [];
      
      // Apply search if provided
      if (search_text) {
        items = items.filter(item => 
          item.name.toLowerCase().includes(search_text.toLowerCase()) ||
          (item.code && item.code.toLowerCase().includes(search_text.toLowerCase()))
        );
      }
      
      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          items = items.filter(item => item.status === filters.status);
        }
        if (filters.type) {
          items = items.filter(item => item.type === filters.type);
        }
      }
      
      // Apply sorting
      items = [...items].sort((a, b) => {
        let valueA, valueB;
        
        // Handle nested fields like assigned_courses_counts.total
        if (sort_attr.includes('.')) {
          const parts = sort_attr.split('.');
          valueA = parts.reduce((obj, key) => obj?.[key], a);
          valueB = parts.reduce((obj, key) => obj?.[key], b);
        } else {
          valueA = a[sort_attr];
          valueB = b[sort_attr];
        }
        
        // Handle different data types
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sort_dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        } else {
          return sort_dir === 'asc' ? (valueA - valueB) : (valueB - valueA);
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * page_size;
      const paginatedItems = items.slice(startIndex, startIndex + page_size);
      
      return {
        data: {
          items: paginatedItems,
          count: items.length,
          has_more_data: startIndex + page_size < items.length,
          current_page: page,
          current_page_size: page_size,
          total_page_count: Math.ceil(items.length / page_size),
          total_count: items.length,
          sort: [
            {
              sort_attr,
              sort_dir
            }
          ]
        }
      };
    },
    staleTime: 5000,
    retry: 2,
  });
};

export const useGetMaterial = (materialId, options = {}) => {
  return useQuery({
    queryKey: ["material", materialId],
    queryFn: async () => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the material in our mock data
      let material = null;
      
      for (const folderId in mockMaterialsByFolder) {
        const found = mockMaterialsByFolder[folderId].find(m => m.material_id === materialId);
        if (found) {
          material = found;
          break;
        }
      }
      
      if (!material) {
        throw new Error("Material not found");
      }
      
      return {
        data: material
      };
    },
    ...options,
    enabled: !!materialId && (options.enabled !== false)
  });
};