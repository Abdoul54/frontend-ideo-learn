'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// Core components
import DataView from "@/views/DataView";
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { Switch, FormControlLabel } from '@mui/material';
import OptionMenu from '@/@core/components/option-menu';
import DataTableNavigationEnhanced from '@/components/datatable/DataTableNavigationEnhanced';
import DeleteConfirmationDialog from '@/views/Dialogs/DeleteConfirmation';

// Hooks
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation';
import { useCategories, useDeleteCategory } from '@/hooks/api/tenant/learn/course/useCategories';

import { useCourses, useDeleteCourse, useUpdateCourseStatus } from '@/hooks/api/tenant/learn/course/useCourse';
import { courseActionColumn, useCoursesColumns } from '@/hooks/api/tenant/learn/course/useCoursesColumns';

// Drawer components - import after hooks to avoid circular dependencies
import AddCategoryDrawer from '@/views/Drawers/Learn/course/AddCategoryDrawer';
import EditCategoryDrawer from '@/views/Drawers/Learn/course/EditCategoryDrawer';
import AddCourseDrawer from '@/views/Drawers/Learn/course/AddCourseDrawer';
import EditCourseDrawer from '@/views/Drawers/Learn/course/EditCourseDrawer';
import MoveCoursesDrawer from '@/views/Drawers/Learn/course/MoveCoursesDrawer';
import { findRootCategory } from '@/utils/categoryUtils';
import EnrollUserDrawer from '@/views/Drawers/Learn/Enroll/EnrollUserDrawer';
import { useTranslation } from '@/@core/contexts/translationContext';

