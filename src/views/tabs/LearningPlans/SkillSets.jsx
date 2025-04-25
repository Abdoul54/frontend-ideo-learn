
import { skillSetsColumns } from "@/constants/Skills";
import { useDeleteSkillGroup, useSkillGroups } from "@/hooks/api/tenant/skills/useSkillGroups";
import DataView from "@/views/DataView";
import DeleteConfirmationDialog from "@/views/Dialogs/DeleteConfirmation";
import SkillAssignmentDrawer from "@/views/Forms/Skills/SkillAssignmentDrawer";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SkillSets = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const router = useRouter();

    const { data, isLoading, error } = useSkillGroups({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const [skillSetDrawerState, setSkillSetDrawerState] = useState({
        open: false,
        data: null
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const deleteSkillGroup = useDeleteSkillGroup();

    const handleDeleteSubmit = (data) => {
        if (deleteConfirmation?.type === 'deleteMany') {
            deleteSkillGroup.mutateAsync({ items: selectedRows?.map(row => ({ id: row?.id })) })
        } else if (deleteConfirmation?.type === 'deleteOne') {
            deleteSkillGroup.mutateAsync({ items: [{ id: data?.id }] });
        }

        setDeleteConfirmation({ open: false, data: null });
    }

    return (
        <>
            <DataView
                title="Skill Sets"
                columns={skillSetsColumns(setDeleteConfirmation, setSkillSetDrawerState, router)}
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
                    },
                    emptyState: {
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
                            return deleteSkillGroup.mutateAsync({ items: selectedRows?.map(row => ({ id: row?.id })) })
                        },
                    }
                }}

                datatablemulti
                enableSelection
            />
            {
                deleteConfirmation.open && <DeleteConfirmationDialog
                    open={deleteConfirmation.open}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    data={deleteConfirmation?.data}
                    title={deleteConfirmation?.data?.name || "Skill sets"}
                    onSubmit={handleDeleteSubmit}
                    variant={deleteConfirmation?.variant}

                />
            }
            {
                skillSetDrawerState.open && <SkillAssignmentDrawer
                    open={skillSetDrawerState.open}
                    onClose={() => setSkillSetDrawerState({ open: false, data: null })}
                    data={skillSetDrawerState?.data}
                />
            }
        </>
    );
};

export default SkillSets;