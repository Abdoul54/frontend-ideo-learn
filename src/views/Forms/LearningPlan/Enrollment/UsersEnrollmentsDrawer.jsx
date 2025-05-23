'use client';

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
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
    FormControlLabel,
    Checkbox
} from "@mui/material";

// Custom components
import DrawerFormContainer from "@/components/DrawerFormContainer";

// API hooks
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useGroups } from "@/hooks/api/tenant/useGroups";
import { useUsers } from "@/hooks/api/tenant/useUsers";
import { useHistoryNavigation } from "@/hooks/useHistoryNavigation";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import DataView from "@/views/DataView";
import DateInput from "@/components/inputs/DateInput";
import dayjs from "dayjs";
import { useEnrollUsers } from "@/hooks/api/tenant/learn/useLearningPlan";


const UsersEnrollmentsDrawer = ({ open, onClose, data }) => {
    // State for active tab and automatically set type via watch/setValue
    const [activeTab, setActiveTab] = useState("users");

    // Form with improved integration to tabs
    const { control, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            user_ids: [],
            branches: [],
            group_ids: [],
            date_begin_validity: null,
            date_expire_validity: null
        }
    });

    const enrollUsers = useEnrollUsers();

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
    const selectedBranchIds = watch('branches');

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
                        label={row?.original?.status === '1' ? 'Active' : 'Inactive'}
                        color={row?.original?.status === '1' ? "success" : "warning"}
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

    // Form submission handler with error handling
    const onSubmit = async (formData) => {
        try {
            enrollUsers.mutateAsync({ learningPlanId: data?.id, data: formData }).then(() => {
                reset();
                onClose();
            });

        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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
                                <CustomTabList
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTabs-flexContainer': {
                                            width: '100%'
                                        }
                                    }}
                                >
                                    <Tab value="users" label="Users" />
                                    <Tab value="groups" label="Groups" />
                                    <Tab value="branches" label="Branches" />
                                </CustomTabList>
                            </Grid>
                            <Grid item size={12}>
                                {/* Users Tab */}
                                <TabPanel value="users">
                                    <DataView
                                        columns={tableColumns.users}
                                        data={usersData?.items || []}
                                        isLoading={isUsersLoading}
                                        error={errorUsers}
                                        enableSelection
                                        height="calc(100vh - 418px)"
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
                                                height: 'calc(100vh - 576px)'
                                            }
                                        }}
                                        noToolBar
                                        noMobileDataTable
                                    />
                                </TabPanel>

                                {/* Groups Tab */}
                                <TabPanel value="groups">
                                    <DataView
                                        columns={tableColumns.groups}
                                        data={groupsData?.items || []}
                                        isLoading={isGroupsLoading}
                                        error={errorGroups}
                                        enableSelection
                                        height="calc(100vh - 418px)"
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
                                                height: 'calc(100vh - 576px)'
                                            }
                                        }}
                                        noToolBar
                                        noMobileDataTable
                                    />
                                </TabPanel>
                                {/* Branches Tab */}
                                <TabPanel value="branches">
                                    <DataView
                                        columns={[
                                            {
                                                accessorKey: "id",
                                                header: "",
                                                cell: ({ row }) => {
                                                    // Find current status from selectedBranchIds
                                                    const currentStatusObj = selectedBranchIds.find(idObj => idObj.branch_id === row.id);
                                                    const status = currentStatusObj?.selected_status || 0;

                                                    // Handler cycles 0 -> 1 -> 2 -> 0
                                                    const onCheckboxChange = () => {
                                                        let newStatus;
                                                        if (status === 0) newStatus = 1;
                                                        else if (status === 1) newStatus = 2;
                                                        else newStatus = 0;

                                                        // Remove existing entry for this row
                                                        let updatedBranchIds = selectedBranchIds.filter(idObj => idObj.branch_id !== row.id);

                                                        // Add new status only if not zero (unchecked)
                                                        if (newStatus !== 0) {
                                                            updatedBranchIds.push({ branch_id: row.id, selected_status: newStatus });
                                                        }

                                                        // Call your setter from react-hook-form or state here
                                                        setValue("branches", updatedBranchIds);
                                                        // If you need to update state too:
                                                        // setSelectedBranchIds(updatedBranchIds);
                                                    };

                                                    return (
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={status === 2}
                                                                    indeterminate={status === 1}
                                                                    onChange={onCheckboxChange}
                                                                />
                                                            }
                                                        />
                                                    );
                                                },
                                                enableSorting: false,
                                                flex: 0.05,
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
                                        intermediate={(row) => {
                                            const selected = selectedBranchIds.some(id => id.id === row.id)
                                            const selectedChildren = selectedBranchIds.some(id => id.id === row.id && id.selected_status === 1)
                                            console.log('selected', selectedChildren);
                                            return selected || selectedChildren;
                                        }}
                                        height="calc(100vh - 418px)"
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
                                                height: 'calc(100vh - 576px)'
                                            }
                                        }}
                                        noToolBar
                                        disableMultiSelect
                                        noMobileDataTable
                                    />
                                </TabPanel>
                            </Grid>
                            <Grid item size={12}>
                                <DateInput
                                    label="Date Begin Validity"
                                    control={control}
                                    name="date_begin_validity"
                                    minDate={new Date()}
                                    maxDate={watch('date_expire_validity')}

                                />
                            </Grid>
                            <Grid item size={12}>
                                <DateInput
                                    label="Date Expire Validity"
                                    control={control}
                                    name="date_expire_validity"
                                    minDate={dayjs(watch('date_begin_validity')).add(1, 'day')}
                                />
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
                        disabled={enrollUsers?.isPending ||
                            (selectedBranchIds?.length === 0 && selectedUserIds?.length === 0 && selectedGroupIds?.length === 0)}
                        startIcon={enrollUsers?.isPending ? <i className="svg-spinners-90-ring" /> : null}

                    >
                        {
                            enrollUsers?.isPending ?
                                "Saving..." :
                                "Save"
                        }
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default UsersEnrollmentsDrawer;