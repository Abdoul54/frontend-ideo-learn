'use client';

import ConfirmationDialog from "@/components/ConfirmationDialog";
import { actionColumn } from "@/constants/LearningPlan";
import { useDeleteLearningPlan, useLearningPlans, useLearningPlansColumns } from "@/hooks/api/tenant/learn/useLearningPlan";
import DataView from "@/views/DataView";
import LearningPlansDrawer from "@/views/Forms/LearningPlans/LearningPlansDrawer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [drawerState, setDrawerState] = useState({
        open: false,
        type: null,
        data: null
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});
    const { data, isLoading, error } = useLearningPlans({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const router = useRouter()

    const {
        data: columnsData,
        isLoading: isColumnsLoading,
        error: columnsError
    } = useLearningPlansColumns({
        actionColumn: actionColumn(router, setDeleteConfirmation)
    });

    const deleteLearningPlan = useDeleteLearningPlan();

    useEffect(() => {
        if (columnsData?.initialVisibility) {
            setColumnVisibility(columnsData.initialVisibility);
        }
    }, [columnsData?.initialVisibility]);

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteMany') {
                // Return the Promise so the dialog knows to wait
                // items should be an array of ids
                const result = await deleteLearningPlan.mutateAsync({
                    data: {
                        items: deleteConfirmation?.data?.map(row => row?.id),
                    }
                });
                // Clear selection after successful deletion
                setSelectedRows([]);
                return result;
            } else if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                const result = await deleteLearningPlan.mutateAsync({
                    data: {
                        items: [
                            deleteConfirmation?.data?.id,
                        ],
                    }
                });
                // Clear selection after successful deletion
                setSelectedRows([]);
                return result;
            }
        } catch (error) {
            console.error('Error deleting skills:', error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    return (
        <>
            <DataView
                title="Learning Plans"
                columns={columnsData?.columns || []}
                isColumnsLoading={isColumnsLoading}
                columnsError={columnsError}
                toolbar={{
                    breadcrumbs: [{ label: 'Learning Plans', link: '/learn/learning-plans' }],
                    buttonGroup: [
                        {
                            text: 'Create Learning Plan',
                            variant: 'contained',
                            tooltip: 'Create Learning Plan',
                            icon: 'solar-add-circle-linear',
                            onClick: () => setDrawerState({ open: true, type: 'learning_plan' })
                        }
                    ]
                }}
                data={data?.items}
                isLoading={isLoading}
                error={error}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
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
                    }
                }}
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onClearSelection: () => setSelectedRows([]),
                    primaryActions: [
                        {
                            id: 'delete',
                            label: 'Delete',
                            color: 'error',
                            handler: () => setDeleteConfirmation({ open: true, data: selectedRows, type: 'deleteMany', variant: 'simple' }),
                        }
                    ]
                }}

                datatablemulti
                enableSelection
            />
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteMany' ? `Delete ${selectedRows?.length} learning plans` : `Delete "${deleteConfirmation?.data?.title}"`}
                    message={deleteConfirmation?.type === 'deleteMany' ? 'Are you sure you want to delete the selected learning plans?' : `Are you sure you want to delete "${deleteConfirmation?.data?.title}"?`}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: 'Delete',
                            cancel: 'Cancel',
                            processing: 'Deleting...',
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: deleteLearningPlan.isLoading,
                    }}
                    confirmationWord={deleteConfirmation?.data?.title}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne' ? true : false}
                    isAsync
                />
            }
            {
                drawerState?.open && drawerState?.type === 'learning_plan' &&
                <LearningPlansDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
            {
                drawerState?.open && drawerState?.type === 'add_courses' &&
                <LearningPlansDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
        </>
    );
}

export default Page;