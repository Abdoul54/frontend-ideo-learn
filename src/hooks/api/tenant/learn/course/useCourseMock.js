import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Sample mock course data that matches your API structure
const MOCK_COURSES = [
  {
    id: 18389,
    code: "",
    uidCourse: "E-1KNQ7X",
    title: "RAM-Questionnaire Be the expert",
    type: "elearning",
    language: "fr",
    language_label: "French",
    is_deleted: false,
    course_status: "in_maintenance",
    creation_date: "2025-04-02 15:13:43",
    published: false,
    category_name: "IDEO",
    users_without_session_count: "0",
    decommissioned_at: null,
    removed_at: null,
    last_update: "2025-04-02 15:13:43",
    created_by: "Imad Moudrik",
    field_1: null,
    has_esignature_enabled: false,
    outdated_count: 0,
    imported_from_content_marketplace: false,
    average_completion_time: "0",
    waiting_list: 0,
    enrolled_count: 1,
    slug_name: "ram-questionnaire-be-the-expert",
    actions: ["enroll", "edit", "reports", "delete", "duplicate"],
    description: "This course is a comprehensive training on RAM questionnaires."
  },
  {
    id: 18388,
    code: "AZURA-MHD265",
    uidCourse: "E-1LNXW9",
    title: "Gestion d'une équipe et d'un projet à distance",
    type: "elearning",
    language: "fr",
    language_label: "French",
    is_deleted: false,
    thumbnail: "//cdn5.dcbstatic.com/files/m/u/multi_skills_docebosaas_com/assets/courselogo/original/a02eb64cd662ac6565d768ee332d86e243adec1b.jpeg",
    course_status: "published",
    creation_date: "2025-04-02 11:38:54",
    published: true,
    category_name: "ONEE",
    users_without_session_count: "0",
    decommissioned_at: null,
    removed_at: null,
    last_update: "2025-04-02 11:39:07",
    created_by: "Othmane Maouji",
    field_1: null,
    has_esignature_enabled: false,
    outdated_count: 0,
    imported_from_content_marketplace: false,
    average_completion_time: "0",
    waiting_list: 0,
    enrolled_count: 0,
    slug_name: "gestion-dune-equipe-et-dun-projet-a-distance",
    actions: ["enroll", "edit", "reports", "delete", "duplicate"],
    description: "Learn how to manage teams and projects remotely."
  },
  {
    id: 18387,
    code: "SAFETY-101",
    uidCourse: "E-1MNXC9",
    title: "Workplace Safety Training",
    type: "classroom",
    language: "en",
    language_label: "English",
    is_deleted: false,
    thumbnail: null,
    course_status: "published",
    creation_date: "2025-03-15 09:34:21",
    published: true,
    category_name: "IDEO",
    users_without_session_count: "5",
    decommissioned_at: null,
    removed_at: null,
    last_update: "2025-03-25 14:20:32",
    created_by: "Sarah Johnson",
    field_1: null,
    has_esignature_enabled: true,
    outdated_count: 0,
    imported_from_content_marketplace: false,
    average_completion_time: "120",
    waiting_list: 3,
    enrolled_count: 15,
    slug_name: "workplace-safety-training",
    actions: ["enroll", "edit", "reports", "delete", "duplicate"],
    description: "A comprehensive safety training course for all employees."
  },
  {
    id: 18386,
    code: "CS-INTRO",
    uidCourse: "E-1PQRTX",
    title: "Introduction to Customer Service",
    type: "webinar",
    language: "en",
    language_label: "English",
    is_deleted: false,
    thumbnail: null,
    course_status: "draft",
    creation_date: "2025-03-10 10:12:43",
    published: false,
    category_name: "TAQA",
    users_without_session_count: "0",
    decommissioned_at: null,
    removed_at: null,
    last_update: "2025-03-10 10:12:43",
    created_by: "Michael Thompson",
    field_1: null,
    has_esignature_enabled: false,
    outdated_count: 0,
    imported_from_content_marketplace: true,
    average_completion_time: "45",
    waiting_list: 0,
    enrolled_count: 0,
    slug_name: "introduction-to-customer-service",
    actions: ["edit", "delete", "duplicate"],
    description: "Learn the fundamentals of excellent customer service."
  },
  {
    id: 18385,
    code: "PROJ-MGT",
    uidCourse: "E-1STUVW",
    title: "Project Management Fundamentals",
    type: "blended",
    language: "ar",
    language_label: "Arabic",
    is_deleted: false,
    thumbnail: "//cdn5.dcbstatic.com/files/project-management-course.jpg",
    course_status: "published",
    creation_date: "2025-02-20 13:45:21",
    published: true,
    category_name: "AKWA",
    users_without_session_count: "2",
    decommissioned_at: null,
    removed_at: null,
    last_update: "2025-03-18 09:33:45",
    created_by: "Ahmed Khalid",
    field_1: null,
    has_esignature_enabled: true,
    outdated_count: 0,
    imported_from_content_marketplace: false,
    average_completion_time: "180",
    waiting_list: 0,
    enrolled_count: 22,
    slug_name: "project-management-fundamentals",
    actions: ["enroll", "edit", "reports", "delete", "duplicate"],
    description: "A comprehensive introduction to project management methodologies."
  }
];

