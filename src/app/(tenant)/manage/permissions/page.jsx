'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { columns } from "@/constants/Permission";
import { useBatchDeletePermission, usePermissions } from "@/hooks/api/tenant/usePermissions";
import PermissionsDrawer from "@/views/Forms/Permissions/PermissionsDrawer";

const Page = () => {
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

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = usePermissions({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
        filters
    })

    const deletePermissions = useBatchDeletePermission()

    return (
        <>
            <DataView
                title="Permissions"
                columns={columns(drawerState, setDrawerState)}
                data={data?.items}
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                toolbar={{
                    breadcrumbs: [{ label: 'Permissions', link: '/manage/permissions' }],
                    buttonGroup: [{
                        text: 'Add Permission',
                        variant: 'contained',
                        tooltip: 'Add new permission',
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
                            deletePermissions.mutateAsync({ items: selectedRows?.map(row => row.id) })
                        },
                    }
                }}
                datatablemulti
                enableSelection
            />
            {
                drawerState?.open && <PermissionsDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                />
            }
        </>
    );
};


export default Page