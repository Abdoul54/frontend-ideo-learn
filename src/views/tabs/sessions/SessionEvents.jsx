'use client';
import React, { useState, useCallback } from 'react';
import {
    Grid,
    Typography,
    Button,
    IconButton,
    Box,
    Chip,
    CircularProgress,
    Paper,
    Tooltip
} from '@mui/material';
import dayjs from 'dayjs';
import DataView from "@/views/DataView";
import DeleteConfirmationDialog from '@/views/Dialogs/DeleteConfirmation';
import AddEventDrawer from '@/views/Drawers/Learn/session/AddEventDrawer';
import { useDeleteSessionEvent, useSessionEvents } from '@/hooks/api/tenant/learn/sessions/useSessionEvents';
import OptionMenu from '@/@core/components/option-menu';
import { useTranslation } from '@/@core/contexts/translationContext';

const SessionEvents = ({ session }) => {
    const { translate } = useTranslation();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([{ id: 'day', desc: false }]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [addEventDrawerOpen, setAddEventDrawerOpen] = useState(false);
    const [editEventDrawerOpen, setEditEventDrawerOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Dialog states
    const [deleteEventDialog, setDeleteEventDialog] = useState({
        open: false,
        eventId: null,
        eventName: ''
    });

    // Fetch session events data
    const { data: eventsData, isLoading, error } = useSessionEvents(session?.id, {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sort_attr: sorting[0]?.id || 'day',
        sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
        search: searchQuery
    });

    // Delete event mutation
    const deleteEventMutation = useDeleteSessionEvent();

    // Handle event deletion
    const handleDeleteEvent = (event) => {
        setDeleteEventDialog({
            open: true,
            eventId: event.id,
            eventName: event.name
        });
    };

    // Handle event editing
    const handleEditEvent = (event) => {
        setSelectedEventId(event.id);
        setEditEventDrawerOpen(true);
        console.log("Edit event:", event);
        // The edit functionality would normally go here or be handled by an edit drawer
    };

    // Handle exporting events
    const handleExportEvents = () => {
        console.log("Export events");
        // Implementation for exporting events would go here
    };

    // Format date time
    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        try {
            return dayjs(dateTime).format('HH:mm');
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Define columns for the DataView
    const columns = [
        {
            id: 'name',
            header: translate('Course management.TABLE_HEADER_SESSION_NAME', 'NAME'),
            accessorKey: 'name',
            enableSorting: true,
            cell: ({ row }) => (
                <Typography variant="body2" noWrap
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.main'
                        },
                        fontWeight: 500
                    }}
                    onClick={() => {
                        window.location.href = `/learn/course/event/${row.original.id}?tab=properties`;
                    }}
                >
                    {row.original.name}
                </Typography>
            )
        },
        {
            id: 'day',
            header: translate('Course management.TABLE_HEADER_DATE', 'DATE'),
            accessorKey: 'day',
            enableSorting: true,
            cell: ({ row }) => {
                // First try to use time_begin, fallback to day field
                const dateValue = row.original.day;
                return (
                    <Typography variant="body2">
                        {dateValue ? dayjs(dateValue).format('DD/MM/YYYY') : 'N/A'}
                    </Typography>
                );
            }
        },
        {
            id: 'hours',
            header: translate('Course management.TABLE_HEADER_HOURS', 'HOURS'),
            accessorKey: 'duration_minutes',
            enableSorting: true,
            cell: ({ row }) => {
                const duration = row.original.duration_minutes;
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                return (
                    <Typography variant="body2">
                        {`${hours}h ${minutes.toString().padStart(2, '0')}m`}
                    </Typography>
                );
            }
        },
        {
            id: 'type',
            header: translate('Course management.TABLE_HEADER_EVENT_TYPE', 'TYPE'),
            accessorKey: 'event_type',
            enableSorting: true,
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.event_type === 'PILT' ? translate('Course management.CHECKBOX_PHYSICAL_LEARNING', 'Physical') :
                        row.original.event_type === 'VILT' ? translate('Course management.CHECKBOX_VIRTUAL_LEARNING', 'Virtual') :
                            row.original.event_type === 'PVILT' ? translate('Course management.CHECKBOX_PHYSICAL_AND_VIRTUAL', 'Physical & Virtual') :
                                translate('Course management.ONLINE', 'Online')}
                </Typography>
            )
        },
        {
            id: 'video_conference_tool',
            header: translate('Course management.TABLE_HEADER_VIDEO_CONFERENCE_TOOL', 'VIDEO CONFERENCE TOOL'),
            accessorKey: 'custom_url',
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.custom_url ? translate('Course management.CUSTOM_TOOL', 'Custom tool') : 'N/A'}
                </Typography>
            )
        },
        {
            id: 'attendance',
            header: translate('Course management.TABLE_HEADER_ATTENDANCE', 'ATTENDANCE'),
            accessorKey: 'attendances_count',
            cell: ({ row }) => {
                const attendanceCount = row.original.attendances_count?.present || 0;
                const totalCount = (row.original.attendances_count?.present || 0) + (row.original.attendances_count?.absent || 0);
                return (
                    <Typography variant="body2">
                        {`${attendanceCount}/${totalCount || 0}`}
                    </Typography>
                );
            }
        },
        {
            id: 'actions',
            header: translate('Course management.TABLE_HEADER_ACTIONS', 'ACTIONS'),
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={translate('common.edit', 'Edit')}>
                        <IconButton
                            size="small"
                            onClick={() => handleEditEvent(row.original)}
                        >
                            <i className="solar-pen-bold-duotone" fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={translate('common.delete', 'Delete')}>
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteEvent(row.original)}
                        >
                            <i className="solar-trash-bin-trash-bold-duotone" fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    // Transform API response for the DataView
    const transformedEventsData = {
        items: eventsData?.items || [],
        total: eventsData?.pagination?.total || 0
    };

    // Action items for the toolbar
    const actionItems = [
        [
            {
                label: translate('Course management.MENU_ADD_EVENT', 'Add Event'),
                icon: <i className="lucide-plus" />,
                handler: () => setAddEventDrawerOpen(true)
            }
        ],
        [
            {
                label: translate('Course management.MENU_EXPORT_EVENTS', 'Export Events'),
                icon: <i className="solar-download-bold-duotone" />,
                handler: () => handleExportEvents()
            }
        ],
    ];

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <DataView
                        columns={columns}
                        data={transformedEventsData.items}
                        isLoading={isLoading}
                        error={error}
                        pagination={{
                            pageIndex: pagination.pageIndex,
                            pageSize: pagination.pageSize,
                            total: transformedEventsData.total
                        }}
                        setPagination={setPagination}
                        getRowId={(row) => row.id}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        slots={{
                            globalFilter: searchQuery,
                            setGlobalFilter: setSearchQuery,
                            sorting,
                            setSorting,
                            columnVisibility,
                            setColumnVisibility,
                            features: {
                                search: true,
                                filter: false,
                                navigation: false,
                                columnVisibility: true
                            },
                            emptyState: {
                                message: translate('Course management.NO_EVENTS_FOUND', 'No events found'),
                                description: translate('Course management.NO_EVENTS_DESCRIPTION', 'There are no events for this session yet. Add an event to get started.'),
                                height: 'calc(100vh - 400px)'
                            }
                        }}
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
                                    tooltip: translate('common.add_options', 'Add options'),
                                }
                            ]
                        }}
                    />
                </Grid>
            </Grid>

            {/* Add Event Drawer */}
            <AddEventDrawer
                open={addEventDrawerOpen}
                onClose={() => setAddEventDrawerOpen(false)}
                sessionId={session?.id}
            />

            {/* Delete Event Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteEventDialog.open}
                onClose={() => setDeleteEventDialog({ ...deleteEventDialog, open: false })}
                data={{ id: deleteEventDialog.eventId }}
                title={translate('Course management.DELETE_EVENT', `Delete Event: ${deleteEventDialog.eventName}`)}
                message={translate('Course management.DELETE_EVENT_CONFIRMATION', `Are you sure you want to delete the event "${deleteEventDialog.eventName}"? This action cannot be undone.`)}
                onSubmit={() => {
                    deleteEventMutation.mutate({
                        sessionId: session?.id,
                        eventId: deleteEventDialog.eventId
                    }, {
                        onSuccess: () => {
                            setDeleteEventDialog({ open: false, eventId: null, eventName: '' });
                        }
                    });
                }}
            />
        </>
    );
};

export default SessionEvents;