// Create additional mock courses for testing pagination
const generateMockCourses = (count) => {
  const mockCourses = [...MOCK_COURSES];
  
  for (let i = 0; i < count - MOCK_COURSES.length; i++) {
    const courseNumber = MOCK_COURSES.length + i + 1;
    
    mockCourses.push({
      id: 18389 + i + 1,
      code: `COURSE-${courseNumber}`,
      uidCourse: `E-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: `Mock Course ${courseNumber}`,
      type: ["elearning", "classroom", "webinar", "blended"][Math.floor(Math.random() * 4)],
      language: ["en", "fr", "ar"][Math.floor(Math.random() * 3)],
      language_label: ["English", "French", "Arabic"][Math.floor(Math.random() * 3)],
      is_deleted: false,
      thumbnail: Math.random() > 0.7 ? "//placeholder.com/150x150" : null,
      course_status: ["published", "draft", "in_maintenance"][Math.floor(Math.random() * 3)],
      creation_date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().replace('T', ' ').slice(0, 19),
      published: Math.random() > 0.5,
      category_name: ["IDEO", "ONEE", "TAQA", "AKWA"][Math.floor(Math.random() * 4)],
      users_without_session_count: Math.floor(Math.random() * 10).toString(),
      decommissioned_at: null,
      removed_at: null,
      last_update: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString().replace('T', ' ').slice(0, 19),
      created_by: ["Imad Moudrik", "Othmane Maouji", "Sarah Johnson", "Michael Thompson", "Ahmed Khalid"][Math.floor(Math.random() * 5)],
      field_1: null,
      has_esignature_enabled: Math.random() > 0.7,
      outdated_count: Math.floor(Math.random() * 5),
      imported_from_content_marketplace: Math.random() > 0.8,
      average_completion_time: (Math.floor(Math.random() * 200)).toString(),
      waiting_list: Math.floor(Math.random() * 5),
      enrolled_count: Math.floor(Math.random() * 30),
      slug_name: `mock-course-${courseNumber}`.toLowerCase(),
      actions: ["enroll", "edit", "reports", "delete", "duplicate"].filter(() => Math.random() > 0.3),
      description: `This is the description for mock course ${courseNumber}.`
    });
  }
  
  return mockCourses;
};

// Generate a total of 30 mock courses
const ALL_MOCK_COURSES = generateMockCourses(30);

// Map of courses by category for filtering
const CATEGORY_COURSE_MAP = {
  1: ALL_MOCK_COURSES, // Root category has all courses
};

// Populate courses by category
ALL_MOCK_COURSES.forEach(course => {
  const categoryName = course.category_name;
  if (!CATEGORY_COURSE_MAP[categoryName]) {
    CATEGORY_COURSE_MAP[categoryName] = [];
  }
  CATEGORY_COURSE_MAP[categoryName].push(course);
});

/**
 * Mock hook to fetch courses for a specific category
 */
export const useCourses = ({
  search_text = "",
  page = 1,
  page_size = 20,
  sort_attr = "creation_date",
  sort_dir = "desc",
  category_id,
  filters = null
}) => {
  return useQuery({
    queryKey: ["courses", { search_text, page, page_size, sort_attr, sort_dir, category_id, filters }],
    queryFn: async () => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get courses
      let filteredCourses = [...ALL_MOCK_COURSES];
      
      // Filter by category if specified
      if (category_id && category_id !== 1) {
        // In a real implementation, you would filter by category_id
        // For mock, we'll use the courses we've assigned to specific categories
        const categoryName = Object.keys(CATEGORY_COURSE_MAP).find(cat => 
          cat.toLowerCase() === `category-${category_id}`.toLowerCase()
        );
        
        if (categoryName && CATEGORY_COURSE_MAP[categoryName]) {
          filteredCourses = CATEGORY_COURSE_MAP[categoryName];
        } else {
          // Filter based on pattern matching - in real implementation this would be precise
          filteredCourses = ALL_MOCK_COURSES.filter(course => 
            course.category_name && course.category_name.includes(category_id.toString())
          );
        }
      }
      
      // Apply search filter
      if (search_text) {
        const searchLower = search_text.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
          (course.title && course.title.toLowerCase().includes(searchLower)) ||
          (course.code && course.code.toLowerCase().includes(searchLower)) ||
          (course.uidCourse && course.uidCourse.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply additional filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            filteredCourses = filteredCourses.filter(course => {
              // Handle nested properties like 'field.subfield'
              if (key.includes('.')) {
                const [field, subfield] = key.split('.');
                return course[field] && course[field][subfield] == value;
              }
              return course[key] == value;
            });
          }
        });
      }
      
      // Apply sorting
      filteredCourses.sort((a, b) => {
        let valueA, valueB;
        
        // Handle nested fields like 'field.subfield'
        if (sort_attr.includes('.')) {
          const path = sort_attr.split('.');
          valueA = path.reduce((obj, key) => obj?.[key], a);
          valueB = path.reduce((obj, key) => obj?.[key], b);
        } else {
          valueA = a[sort_attr];
          valueB = b[sort_attr];
        }
        
        // Properly compare based on value type
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sort_dir === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        } else {
          // For numbers, dates, booleans
          return sort_dir === 'asc' 
            ? (valueA > valueB ? 1 : -1) 
            : (valueA < valueB ? 1 : -1);
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * page_size;
      const endIndex = startIndex + page_size;
      const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
      
      // Calculate pagination info
      const totalPages = Math.ceil(filteredCourses.length / page_size);
      
      return {
        items: paginatedCourses,
        pagination: {
          total: filteredCourses.length,
          per_page: page_size,
          current_page: page,
          last_page: totalPages,
          has_more: page < totalPages
        }
      };
    },
    staleTime: 5000,
    retry: 2,
  });
};

/**
 * Mock hook to get a single course by ID
 */
export const useCourse = (courseId) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const course = ALL_MOCK_COURSES.find(c => c.id === parseInt(courseId));
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course;
    },
    enabled: !!courseId
  });
};

/**
 * Mock hook to create a new course
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a new mock course with a unique ID
      const newId = Math.max(...ALL_MOCK_COURSES.map(c => c.id)) + 1;
      const newUidCourse = `E-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const newCourse = {
        id: newId,
        uidCourse: newUidCourse,
        title: courseData.title,
        code: courseData.code || "",
        type: courseData.type || "elearning",
        language: courseData.language || "en",
        language_label: courseData.language === "fr" ? "French" : courseData.language === "ar" ? "Arabic" : "English",
        is_deleted: false,
        thumbnail: null,
        course_status: courseData.course_status || "in_maintenance",
        creation_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        published: courseData.course_status === "published",
        category_name: "IDEO", // This would come from the category_id in a real implementation
        users_without_session_count: "0",
        decommissioned_at: null,
        removed_at: null,
        last_update: new Date().toISOString().replace("T", " ").slice(0, 19),
        created_by: "Current User",
        field_1: null,
        has_esignature_enabled: courseData.has_esignature_enabled || false,
        outdated_count: 0,
        imported_from_content_marketplace: false,
        average_completion_time: "0",
        waiting_list: 0,
        enrolled_count: 0,
        slug_name: courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        actions: ["edit", "delete", "duplicate"],
        description: courseData.description || ""
      };
      
      // Add the new course to our mock data
      ALL_MOCK_COURSES.unshift(newCourse);
      
      return newCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Course created successfully");
    },
    onError: (error) => {
      console.error("Failed to create course:", error);
      toast.error("Failed to create course");
    }
  });
};

