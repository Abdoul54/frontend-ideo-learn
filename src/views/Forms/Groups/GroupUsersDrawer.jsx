'use client';

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Grid,
    Paper,
    Breadcrumbs,
    Typography,
    IconButton,
    Box,
    FormHelperText,
    Tab,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment,
    Stack
} from "@mui/material";

// Custom components
import DrawerFormContainer from "@/components/DrawerFormContainer";
import DataTable from "@/components/datatable/DataTable";

// API hooks
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useAddUsersToGroup, useGroups } from "@/hooks/api/tenant/useGroups";
import { useUsers } from "@/hooks/api/tenant/useUsers";
import { useHistoryNavigation } from "@/hooks/useHistoryNavigation";
import CheckboxesGroup from "@/components/inputs/CheckboxesGroup";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";

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

    // Handler for clicking on a haykal item
    const handleHaykalItemClick = (id, title) => {
        goForward({ id, title });
    };

    // Form submission handler with error handling
    const onSubmit = async (formData) => {
        try {
            // Add type based on active tab
            console.log('Submitting formData:', formData);

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
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{
                                    bgcolor: 'background.default',
                                }}>
                                    <CustomTabList
                                        pill='true'
                                        onChange={handleTabChange}
                                        variant="fullWidth"
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
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                                    {/* Users Tab */}
                                    <TabPanel value="0" sx={{ p: 0, pt: 2 }}>
                                        <Stack>
                                            <Typography variant='h6' gutterBottom>
                                                Select users to assign
                                            </Typography>
                                            {errors?.user_ids && (
                                                <Typography variant='caption' className="text-error">{errors?.user_ids?.message}</Typography>
                                            )}
                                        </Stack>
                                        {/* Users Search */}
                                        <Box sx={{ mb: 3 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Search users..."
                                                variant="outlined"
                                                size="small"
                                                value={searchInputs.users}
                                                onChange={(e) => handleSearchChange('users', e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <i className="lucide-search" style={{ width: 16, height: 16 }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: searchInputs.users ? (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                edge="end"
                                                                onClick={() => handleSearchChange('users', '')}
                                                                size="small"
                                                                aria-label="clear search"
                                                            >
                                                                <i className="lucide-x" style={{ width: 16, height: 16 }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ) : null
                                                }}
                                            />
                                        </Box>

                                        <DataTable
                                            columns={tableColumns.users}
                                            isLoading={isUsersLoading}
                                            error={errorUsers}
                                            totalRows={usersData?.pagination?.total}
                                            pageIndex={tableState.users.pagination.pageIndex}
                                            pageSize={tableState.users.pagination.pageSize}
                                            onPaginationChange={(pagination) => updateTableState('users', 'pagination', pagination)}
                                            onSortingChange={(sorting) => updateTableState('users', 'sorting', sorting)}
                                            sorting={tableState.users.sorting}
                                            data={usersData?.items || []}
                                            selectedRows={usersData?.items?.filter(user => selectedUserIds.includes(user.id))}
                                            onRowSelectionChange={(value) => setValue('user_ids', value.map(item => item.id))}
                                            height="calc(100vh - 390px)"  /* Adjusted for search field */
                                            emptyStateProps={{
                                                height: 'calc(100vh - 545px)', /* Adjusted for search field */
                                                message: isUsersLoading
                                                    ? 'Loading users...'
                                                    : searchInputs.users
                                                        ? 'No users found matching your search'
                                                        : 'No users found'
                                            }}
                                            enableSelection
                                        />
                                    </TabPanel>

                                    {/* Groups Tab */}
                                    <TabPanel value="1" sx={{ p: 0, pt: 2 }}>
                                        <Stack>
                                            <Typography variant='h6' gutterBottom>
                                                Select groups to assign
                                            </Typography>
                                            {errors?.group_ids && (
                                                <Typography variant='caption' className="text-error">{errors?.group_ids?.message}</Typography>
                                            )}
                                        </Stack>
                                        {/* Groups Search */}
                                        <Box sx={{ mb: 3 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Search groups..."
                                                variant="outlined"
                                                size="small"
                                                value={searchInputs.groups}
                                                onChange={(e) => handleSearchChange('groups', e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <i className="lucide-search" style={{ width: 16, height: 16 }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: searchInputs.groups ? (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                edge="end"
                                                                onClick={() => handleSearchChange('groups', '')}
                                                                size="small"
                                                                aria-label="clear search"
                                                            >
                                                                <i className="lucide-x" style={{ width: 16, height: 16 }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ) : null
                                                }}
                                            />
                                        </Box>

                                        <DataTable
                                            columns={tableColumns.groups}
                                            isLoading={isGroupsLoading}
                                            error={errorGroups}
                                            totalRows={groupsData?.pagination?.total}
                                            pageIndex={tableState.groups.pagination.pageIndex}
                                            pageSize={tableState.groups.pagination.pageSize}
                                            data={groupsData?.items || []}
                                            onPaginationChange={(pagination) => updateTableState('groups', 'pagination', pagination)}
                                            onSortingChange={(sorting) => updateTableState('groups', 'sorting', sorting)}
                                            sorting={tableState.groups.sorting}
                                            selectedRows={groupsData?.items?.filter(group => selectedGroupIds.includes(group.id))}
                                            onRowSelectionChange={(value) => setValue('group_ids', value.map(item => item.id))}
                                            height="calc(100vh - 390px)"  /* Adjusted for search field */
                                            emptyStateProps={{
                                                height: 'calc(100vh - 545px)', /* Adjusted for search field */
                                                message: isGroupsLoading
                                                    ? 'Loading groups...'
                                                    : searchInputs.groups
                                                        ? 'No groups found matching your search'
                                                        : 'No groups found'
                                            }}
                                            enableSelection
                                        />
                                    </TabPanel>

                                    {/* Branches Tab */}
                                    <TabPanel value="2" sx={{ p: 0, pt: 2 }}>
                                        <Stack>
                                            <Typography variant='h6' gutterBottom>
                                                Select branches to assign
                                            </Typography>
                                            {errors?.branch_ids && (
                                                <Typography variant='caption' className="text-error">{errors?.branch_ids?.message}</Typography>
                                            )}
                                        </Stack>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2
                                        }}>
                                            {history.length > 1 && (
                                                <IconButton
                                                    onClick={goBack}
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    aria-label="Go back"
                                                >
                                                    <i className="lucide-chevron-left" style={{ width: 20, height: 20 }} />
                                                </IconButton>
                                            )}

                                            <Breadcrumbs separator="›" aria-label="breadcrumb">
                                                {/* Platform as root */}
                                                <Button
                                                    variant="text"
                                                    color={currentItem?.id === 1 ? "primary" : "inherit"}
                                                    onClick={() => goToBreadcrumb({ id: 1, title: 'Platform' })}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: currentItem?.id === 1 ? 600 : 400
                                                    }}
                                                >
                                                    Platform
                                                </Button>

                                                {/* Rest of the path */}
                                                {history.map((item, index) => (
                                                    index === 0 && item.id === 1 ? null : (
                                                        <Button
                                                            key={index}
                                                            variant="text"
                                                            color={currentItem?.id === item.id ? "primary" : "inherit"}
                                                            onClick={() => goToBreadcrumb(item)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontWeight: currentItem?.id === item.id ? 600 : 400
                                                            }}
                                                        >
                                                            {item.title || 'Unnamed'}
                                                        </Button>
                                                    )
                                                ))}
                                            </Breadcrumbs>
                                        </Box>

                                        {/* Branches Search */}
                                        <Box sx={{ mb: 3 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Search branches..."
                                                variant="outlined"
                                                size="small"
                                                value={searchInputs.haykal}
                                                onChange={(e) => handleSearchChange('haykal', e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <i className="lucide-search" style={{ width: 16, height: 16 }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: searchInputs.haykal ? (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                edge="end"
                                                                onClick={() => handleSearchChange('haykal', '')}
                                                                size="small"
                                                                aria-label="clear search"
                                                            >
                                                                <i className="lucide-x" style={{ width: 16, height: 16 }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ) : null
                                                }}
                                            />
                                        </Box>

                                        {isHaykalLoading ? (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                py: 4
                                            }}>
                                                <CircularProgress size={24} />
                                                <Typography variant="body2" sx={{ ml: 2 }}>
                                                    Loading branches...
                                                </Typography>
                                            </Box>
                                        ) : (haykalData?.data?.items?.length === 0 && currentItem?.id !== 1) ? (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                py: 4,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px dashed',
                                                borderColor: 'divider'
                                            }}>
                                                <i className="lucide-folder" style={{ width: 40, height: 40, opacity: 0.5 }} />
                                                <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                                                    {searchInputs.haykal
                                                        ? 'No branches found matching your search'
                                                        : 'No branches found'}
                                                </Typography>
                                                {searchInputs.haykal && (
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={() => handleSearchChange('haykal', '')}
                                                        startIcon={<i className="lucide-refresh-cw" style={{ width: 16, height: 16 }} />}
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                            </Box>
                                        ) : (
                                            <CheckboxesGroup
                                                items={[
                                                    // Platform as first item if not at root
                                                    ...(currentItem?.id === 1 ? [{
                                                        id: 1,
                                                        title: 'Platform',
                                                        has_children: false,
                                                        _style: {
                                                            background: 'rgba(var(--mui-palette-primary-mainChannel) / 0.05)',
                                                            borderBottom: '1px solid',
                                                            borderColor: 'divider',
                                                            borderRadius: '4px 4px 0 0',
                                                            padding: '12px 16px',
                                                        }
                                                    }] : []),
                                                    // Items from API with enhanced display
                                                    ...(haykalData?.data?.items || []).map(item => ({
                                                        ...item,
                                                        _style: {
                                                            borderBottom: '1px solid',
                                                            borderColor: 'divider',
                                                            transition: 'background-color 0.2s ease',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.04)'
                                                            }
                                                        }
                                                    }))
                                                ]}
                                                control={control}
                                                name="branch_ids"
                                                getItemId={(item) => item.id}
                                                getItemLabel={(item) => item.title}
                                                getItemStyle={(item) => item._style || {}}
                                                pagination={{
                                                    count: haykalData?.data?.pagination?.total || 0,
                                                    page: tableState.haykal.pagination.pageIndex,
                                                    rowsPerPage: tableState.haykal.pagination.pageSize
                                                }}
                                                onPaginationChange={(newPagination) => {
                                                    updateTableState('haykal', 'pagination', {
                                                        pageIndex: newPagination.pageIndex,
                                                        pageSize: newPagination.pageSize
                                                    });
                                                }}
                                                onItemClick={(id, title) => {
                                                    if (id !== 1 || currentItem?.id === 1) {
                                                        handleHaykalItemClick(id, title);
                                                    }
                                                }}
                                            />
                                        )}
                                    </TabPanel>
                                </Paper>
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