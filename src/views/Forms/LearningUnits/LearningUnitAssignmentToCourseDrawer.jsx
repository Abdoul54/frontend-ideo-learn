'use client';

import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    FormControl,
    FormControlLabel,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
    Radio,
    RadioGroup,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import DataView from "@/views/DataView";
import { useAssignLearningUnit, useLearningUnitVersions } from "@/hooks/api/tenant/repos/useLeaningUnits";
import { useCourses } from "@/hooks/api/tenant/learn/course/useCourse";
import SelectInput from "@/components/inputs/SelectInput";

const LearningUnitAssignmentToCourseDrawer = ({ open, onClose, data }) => {
    const {
        control,
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            "course_id": null,
            "scorm_version_id": null
        }
    });

    const { data: versions } = useLearningUnitVersions(data?.id)

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});

    const { data: courses, error: coursesError, isLoading: coursesLoading } = useCourses({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
    });

    const assignLearningUnit = useAssignLearningUnit();


    useEffect(() => {
        if (versions) {
            reset({
                scorm_version_id: versions?.active_version_id
            });
        }
    }, [versions, reset]);

    const onSubmit = async (submittedData) => {
        await assignLearningUnit.mutateAsync({ id: data?.id, data: submittedData });
        reset();
        onClose();
    };

    return (
        <DrawerFormContainer
            title="Assign Learning Unit to Course"
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 0
                }}
            >
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': { width: '0.4em' },
                        '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}
                >
                    <Grid container rowSpacing={3} padding={2} component={List}>

                        {versions?.versions?.length > 1 && (
                            <>

                                <Grid item size={12} component={ListItem}>
                                    <ListItemText
                                        primary="Select a version of the learning unit"
                                    />
                                </Grid>
                                <Grid item size={12} component={ListItem}>
                                    <SelectInput
                                        name="scorm_version_id"
                                        defaultValue={versions?.active_version_id}
                                        control={control}
                                        options={versions?.versions}
                                        label="Select a version"
                                        labelKey="value"
                                        valueKey="id"

                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item size={12} component={ListItem}>
                            <ListItemText
                                primary="Select a course to assign the learning unit to"
                                secondary="You can only assign one course at a time"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <Controller
                                name="course_id"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl error={!!error} fullWidth>
                                        <RadioGroup
                                            {...field}
                                        >
                                            <DataView
                                                title="Courses"
                                                columns={[
                                                    {
                                                        accessorKey: "id",
                                                        header: "",
                                                        cell: ({ row }) => <FormControlLabel
                                                            value={row?.original.id}
                                                            control={<Radio />}
                                                        />,
                                                        flex: .3
                                                    },
                                                    {
                                                        accessorKey: "name",
                                                        header: "Name",
                                                        flex: 1
                                                    },
                                                    {
                                                        accessorKey: "course_type",
                                                        header: "Type",
                                                        cell: ({ row }) => {
                                                            const type = row?.original?.course_type;
                                                            return (
                                                                <Chip
                                                                    variant='outlined'
                                                                    size='small'
                                                                    color='primary'
                                                                    label={type?.toUpperCase()}
                                                                />
                                                            );
                                                        },
                                                        flex: 1
                                                    },
                                                    {
                                                        accessorKey: "status",
                                                        header: "Status",
                                                        cell: ({ row }) => {
                                                            const status = row?.original?.status;
                                                            return (
                                                                <Chip
                                                                    variant='outlined'
                                                                    size='small'
                                                                    color={status === '"unpublished"' ? 'error' : 'success'}
                                                                    label={status?.toUpperCase()}
                                                                />
                                                            );
                                                        },
                                                        flex: 1
                                                    }
                                                ]}
                                                data={courses?.items}
                                                isLoading={coursesLoading}
                                                error={coursesError}
                                                height="calc(100vh - 352px)"
                                                enableSelection={false}
                                                pagination={{ ...pagination, total: courses?.pagination?.total }}
                                                setPagination={setPagination}
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
                                                noMobileDataTable
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={assignLearningUnit?.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={assignLearningUnit?.isPending}
                    >
                        {assignLearningUnit?.isPending ? "Saving..." : "Save"}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default LearningUnitAssignmentToCourseDrawer;
