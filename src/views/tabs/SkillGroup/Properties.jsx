import CustomTabList from "@/@core/components/mui/TabList";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { useUpdateSkillGroup } from "@/hooks/api/tenant/skills/useSkillGroups";
import { useGroups } from "@/hooks/api/tenant/useGroups";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import DataView from "@/views/DataView";
import { yupResolver } from "@hookform/resolvers/yup";
import { TabContext, TabPanel } from "@mui/lab";
import {
    Button,
    Grid2 as Grid,
    ListItem,
    ListItemText,
    Card,
    CardContent,
    CardActions,
    Collapse,
    Paper,
    Tab,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

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

const Properties = ({ data }) => {
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
        if (formData?.visible_by?.groups?.length === 0)
            delete formData.visible_by.groups;

        if (formData?.visible_by?.branches?.length === 0)
            delete formData.visible_by.branches;


        updateSkillGroup.mutateAsync({ id: data.id, data: formData }).then(() => {
            onClose();
            reset();
        });

    }

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)} sx={{
            border: 0,
            p: 0
        }} >

            <CardContent component={Grid} container spacing={3} >
                <Grid item size={12} component={ListItem}>
                    <ListItemText
                        primary="General"
                        secondary="Basic information about the skill set"
                        primaryTypographyProps={{
                            variant: 'h5',
                            sx: {
                                fontWeight: 600,
                                fontSize: '1.2rem',
                            }
                        }} />
                </Grid>
                <Grid item size={12} component={ListItem}>
                    <TextInput
                        name="name"
                        label="Name"
                        control={control}
                        type="text"
                    />
                </Grid>
                <Grid item size={12} component={ListItem}>
                    <TextInput
                        name="description"
                        label="Description"
                        control={control}
                        type="text"
                        maxRows={4}
                        multiline
                    />
                </Grid>
                <Grid item size={12} component={ListItem}>
                    <ListItemText
                        primary='Visibility'
                        primaryTypographyProps={{
                            variant: 'h5',
                            sx: {
                                fontWeight: 600,
                                fontSize: '1.2rem',
                            }
                        }} />
                </Grid>
                <Grid item size={12} component={ListItem}>
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
                <Grid item size={12} component={ListItem}>
                    <ListItemText
                        primary='People selection'
                        secondary="Select the groups or branches of users who will be able to choose their own skills"
                        primaryTypographyProps={{
                            variant: 'h6',
                            sx: {
                                fontWeight: 500,
                                fontSize: '1rem',
                            }
                        }} />
                </Grid>
                <Collapse in={watch('visible_by.all') === false} sx={{ width: '100%' }}>
                    <Grid item size={12} component={ListItem}>
                        <TabContext value={currentDataTable}>
                            <Grid container spacing={4} width={1}>
                                <Grid item size={12}>
                                    <Paper elevation={0}>
                                        <CustomTabList
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
                                <Grid item size={12}>
                                    <Paper elevation={0} sx={{ border: 0, padding: 0 }}>
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
            </CardContent>
            <CardActions>
                <Grid container width={1} >
                    <Grid item size={12} display='flex' justifyContent='flex-end'>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card >
    );
};

export default Properties;