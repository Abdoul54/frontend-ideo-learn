import React, { useState } from 'react';
import DataView from "@/views/DataView";
import { useDeleteClassroom } from '@/hooks/api/tenant/learn/classrooms-locations/useClassrooms';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Chip } from '@mui/material';
import OptionMenu from '@/@core/components/option-menu';
import { useEnrollments, useUnenrollUsers } from '@/hooks/api/tenant/learn/enrollment/UseEnrollments';

const CourseEnrollmentsTab = ({ courseId }) => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null,
        type: null,
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});
    const { data, isLoading, error } = useEnrollments({
        courseId: courseId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    })

    const columns = [
        {
            accessorKey: 'user.username',
            header: 'Username',
            flex: 1
        },
        {
            accessorKey: 'user.first_name',
            header: 'First Name',
            flex: 1
        },
        {
            accessorKey: 'user.last_name',
            header: 'Last Name',
            flex: 1
        },
        {
            accessorKey: 'user.email',
            header: 'Email',
            flex: 1
        },
        {
            accessorKey: 'status_label',
            header: 'Enrollment Status',
            cell: ({ row }) => {
                const status = row?.original?.status_label;
                return (
                    <Chip label={status} variant='outlined' />
                );
            },
            flex: 1
        },
        {
            accessorKey: 'enrollment_date',
            header: 'Enrollment Date',
            cell: ({ row }) => {
                const date = new Date(row?.original?.enrollment_date);
                return (
                    <span>{date.toLocaleString('fr-FR')}</span>
                );
            },
            flex: 1
        },
        {
            accessorKey: 'actions',
            header: '',
            cell: ({ row }) => (
                <OptionMenu
                    options={[
                        {
                            text: 'Unenroll',
                            icon: <i className="solar-list-cross-minimalistic-outline" />,
                            menuItemProps: {
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmation({
                                        open: true,
                                        data: row?.original,
                                        type: 'deleteOne',
                                        variant: 'default'
                                    });
                                },
                                className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                            }
                        },
                    ]}
                />
            ),
            enableSorting: false,
            flex: 0.1
        }
    ]

    // const unassignLocation = useUnassignLocation()
    const unEnrollUsers = useUnenrollUsers();

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                // return deleteClassroom.mutateAsync(deleteConfirmation?.data?.id);
                return unEnrollUsers.mutateAsync({
                    user_ids: [deleteConfirmation?.data?.user?.id],
                    course_ids: [courseId]
                });

            }
            if (deleteConfirmation?.type === 'deleteMany') {

                // Return the Promise so the dialog knows to wait
                return unEnrollUsers.mutateAsync({
                    user_ids: selectedRows?.map(row => row?.user?.id),
                    course_ids: [
                        courseId
                    ]
                }).then(() => {
                    setSelectedRows([]);
                });

            }
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error; // Re-throw so dialog can handle it
        }
    }



    return (
        <>
            <DataView
                title="Enrollments"
                columns={columns}
                data={data?.items}
                height="calc(100vh - 358px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                enableSelection
                noToolbar
                slots={{
                    filters,
                    setFilters,
                    globalFilter,
                    setGlobalFilter,
                    sorting,
                    setSorting,
                    columnVisibility,
                    setColumnVisibility,
                    features: {
                        search: true,
                        filter: false,
                        columnVisibility: true
                    }, emptyState: {
                        height: 'calc(100vh - 515px)'
                    }
                }}

                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onClearSelection: () => setSelectedRows([]),
                    primaryActions: [
                        {
                            id: 'delete',
                            label: 'Unenroll',
                            color: 'error',
                            handler: () => setDeleteConfirmation({ open: true, data: selectedRows, type: 'deleteMany', variant: 'simple' }),
                        }
                    ],
                }}
                datatablemulti
            />
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteOne' ? `Unenroll "${deleteConfirmation?.data?.user?.username}"` : 'Unenroll all selected users'}
                    message={deleteConfirmation?.type === 'deleteOne' ? `Are you sure you want to un "${deleteConfirmation?.data?.user?.username}?"` : 'Are you sure you want to unenroll all selected users?'}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: 'Enrollment removed',
                            error: 'Error removing enrollment',
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: 'Unenroll',
                            cancel: 'Cancel',
                            processing: 'Unenrolling...',
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: unEnrollUsers.isPending,
                    }}
                    confirmationWord={deleteConfirmation?.data?.user?.username}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne'}
                    isAsync
                />
            }
        </>
    );
};

export default CourseEnrollmentsTab;