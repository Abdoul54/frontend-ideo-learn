import ConfirmationDialog from "@/components/ConfirmationDialog";
import { assignedSkillsColumns } from "@/constants/Skills";
import { useSkillGroupSkills, useUnassignSkillsFromSkillGroup } from "@/hooks/api/tenant/skills/useSkillGroups";
import DataView from "@/views/DataView";
import { useState } from "react";


const AssignedSkills = ({ data }) => {
    // states 
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const { data: skills, isLoading, error } = useSkillGroupSkills({
        skillGroupId: data?.id,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
    });

    const deleteSkill = useUnassignSkillsFromSkillGroup()

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
                title="Skills"
                columns={assignedSkillsColumns(setDeleteConfirmation)}
                data={skills?.items}
                isLoading={isLoading}
                error={error}
                enableSelection
                height="calc(100vh - 326px)"
                pagination={{ ...pagination, total: skills?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                slots={{
                    globalFilter,
                    setGlobalFilter,
                    columnVisibility,
                    setColumnVisibility,
                    sorting,
                    setSorting,
                    features: {
                        search: true,
                        filter: false,
                        columnVisibility: false
                    },
                    emptyState: {
                        height: 'calc(100vh - 480px)'
                    }
                }}
                noToolBar
                datatablemulti
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
                            id: 'unassign',
                            label: 'Unassign skills',
                            color: 'error',
                            handler: () => setDeleteConfirmation({ open: true, data: selectedRows, type: 'deleteMany', variant: 'simple' }),
                        }
                    ]
                }}
            />
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteMany' ? 'Unassign the selected skills' : `Unassign "${deleteConfirmation?.data?.name}" skill from "${data?.name}"`}
                    message={deleteConfirmation?.type === 'deleteMany' ? 'Are you sure you want to unassign the selected skills?' : `Are you sure you want to unassign "${deleteConfirmation?.data?.name}" skill from "${data?.name}"?`}
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
                    confirmationWord={deleteConfirmation?.data?.name}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne' ? true : false}
                    isAsync
                />
            }
        </>
    );
};

export default AssignedSkills;