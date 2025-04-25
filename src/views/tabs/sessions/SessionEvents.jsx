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

const SessionEvents = ({ session }) => {
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
            header: 'NAME',
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
            header: 'DATE',
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
            header: 'HOURS',
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
            header: 'TYPE',
            accessorKey: 'event_type',
            enableSorting: true,
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.event_type === 'PILT' ? 'Physical' :
                        row.original.event_type === 'VILT' ? 'Virtual' :
                            row.original.event_type === 'PVILT' ? 'Physical & Virtual' :
                                'Online'}
                </Typography>
            )
        },
        {
            id: 'video_conference_tool',
            header: 'VIDEO CONFERENCE TOOL',
            accessorKey: 'custom_url',
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.custom_url ? 'Custom tool' : 'N/A'}
                </Typography>
            )
        },
        {
            id: 'attendance',
            header: 'ATTENDANCE',
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
            header: 'ACTIONS',
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => handleEditEvent(row.original)}
                        >
                            <i className="solar-pen-bold-duotone" fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
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
                label: 'Add Event',
                icon: <i className="lucide-plus" />,
                handler: () => setAddEventDrawerOpen(true)
            }
        ],
        [
            {
                label: 'Export Events',
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
                                message: "No events found",
                                description: "There are no events for this session yet. Add an event to get started.",
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
                                    tooltip: "Add options",
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

            {/* You may need to add an EditEventDrawer component if you want to implement edit functionality */}
            {/* <EditEventDrawer
                open={editEventDrawerOpen}
                onClose={() => setEditEventDrawerOpen(false)}
                sessionId={session?.id}
                eventId={selectedEventId}
            /> */}

            {/* Delete Event Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteEventDialog.open}
                onClose={() => setDeleteEventDialog({ ...deleteEventDialog, open: false })}
                data={{ id: deleteEventDialog.eventId }}
                title={`Delete Event: ${deleteEventDialog.eventName}`}
                message={`Are you sure you want to delete the event "${deleteEventDialog.eventName}"? This action cannot be undone.`}
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