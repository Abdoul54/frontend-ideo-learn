'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Collapse,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tab
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import DataView from "@/views/DataView";
import CustomTabList from "@/@core/components/mui/TabList";
import { TabContext, TabPanel } from "@mui/lab";
import { useGroups } from "@/hooks/api/tenant/useGroups";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useCreateSkillGroup, useUpdateSkillGroup } from "@/hooks/api/tenant/skills/useSkillGroups";

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    visible_by: yup.object().shape({
        all: yup.boolean(),
        groups: yup.array().of(yup.string()),
        branches: yup.array().of(yup.object().shape({
            id: yup.string().required('Branch ID is required'),
        })),
    })
});

const SkillSetDrawer = ({ open, onClose, data }) => {
    // states 
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});

    const [currentDataTable, setCurrentDataTable] = useState('groups')
    const { data: groups, isLoading: groupsLoading, error: groupsError } = useGroups({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
    });

    const { data: branches, isLoading: branchesLoading, error: branchesError } = useHaykal({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter
    });

    const createSkillGroup = useCreateSkillGroup();
    const updateSkillGroup = useUpdateSkillGroup();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            visible_by: {
                all: false,
                groups: [],
                branches: []
            }
        },
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (data) {
            reset({
                name: data?.name,
                description: data?.description,
                visible_by: {
                    all: data?.visible_by?.all,
                    groups: data?.visible_by?.groups?.length ? data.visible_by.groups : [],
                    branches: data?.visible_by?.branches?.length ? data.visible_by.branches : []
                }
            })
        }
    }, [data])

    const selectedGroups = watch('visible_by.groups') || [];
    const selectedBranches = watch('visible_by.branches') || [];

    const onSubmit = (formData) => {
        if (data) {
            if (formData?.visible_by?.groups?.length === 0)
                delete formData.visible_by.groups;

            if (formData?.visible_by?.branches?.length === 0)
                delete formData.visible_by.branches;


            updateSkillGroup.mutateAsync({ id: data.id, data: formData }).then(() => {
                onClose();
                reset();
            });
        } else {
            if (formData?.all) {
                delete formData.visible_by.groups;
                delete formData.visible_by.branches;
            }
            createSkillGroup.mutateAsync(formData).then(() => {
                onClose();
                reset();
            });
        };
    }


    return (
        <DrawerFormContainer
            title="New Skill Set"
            description="Fill in the field below to start creating your set of skills"
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
                            <ListItemText primary='Details' secondary="Users will choose their own skills from a limited selection of skills filtered by you" primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }} />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="name"
                                label="Name"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="description"
                                label="Description"
                                control={control}
                                type="text"
                                maxRows={4}
                                multiline
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText
                                primary='Visible by' secondary="Users will choose their own skills from a limited selection of skills filtered by you"
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }} />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <SwitchInput
                                name="visible_by.all"
                                label={
                                    <ListItemText
                                        primary='Visible by all'
                                        secondary="When enabled, this skill set will be visible to all users" />
                                }
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Collapse in={watch('visible_by.all') === false} sx={{ width: '100%' }}>
                            <Grid item xs={12} component={ListItem}>
                                <TabContext value={currentDataTable}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12}>
                                            <Paper elevation={0} sx={{
                                                bgcolor: 'background.default',
                                            }}>
                                                <CustomTabList
                                                    pill='true'
                                                    onChange={(_, newValue) => {
                                                        setCurrentDataTable(newValue);
                                                    }}
                                                    variant="fullWidth"
                                                    sx={{
                                                        '& .MuiTabs-flexContainer': {
                                                            width: '100%'
                                                        }
                                                    }}
                                                >
                                                    <Tab value="groups" label="Groups" />
                                                    <Tab value="branches" label="Branches" />
                                                </CustomTabList>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                                <TabPanel value="groups">
                                                    <DataView
                                                        title="Groups"
                                                        columns={[
                                                            { accessorKey: 'name', header: 'Name', flex: 1 },
                                                            { accessorKey: 'description', header: 'Description', flex: 1 },
                                                        ]}
                                                        data={groups?.items}
                                                        isLoading={groupsLoading}
                                                        error={groupsError}
                                                        enableSelection
                                                        height="calc(100vh - 352px)"
                                                        pagination={{ ...pagination, total: groups?.pagination?.total }}
                                                        setPagination={setPagination}
                                                        selectedRows={groups?.items?.filter(group => selectedGroups.includes(group.id))}
                                                        setSelectedRows={(selectedItems) => {
                                                            setValue('visible_by.groups', selectedItems.map(item => item.id));
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
                                                                columnVisibility: false
                                                            },
                                                            emptyState: {
                                                                height: 'calc(100vh - 506px)'
                                                            }
                                                        }}
                                                        noToolBar
                                                        disableMultiSelect
                                                    />
                                                </TabPanel>
                                                <TabPanel value="branches">
                                                    <DataView
                                                        title="Branches"
                                                        columns={[
                                                            { accessorKey: 'code', header: 'Code', flex: 1 },
                                                            { accessorKey: 'title', header: 'Title', flex: 1 },
                                                        ]}
                                                        data={branches?.data?.items}
                                                        isLoading={branchesLoading}
                                                        error={branchesError}
                                                        enableSelection
                                                        height="calc(100vh - 352px)"
                                                        pagination={{ ...pagination, total: branches?.data?.pagination?.total }}
                                                        setPagination={setPagination}
                                                        selectedRows={branches?.data?.items?.filter(branch => selectedBranches.some(item => item.id === branch.id))}
                                                        setSelectedRows={(selectedItems) => {
                                                            setValue('visible_by.branches', selectedItems.map(item => ({ id: item.id })));
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
                                                                columnVisibility: false
                                                            },
                                                            emptyState: {
                                                                height: 'calc(100vh - 506px)'
                                                            }
                                                        }}
                                                        noToolBar
                                                        disableMultiSelect
                                                    />
                                                </TabPanel>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </TabContext>

                            </Grid>
                        </Collapse>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={false}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={false}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default SkillSetDrawer;