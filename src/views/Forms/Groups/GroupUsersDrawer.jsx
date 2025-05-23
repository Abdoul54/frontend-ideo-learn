'use client';

import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Grid2 as Grid,
    Paper,
    IconButton,
    Tab,
    CircularProgress,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";

// Custom components
import DrawerFormContainer from "@/components/DrawerFormContainer";

// API hooks
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useAddUsersToGroup, useGroups } from "@/hooks/api/tenant/useGroups";
import { useUsers } from "@/hooks/api/tenant/useUsers";
import { useHistoryNavigation } from "@/hooks/useHistoryNavigation";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import DataView from "@/views/DataView";

// Schema with better error messages and type validation based on tabToTypeMap
const tabToTypeMap = {
    '0': 'users',
    '1': 'groups',
    '2': 'branches'
};

const schema = yup.object({
    type: yup.string().required('Type is required'),
    user_ids: yup.array().when('type', {
        is: 'users',
        then: (schema) => schema.min(1, 'Please select at least one user').required('Users selection is required'),
        otherwise: (schema) => schema
    }),
    group_ids: yup.array().when('type', {
        is: 'groups',
        then: (schema) => schema.min(1, 'Please select at least one group').required('Group selection is required'),
        otherwise: (schema) => schema
    }),
    branch_ids: yup.array().when('type', {
        is: 'branches',
        then: (schema) => schema.min(1, 'Please select at least one branch').required('Branch selection is required'),
        otherwise: (schema) => schema
    })
});

