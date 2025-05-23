'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import OptionMenu from "@/@core/components/option-menu";
import { useEnrollments, useUnenrollUser, useUnenrollUsers } from "@/hooks/api/tenant/learn/useLearningPlan";
import { Chip } from "@mui/material";
import { useRouter } from "next/navigation";

const Enrollments = ({ learningPlanId }) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const { data, isLoading, error } = useEnrollments({
        learningPlanId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
    });

    const router = useRouter();
    const unEnrollUsers = useUnenrollUsers();
    const unEnrollUser = useUnenrollUser();

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteMany') {
                const result = await unEnrollUsers.mutateAsync({
                    data: {
                        user_ids: deleteConfirmation?.data?.map(row => row?.user?.id),
                    },
                    learningPlanId: learningPlanId
                });
                setSelectedRows([]);
                return result;
            } else if (deleteConfirmation?.type === 'deleteOne') {
                const result = await unEnrollUser.mutateAsync({ learningPlanId, userId: deleteConfirmation?.data?.user?.id });
                setSelectedRows([]);
                return result;
            }

        } catch (error) {
            console.error('Error deleting content:', error);
            throw error;
        }
    };

    const columns = [
        {
            accessorKey: 'user.username',
            header: 'Learner',
            flex: 1
        },
        {
            accessorKey: 'status_label',
            header: 'Status',
            flex: 1,
            cell: ({ row }) => {
                const status = row?.original?.status;
                const label = row?.original?.status_label;

                const color = () => {
                    switch (status) {

                        case 'enrolled':
                            return 'info';
                        case 'in_progress':
                            return 'warning';
                        case 'completed':
                            return 'success';
                        case 'expired':
                            return 'error';
                        default:
                            return 'default';
                    }
                };
                return (
                    <Chip label={label} variant='outlined' size="small" color={color()} />
                );
            }
        },
        {
            accessorKey: 'progress_percentage',
            header: 'Progress',
            cell: ({ row }) => {
                const progress = row?.original?.progress_percentage;
                const color = progress === 100 ? 'success' : progress > 0 ? 'info' : 'error';
                return <Chip label={`${progress}%`} size="small" color={color} variant="outlined" />;
            }
        },
        {
            accessorKey: 'validity_start_date',
            header: 'Validity Start',
            cell: ({ row }) => {
                if (!row?.original?.validity_start_date) return '-';
                const date = new Date(row?.original?.validity_start_date);
                return date.toLocaleDateString('fr-FR');
            },
            flex: 1
        },
        {
            accessorKey: 'validity_end_date',
            header: 'Validity End',
            cell: ({ row }) => {
                if (!row?.original?.validity_end_date) return '-';
                const date = new Date(row?.original?.validity_end_date);
                return date.toLocaleDateString('fr-FR');
            },
            flex: 1
        },
        {
            accessorKey: 'enrollment_date',
            header: 'Enrollment Date',
            cell: ({ row }) => {
                if (!row?.original?.enrollment_date) return '-';
                const date = new Date(row?.original?.enrollment_date);
                return date.toLocaleDateString('fr-FR');
            },
            flex: 1
        },
        {
            accessorKey: 'completion_date',
            header: 'Completion Date',
            cell: ({ row }) => {
                if (!row?.original?.completion_date) return '-';
                const date = new Date(row?.original?.completion_date);
                return date.toLocaleDateString('fr-FR');
            },
            flex: 1
        },
        {
            id: 'actions',
            header: '',
            flex: 0.1,
            enableSorting: false,
            cell: ({ row }) => (
                <OptionMenu
                    options={[
                        {
                            text: 'Edit',
                            icon: <i className='solar-pen-outline' />,
                            menuItemProps: {
                                onClick: (e) => {
                                    e.stopPropagation();
                                    const url = row?.original?.content_type === 'learningplan'
                                        ? `/learn/learning-plans/${row?.original?.content_id}`
                                        : `/learn/course/edit/${row?.original?.content_id}`;
                                    router.push(url);
                                },
                                className: 'flex items-center gap-2'
                            }
                        },
                        {
                            text: 'Delete',
                            icon: <i className="solar-trash-bin-2-bold-duotone" />,
                            menuItemProps: {
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmation({
                                        open: true,
                                        data: row?.original,
                                        type: 'deleteOne'
                                    });
                                },
                                className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                            }
                        }
                    ]}
                />
            )
        }
    ];

    return (
        <>
            <DataView
                title="Enrollments"
                columns={columns}
                data={data?.items}
                height="calc(100vh - 302px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                getRowId={(row) => row?.id}
                enableSelection
                datatablemulti
                noToolBar
                slots={{
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
                    },
                    emptyState: {
                        height: 'calc(100vh - 460px)'
                    }
                }}
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onClearSelection: () => setSelectedRows([]),
                    primaryActions: [
                        {
                            id: 'delete',
                            label: 'Unassign Content',
                            color: 'error',
                            handler: () => setDeleteConfirmation({
                                open: true,
                                data: selectedRows,
                                type: 'deleteMany'
                            })
                        }
                    ]
                }}
            />

            {deleteConfirmation.open && (
                <ConfirmationDialog
                    type="error"
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteMany' ? 'Unenroll Users' : 'Unassign a User'}
                    message={deleteConfirmation?.type === 'deleteMany'
                        ? `Are you sure you want to unenroll the ${deleteConfirmation?.data?.length} selected users?`
                        : `Are you sure you want to unenroll "${deleteConfirmation?.data?.user?.username}"?`}
                    onClose={() => setDeleteConfirmation({ open: false, data: null, type: null })}
                    actions={{
                        toast: { show: false },
                        icons: { confirm: null, cancel: null },
                        buttons: {
                            confirm: 'Unenroll',
                            cancel: 'Cancel',
                            processing: 'Unenrolling...'
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: unEnrollUser?.isPending || unEnrollUsers?.isPending
                    }}
                    confirmationWord={deleteConfirmation?.data?.user?.username}
                    typingConfirmation={deleteConfirmation?.type === 'deleteMany' ? false : true}
                    isAsync
                />
            )}
        </>
    );
};

export default Enrollments;
