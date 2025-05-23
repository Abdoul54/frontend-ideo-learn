'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Tab,
    Typography
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useState } from "react";
import DataView from "@/views/DataView";
import { useCourses } from "@/hooks/api/tenant/learn/course/useCourse";
import { useLearningPlans } from "@/hooks/api/tenant/learn/useLearningPlan";
import { useAssignContentsToCatalog } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import toast from "react-hot-toast";
import { useTranslation } from '@/@core/contexts/translationContext';

// Schema validation for form
const schema = yup.object().shape({
    contents: yup.array().of(
        yup.object().shape({
            content_type: yup.string().required(),
            content_id: yup.number().required()
        })
    ).min(1, 'You must select at least one course or learning plan')
});

const AssignContentsToCatalogDrawer = ({ open, onClose, catalog }) => {
    const { translate } = useTranslation();
    // Tab state
    const [activeTab, setActiveTab] = useState('courses');

    // State for courses data view
    const [coursePagination, setCoursePagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [courseSorting, setCourseSorting] = useState([]);
    const [courseFilter, setCourseFilter] = useState('');
    const [courseColumnVisibility, setCourseColumnVisibility] = useState({});
    const [selectedCourses, setSelectedCourses] = useState([]);

    // State for learning plans data view
    const [planPagination, setPlanPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [planSorting, setPlanSorting] = useState([]);
    const [planFilter, setPlanFilter] = useState('');
    const [planColumnVisibility, setPlanColumnVisibility] = useState({});
    const [selectedPlans, setSelectedPlans] = useState([]);

    // Form setup
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
            contents: []
        },
        resolver: yupResolver(schema)
    });

    // API hooks
    const {
        data: coursesData,
        isLoading: coursesLoading,
        error: coursesError
    } = useCourses({
        page: coursePagination.pageIndex + 1,
        page_size: coursePagination.pageSize,
        search_text: courseFilter,
        sort_attr: courseSorting[0]?.id || 'name',
        sort_dir: courseSorting[0]?.desc ? 'desc' : 'asc'
    });

    const {
        data: plansData,
        isLoading: plansLoading,
        error: plansError
    } = useLearningPlans({
        page: planPagination.pageIndex + 1,
        page_size: planPagination.pageSize,
        search: planFilter,
        sort_attr: planSorting[0]?.id || 'title',
        sort_dir: planSorting[0]?.desc ? 'desc' : 'asc'
    });

    const assignContentsMutation = useAssignContentsToCatalog();

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Update form values when selections change
    const updateFormContents = () => {
        const contents = [
            // Map selected courses
            ...selectedCourses.map(course => ({
                content_type: 'course',
                content_id: course.id
            })),
            // Map selected learning plans
            ...selectedPlans.map(plan => ({
                content_type: 'learningplan',
                content_id: plan.id
            }))
        ];

        setValue('contents', contents);
        return contents;
    };

    const handleCourseSelectionChange = (selected) => {
        setSelectedCourses(selected);

        // Use the actual selected value passed in rather than relying on state
        const contents = [
            ...selected.map(course => ({
                content_type: 'course',
                content_id: course.id
            })),
            ...selectedPlans.map(plan => ({
                content_type: 'learningplan',
                content_id: plan.id
            }))
        ];

        setValue('contents', contents);
    };

    const handlePlanSelectionChange = (selected) => {
        setSelectedPlans(selected);

        // Use the actual selected value passed in
        const contents = [
            ...selectedCourses.map(course => ({
                content_type: 'course',
                content_id: course.id
            })),
            ...selected.map(plan => ({
                content_type: 'learningplan',
                content_id: plan.id
            }))
        ];

        setValue('contents', contents);
    };

    // Handle form submission
    const onSubmit = async (formData) => {
        try {
            if (!catalog?.id) {
                throw new Error("Catalog ID is required");
            }

            // Ensure we have the latest selection
            const contents = updateFormContents();

            if (contents.length === 0) {
                toast.error("Please select at least one course or learning plan");
                return;
            }

            await assignContentsMutation.mutateAsync({
                catalogId: catalog.id,
                contents: contents
            });

            toast.success("Content assigned successfully");
            handleClose();
        } catch (error) {
            toast.error(error.message || "Failed to assign content");
            console.error("Content assignment error:", error);
        }
    };

    // Handle drawer close
    const handleClose = () => {
        reset();
        setSelectedCourses([]);
        setSelectedPlans([]);
        setActiveTab('courses');
        onClose();
    };

    // Column definitions for courses table
    const courseColumns = [
        {
            id: 'name',
            header: translate('Catalog management.TABLE_HEADER_NAME', 'Name'),
            accessorKey: 'name',
            size: 250,
        },
        {
            id: 'code',
            header: translate('Catalog management.TABLE_HEADER_CODE', 'Code'),
            accessorKey: 'code',
        },
        {
            id: 'course_type',
            header: translate('Catalog management.TABLE_HEADER_TYPE', 'Type'),
            accessorKey: 'course_type',
            cell: ({ row }) => (
                <Chip
                    label={row.original.course_type || 'elearning'}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ),
            size: 130,
        },
        {
            id: 'status',
            header: translate('Catalog management.TABLE_HEADER_STATUS', 'Status'),
            accessorKey: 'status',
            cell: ({ row }) => (
                <Chip
                    label={row.original.status}
                    size="small"
                    color={row.original.status === 'published' ? 'success' : 'warning'}
                    variant="outlined"
                />
            ),
            size: 120,
        }
    ];

    // Column definitions for learning plans table
    const planColumns = [
        {
            id: 'title',
            header: translate('Catalog management.TABLE_HEADER_TITLE', 'Title'),
            accessorKey: 'title',
            size: 250,
        },
        {
            id: 'code',
            header: translate('Catalog management.TABLE_HEADER_CODE', 'Code'),
            accessorKey: 'code',
        },
        {
            id: 'status',
            header: translate('Catalog management.TABLE_HEADER_STATUS', 'Status'),
            accessorKey: 'status',
            cell: ({ row }) => (
                <Chip
                    label={row.original.status}
                    size="small"
                    color={row.original.status === 'published' ? 'success' : 'warning'}
                    variant="outlined"
                />
            ),
            size: 120,
        }
    ];

    // Calculate total selected
    const totalSelected = selectedCourses.length + selectedPlans.length;

    return (
        <DrawerFormContainer
            title={translate('Catalog management.DRAWER_TITLE_ASSIGN_CONTENT',
                { catalogName: catalog?.name || translate('Catalog management.CATALOG', 'Catalog') }
            )}
            description={translate('Catalog management.DRAWER_DESCRIPTION_ASSIGN_CONTENT', 'Select courses and learning plans to assign to this catalog')}
            open={open}
            onClose={handleClose}
            width={{ xs: '100%', sm: '75%', md: '70%' }}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 0,
                    '&::-webkit-scrollbar': { width: '0.4em' },
                    '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <TabContext value={activeTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleTabChange} aria-label="content tabs">
                                <Tab
                                    label={selectedCourses.length > 0
                                        ? translate('Catalog management.TAB_COURSES_WITH_COUNT', { count: selectedCourses.length })
                                        : translate('Catalog management.TAB_COURSES')
                                    }
                                    value="courses"
                                />
                                <Tab
                                    label={selectedPlans.length > 0
                                        ? translate('Catalog management.TAB_LEARNING_PLANS_WITH_COUNT', { count: selectedPlans.length })
                                        : translate('Catalog management.TAB_LEARNING_PLANS')
                                    }
                                    value="learning-plans"
                                />
                            </TabList>
                        </Box>

                        {/* Courses Tab */}
                        <TabPanel value="courses" sx={{ px: 0, py: 2 }}>
                            <DataView
                                columns={courseColumns}
                                data={coursesData?.items || []}
                                isLoading={coursesLoading}
                                error={coursesError}
                                pagination={{
                                    ...coursePagination,
                                    total: coursesData?.pagination?.total || 0
                                }}
                                setPagination={setCoursePagination}
                                selectedRows={selectedCourses}
                                setSelectedRows={handleCourseSelectionChange}
                                slots={{
                                    globalFilter: courseFilter,
                                    setGlobalFilter: setCourseFilter,
                                    columnVisibility: courseColumnVisibility,
                                    setColumnVisibility: setCourseColumnVisibility,
                                    sorting: courseSorting,
                                    setSorting: setCourseSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        message: translate('Catalog management.EMPTY_STATE_NO_COURSES', 'No courses found'),
                                        description: translate('Catalog management.EMPTY_STATE_ADJUST_SEARCH', 'Try adjusting your search criteria'),
                                        height: 'calc(100vh - 500px)'
                                    }
                                }}
                                noToolBar
                                enableSelection={true}
                                disableMultiSelect={true}
                                height="calc(100vh - 350px)"
                                getRowId={(row) => row.id}
                            />
                        </TabPanel>

                        {/* Learning Plans Tab */}
                        <TabPanel value="learning-plans" sx={{ px: 0, py: 2 }}>
                            <DataView
                                columns={planColumns}
                                data={plansData?.items || []}
                                isLoading={plansLoading}
                                error={plansError}
                                pagination={{
                                    ...planPagination,
                                    total: plansData?.pagination?.total || 0
                                }}
                                setPagination={setPlanPagination}
                                selectedRows={selectedPlans}
                                setSelectedRows={handlePlanSelectionChange}
                                slots={{
                                    globalFilter: planFilter,
                                    setGlobalFilter: setPlanFilter,
                                    columnVisibility: planColumnVisibility,
                                    setColumnVisibility: setPlanColumnVisibility,
                                    sorting: planSorting,
                                    setSorting: setPlanSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        message: translate('Catalog management.EMPTY_STATE_NO_LEARNING_PLANS', 'No learning plans found'),
                                        description: translate('Catalog management.EMPTY_STATE_ADJUST_SEARCH', 'Try adjusting your search criteria'),
                                        height: 'calc(100vh - 500px)'
                                    }
                                }}
                                noToolBar
                                enableSelection={true}
                                disableMultiSelect={true}
                                height="calc(100vh - 350px)"
                                getRowId={(row) => row.id}
                            />
                        </TabPanel>
                    </TabContext>
                </CardContent>

                {/* Form Errors */}
                {errors.contents && (
                    <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.main' }}>
                        <Typography variant="body2">{errors.contents.message}</Typography>
                    </Box>
                )}

                <Divider />

                {/* Actions Footer */}
                <CardActions sx={{ justifyContent: 'space-between', p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {translate(
                            totalSelected === 1
                                ? 'Catalog management.SELECTION_COUNT_SINGULAR'
                                : 'Catalog management.SELECTION_COUNT_PLURAL',
                            { count: totalSelected }
                        )}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            onClick={handleClose}
                            disabled={assignContentsMutation.isPending || isSubmitting}
                        >
                            {translate('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={totalSelected === 0 || assignContentsMutation.isPending || isSubmitting}
                            startIcon={
                                (assignContentsMutation.isPending || isSubmitting) &&
                                <CircularProgress size={20} color="inherit" />
                            }
                        >
                            {assignContentsMutation.isPending || isSubmitting
                                ? translate('Catalog management.PROCESSING_ASSIGNING', 'Assigning...')
                                : translate('Catalog management.BUTTON_ASSIGN_CONTENT', 'Assign Content')
                            }
                        </Button>
                    </Box>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default AssignContentsToCatalogDrawer;