const GroupUsersDrawer = ({ open, onClose, id }) => {
    // State for active tab and automatically set type via watch/setValue
    const [activeTab, setActiveTab] = useState("0");

    // Form with improved integration to tabs
    const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            type: tabToTypeMap[activeTab], // Set type based on active tab
            user_ids: [],
            branch_ids: [],
            group_ids: [],
        }
    });

    const addUsersToGroup = useAddUsersToGroup();

    // UI state with more organized structure
    const [tableState, setTableState] = useState({
        users: {
            columnVisibility: {},
            query: '',
            sorting: [],
            pagination: { pageIndex: 0, pageSize: 15 }
        },
        groups: {
            columnVisibility: {},
            query: '',
            sorting: [],
            pagination: { pageIndex: 0, pageSize: 15 }
        },
        haykal: {
            filter: '',
            sorting: [],
            columnVisibility: {},
            query: '',
            pagination: { pageIndex: 0, pageSize: 15 }
        }
    });

    // Update specific table state with immutable pattern
    const updateTableState = (tableType, field, value) => {
        setTableState(prev => ({
            ...prev,
            [tableType]: {
                ...prev[tableType],
                [field]: value
            }
        }));
    };

    // Search input state
    const [searchInputs, setSearchInputs] = useState({
        users: '',
        groups: '',
        haykal: ''
    });

    // Handler for search input changes
    const handleSearchChange = (type, value) => {
        setSearchInputs(prev => ({
            ...prev,
            [type]: value
        }));

        // Update table state immediately without debouncing
        if (type === 'users') {
            updateTableState('users', 'query', value);
            updateTableState('users', 'pagination', {
                ...tableState.users.pagination,
                pageIndex: 0
            });
        } else if (type === 'groups') {
            updateTableState('groups', 'query', value);
            updateTableState('groups', 'pagination', {
                ...tableState.groups.pagination,
                pageIndex: 0
            });
        } else if (type === 'haykal') {
            updateTableState('haykal', 'filter', value);
            updateTableState('haykal', 'pagination', {
                ...tableState.haykal.pagination,
                pageIndex: 0
            });
        }
    };

    // Watch form values
    const selectedGroupIds = watch('group_ids');
    const selectedUserIds = watch('user_ids');

    // Initialize history navigation with initial root item
    const {
        history,
        currentItem,
        goForward,
        goBack,
        goToBreadcrumb
    } = useHistoryNavigation(
        { id: 1, title: 'Platform' },
        (item, action) => {
            if (action === 'forward' || action === 'breadcrumb') {
                updateTableState('haykal', 'pagination', {
                    ...tableState.haykal.pagination,
                    pageIndex: 0
                });
                updateTableState('haykal', 'filter', '');
                setSearchInputs(prev => ({
                    ...prev,
                    haykal: ''
                }));
            }
        }
    );

    // Table column definitions with memoization for performance
    const tableColumns = useMemo(() => ({
        groups: [
            {
                header: 'Name',
                accessorKey: 'name',
                flex: 1,
                enableSorting: true
            },
            {
                header: 'Description',
                accessorKey: 'description',
                flex: 1,
                enableSorting: true,
                cell: ({ row }) => row?.original?.description
            },
            {
                header: 'Type',
                accessorKey: 'type',
                cell: ({ row }) => (
                    <Chip
                        variant='tonal'
                        label={row?.original?.type === 'manual' ? 'Manual' : 'Automatic'}
                        color="info"
                        size="small"
                    />
                ),
                flex: 1,
                enableSorting: true
            },
            {
                header: 'Updated',
                accessorKey: 'updated_at',
                cell: ({ row }) => {
                    const date = new Date(row?.original?.updated_at);
                    return date.toLocaleDateString();
                },
                flex: 1,
                enableSorting: true
            }
        ],
        users: [
            {
                header: 'Username',
                accessorKey: 'username',
                flex: 1,
                enableSorting: true
            },
            {
                header: 'Email',
                accessorKey: 'email',
                flex: 1,
                enableSorting: true
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => (
                    <Chip
                        variant='tonal'
                        label={row?.original?.status === 'active' ? 'Active' : 'Inactive'}
                        color={row?.original?.status === 'active' ? "success" : "warning"}
                        size="small"
                    />
                ),
                flex: 0.5,
                enableSorting: true
            }
        ]
    }), []);

    // Data fetching hooks
    const {
        data: haykalData,
        isLoading: isHaykalLoading,
        error: errorHaykal
    } = useHaykal({
        page: tableState.haykal.pagination.pageIndex + 1,
        page_size: tableState.haykal.pagination.pageSize,
        search: tableState.haykal.filter,
        haykal_id: currentItem?.id,
    });

    const {
        data: groupsData,
        isLoading: isGroupsLoading,
        error: errorGroups
    } = useGroups({
        page: tableState.groups.pagination.pageIndex + 1,
        page_size: tableState.groups.pagination.pageSize,
        search: tableState.groups.query,
        sort: tableState.groups.sorting
    });

    const {
        data: usersData,
        isLoading: isUsersLoading,
        error: errorUsers
    } = useUsers({
        page: tableState.users.pagination.pageIndex + 1,
        page_size: tableState.users.pagination.pageSize,
        search: tableState.users.query,
        sort: tableState.users.sorting
    });

    const clickableBreadcrumbs = useMemo(
        () =>
            history?.map(item => ({
                ...item,
                onClick: () => goToBreadcrumb(item),
                isActive: item.id === currentItem.id,
            })),
        [history, currentItem, goToBreadcrumb]
    );

    // Handler for clicking on a haykal item
    const handleHaykalItemClick = (id, title) => {
        goForward({ id, title });
    };

    // Form submission handler with error handling
    const onSubmit = async (formData) => {
        try {
            // Add type based on active tab
            if (formData.type === 'branches') {
                delete formData.group_ids;
                delete formData.user_ids;
            }

            if (formData.type === 'groups') {
                delete formData.user_ids;
                delete formData.branch_ids;
            }

            if (formData.type === 'users') {
                delete formData.group_ids;
                delete formData.branch_ids;
            }

            addUsersToGroup.mutateAsync({ id, data: formData })

            reset();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        // No need for useEffect - update type directly when tab changes
        setValue('type', tabToTypeMap[newValue]);
    };


    return (
        <DrawerFormContainer
            title="Assign Users"
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
                    <TabContext value={activeTab}>
                        <Grid container spacing={4}>
                            <Grid item size={12}>
                                <Paper elevation={0} sx={{
                                    bgcolor: 'background.default',
                                }}>
                                    <CustomTabList
                                        onChange={handleTabChange}
                                        sx={{
                                            '& .MuiTabs-flexContainer': {
                                                width: '100%'
                                            }
                                        }}
                                    >
                                        <Tab value="0" label="Users" />
                                        <Tab value="1" label="Groups" />
                                        <Tab value="2" label="Branches" />
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item size={12}>
                                {/* Users Tab */}
                                <TabPanel value="0">
                                    <DataView
                                        columns={tableColumns.users}
                                        data={usersData?.items || []}
                                        isLoading={isUsersLoading}
                                        error={errorUsers}
                                        enableSelection
                                        height="calc(100vh - 405px)"
                                        pagination={{
                                            count: usersData?.pagination?.total || 0,
                                            page: tableState.users.pagination.pageIndex,
                                            rowsPerPage: tableState.users.pagination.pageSize
                                        }}
                                        setPagination={(pagination) => {
                                            updateTableState('users', 'pagination', {
                                                pageIndex: pagination.pageIndex,
                                                pageSize: pagination.pageSize
                                            });
                                        }}
                                        selectedRows={usersData?.items?.filter(user => selectedUserIds.includes(user.id))}
                                        setSelectedRows={(value => setValue('user_ids', value.map(item => item.id)))}
                                        disableMultiSelect
                                        slots={{
                                            globalFilter: searchInputs.users,
                                            setGlobalFilter: (value => handleSearchChange('users', value)),
                                            columnVisibility: tableState.users.columnVisibility,
                                            setColumnVisibility: (columnVisibility => updateTableState('users', 'columnVisibility', columnVisibility)),
                                            sorting: tableState.users.sorting,
                                            setSorting: (sorting => updateTableState('users', 'sorting', sorting)),
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
                                        noMobileDataTable
                                    />
                                </TabPanel>

                                {/* Groups Tab */}
                                <TabPanel value="1" >
                                    <DataView
                                        columns={tableColumns.groups}
                                        data={groupsData?.items || []}
                                        isLoading={isGroupsLoading}
                                        error={errorGroups}
                                        enableSelection
                                        height="calc(100vh - 405px)"
                                        pagination={{
                                            count: groupsData?.pagination?.total || 0,
                                            page: tableState.groups.pagination.pageIndex,
                                            rowsPerPage: tableState.groups.pagination.pageSize
                                        }}
                                        setPagination={(pagination) => {
                                            updateTableState('groups', 'pagination', {
                                                pageIndex: pagination.pageIndex,
                                                pageSize: pagination.pageSize
                                            });
                                        }}
                                        selectedRows={groupsData?.items?.filter(group => selectedGroupIds.includes(group.id))}
                                        setSelectedRows={(value => setValue('group_ids', value.map(item => item.id)))}
                                        disableMultiSelect
                                        slots={{
                                            globalFilter: searchInputs.groups,
                                            setGlobalFilter: (value => handleSearchChange('groups', value)),
                                            columnVisibility: tableState.groups.columnVisibility,
                                            setColumnVisibility: (columnVisibility => updateTableState('groups', 'columnVisibility', columnVisibility)),
                                            sorting: tableState.groups.sorting,
                                            setSorting: (sorting => updateTableState('groups', 'sorting', sorting)),
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
                                        noMobileDataTable
                                    />
                                </TabPanel>
                                {/* Branches Tab */}
                                <TabPanel value="2">
                                    <Controller
                                        name="folder_id"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl error={!!error} fullWidth>
                                                <RadioGroup {...field}>
                                                    <DataView
                                                        columns={[
                                                            {
                                                                accessorKey: "id",
                                                                header: "",
                                                                cell: ({ row }) => (
                                                                    <FormControlLabel
                                                                        value={row.original.id}
                                                                        control={<Radio />}
                                                                    />
                                                                ),
                                                                flex: .1
                                                            },
                                                            {
                                                                accessorKey: "title",
                                                                header: "Title",
                                                                flex: 1
                                                            },
                                                            {
                                                                accessorKey: "action",
                                                                header: "",
                                                                cell: ({ row }) =>
                                                                    row.original.has_children && (
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                const next = {
                                                                                    id: row.original.id,
                                                                                    title: row.original.title
                                                                                };
                                                                                goForward(next);
                                                                            }}
                                                                            size="small"
                                                                        >
                                                                            <i className="ri-arrow-right-s-line" />
                                                                        </IconButton>
                                                                    ),
                                                                flex: .075
                                                            }
                                                        ]}
                                                        data={haykalData?.data?.items || []}
                                                        isLoading={isHaykalLoading}
                                                        error={errorHaykal}
                                                        height="calc(100vh - 370px)"
                                                        enableSelection={false}
                                                        pagination={{
                                                            pageIndex: tableState.haykal.pagination.pageIndex,
                                                            pageSize: tableState.haykal.pagination.pageSize,
                                                            total: haykalData?.data?.pagination?.total || 0,
                                                        }}
                                                        setPagination={
                                                            (pagination) => {
                                                                updateTableState('haykal', 'pagination', {
                                                                    pageIndex: pagination.pageIndex,
                                                                    pageSize: pagination.pageSize
                                                                });
                                                            }
                                                        }
                                                        slots={{
                                                            globalFilter: searchInputs.haykal,
                                                            setGlobalFilter: (value) => handleSearchChange('haykal', value),
                                                            columnVisibility: tableState.haykal.columnVisibility,
                                                            setColumnVisibility: (columnVisibility => updateTableState('haykal', 'columnVisibility', columnVisibility)),
                                                            sorting: tableState.haykal.sorting,
                                                            setSorting: (sorting => updateTableState('haykal', 'sorting', sorting)),
                                                            goBack: goBack,
                                                            breadcrumbs: clickableBreadcrumbs,
                                                            features: {
                                                                search: true,
                                                                filter: false,
                                                                columnVisibility: true,
                                                                breadcrumbs: true,
                                                                goBack: true,
                                                            },
                                                            emptyState: {
                                                                height: 'calc(100vh - 524px)'
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
                                </TabPanel>
                            </Grid>
                        </Grid>
                    </TabContext>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <CircularProgress size={16} color="inherit" />}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default GroupUsersDrawer;