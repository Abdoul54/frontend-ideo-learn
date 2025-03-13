'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { columns } from "@/constants/Profile";
import { useBatchDeleteProfile, useProfiles } from "@/hooks/api/tenant/useProfiles";
import ProfilesDrawer from "@/views/Forms/Profiles/ProfilesDrawer";
import GrantPowerUsersDrawer from "@/views/Forms/Profiles/GrantPowerUsersDrawer";
import { useRouter } from "next/navigation";

const Profile = () => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const router = useRouter();

    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null
    });

    const [grantPowerUserDrawerState, setGrantPowerUserDrawerState] = useState({
        open: false,
        data: null
    });

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = useProfiles({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
        filters
    })

    const deleteProfiles = useBatchDeleteProfile()

    return (
        <>
            <DataView
                title="Profiles"
                columns={columns(grantPowerUserDrawerState, setGrantPowerUserDrawerState, router)}
                data={data?.items}
                height="calc(100vh - 300px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                toolbar={{
                    breadcrumbs: [{ label: 'Profiles', path: '/profiles' }],
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
                    deleteConfirmationProps: {
                        onSubmit: () => {
                            deleteProfiles.mutateAsync({ items: selectedRows?.map(row => ({ profile_id: row.id })) })
                        },
                    }
                }}

                datatablemulti
                enableSelection
            />
            {
                drawerState?.open && <ProfilesDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                grantPowerUserDrawerState?.open && <GrantPowerUsersDrawer
                    open={grantPowerUserDrawerState?.open}
                    onClose={() => setGrantPowerUserDrawerState({ open: false, data: null })}
                    data={grantPowerUserDrawerState?.data}
                />
            }
        </>
    );
};

export default Profile
