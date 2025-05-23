import React, { useState } from 'react';
import { useCourseSessions, useDeleteCourseSession } from '@/hooks/api/tenant/learn/course/useCourse';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import DataView from "@/views/DataView";
import OptionMenu from '@/@core/components/option-menu';
import DeleteConfirmationDialog from '@/views/Dialogs/DeleteConfirmation';
import AddSessionDrawer from '@/views/Drawers/Learn/session/AddSessionDrawer';
import { useTranslation } from '@/@core/contexts/translationContext';

const CourseSessionsTab = ({ courseId }) => {
    const { translate } = useTranslation();

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([{ id: 'name', desc: true }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [filters, setFilters] = useState(null);
    const [columnVisibility, setColumnVisibility] = useState({});

    // Drawer states
    const [addSessionDrawerOpen, setAddSessionDrawerOpen] = useState(false);

    // Dialog states
    const [deleteSessionDialog, setDeleteSessionDialog] = useState({
        open: false,
        sessionIds: [],
        isMultiple: false
    });

    // API mutations
    const deleteSessionMutation = useDeleteCourseSession();

    // Fetch sessions data
    const {
        data: sessionsData,
        isLoading,
        error
    } = useCourseSessions({
        courseId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sort_attr: sorting[0]?.id || 'name',
        sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
        search_text: searchQuery
    });

    // Handler for deleting a session
    const handleDeleteSession = (session) => {
        setDeleteSessionDialog({
            open: true,
            sessionIds: [session.id],
            isMultiple: false
        });
    };

    // Handler for deleting multiple selected sessions
    const handleDeleteSelectedSessions = (sessions) => {
        setDeleteSessionDialog({
            open: true,
            sessionIds: sessions.map(session => session.id),
            isMultiple: true
        });
    };

    // Define columns for the DataTable
    const columns = [
        {
            accessorKey: 'name',
            header: translate('Course management.TABLE_HEADER_SESSION_NAME', 'Session Name'),
            cell: ({ row }) => (
                <Typography
                    variant="body2"
                    sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => {
                        window.location.href = `/learn/course/session/${row.original.id}`;
                    }}
                >
                    {row.original.name}
                </Typography>
            ),
            size: 200
        },
        {
            accessorKey: 'code',
            header: translate('Course management.TABLE_HEADER_SESSION_CODE', 'Session Code'),
            cell: ({ row }) => <Typography variant="body2">{row.original.code}</Typography>,
            size: 150
        },
        {
            accessorKey: 'enrollment_deadline',
            header: translate('Course management.FIELD_ENROLLMENT_DEADLINE', 'Enrollment Deadline'),
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.enrollment_deadline
                        ? new Date(row.original.enrollment_deadline).toLocaleDateString()
                        : translate('common.not_set', 'Not Set')}
                </Typography>
            ),
            size: 150
        },
        {
            accessorKey: 'min_enroll',
            header: translate('Course management.TABLE_HEADER_MIN_ENROLLMENT', 'Min Enrollment'),
            cell: ({ row }) => <Typography variant="body2">{row.original.min_enroll}</Typography>,
            size: 120
        },
        {
            accessorKey: 'max_enroll',
            header: translate('Course management.TABLE_HEADER_MAX_ENROLLMENT', 'Max Enrollment'),
            cell: ({ row }) => <Typography variant="body2">{row.original.max_enroll}</Typography>,
            size: 120
        },
        {
            accessorKey: 'instructors',
            header: translate('Course management.TABLE_HEADER_INSTRUCTORS', 'Instructors'),
            cell: ({ row }) => {
                const instructors = row.original.instructors || [];
                return (
                    <Typography variant="body2">
                        {instructors.length > 0
                            ? instructors.map(instructor => instructor.name).join(', ')
                            : translate('Course management.NO_INSTRUCTORS_ASSIGNED', 'No instructors assigned')}
                    </Typography>
                );
            },
            size: 200
        },
        // Action column
        {
            id: 'actions',
            header: translate('Course management.TABLE_HEADER_ACTIONS', 'Actions'),
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <OptionMenu
                        menuProps={{
                            elevation: 2,
                            sx: { '& .MuiMenu-paper': { minWidth: 150 } }
                        }}
                        iconButtonProps={{ size: 'small' }}
                        icon={<i className="solar-menu-dots-bold" size={16} />}
                        options={[
                            {
                                text: translate('common.edit', 'Edit'),
                                icon: <i className="solar-pen-2-line-duotone" size={14} />,
                                menuItemProps: {
                                    onClick: () => {
                                        // Handle edit action
                                        window.location.href = `/learn/course/session/${row.original.id}`;
                                    },
                                    sx: { py: 1.5 }
                                }
                            },
                            {
                                text: translate('common.delete', 'Delete'),
                                icon: <i className="solar-trash-bin-2-bold-duotone" size={14} />,
                                menuItemProps: {
                                    onClick: () => handleDeleteSession(row.original),
                                    sx: { py: 1.5, color: 'error.main' }
                                }
                            }
                        ]}
                    />
                </Box>
            ),
            size: 80
        }
    ];

    // Define custom action groups
    const actionGroups = [
        [
            {
                id: 'delete-selected',
                label: translate('Course management.DELETE_SELECTED', 'Delete Selected'),
                icon: <i className="solar-trash-bin-2-bold-duotone" size={18} />,
                handler: (rows) => {
                    handleDeleteSelectedSessions(rows);
                },
                disabled: selectedRows.length === 0,
            },
        ],
    ];

    // Button actions for toolbar
    const actionItems = [
        [
            {
                id: 'add-session',
                label: translate('Course management.MENU_ADD_SESSION', 'Add Session'),
                icon: <i className="solar-document-add-bold-duotone" />,
                handler: () => {
                    setAddSessionDrawerOpen(true);
                },
            }
        ],
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" color="error">{translate('Course management.ERROR_LOADING_SESSIONS', 'Error loading sessions')}</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    {error.message || translate('Course management.ERROR_LOADING_DATA', "An error occurred while loading session data.")}
                </Typography>
            </Paper>
        );
    }

    const transformedSessionsData = {
        items: sessionsData?.items || [],
        total: sessionsData?.pagination?.total || 0
    };

    return (
        <>
            <DataView
                title={translate('Course management.TAB_SESSIONS', 'Course Sessions')}
                height="calc(100vh - 253px)"
                columns={columns}
                pagination={{
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                    total: transformedSessionsData.total
                }}
                setPagination={setPagination}
                data={transformedSessionsData.items}
                getRowId={(row) => row.id}
                slots={{
                    filters,
                    setFilters,
                    globalFilter: searchQuery,
                    setGlobalFilter: setSearchQuery,
                    sorting,
                    setSorting,
                    columnVisibility,
                    setColumnVisibility,
                    features: {
                        search: true,
                        filter: true,
                        columnVisibility: true
                    },
                    emptyState: {
                        message: translate('Course management.NO_SESSIONS_FOUND', "No sessions found"),
                        description: translate('Course management.NO_SESSIONS_YET', "This course has no sessions yet. Add a new session to get started."),
                        height: "calc(100vh - 408px)",
                    }
                }}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
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
                            tooltip: translate('common.add_options', "Add options"),
                        }
                    ]
                }}
                onDeleteSelected={handleDeleteSelectedSessions}
                actionGroups={actionGroups}
            />

            {/* Add Session Drawer */}
            <AddSessionDrawer
                open={addSessionDrawerOpen}
                onClose={() => setAddSessionDrawerOpen(false)}
                courseId={courseId}
            />

            {/* Delete Session Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteSessionDialog.open}
                onClose={() => setDeleteSessionDialog({ ...deleteSessionDialog, open: false })}
                data={{ ids: deleteSessionDialog.sessionIds }}
                title={deleteSessionDialog.isMultiple
                    ? translate('Course management.DELETE_MULTIPLE_SESSIONS', {count: deleteSessionDialog.sessionIds.length})
                    : translate('Course management.DELETE_SESSION', 'Delete Session')}
                message={deleteSessionDialog.isMultiple
                    ? translate('Course management.CONFIRM_DELETE_MULTIPLE_SESSIONS', 'Are you sure you want to delete these sessions? This action cannot be undone.')
                    : translate('Course management.CONFIRM_DELETE_SESSION', 'Are you sure you want to delete this session? This action cannot be undone.')}
                onSubmit={() => {
                    const ids = deleteSessionDialog.sessionIds;
                    if (ids && ids.length > 0) {
                        // Handle both single and multiple deletions through the same hook
                        deleteSessionMutation.mutate(
                            {
                                // For single deletion, pass the single ID
                                // For multiple deletions, pass the array of IDs
                                sessionIds: deleteSessionDialog.isMultiple ? ids : ids[0],
                                courseId // Include courseId for query invalidation
                            },
                            {
                                onSuccess: () => {
                                    setDeleteSessionDialog({ open: false, sessionIds: [], isMultiple: false });
                                    setSelectedRows([]);
                                },
                                onError: (error) => {
                                    console.error('Error deleting sessions:', error);
                                }
                            }
                        );
                    } else {
                        setDeleteSessionDialog({ open: false, sessionIds: [], isMultiple: false });
                    }
                }}
            />
        </>
    );
};

export default CourseSessionsTab;