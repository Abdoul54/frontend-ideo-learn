import ConfirmationDialog from "@/components/ConfirmationDialog";
import { actionColumn } from "@/constants/LearningPlan.js";
import { useLearningPlans, useLearningPlansColumns } from "@/hooks/api/tenant/learn/useLearningPlan";
import { useDeleteSkill } from "@/hooks/api/tenant/skills/useSkills";
import DataView from "@/views/DataView";
import SkillGroupAssignmentDrawer from "@/views/Forms/Skills/SkillGroupAssignmentDrawer";
import { useEffect, useState } from "react";

const LearningPlans = ({ setDrawerState }) => {
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
    const { data, isLoading, error } = useLearningPlans({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const {
        data: columnsData,
        isLoading: isColumnsLoading,
        error: columnsError
    } = useLearningPlansColumns({
        actionColumn: actionColumn(setDrawerState, setDeleteConfirmation)
    });

    useEffect(() => {
        if (columnsData?.initialVisibility) {
            setColumnVisibility(columnsData.initialVisibility);
        }
    }, [columnsData?.initialVisibility]);

    const [skillDrawerState, setSkillDrawerState] = useState({
        open: false,
        data: null
    });

    const deleteSkill = useDeleteSkill();

    const handleDeleteSubmit = async () => {
        try {

            if (deleteConfirmation?.type === 'deleteMany') {
                // Return the Promise so the dialog knows to wait
                return deleteSkill.mutateAsync({
                    data: {
                        items: deleteConfirmation?.data?.map(row => ({
                            id: row?.id
                        })),
                    },
                    skillgroup_id: data?.id
                });
            } else if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                return deleteSkill.mutateAsync({
                    data: {
                        items: [
                            { id: deleteConfirmation?.data?.id }
                        ],
                    },
                    skillgroup_id: data?.id
                });
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
                data={data?.items}
                height="calc(100vh - 328px)"
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
                    }, emptyState: {
                        height: 'calc(100vh - 484px)'
                    }
                }}
                noToolBar
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    // onSelectAll: () => setSelectAll(true),
                    // onUnselectAll: () => {
                    //     setSelectedRows([]);
                    //     setSelectAll(false)
                    // },
                    onClearSelection: () => setSelectedRows([]),
                    primaryActions: [
                        {
                            id: 'delete',
                            label: 'Delete',
                            color: 'error',
                            handler: () => setDeleteConfirmation({ open: true, data: selectedRows, type: 'deleteMany', variant: 'simple' }),
                        }
                    ],
                    deleteConfirmationProps: {
                        variant: 'default',
                        onSubmit: () => {
                            return deleteSkill.mutateAsync({ items: selectedRows?.map(row => ({ id: row?.id })) })
                        },
                    }
                }}

                datatablemulti
                enableSelection
            />
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteMany' ? `Delete ${selectedRows?.length} learning plans` : `Delete "${deleteConfirmation?.data?.title}"`}
                    message={deleteConfirmation?.type === 'deleteMany' ? 'Are you sure you want to delete the selected skills?' : `Are you sure you want to delete "${deleteConfirmation?.data?.title}"?`}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: 'Skill deleted successfully',
                            error: 'Error deleting skill',
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
                        isLoading: deleteSkill.isPending,
                    }}
                    confirmationWord={deleteConfirmation?.data?.title}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne' ? true : false}
                    isAsync
                />
            }
            {
                skillDrawerState.open && <SkillGroupAssignmentDrawer
                    open={skillDrawerState.open}
                    onClose={() => setSkillDrawerState({ open: false, data: null })}
                    data={skillDrawerState?.data}
                />
            }
        </>
    );
};


export default LearningPlans;