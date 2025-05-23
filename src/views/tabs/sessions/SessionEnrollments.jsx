import React, { useState } from 'react';
import DataView from "@/views/DataView";
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Chip } from '@mui/material';
import OptionMenu from '@/@core/components/option-menu';
import { useSessionEnrollments, useUnEnrollSessionUser, useUnEnrollSessionUsers, useUnenrollUsers } from '@/hooks/api/tenant/learn/enrollment/UseEnrollments';
import { useTranslation } from '@/@core/contexts/translationContext';

const SessionEnrollments = ({ sessionId }) => {
    const { translate } = useTranslation();
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});
    const { data, isLoading, error } = useSessionEnrollments({
        sessionId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    })

    const columns = [
        {
            accessorKey: 'user.username',
            header: translate('common.username', 'Username'),
            flex: 1
        },
        {
            accessorKey: 'user.first_name',
            header: translate('common.firstname', 'First Name'),
            flex: 1
        },
        {
            accessorKey: 'user.last_name',
            header: translate('common.lastname', 'Last Name'),
            flex: 1
        },
        {
            accessorKey: 'user.email',
            header: translate('common.email', 'Email'),
            flex: 1
        },
        {
            accessorKey: 'course.title',
            header: translate('Course management.TEXT_COURSE', 'Course'),
        },
        {
            accessorKey: 'status_label',
            header: translate('Course management.TABLE_HEADER_ENROLLMENT_STATUS', 'Enrollment Status'),
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
            header: translate('Course management.TABLE_HEADER_ENROLLMENT_DATE', 'Enrollment Date'),
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
                            text: translate('Course management.ACTION_UNENROLL', 'Unenroll'),
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
    const unEnrollSessionUsers = useUnEnrollSessionUsers();
    const unEnrollSessionUser = useUnEnrollSessionUser();


    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                // return deleteClassroom.mutateAsync(deleteConfirmation?.data?.id);
                return unEnrollSessionUser.mutateAsync({
                    courseId: deleteConfirmation?.data?.course?.id,
                    userId: deleteConfirmation?.data?.user?.id,
                    sessionId: sessionId
                });

            }
            if (deleteConfirmation?.type === 'deleteMany') {

                // Return the Promise so the dialog knows to wait
                return unEnrollSessionUsers.mutateAsync({
                    items: selectedRows?.map(row => ({
                        user_id: row?.user?.id
                    })),
                    session_id: sessionId
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
                title={translate('Course management.SECTION_ENROLLMENTS', 'Enrollments')}
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
                            label: translate('Course management.ACTION_UNENROLL', 'Unenroll'),
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
                    title={deleteConfirmation?.type === 'deleteOne' 
                        ? translate('Course management.TITLE_UNENROLL_USER', `Unenroll "${deleteConfirmation?.data?.user?.username}"`) 
                        : translate('Course management.TITLE_UNENROLL_SELECTED', 'Unenroll all selected users')}
                    message={deleteConfirmation?.type === 'deleteOne' 
                        ? translate('Course management.MESSAGE_UNENROLL_USER', `Are you sure you want to unenroll "${deleteConfirmation?.data?.user?.username}?"`) 
                        : translate('Course management.MESSAGE_UNENROLL_SELECTED', 'Are you sure you want to unenroll all selected users?')}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: translate('Course management.TOAST_ENROLLMENT_REMOVED', 'Enrollment removed'),
                            error: translate('Course management.TOAST_ENROLLMENT_ERROR', 'Error removing enrollment'),
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: translate('Course management.BUTTON_UNENROLL', 'Unenroll'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('Course management.BUTTON_UNENROLLING', 'Unenrolling...'),
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: unEnrollSessionUsers.isPending,
                    }}
                    confirmationWord={deleteConfirmation?.data?.user?.username}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne'}
                    isAsync
                />
            }
        </>
    );
};

export default SessionEnrollments;