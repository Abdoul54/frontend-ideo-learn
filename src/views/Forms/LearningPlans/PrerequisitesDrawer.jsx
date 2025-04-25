'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemText,
    Box,
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import { useState, useCallback, useMemo, useEffect } from "react";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import DataView from "@/views/DataView";
import { useGetSelectedPrerequisites, useResetPrerequisites, useUpdatePrerequisites } from "@/hooks/api/tenant/learn/useLearningPlan";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import SelectInput from "@/components/inputs/SelectInput";

// Define validation schema
const schema = yup.object().shape({
    items: yup.array().of(
        yup.object().shape({
            id: yup.string().required('Course is required'),
            is_prerequisite: yup.boolean().required('Is prerequisite is required'),
        })
    ).required('At least one course is required'),
    all_courses: yup.boolean().default(false),
    postpone_access: yup.boolean().default(false),
    time: yup.mixed().when('postpone_access', {
        is: true,
        then: () => yup.number().required('Time is required'),
        otherwise: () => yup.number().nullable()
    }),
    time_unit: yup.mixed().when('postpone_access', {
        is: true,
        then: () => yup.string().required('Time unit is required'),
        otherwise: () => yup.string().nullable()
    }),
    courses_to_be_completed: yup.mixed().when('all_courses', {
        is: false,
        then: () => yup.number().required('Number of courses to be completed is required'),
        otherwise: () => yup.number().nullable()
    }),
});


const steps = ['Select Courses', 'Configure Prerequisites'];
const TIME_UNITS = [
    { value: 'day', label: 'Days' },
    { value: 'week', label: 'Weeks' },
    { value: 'month', label: 'Months' },
];