const CourseManagementPage = () => {
  // State management
  const [filters, setFilters] = useState(null);
  const [categoriesPagination, setCategoriesPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [coursesPagination, setCoursesPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [coursesSearchQuery, setCoursesSearchQuery] = useState("");
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rootCategory, setRootCategory] = useState();
  const [showDescendants, setShowDescendants] = useState(true);

  // Drawer states
  const [addCategoryDrawerOpen, setAddCategoryDrawerOpen] = useState(false);
  const [editCategoryDrawerOpen, setEditCategoryDrawerOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [addCourseDrawerOpen, setAddCourseDrawerOpen] = useState(false);
  const [editCourseDrawerOpen, setEditCourseDrawerOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [moveCoursesDrawerOpen, setMoveCoursesDrawerOpen] = useState(false);
  const [initialHistoryForDrawer, setInitialHistoryForDrawer] = useState([]);

  const [bulkEnrollDrawerOpen, setBulkEnrollDrawerOpen] = useState(false);

  const { translate, language } = useTranslation();

  // Dialog states
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState({
    open: false,
    categoryId: null,
    categoryTitle: ''
  });

  const [deleteCourseDialog, setDeleteCourseDialog] = useState({
    open: false,
    courseIds: [],
    isMultiple: false
  });

  // Search and other settings
  const [searchType, setSearchType] = useState(1);

  const router = useRouter();

  const handleShowDescendantsChange = (event) => {
    const newValue = event.target.checked;
    console.log(`Show descendants changed to: ${newValue}`);
    setShowDescendants(newValue);
  };

  // Navigation history management
  const {
    history: navigationHistory,
    currentItem: currentCategory,
    goForward,
    goBack,
    goToBreadcrumb,
    setCurrentItem,  // Make sure to destructure these functions
    setHistory       // from the useHistoryNavigation hook
  } = useHistoryNavigation(
    null,
    (newItem, direction) => {
      // Reset pagination when navigation changes
      setCategoriesPagination(prev => ({ ...prev, pageIndex: 0 }));
      setCoursesPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  );

  const buildExtraFilters = useCallback((categoryId, includeDescendants) => {
    // Make sure we have a valid category ID
    if (!categoryId) return null;

    console.log(`Building extra filters for category: ${categoryId}, include descendants: ${includeDescendants}`);

    return {
      category: {
        criteria: "in_array",
        value: [
          {
            id: categoryId,
            include_descendants: includeDescendants
          }
        ]
      }
    };
  }, []);

  const courseExtraFilters = useMemo(() => {
    // Only if we have a valid category, create filters
    if (!currentCategory?.id) {
      console.log('No current category, not creating filters');
      return null;
    }

    const filters = buildExtraFilters(currentCategory.id, showDescendants);
    console.log('Created extra filters:', filters);
    return filters;
  }, [buildExtraFilters, currentCategory, showDescendants]);

  // API mutations - moved up before they are used
  const deleteCategoryMutation = useDeleteCategory();
  const deleteCourseMutation = useDeleteCourse();
  const updateCourseStatusMutation = useUpdateCourseStatus();

  // Fetch categories data
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({
    page: categoriesPagination.pageIndex + 1,
    page_size: categoriesPagination.pageSize,
    search: categoriesSearchQuery,
    sort_attr: 'title',
    sort_dir: 'asc',
    category_id: currentCategory?.id,
    search_type: searchType,
    lang: language,
  });

  // Fetch courses data for the selected category
  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    error: coursesError,
    refetch: refetchCourses // Add refetch function
  } = useCourses({
    search_text: coursesSearchQuery || '',
    page: coursesPagination.pageIndex + 1,
    page_size: coursesPagination.pageSize,
    sort_attr: sorting[0]?.id || 'name',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    category_id: currentCategory?.id,
    extra_filters: courseExtraFilters, // Make sure this is included
    filters
  });

  useEffect(() => {
    // We need to refetch any time the category changes OR when the showDescendants changes
    if (currentCategory?.id && refetchCourses) {
      console.log(`Refetching courses for category ${currentCategory.id} with showDescendants=${showDescendants}`);
      refetchCourses();
    }
  }, [currentCategory?.id, showDescendants, refetchCourses]);

  // Update root category from API response using is_root flag
  useEffect(() => {
    if (categoriesData) {
      // Use our utility function to find the root category
      const foundRoot = findRootCategory(categoriesData);

      if (foundRoot) {
        console.log('Root Category found:', foundRoot.title);

        // Update the root category state
        setRootCategory(foundRoot);

        // Initialize navigation if it hasn't been set yet
        if (!currentCategory) {
          setCurrentItem(foundRoot);
          setHistory([foundRoot]);
        }
      }
    }
  }, [categoriesData, currentCategory, setCurrentItem, setHistory]);

  useEffect(() => {
    // Only reset pagination when the current category changes
    setCoursesPagination(prev => ({ ...prev, pageIndex: 0 }));

    // Log the current category for debugging
    console.log('Current category changed:', currentCategory?.id);
    console.log('Maintaining showDescendants state:', showDescendants);

    // Don't reset the showDescendants state - it will persist until manually changed
  }, [currentCategory?.id]);

  // Handler for search type change
  const handleSearchTypeChange = useCallback((newSearchType) => {
    setSearchType(newSearchType);
    // Reset pagination when search type changes
    setCategoriesPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Transform Categories API response for navigation
  const transformedCategoriesData = useMemo(() => {
    let items = [];
    let total = 0;
    let parent = null;

    if (categoriesData) {
      items = categoriesData.data?.items || [];
      total = categoriesData.data?.pagination?.total || 0;
      parent = categoriesData.data?.extra_data || null;
    }

    return {
      items,
      total,
      parent
    };
  }, [categoriesData]);

  // Transform Courses API response for the table
  const transformedCoursesData = useMemo(() => ({
    items: coursesData?.items?.map(item => ({
      ...item,
      id: item.id
    })) || [],
    total: coursesData?.pagination?.total || 0,
    current_page: coursesData?.pagination?.current_page || 1,
    per_page: coursesData?.pagination?.per_page || 10,
  }), [coursesData]);

  // Navigation handlers
  const handleNavigateForward = useCallback((id, title) => {
    goForward({
      id,
      title
    });
    setCategoriesPagination(prev => ({ ...prev, pageIndex: 0 }));
    setCoursesPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [goForward]);

  const handleNavigateBack = useCallback(() => {
    goBack();
    setCategoriesPagination(prev => ({ ...prev, pageIndex: 0 }));
    setCoursesPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [goBack]);

  // Category action handlers
  const handleDeleteCategory = (category) => {
    // Check if the category has children
    if (category.has_child) {
      toast.error("Cannot delete a category that has subcategories");
      return;
    }

    setDeleteCategoryDialog({
      open: true,
      categoryId: category.id,
      categoryTitle: category.title
    });
  };

  const handleEditCategory = (category) => {
    setSelectedCategoryId(category.id);
    setEditCategoryDrawerOpen(true);
  };

  // Improved function to handle adding a subcategory
  const handleAddSubCategory = (category) => {
    // Set the parent category ID
    setSelectedCategoryId(category.id);

    // Build the navigation history up to the selected category
    // Create a simpler history with just the current category
    // This avoids the circular reference issues that can occur
    const historyToUse = [
      rootCategory ? { ...rootCategory } : null,
      { id: category.id, title: category.title }
    ].filter(Boolean);

    // Set the history for the drawer
    setInitialHistoryForDrawer(historyToUse);

    // Open the drawer
    setAddCategoryDrawerOpen(true);
  };

  // Course action handlers
  const handleDeleteCourse = (course) => {
    setDeleteCourseDialog({
      open: true,
      courseIds: [course.id],
      isMultiple: false
    });
  };

  const handleDeleteSelectedCourses = (courses) => {
    setDeleteCourseDialog({
      open: true,
      courseIds: courses.map(course => course.id),
      isMultiple: true
    });
  };

  const handleEditCourse = (course) => {
    router.push(`/learn/course/edit/${course.id}`);
  };

  const enrollCourses = (courses) => {
    if (courses.length === 0) {
      toast.error("Please select at least one course for enrollment");
      return;
    }

    setSelectedRows(courses);
    setBulkEnrollDrawerOpen(true);
  };

  const descendantsSwitch = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 2,
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="body2" color="text.secondary" mr={1}>
        {translate('Course management.TOGGLE_INCLUDE_DESCENDANTS', 'Include Descendants')}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={showDescendants}
            onChange={handleShowDescendantsChange}
            color="primary"
          />
        }
        label=""
      />
    </Box>
  );

  // Define custom action groups for courses
  const actionGroups = [
    // Status actions
    [
      {
        id: 'status',
        label: translate('Course management.FIELD_STATUS', 'Status'),
        icon: <i className='solar-check-square-bold-duotone' size={18} />,
        subMenu: [
          {
            id: 'set-published',
            label: translate('Course management.DROPDOWN_STATUS_PUBLISHED', 'Set Published'),
            icon: <i className='solar-check-circle-bold-duotone' size={18} />,
            handler: (rows) => {
              const courseIds = rows.map(row => row.id);
              updateCourseStatusMutation.mutate({ courseIds, status: 'published' });
            }
          },
          {
            id: 'set-unpublished',
            label: translate('Course management.DROPDOWN_STATUS_UNPUBLISHED', 'Set unpublished'),
            icon: <i className='solar-archive-bold-duotone' size={18} />,
            handler: (rows) => {
              const courseIds = rows.map(row => row.id);
              updateCourseStatusMutation.mutate({ courseIds, status: 'unpublished' });
            }
          }
        ]
      },
      // {
      //   id: 'move-courses',
      //   label: 'Move to Category',
      //   icon: <i className="solar-move-to-folder-bold-duotone" size={18} />,
      //   handler: (rows) => {
      //     setSelectedRows(rows);
      //     setMoveCoursesDrawerOpen(true);
      //   },
      // },
    ],
    // Delete action
    [
      {
        id: 'delete-selected',
        label: translate('common.delete', 'Delete'),
        icon: <i className="solar-trash-bin-2-bold-duotone" size={18} />,
        handler: (rows) => {
          handleDeleteSelectedCourses(rows);
        },
        disabled: selectedRows.length === 0,
      },
    ],
    // Enroll action
    [
      {
        id: 'enroll-selected',
        label: translate('Course management.BUTTON_ENROLL_USERS', 'Enroll users'),
        icon: <i className="solar-user-plus-bold-duotone" size={18} />,
        handler: (rows) => {
          if (rows.length > 0) {
            enrollCourses(rows);
          } else {
            toast.error("Please select at least one course for enrollment");
          }
        },
        disabled: selectedRows.length === 0,
      },
    ]
  ];

  // Button actions for toolbar
  const actionItems = [
    [
      {
        id: 'add-course',
        label: translate('Course management.MENU_ADD_COURSE', 'Add Course'),
        icon: <i className="solar-document-add-bold-duotone" />,
        handler: () => setAddCourseDrawerOpen(true),
      },
      {
        id: 'add-category',
        label: translate('Course management.MENU_ADD_CATGORY', 'Add Category'),
        icon: <i className="solar-add-folder-bold-duotone" />,
        handler: () => setAddCategoryDrawerOpen(true),
      },
    ],
  ];

  const actionEnroll = [
    [
      {
        id: 'enroll-selected',
        label: translate('Course management.BUTTON_ENROLL_USERS', 'Enroll users'),
        icon: <i className="solar-user-plus-bold-duotone" />,
        handler: (rows) => {
          if (rows.length > 0) {
            enrollCourses(rows);
          } else {
            toast.error("Please select at least one course for enrollment");
          }
        },
        disabled: selectedRows.length === 0,
      },
    ],
  ];

  // Navigation data
  const navigationData = useMemo(() =>
    Array.isArray(transformedCategoriesData.items) ? transformedCategoriesData.items : []
    , [transformedCategoriesData.items]);

  // Fetch course columns with better error handling
  const {
    data: columnsData,
    isLoading: isColumnsLoading,
    error: columnsError,
    isSuccess: isColumnsSuccess
  } = useCoursesColumns({
    actionColumn: courseActionColumn(handleDeleteCourse, handleEditCourse)
  });

  // Use memo for columns to ensure stability
  // const columns = useMemo(() => {
  //   if (isColumnsSuccess && columnsData?.columns && Array.isArray(columnsData.columns)) {
  //     // Ensure all columns have required properties
  //     return columnsData.columns.map(col => ({
  //       ...col,
  //       id: col.id || `col-${Math.random().toString(36).substring(2, 9)}`,
  //       header: col.header || col.name || 'Column',
  //       accessorKey: col.accessorKey || col.field || col.id
  //     }));
  //   }
  //   return [];
  // }, [isColumnsSuccess, columnsData]);

  // Initialize column visibility when data loads
  useEffect(() => {
    if (columnsData?.initialVisibility) {
      setColumnVisibility(columnsData.initialVisibility);
    }
  }, [columnsData?.initialVisibility]);

  // For replacing the DataTableNavigation with our enhanced version
  const CustomDataTableNavigation = useCallback(props => (
    <DataTableNavigationEnhanced
      {...props}
      idField="id"
      titleField="title"
      hasChildrenField="has_child"
      onEditItem={handleEditCategory}
      onAddItem={handleAddSubCategory}
      onDeleteItem={handleDeleteCategory}
    />
  ), []);

  // Don't render the DataView until columns are loaded
  if (isColumnsLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <Typography variant="h6">Loading course management...</Typography>
      </Box>
    );
  }

  // Show error message if columns failed to load
  if (columnsError) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <Typography variant="h6" color="error">
          Error loading course management. Please refresh the page.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <DataView
        title={translate('Course management.BREADCRUMB_COURSE_MANAGEMENT', 'Course Management')}
        columns={columnsData?.columns || []}
        isColumnsLoading={isColumnsLoading}
        columnsError={columnsError}
        pagination={{
          pageIndex: coursesPagination.pageIndex,
          pageSize: coursesPagination.pageSize,
          total: transformedCoursesData.total
        }}
        setPagination={setCoursesPagination}
        data={transformedCoursesData.items}
        isLoading={isCoursesLoading}
        error={coursesError}
        getRowId={(row) => row.id}
        initialNavigationOpen={true}
        navigation={{
          DataTableNavigation: CustomDataTableNavigation,
          data: navigationData,
          currentItem: currentCategory,
          GoBack: handleNavigateBack,
          GoForward: handleNavigateForward,
          searchQuery: categoriesSearchQuery,
          onSearchChange: (e) => setCategoriesSearchQuery(e.target.value),
          searchType: searchType,
          onSearchTypeChange: handleSearchTypeChange,
          enableSearchType: true,
          isLoading: isCategoriesLoading,
          pagination: {
            count: transformedCategoriesData.total,
            page: categoriesPagination.pageIndex,
            rowsPerPage: categoriesPagination.pageSize,
            onPageChange: (newPage) => {
              setCategoriesPagination(prev => ({ ...prev, pageIndex: newPage }));
            },
            onRowsPerPageChange: (newRowsPerPage) => {
              setCategoriesPagination({ pageIndex: 0, pageSize: newRowsPerPage });
            }
          },
          parent: transformedCategoriesData.parent,
          footerComponent: descendantsSwitch,
        }}
        toolbar={{
          buttonGroup: [
            {
              component: (
                <OptionMenu
                  menuProps={{
                    elevation: 2,
                    sx: { '& .MuiMenu-paper': { minWidth: 200 } }
                  }}
                  iconButtonProps={{ color: 'primary' }}
                  icon={<i className="lucide-plus" />}
                  options={actionItems.flatMap((group, groupIndex) => [
                    ...(groupIndex > 0 ? [{ divider: true }] : []),
                    ...group.map(action => ({
                      text: action.label,
                      icon: action.icon,
                      menuItemProps: {
                        onClick: () => action.handler(),
                        sx: { py: 1.5 }
                      }
                    }))
                  ])}
                />
              ),
              tooltip: "Add options",
            },
            {
              component: (
                <OptionMenu
                  menuProps={{
                    elevation: 2,
                    sx: { '& .MuiMenu-paper': { minWidth: 200 } }
                  }}
                  iconButtonProps={{ color: 'primary' }}
                  icon={<i className="solar-menu-dots-bold" />}
                  options={actionEnroll.flatMap((group, groupIndex) => [
                    ...(groupIndex > 0 ? [{ divider: true }] : []),
                    ...group.map(action => ({
                      text: action.label,
                      icon: action.icon,
                      menuItemProps: {
                        onClick: () => action.handler(selectedRows),
                        disabled: action.disabled,
                        sx: { py: 1.5 }
                      }
                    }))
                  ])}
                />
              ),
              tooltip: "More options",
            }
          ]
        }}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        slots={{
          filters,
          setFilters,
          globalFilter: coursesSearchQuery,
          setGlobalFilter: setCoursesSearchQuery,
          sorting,
          setSorting,
          columnVisibility,
          setColumnVisibility,
          features: {
            search: true,
            filter: true,
            navigation: true,
            columnVisibility: true,
            breadcrumbs: true
          },
          emptyState: {
            message: "No courses found",
            description: "Try adjusting your filters or add a new course.",
            height: 'calc(100vh - 400px)'
          }
        }}
        onDeleteSelected={handleDeleteSelectedCourses}
        actionGroups={actionGroups}
      />

      {/* Add Category Drawer */}
      <AddCategoryDrawer
        open={addCategoryDrawerOpen}
        onClose={() => {
          setAddCategoryDrawerOpen(false);
          setSelectedCategoryId(null);
          setInitialHistoryForDrawer([]);
        }}
        parentCategoryId={selectedCategoryId || currentCategory?.id}
        initialHistory={initialHistoryForDrawer}
        rootCategory={rootCategory}
      />

      {/* Edit Category Drawer */}
      <EditCategoryDrawer
        open={editCategoryDrawerOpen}
        onClose={() => setEditCategoryDrawerOpen(false)}
        categoryId={selectedCategoryId}
        rootCategory={rootCategory}
      />

      {/* Add Course Drawer */}
      <AddCourseDrawer
        open={addCourseDrawerOpen}
        onClose={() => setAddCourseDrawerOpen(false)}
        categoryId={currentCategory?.id}
      />

      {/* Edit Course Drawer */}
      <EditCourseDrawer
        open={editCourseDrawerOpen}
        onClose={() => setEditCourseDrawerOpen(false)}
        courseId={selectedCourseId}
      />

      {/* Move Courses Drawer */}
      <MoveCoursesDrawer
        open={moveCoursesDrawerOpen}
        onClose={() => setMoveCoursesDrawerOpen(false)}
        selectedRows={selectedRows}
        currentCategoryId={currentCategory?.id}
      />

      {/* Delete Category Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteCategoryDialog.open}
        onClose={() => setDeleteCategoryDialog({ ...deleteCategoryDialog, open: false })}
        data={{ id: deleteCategoryDialog.categoryId }}
        title={`Delete Category: ${deleteCategoryDialog.categoryTitle}`}
        message={`Are you sure you want to delete the category "${deleteCategoryDialog.categoryTitle}"? This action cannot be undone.`}
        onSubmit={() => {
          // Use mutate instead of mutateAsync and handle everything in the callbacks
          deleteCategoryMutation.mutate(deleteCategoryDialog.categoryId, {
            onSuccess: () => {
              setDeleteCategoryDialog({ open: false, categoryId: null, categoryTitle: '' });
            },
            onError: (error) => {
              console.error('Error deleting category:', error);
            }
          });
        }}
      />

      {/* Delete Course Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteCourseDialog.open}
        onClose={() => setDeleteCourseDialog({ ...deleteCourseDialog, open: false })}
        data={{ ids: deleteCourseDialog.courseIds }}
        title={`Delete ${deleteCourseDialog.isMultiple ? `${deleteCourseDialog.courseIds.length} Courses` : 'Course'}`}
        message={`Are you sure you want to delete ${deleteCourseDialog.isMultiple ? 'these courses' : 'this course'}? This action cannot be undone.`}
        onSubmit={() => {
          // Fix the course deletion logic too
          if (deleteCourseDialog.courseIds.length > 0) {
            // Pass the entire array to use batch delete
            deleteCourseMutation.mutate(deleteCourseDialog.courseIds, {
              onSuccess: () => {
                // All items processed at once
                setDeleteCourseDialog({ open: false, courseIds: [], isMultiple: false });
                setSelectedRows([]);
              },
              onError: (error) => {
                console.error('Error deleting courses:', error);
              }
            });
          } else {
            // No IDs to delete, just close the dialog
            setDeleteCourseDialog({ open: false, courseIds: [], isMultiple: false });
          }
        }}
      />

      <EnrollUserDrawer
        open={bulkEnrollDrawerOpen}
        onClose={() => setBulkEnrollDrawerOpen(false)}
        selectedCourses={selectedRows}
        isBulkEnrollment={true}
      />
    </>
  );
};

export default CourseManagementPage;