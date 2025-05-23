// MainDomain.tsx
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { profilePowerUsersColumns } from "@/constants/PowerUser";
import { useUnassignPowerUserProfiles } from "@/hooks/api/tenant/usePowerUsers";
import { useProfilePowerUsers } from "@/hooks/api/tenant/useProfiles";
import DataView from "@/views/DataView";
import { useState } from "react";


const PowerUsers = ({ profileId }) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});
    const { data, isLoading, error } = useProfilePowerUsers({
        id: profileId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const unassignPowerUser = useUnassignPowerUserProfiles();

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteMany') {
                if (selectAll) {

                    const result = await unassignPowerUser.mutateAsync({ user_all: true, profile_ids: [profileId] });
                    // Clear selection after successful deletion
                    setSelectedRows([]);
                    return result;
                }

                const result = await unassignPowerUser.mutateAsync({
                    user_ids: selectedRows?.map(row => row?.id),
                    profile_ids: [profileId]
                });

                // Clear selection after successful deletion
                setSelectedRows([]);
                return result;

            } else if (deleteConfirmation?.type === 'deleteOne') {
                const result = await unassignPowerUser.mutateAsync({
                    user_ids: [deleteConfirmation?.data?.id],
                    profile_ids: [profileId]
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
                height='calc(100vh - 325px)'
                data={data?.items}
                columns={profilePowerUsersColumns(setDeleteConfirmation)}
                isLoading={isLoading}
                error={error}
                pagination={pagination}
                setPagination={setPagination}
                slots={{
                    columnVisibility: columnVisibility,
                    setColumnVisibility: setColumnVisibility,
                    sorting: sorting,
                    setSorting: setSorting,
                    globalFilter: globalFilter,
                    setGlobalFilter: setGlobalFilter,
                    features: {
                        search: true,
                        filter: false,
                        columnVisibility: true,
                    },
                    emptyState: {
                        height: 'calc(100vh - 479px)'
                    }
                }}
                enableSelection
                selectAll={selectAll}
                onSelectAllChange={setSelectAll}

                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onClearSelection: () => {
                        setSelectedRows([]);
                        setSelectAll(false);
                    },
                    selectAll,
                    onSelectAll: () => setSelectAll(true),
                    onUnselectAll: () => {
                        setSelectedRows([]);
                        setSelectAll(false);
                    },
                    primaryActions: [
                        {
                            id: 'unassign-poweruser',
                            label: 'Unassign Power Users',
                            color: 'error',
                            handler: () => setDeleteConfirmation({ open: true, data: selectedRows, type: 'deleteMany' }),
                        }
                    ]
                }}
                datatablemulti
            />
            {
                deleteConfirmation?.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={deleteConfirmation?.type === 'deleteOne' ? `Unassign "${deleteConfirmation?.data?.username}"` : selectAll ? 'Unassign All Power Users' : 'Unassign Power Users'}
                    message={deleteConfirmation?.type === 'deleteOne' ? `Are you sure you want to unassign ${deleteConfirmation?.data?.username} ?` : selectAll ? 'Are you sure you want to unassign all power users ?' : `Are you sure you want to unassign the selected ${deleteConfirmation?.data?.length} power users ?`}
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
                            confirm: 'Unassign',
                            cancel: 'Cancel',
                            processing: 'Unassigning...',
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: unassignPowerUser.isLoading,
                    }}
                    confirmationWord={deleteConfirmation?.data?.username}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne' ? true : false}
                    isAsync
                />
            }
        </>
    );
}


export default PowerUsers;