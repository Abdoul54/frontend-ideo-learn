'use client';
import React, { useState } from 'react';
import {
    Grid,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Button
} from '@mui/material';
import dayjs from 'dayjs';
import DataView from "@/views/DataView";
import { useEventAttendances } from '@/hooks/api/tenant/learn/sessions/useSessionEvents';
import OptionMenu from '@/@core/components/option-menu';
import AttendanceDrawer from '@/views/Drawers/Learn/event/AttendanceDrawer';
const EventAttendance = ({ event }) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
    const [sorting, setSorting] = useState([{ id: 'user_name', desc: false }]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    // Fetch event attendances data
    const { data: attendancesData, isLoading, error } = useEventAttendances(event?.id, {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sort_attr: sorting[0]?.id || 'user_name',
        sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
        search: searchQuery
    });

    // Open attendance drawer
    const handleOpenAttendanceDrawer = (attendance) => {
        setSelectedAttendance(attendance);
        setDrawerOpen(true);
    };

    // Define status chip color
    const getStatusChipColor = (status) => {
        switch (status) {
            case 'present':
                return 'success';
            case 'absent':
                return 'error';
            default:
                return 'default';
        }
    };

    // Define columns for the DataView
    const columns = [
        {
            id: 'user',
            header: 'LEARNER',
            accessorKey: 'user.full_name',
            enableSorting: true,
            cell: ({ row }) => (
                <Box>
                    <Typography variant="body2" fontWeight="500">
                        {row.original.user?.full_name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.original.user?.email || 'No email'}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'status',
            header: 'ATTENDANCE STATUS',
            accessorKey: 'status',
            enableSorting: true,
            cell: ({ row }) => (
                <Chip
                    label={row.original.status ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) : 'Not set'}
                    size="small"
                    color={getStatusChipColor(row.original.status)}
                    sx={{ fontWeight: 500, minWidth: 80 }}
                />
            )
        },
        {
            id: 'attendance_time',
            header: 'ATTENDANCE TIME',
            accessorKey: 'attendance_time',
            enableSorting: true,
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.attendance_time ? dayjs(row.original.attendance_time).format('DD/MM/YYYY HH:mm') : 'N/A'}
                </Typography>
            )
        },
        {
            id: 'last_updated',
            header: 'LAST UPDATED',
            accessorKey: 'updated_at',
            enableSorting: true,
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.updated_at ? dayjs(row.original.updated_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
                </Typography>
            )
        },
        {
            id: 'actions',
            header: 'ACTIONS',
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Mark Attendance">
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenAttendanceDrawer(row.original)}
                            startIcon={<i className="solar-clipboard-check-bold-duotone" fontSize="small" />}
                        >
                            Mark Attendance
                        </Button>
                    </Tooltip>
                </Box>
            )
        }
    ];

    // Transform API response for the DataView
    const transformedAttendancesData = {
        items: attendancesData?.items || [],
        total: attendancesData?.pagination?.total || 0
    };

    // Action items for the toolbar
    const actionItems = [
        [
        //     {
        //         label: 'Mark All Present',
        //         icon: <i className="solar-check-square-bold-duotone" />,
        //         handler: () => {
        //             // Implementation for marking all present would go here
        //             console.log("Mark all present");
        //         }
        //     },
        //     {
        //         label: 'Mark All Absent',
        //         icon: <i className="solar-close-square-bold-duotone" />,
        //         handler: () => {
        //             // Implementation for marking all absent would go here
        //             console.log("Mark all absent");
        //         }
        //     }
        // ],
        // [
        //     {
        //         label: 'Export Attendance',
        //         icon: <i className="solar-download-bold-duotone" />,
        //         handler: () => {
        //             // Implementation for exporting attendance would go here
        //             console.log("Export attendance");
        //         }
        //     }
        ]
    ];

    // Empty state content
    const emptyStateContent = (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>No attendance records found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                There are no attendance records for this event yet. You can add learners to this event and mark their attendance.
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    maxWidth: 500,
                    mx: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Tips for managing attendance
                </Typography>
                <Typography variant="body2" paragraph>
                    • You can mark attendance as Present, Absent, or Not Set
                </Typography>
                <Typography variant="body2" paragraph>
                    • Attendance can be updated at any time
                </Typography>
                <Typography variant="body2">
                    • Use the search to find specific learners quickly
                </Typography>
            </Paper>
        </Box>
    );

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Attendance Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage attendance records for this event. Mark learners as present or absent.
                        </Typography>
                    </Box>

                    <DataView
                        columns={columns}
                        data={transformedAttendancesData.items}
                        isLoading={isLoading}
                        error={error}
                        pagination={{
                            pageIndex: pagination.pageIndex,
                            pageSize: pagination.pageSize,
                            total: transformedAttendancesData.total
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
                                message: "No attendance records found",
                                description: "There are no attendance records for this event yet.",
                                content: emptyStateContent,
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
                                            icon={<i className="lucide-more-horizontal" />}
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
                                    tooltip: "Attendance options",
                                }
                            ]
                        }}
                    />
                </Grid>
            </Grid>

            {/* Attendance Drawer */}
            <AttendanceDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                eventId={event?.id}
                attendanceData={selectedAttendance}
            />
        </>
    );
};

export default EventAttendance;