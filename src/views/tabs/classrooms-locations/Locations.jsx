'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import { locationsColumns } from "@/constants/ClassroomsLocations";
import { useDeleteLocation, useLocations } from "@/hooks/api/tenant/learn/classrooms-locations/useLocations";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTranslation } from '@/@core/contexts/translationContext';

const Locations = ({ setDrawerState }) => {
    const { translate } = useTranslation();
    
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');

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

     const deleteConfirmationName = deleteConfirmation?.data?.name;

    return (
        <>
            <DataView
                title={translate('CL management.TAB_LOCATIONS', "Locations")}
                columns={locationsColumns(setDrawerState, setDeleteConfirmation)}
                data={data?.items}
                height="calc(100vh - 325px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                noToolbar
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
                        message: translate('CL management.NO_LOCATION_FOUND', 'No locations found'),
                        description: translate('CL management.TRY_CREATING', 'Try creating a new location'),
                        height: 'calc(100vh - 466px)'
                    }
                }}
                enableSelection={false}
            />

            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={translate('CL management.DIALOG_TITLE_DELETE_LOCATION', { name: deleteConfirmationName })}
                    message={translate('CL management.DIALOG_MESSAGE_DELETE_LOCATION', { name: deleteConfirmationName })}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            success: translate('CL management.TOAST_SUCCESS_LOCATION_DELETED', 'Location deleted successfully'),
                            error: translate('CL management.TOAST_ERROR_LOCATION_DELETED', 'Error deleting location'),
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: translate('common.delete', 'Delete'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('common.deleting', 'Deleting...'),
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

export default Locations;
