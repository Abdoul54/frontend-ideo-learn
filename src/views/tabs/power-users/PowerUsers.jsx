'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { usePowerUsers, useRemovePowerUser, useUnassignPowerUserProfiles } from "@/hooks/api/tenant/usePowerUsers";
import PowerUsersDrawer from "@/views/Forms/PowerUsers/PowerUsersDrawer";
import { columns } from "@/constants/PowerUser";
import GrantProfilesDrawer from "@/views/Forms/PowerUsers/GrantProfilesDrawer";
import DeleteConfirmationDialog from "@/views/Dialogs/DeleteConfirmation";

const PowerUsers = () => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [grantProfileDrawerState, setGrantProfileDrawerState] = useState({
        open: false,
        data: null
    });

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = usePowerUsers({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
        filters
    })

    const removePowerUser = useRemovePowerUser()
    const unassignPowerUser = useUnassignPowerUserProfiles()

    const handleDeleteSubmit = (data) => {
        if (deleteConfirmation?.type === 'unassign-profile') {
            if (selectAll) {
                return unassignPowerUser.mutateAsync({ user_all: true, profile_all: true })
            }
            return unassignPowerUser.mutateAsync({ user_ids: selectedRows?.map(row => row?.id), profile_all: true })
        }
        if (deleteConfirmation?.type === 'unassign') {
            return unassignPowerUser.mutateAsync({ user_ids: [data?.id], profile_ids: data?.profiles?.map(profile => profile?.id) });
        };
        return removePowerUser.mutateAsync({ user_ids: [data?.id] });
    };

    return (
        <>
            <DataView
                title="Power Users"
                columns={columns(drawerState, setDrawerState, grantProfileDrawerState, setGrantProfileDrawerState, setDeleteConfirmation, unassignPowerUser)}
                data={data?.items}
                height="calc(100vh - 300px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                toolbar={{
                    breadcrumbs: [{ label: 'Power Users', path: '/power-users' }],
                    buttonGroup: [{
                        text: 'Add Profile',
                        variant: 'contained',
                        tooltip: 'Add new profile',
                        icon: 'solar-add-circle-outline',
                        onClick: () => setDrawerState({ open: true, data: null })
                    }]
                }}
                selectAll={selectAll}
                onSelectAllChange={setSelectAll}
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
                        height: 'calc(100vh - 455px)'
                    }
                }}
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onSelectAll: () => setSelectAll(true),
                    onUnselectAll: () => {
                        setSelectedRows([]);
                        setSelectAll(false)
                    },
                    onClearSelection: () => setSelectedRows([]),
                    actionGroups: [
                        [
                            {
                                id: 'unassign-profile',
                                label: 'Unassign Profiles',
                                handler: () => setDeleteConfirmation({ open: true, data: null, type: 'unassign-profile', variant: 'simple' }),
                            }
                        ],
                    ],
                    deleteConfirmationProps: {
                        onSubmit: () => {
                            if (selectAll) {
                                return removePowerUser.mutateAsync({ user_all: true })
                            }
                            removePowerUser.mutateAsync({ user_ids: selectedRows?.map(row => row?.id) })
                        },
                    }
                }}

                datatablemulti
                enableSelection
            />
            {
                drawerState?.open && <PowerUsersDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                deleteConfirmation.open && <DeleteConfirmationDialog
                    open={deleteConfirmation.open}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    data={deleteConfirmation?.data}
                    title={deleteConfirmation?.data?.username}
                    onSubmit={handleDeleteSubmit}
                    variant={deleteConfirmation?.variant}
                />}
            {
                grantProfileDrawerState?.open && <GrantProfilesDrawer
                    open={grantProfileDrawerState?.open}
                    onClose={() => setGrantProfileDrawerState({ open: false, data: null })}
                    data={grantProfileDrawerState?.data}
                />
            }
        </>
    );
};

export default PowerUsers
