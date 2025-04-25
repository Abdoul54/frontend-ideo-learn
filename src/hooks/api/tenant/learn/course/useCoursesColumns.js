import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { Box } from "@mui/material";
import { generateColumns, generateInitialVisibility } from "@/utils/columnsGenerator";
import { mockGetCourseColumns } from "./useCoursesColumnsMock";
import React from "react";
import OptionMenu from "@/@core/components/option-menu";

/**
 * Custom cell renderers for course-specific fields
 */
const customCellRenderers = {
  // Status renderer with colored badge
  status: ({ row }) => {
    const status = row.original.status;
    let color = "primary";
    let label = status;

    if (status === "published") {
      color = "success";
      label = "Published";
    } else if (status === "unpublished" || status === "draft") {
      color = "warning";
      label = status === "unpublished" ? "Unpublished" : "Draft";
    } else if (status === "archived") {
      color = "secondary";
      label = "Archived";
    }

    return (
      <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        bgcolor: `${color}.lighter`,
        color: `${color}.main`,
        fontSize: '0.75rem',
        fontWeight: 600
      }}>
        {label}
      </Box>
    );
  },

  code: ({ row }) => {
    const code = row.original.code;
    return (
      <Box
        sx={{
          cursor: 'pointer',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
        component="a"
        href={`/learn/course/edit/${row.original.id}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {code}
      </Box>
    );
  },

  // Course type renderer
  course_type: ({ row }) => {
    const type = row.original.course_type;
    let icon = null;
    let label = type;

    if (type === "elearning") {
      icon = <i className="solar-smartphone-bold-duotone" style={{ marginRight: '4px' }} />;
      label = "E-Learning";
    } else if (type === "classroom") {
      icon = <i className="solar-buildings-2-bold-duotone" style={{ marginRight: '4px' }} />;
      label = "Classroom";
    } else if (type === "webinar") {
      icon = <i className="solar-monitor-bold-duotone" style={{ marginRight: '4px' }} />;
      label = "Webinar";
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        {label}
      </Box>
    );
  },

  // Duration formatter
  duration_hours: ({ row }) => {
    const hours = row.original.duration_hours || 0;
    const minutes = row.original.duration_minutes || 0;

    if (hours === 0 && minutes === 0) return "-";

    let result = [];
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}m`);

    return result.join(" ");
  }
};

/**
 * Action column definition for course actions
 */
export const courseActionColumn = (onDelete, onEdit) => ({
  id: 'actions',
  header: '',
  cell: ({ row }) => (
    <OptionMenu
      options={[
        {
          text: 'Edit',
          icon: <i className="solar-pen-2-linear" />,
          menuItemProps: {
            onClick: (e) => {
              e.stopPropagation();
              onEdit(row.original);
            },
            className: 'flex items-center gap-2',
          },
        },
        {
          text: 'Delete',
          icon: <i className="solar-trash-bin-trash-linear" />,
          menuItemProps: {
            onClick: (e) => {
              e.stopPropagation();
              onDelete(row.original);
            },
            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
          },
        }
      ]}
    />
  ),
  enableSorting: false,
  flex: 0.1,
});

/**
 * Hook to fetch course columns from the API
 */
export const useCoursesColumns = ({ actionColumn = {} }) => {
  const USE_MOCK_DATA = true; // Set to false when API is available again

  const lockedColumns = ['course_type'];

  return useQuery({
    queryKey: ["coursesColumns", { actionColumn }],
    queryFn: async () => {
      try {
        let response;

        if (USE_MOCK_DATA) {
          // Use mock data service
          response = await mockGetCourseColumns();
        } else {
          // Use real API when it becomes available again
          const apiResponse = await axiosInstance.get("/tenant/taallum/v1/courses/importer_fields");
          response = apiResponse.data;
        }

        if (!response?.success) {
          throw new Error("Invalid response structure");
        }

        const initialVisibility = generateInitialVisibility(response?.data, 8, lockedColumns);
        const columns = generateColumns(response?.data, {
          actionColumn,
          customCellRenderers,
          lockedColumns,
        });

        console.log("Course Columns:", columns);

        return {
          columns,
          initialVisibility,
        };
      } catch (error) {
        console.error("Courses Columns Fetch Error:", error.message);
        throw error;
      }
    },
    staleTime: 5000,
    retry: 2,
  });
};