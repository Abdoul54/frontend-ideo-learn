'use client'

import { useEffect, useMemo, useState } from "react";
import DataView from "@/views/DataView";
import { useDeleteManagerType, useManagerTypeDetails, useManagerTypes } from "@/hooks/api/tenant/useManager";
import { columns } from "@/constants/manager-service/ManagerTypes";
import ManagerTypeDrawer from "@/views/Drawers/AddManagerTypes";
import toast from "react-hot-toast";

const Page = () => {
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    console.log('selectedRows', selectedRows);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedManagerType, setSelectedManagerType] = useState(null);
    const [selectedManagerTypeId, setSelectedManagerTypeId] = useState(null);

    const { data, isLoading, error } = useManagerTypes({
        search_text: globalFilter,
        page: pagination.pageIndex,
        page_size: pagination.pageSize,
        sort: sorting,
        filters
    })

    // Fetch manager type details when a specific ID is selected
    const {
        data: managerTypeDetails,
        isLoading: isLoadingDetails
    } = useManagerTypeDetails(selectedManagerTypeId, {
        enabled: !!selectedManagerTypeId
    });

    const deleteMutation = useDeleteManagerType();

    useEffect(() => {
        if (managerTypeDetails && selectedManagerTypeId) {
            const formattedData = {
                id: selectedManagerTypeId,
                code: managerTypeDetails.code,
                name: managerTypeDetails.title,
                description: managerTypeDetails.description,
                is_active: managerTypeDetails.active === 1
            };

            setSelectedManagerType(formattedData);
        }
    }, [managerTypeDetails, selectedManagerTypeId]);

    // Open drawer for creating new manager type
    const handleAddNew = () => {
        setSelectedManagerType(null);
        setDrawerOpen(true);
    };

    // Open drawer for editing existing manager type
    const handleEdit = (managerType) => {
        // Set the ID to trigger the API fetch
        setSelectedManagerTypeId(managerType.manager_type_id);
        setDrawerOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteMutation.mutateAsync([id]);
        } catch (error) {
            toast.error(error.message || "Failed to delete manager type");
        }
    };

    // Delete multiple manager types
    const handleDeleteSelected = async () => {
        try {
            // Map selected rows back to manager_type_id
            const ids = selectedRows.map(row => row.manager_type_id).filter(Boolean);
            if (ids.length === 0) {
                toast.error("No valid manager types selected");
                return;
            }
            await deleteMutation.mutateAsync(ids);
            setSelectedRows([]);
        } catch (error) {
            toast.error(error.message || "Failed to delete selected manager types");
        }
    };

    const handleClearSelection = () => {
        setSelectedRows([]);
    };

    // Close drawer
    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedManagerType(null);
        setSelectedManagerTypeId(null);
    };

    // Disable actions during mutation
    const actionGroups = [
        [
            {
                id: 'bulk-delete',
                label: 'Delete Selected',
                icon: <i className="solar-trash-bin-2-bold-duotone" />,
                handler: handleDeleteSelected,
                disabled: selectedRows.length === 0 || deleteMutation.isPending
            }
        ]
    ];

    const transformedData = useMemo(() => {
        if (!data?.items) return [];
        return data.items.map(item => ({
            ...item,
            id: item.manager_type_id, // Map manager_type_id to id
        }));
    }, [data]);

    return (
        <>
            <DataView
                title="Manager Types"
                columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
                data={transformedData}
                height="calc(100vh - 182px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                getRowId={(row) => row.id.toString()}
                toolbar={{
                    breadcrumbs: [{ label: 'Manager Type', link: "/manage/manager-types" }],
                    buttonGroup: [
                        {
                            text: "Add Manager Type",
                            tooltip: "Add new manager type",
                            variant: "contained",
                            icon: "lucide-plus",
                            onClick: handleAddNew
                        }
                    ]
                }}
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
                emptyState={{
                    title: 'No manager types found',
                    description: 'Try changing the filters or search query'
                }}
                actionGroups={actionGroups}
                onDeleteSelected={handleDeleteSelected}
                onClearSelection={handleClearSelection}
            />

            {/* Create manager types drawer */}
            <ManagerTypeDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                data={selectedManagerType}
                isLoading={isLoadingDetails && !!selectedManagerTypeId}
            />
        </>
    );
};


export default Page;