/**
 * Mock hook to update an existing course
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, data }) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the course to update
      const courseIndex = ALL_MOCK_COURSES.findIndex(c => c.id === parseInt(courseId));
      
      if (courseIndex === -1) {
        throw new Error("Course not found");
      }
      
      // Update the course
      const updatedCourse = {
        ...ALL_MOCK_COURSES[courseIndex],
        ...data,
        last_update: new Date().toISOString().replace("T", " ").slice(0, 19),
        published: data.course_status === "published"
      };
      
      // Replace the course in our mock data
      ALL_MOCK_COURSES[courseIndex] = updatedCourse;
      
      return updatedCourse;
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
 * Mock hook to delete a course
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Find the course index
      const courseIndex = ALL_MOCK_COURSES.findIndex(c => c.id === parseInt(courseId));
      
      if (courseIndex === -1) {
        throw new Error("Course not found");
      }
      
      // Remove the course from our mock data
      ALL_MOCK_COURSES.splice(courseIndex, 1);
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    }
  });
};

/**
 * Mock hook to update course status
 */
export const useUpdateCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseIds, status }) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
      
      // Update all specified courses
      ids.forEach(id => {
        const courseIndex = ALL_MOCK_COURSES.findIndex(c => c.id === parseInt(id));
        
        if (courseIndex !== -1) {
          ALL_MOCK_COURSES[courseIndex] = {
            ...ALL_MOCK_COURSES[courseIndex],
            course_status: status,
            published: status === "published",
            last_update: new Date().toISOString().replace("T", " ").slice(0, 19)
          };
        }
      });
      
      return { success: true, updated: ids.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Course status updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update course status:", error);
      toast.error("Failed to update course status");
    }
  });
};

/**
 * Mock hook to move courses to different category
 */
export const useMoveCourses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseIds, targetCategoryId }) => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
      const categoryName = `CATEGORY-${targetCategoryId}`;
      
      // Update the category for all specified courses
      ids.forEach(id => {
        const courseIndex = ALL_MOCK_COURSES.findIndex(c => c.id === parseInt(id));
        
        if (courseIndex !== -1) {
          ALL_MOCK_COURSES[courseIndex] = {
            ...ALL_MOCK_COURSES[courseIndex],
            category_name: categoryName,
            last_update: new Date().toISOString().replace("T", " ").slice(0, 19)
          };
        }
      });
      
      return { success: true, moved: ids.length };
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