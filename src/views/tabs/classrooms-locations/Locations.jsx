'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { useRemovePowerUser, useUnassignPowerUserProfiles } from "@/hooks/api/tenant/usePowerUsers";
import { locationsColumns } from "@/constants/ClassroomsLocations";
import LocationsDrawer from "@/views/Forms/Locations/LocationsDrawer";
import { useDeleteLocation, useLocations } from "@/hooks/api/tenant/learn/classrooms-locations/useLocations";
import ConfirmationDialog from "@/components/ConfirmationDialog";


const Locations = () => {
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

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = useLocations({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    })

    const deleteLocation = useDeleteLocation();

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                return deleteLocation.mutateAsync(deleteConfirmation?.data?.id);
            }
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    return (
        <>
            <DataView
                title="Locations"
                columns={locationsColumns(setDrawerState, setDeleteConfirmation)}
                data={data?.items}
                height="calc(100vh - 300px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                toolbar={{
                    buttonGroup: [
                        {
                            text: "Add Location",
                            variant: "contained",
                            tooltip: "Create a new location",
                            icon: "lucide-plus",
                            onClick: () => setDrawerState({ open: true, data: null }),
                        },
                    ]
                }}
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
                        height: 'calc(100vh - 455px)'
                    }
                }}

                enableSelection={false}
            />
            {
                drawerState?.open && <LocationsDrawer
                    open={drawerState?.open}
                    onClose={() => setDrawerState({ open: false, data: null })}
                    data={drawerState?.data}
                />
            }
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={`Delete "${deleteConfirmation?.data?.name}"`}
                    message={`Are you sure you want to delete "${deleteConfirmation?.data?.name}"?`}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: 'Location deleted successfully',
                            error: 'Error deleting location',
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
                        isLoading: deleteLocation.isPending,
                    }}
                    confirmationWord={deleteConfirmation?.data?.name}
                    typingConfirmation
                    isAsync
                />
            }
        </>
    );
};

export default Locations
