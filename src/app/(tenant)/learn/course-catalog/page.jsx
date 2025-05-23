'use client';

import DataView from "@/views/DataView";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteCatalog, useCatalogs } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { columns } from "@/constants/Catalogs";
import CatalogsDrawer from "@/views/Forms/Catalogs/CatalogsDrawer";
import toast from "react-hot-toast";
import { useTranslation } from '@/@core/contexts/translationContext';

const CatalogsPage = () => {
    // State management
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const { translate } = useTranslation();

    // Drawer state for creating/editing catalogs
    const [drawerState, setDrawerState] = useState({
        open: false,
        type: null,
        data: null
    });

    // Confirmation dialog state for deletions
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const router = useRouter();

    // Fetch catalogs with pagination, sorting and filtering
    const { data: catalogsData, isLoading, error } = useCatalogs({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort_attr: sorting[0]?.id || 'name',
        sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    });

    // Delete catalog mutation
    const deleteCatalogMutation = useDeleteCatalog();

    // Handler for delete confirmation dialog submission
    const handleDeleteSubmit = async () => {
        try {
            if (!deleteConfirmation?.data?.id) {
                throw new Error(translate('Catalog management.ERROR_NO_CATALOG_ID', "Catalog ID is required for deletion"));
            }

            await deleteCatalogMutation.mutateAsync(deleteConfirmation.data.id);

            // Close the confirmation dialog
            setDeleteConfirmation({ open: false, data: null });

            // Clear any selected rows
            setSelectedRows([]);

            return true;
        } catch (error) {
            console.error('Error deleting catalog:', error);
            toast.error(error.message || translate('Catalog management.ERROR_DELETE_CATALOG', "Failed to delete catalog"));
            return false;
        }
    };

    // Handler for opening the drawer to create a new catalog
    const handleCreateCatalog = () => {
        setDrawerState({
            open: true,
            type: 'add_catalog',
            data: null
        });
    };

    // Handler for closing any active drawer
    const handleCloseDrawer = () => {
        setDrawerState({
            open: false,
            type: null,
            data: null
        });
    };

    const deleteConfirmationName = deleteConfirmation?.data?.name;

    return (
        <>
            <DataView
                title={translate('Catalog management.PAGE_TITLE', "Catalogs")}
                columns={columns(setDeleteConfirmation, router, setDrawerState)}
                toolbar={{
                    breadcrumbs: [{ label: translate('Catalog management.BREADCRUMB_CATALOGS', 'Catalogs'), link: '/learn/catalog' }],
                    buttonGroup: [
                        {
                            text: translate('Catalog management.BUTTON_CREATE_CATALOG', 'Create Catalog'),
                            variant: 'contained',
                            tooltip: translate('Catalog management.TOOLTIP_CREATE_CATALOG', 'Create a new catalog'),
                            icon: 'solar-add-circle-linear',
                            onClick: handleCreateCatalog
                        }
                    ]
                }}
                data={catalogsData?.items || []}
                isLoading={isLoading}
                error={error}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                pagination={{
                    ...pagination,
                    total: catalogsData?.pagination?.total || 0
                }}
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
                        message: translate('Catalog management.EMPTY_STATE_MESSAGE', "No catalogs found"),
                        description: translate('Catalog management.EMPTY_STATE_DESCRIPTION', "Create your first catalog to organize your courses"),
                        height: 'calc(100vh - 400px)'
                    }
                }}
                datatablemulti
                enableSelection={false}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmation.open && (
                <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={translate('Catalog management.DIALOG_TITLE_DELETE_CATALOG', 'Delete Catalog')}
                    message={translate('Catalog management.DIALOG_MESSAGE_DELETE_CATALOG', { name: deleteConfirmationName })}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            show: true,
                            error: translate('Catalog management.TOAST_ERROR_DELETE_CATALOG', "Failed to delete catalog")
                        },
                        icons: {
                            confirm: <i className="solar-trash-bin-trash-bold-duotone" />,
                            cancel: <i className="solar-close-circle-bold-duotone" />
                        },
                        buttons: {
                            confirm: translate('common.delete', 'Delete'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('common.deleting', 'Deleting...'),
                        },
                        onConfirm: handleDeleteSubmit
                    }}
                    confirmationWord={deleteConfirmation?.data?.name}
                    typingConfirmation={true}
                    isAsync={true}
                />
            )}

            {/* Catalog Creation Drawer */}
            {drawerState?.open && (
                <CatalogsDrawer
                    open={drawerState.open}
                    data={drawerState.data}
                    onClose={handleCloseDrawer}
                />
            )}
        </>
    );
};

export default CatalogsPage;