const PrerequisitesDrawer = ({ open, onClose, data }) => {
    // Step state
    const [activeStep, setActiveStep] = useState(0);

    // Table state with default values
    const [tableState, setTableState] = useState({
        pagination: { pageIndex: 0, pageSize: 15 },
        sorting: [],
        globalFilter: '',
        columnVisibility: {},
    });

    // Form setup
    const {
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            items: [],
            all_courses: false,
            courses_to_be_completed: null,
            postpone_access: false,
            time: null,
            time_unit: null
        },
        resolver: yupResolver(schema),
    });

    // Watch form values for conditional rendering
    const selectedItems = watch('items') || [];
    const allCourses = watch('all_courses');
    const postponeAccess = watch('postpone_access');

    // Fetch courses using the proper hook instead of mock data
    const {
        data: coursesData,
        isLoading: isCoursesLoading,
        error: coursesError
    } = useGetSelectedPrerequisites({
        learningPlanId: data?.learningPlanId,
        courseId: data?.id_course,
        pagination: tableState.pagination,
        sorting: tableState.sorting,
        search: tableState.globalFilter
    });

    const updatePrerequisites = useUpdatePrerequisites();
    const resetPrerequisites = useResetPrerequisites();


    // Memoize table columns to prevent unnecessary re-renders
    const columns = useMemo(() => [
        {
            accessorKey: 'code',
            header: 'Code',
            flex: 1,
        },
        {
            accessorKey: 'title',
            header: 'Title',
            flex: 1,
        },
        {
            accessorKey: 'type',
            header: 'Type',
            flex: 1,
        }
    ], []);

    useEffect(() => {
        // add items that has is_prerequisite: true to the form
        const selectedCourses = coursesData?.items?.filter(item => item.is_prerequisite);
        if (selectedCourses) {
            setValue('items', selectedCourses.map(item => ({
                id: item.id,
                is_prerequisite: true
            })), { shouldValidate: true });
        }
        setValue('all_courses', data?.prerequisites_completion?.all_courses || false);
        setValue('postpone_access', data?.prerequisites_completion?.postpone_access || false);
        setValue('time', data?.prerequisites_completion?.time || null);
        setValue('time_unit', data?.prerequisites_completion?.time_unit || null);
        setValue('courses_to_be_completed', data?.prerequisites_completion?.courses_to_be_completed || null);

    }, [
        coursesData,
        setValue
    ]);

    // useEffect(() => {
    //     if (allCourses) {
    //         setValue('courses_to_be_completed', null);
    //     }
    // }, [allCourses, setValue]);

    // Handle table state changes with useCallback to prevent unnecessary re-renders
    const handlePaginationChange = useCallback((newPagination) => {
        setTableState(prev => ({ ...prev, pagination: newPagination }));
    }, []);

    const handleSortingChange = useCallback((newSorting) => {
        setTableState(prev => ({ ...prev, sorting: newSorting }));
    }, []);

    const handleGlobalFilterChange = useCallback((newFilter) => {
        setTableState(prev => ({ ...prev, globalFilter: newFilter }));
    }, []);

    const handleColumnVisibilityChange = useCallback((newVisibility) => {
        setTableState(prev => ({ ...prev, columnVisibility: newVisibility }));
    }, []);

    // Handle selected rows change more efficiently
    const handleSelectedRowsChange = useCallback((newSelectedRows) => {
        // Update form value directly
        setValue('items', newSelectedRows.map(item => ({
            id: item.id,
            is_prerequisite: true
        })), { shouldValidate: true });
    }, [setValue]);

    // Form navigation and submission
    const handleNext = useCallback((e) => {
        if (e) e.preventDefault();
        setActiveStep(prevStep => prevStep + 1);
    }, []);

    const handleBack = useCallback((e) => {
        if (e) e.preventDefault();
        setActiveStep(prevStep => prevStep - 1);
    }, []);

    const canProceedToNextStep = useCallback(() => {
        if (activeStep === 0) {
            return selectedItems.length > 0;
        }
        return true;
    }, [activeStep, selectedItems.length]);

    const handleClose = useCallback(() => {
        onClose();
        reset();
        setActiveStep(0);
    }, [onClose, reset]);

    const onSubmit = useCallback(async (formData) => {
        try {
            await updatePrerequisites.mutateAsync({
                learningPlanId: data?.learningPlanId,
                courseId: data?.id_course,
                data: formData
            });
            handleClose();
        } catch (error) {
            console.error("Error updating prerequisites:", error);
        }
    }, [data, updatePrerequisites, handleClose]);

    // Render step content based on active step
    const renderStepContent = useCallback((step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText
                                primary='Courses'
                                secondary={
                                    errors?.items?.message || 'Select the courses you want to set as prerequisites'
                                }
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }}
                                secondaryTypographyProps={{
                                    color: errors?.items ? 'error.main' : 'text.secondary',
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DataView
                                title="Courses"
                                columns={columns}
                                data={coursesData?.items || []}
                                isLoading={isCoursesLoading}
                                error={coursesError}
                                enableSelection
                                height="calc(100vh - 405px)"
                                pagination={{
                                    ...tableState.pagination,
                                    total: coursesData?.pagination?.total || 0
                                }}
                                setPagination={handlePaginationChange}
                                selectedRows={selectedItems.map(c => ({ id: c.id }))}
                                setSelectedRows={handleSelectedRowsChange}
                                disableMultiSelect
                                slots={{
                                    globalFilter: tableState.globalFilter,
                                    setGlobalFilter: handleGlobalFilterChange,
                                    columnVisibility: tableState.columnVisibility,
                                    setColumnVisibility: handleColumnVisibilityChange,
                                    sorting: tableState.sorting,
                                    setSorting: handleSortingChange,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        height: 'calc(100vh - 560px)'
                                    }
                                }}
                                noToolBar
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3} padding={2} component={List}>
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText
                                primary='Prerequisite Configuration'
                                secondary={
                                    errors?.all_courses?.message || 'Configure how learners must complete the prerequisite courses'
                                }
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }}
                                secondaryTypographyProps={{
                                    color: errors?.all_courses ? 'error.main' : 'text.secondary',
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <SwitchInput
                                name="all_courses"
                                label={
                                    <ListItemText
                                        primary="All Courses"
                                        secondary="Select if all courses must be completed"
                                    />
                                }
                                control={control}
                                uncheckedValue={false}
                                checkedValue={true}
                            />
                        </Grid>
                        {!allCourses && (
                            <Grid item xs={12} component={ListItem}>
                                <TextInput
                                    label="Number of courses to be completed"
                                    name="courses_to_be_completed"
                                    control={control}
                                    type="number"
                                    placeholder="Number of courses to be completed"
                                    inputProps={{
                                        min: 1,
                                        max: selectedItems?.length
                                    }}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        setValue('courses_to_be_completed', isNaN(value) ? null : value);
                                    }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} component={ListItem}>
                            <SwitchInput
                                name="postpone_access"
                                label={
                                    <ListItemText
                                        primary="Unlock interval"
                                        secondary="Implement a waiting period between prerequisite completion and course access"
                                    />
                                }
                                control={control}
                                uncheckedValue={false}
                                checkedValue={true}
                            />
                        </Grid>
                        {postponeAccess && (
                            <>
                                <Grid item xs={6} component={ListItem}>
                                    <TextInput
                                        label="Time"
                                        name="time"
                                        control={control}
                                        type="number"
                                        placeholder="Enter time value"
                                        inputProps={{ min: 1 }}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            setValue('time', isNaN(value) ? null : value);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} component={ListItem}>
                                    <SelectInput
                                        name="time_unit"
                                        label="Time unit"
                                        control={control}
                                        placeholder="Select time unit"
                                        options={TIME_UNITS}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                );
            default:
                return null;
        }
    }, [
        activeStep,
        errors,
        columns,
        coursesData,
        isCoursesLoading,
        coursesError,
        tableState,
        selectedItems,
        allCourses,
        postponeAccess,
        control,
        handlePaginationChange,
        handleGlobalFilterChange,
        handleColumnVisibilityChange,
        handleSortingChange,
        handleSelectedRowsChange
    ]);

    return (
        <DrawerFormContainer
            title="Set prerequisites"
            description="Choose the courses that learners must complete to enroll in the selected course"
            open={open}
            onClose={handleClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <Box sx={{ p: 2 }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: '0.4em'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    {renderStepContent(activeStep)}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Box>
                        {activeStep > 0 && (
                            <Button
                                type="button"
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        )}
                        {activeStep === 0 && (
                            <Button
                                type="button"
                                color="error"
                                onClick={() => {
                                    resetPrerequisites.mutateAsync({
                                        learningPlanId: data?.learningPlanId,
                                        courseId: data?.id_course
                                    }).then(() => {
                                        reset();
                                        setActiveStep(0);
                                        onClose();
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            type="button"
                            onClick={handleClose}
                            disabled={updatePrerequisites.isPending}
                        >
                            Cancel
                        </Button>

                        {activeStep < steps.length - 1 ? (
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                disabled={!canProceedToNextStep()}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={updatePrerequisites.isPending}
                            >
                                Submit
                            </Button>
                        )}
                    </Box>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default PrerequisitesDrawer;