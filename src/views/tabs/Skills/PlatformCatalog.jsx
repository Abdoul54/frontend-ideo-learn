import { platformCatalogColumns } from "@/constants/Skills";
import { useDeleteSkill, useSkills } from "@/hooks/api/tenant/skills/useSkills";
import DataView from "@/views/DataView";
import DeleteConfirmationDialog from "@/views/Dialogs/DeleteConfirmation";
import SkillGroupAssignmentDrawer from "@/views/Forms/Skills/SkillGroupAssignmentDrawer";
import { useState } from "react";
import { useTranslation } from '@/@core/contexts/translationContext';

const PlatformCatalog = ({ setDrawerState }) => {
    const { translate } = useTranslation();
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
    const { data, isLoading, error } = useSkills({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const [skillDrawerState, setSkillDrawerState] = useState({
        open: false,
        data: null
    });

    const deleteSkill = useDeleteSkill();

    const handleDeleteSubmit = (data) => {
        if (deleteConfirmation?.type === 'deleteMany') {
            deleteSkill.mutateAsync({ items: selectedRows?.map(row => ({ id: row?.id })) })
        } else if (deleteConfirmation?.type === 'deleteOne') {
            deleteSkill.mutateAsync({ items: [{ id: data?.id }] });
        }

        setDeleteConfirmation({ open: false, data: null });
    }

    return (
        <>
            <DataView
                title={translate('Skill management.TABLE_HEADER_SKILLS', 'Skills')}
                columns={platformCatalogColumns(setDeleteConfirmation, setDrawerState, setSkillDrawerState)}
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
                            label: translate('common.delete', 'Delete'),
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
                deleteConfirmation.open && <DeleteConfirmationDialog
                    open={deleteConfirmation.open}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    data={deleteConfirmation?.data}
                    title={deleteConfirmation?.data?.name || translate('Skill management.TABLE_HEADER_SKILLS', 'Skills')}
                    onSubmit={handleDeleteSubmit}
                    variant={deleteConfirmation?.variant}
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

export default PlatformCatalog;