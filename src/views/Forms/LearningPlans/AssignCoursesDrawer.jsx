'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    IconButton,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useState } from "react";
import DataView from "@/views/DataView";
import { useAddCoursesToLearningPlan } from "@/hooks/api/tenant/learn/useLearningPlan";
import { useCourses } from "@/hooks/api/tenant/learn/course/useCourse";

// courses should at least have one course
const schema = yup.object().shape({
    courses: yup.array().of(
        yup.object().shape({
            course_id: yup.number().required(),
            is_required: yup.boolean().required()
        })
    ).min(1, 'You must select at least one course'),
});

const AssignCoursesDrawer = ({ open, onClose, data }) => {
    // states 
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});

    // hooks
    const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const addCourses = useAddCoursesToLearningPlan()

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            courses: []
        },
        resolver: yupResolver(schema),
    });

    const selectedCourses = watch('courses') || [];

    // Find if a course is already selected by its id
    const isCourseSelected = (courseId) => {
        return selectedCourses.some(course => course.course_id === courseId);
    };

    const onSubmit = (formData) => {
        addCourses.mutateAsync({ data: { items: formData.courses }, learningPlanId: data?.id });
        onClose();
        reset();
    }

    return (
        <DrawerFormContainer
            title="Assign courses to a learning plan"
            description="Add as many courses as you want to a learning plan"
            open={open}
            onClose={onClose}
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
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText primary='Courses' secondary={
                                errors?.courses?.message || 'Select the courses you want to assign to this learning plan'
                            } primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }} secondaryTypographyProps={{
                                color: errors?.courses ? 'error.main' : 'text.secondary',
                            }} />
                        </Grid>
                        <Grid item xs={12}>
                            <DataView
                                title="Courses"
                                columns={[
                                    {
                                        accessorKey: 'name',
                                        header: 'Name',
                                        flex: 1,
                                    },
                                    {
                                        accessorKey: 'code',
                                        header: 'Code',
                                        flex: 1,
                                    },
                                    {
                                        accessorKey: 'description',
                                        header: 'Description',
                                        flex: 1,
                                    },
                                    {
                                        accessorKey: 'category',
                                        header: 'Category',
                                        cell: ({ row }) => {
                                            // Check if category is an object and if it has a name property
                                            const categoryLabel = typeof row?.original?.category === 'object' && row?.original?.category !== null
                                                ? (row?.original?.category?.name || 'Uncategorized')
                                                : String(row?.original?.category || 'Uncategorized');

                                            return (
                                                <Chip label={categoryLabel} color="primary" size="small" variant="outlined" />
                                            )
                                        },
                                        flex: 1
                                    },
                                    {
                                        accessorKey: 'status',
                                        header: 'Status',
                                        cell: ({ row }) => {
                                            const status = row?.original?.status === "unpublished" ? 'error' : 'success';
                                            return (
                                                <Chip label={row?.original?.status} color={status} size="small" variant="outlined" />
                                            )
                                        },
                                        flex: 1
                                    },
                                    {
                                        id: 'mandatory',
                                        accessorKey: 'mandatory',
                                        header: 'Mandatory',
                                        cell: ({ row }) => {
                                            // check if this rows id is in the selectedCourses array
                                            const isSelected = isCourseSelected(row?.original?.id);

                                            // check if the course is required
                                            const isRequired = selectedCourses.some(course =>
                                                course.course_id === row?.original?.id && course.is_required);

                                            // Toggle the required status of a course
                                            const toggleRequired = () => {
                                                if (!isSelected) {
                                                    // If not selected, add it as required
                                                    const updatedCourses = [...selectedCourses, {
                                                        course_id: row?.original?.id,
                                                        is_required: true
                                                    }];
                                                    setValue('courses', updatedCourses);
                                                } else if (isRequired) {
                                                    // If selected and required, make it not required
                                                    const updatedCourses = selectedCourses.map(course =>
                                                        course.course_id === row?.original?.id
                                                            ? { ...course, is_required: false }
                                                            : course
                                                    );
                                                    setValue('courses', updatedCourses);
                                                } else {
                                                    // If selected but not required, make it required
                                                    const updatedCourses = selectedCourses.map(course =>
                                                        course.course_id === row?.original?.id
                                                            ? { ...course, is_required: true }
                                                            : course
                                                    );
                                                    setValue('courses', updatedCourses);
                                                }
                                            };

                                            return (
                                                <IconButton onClick={toggleRequired} disabled={!isSelected}>
                                                    {isSelected && isRequired ? (
                                                        <i className="solar-check-circle-line-duotone text-success" />
                                                    ) : (
                                                        <i className="solar-close-circle-line-duotone text-error" />
                                                    )}
                                                </IconButton>
                                            );
                                        },
                                        flex: 1
                                    }
                                ]}
                                data={courses?.items}
                                isLoading={coursesLoading}
                                error={coursesError}
                                enableSelection
                                height="calc(100vh - 352px)"
                                pagination={{ ...pagination, total: courses?.pagination?.total }}
                                setPagination={setPagination}
                                selectedRows={courses?.items?.filter(course => isCourseSelected(course.id))}
                                setSelectedRows={(selectedItems) => {
                                    // Map selected items to the required format with course_id and is_required
                                    setValue('courses', selectedItems.map(item => ({
                                        course_id: item.id,
                                        is_required: true
                                    })));
                                }}
                                slots={{
                                    globalFilter,
                                    setGlobalFilter,
                                    columnVisibility,
                                    setColumnVisibility,
                                    sorting,
                                    setSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        height: 'calc(100vh - 506px)'
                                    }
                                }}
                                noToolBar
                                disableMultiSelect
                            />
                        </Grid>
                    </Grid>
                </CardContent >
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={addCourses?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={selectedCourses.length === 0 || addCourses?.isPending}>Submit</Button>
                </CardActions>
            </Card >
        </DrawerFormContainer >
    );
};

export default AssignCoursesDrawer;