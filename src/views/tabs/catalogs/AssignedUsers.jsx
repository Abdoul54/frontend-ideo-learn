'use client'

import { useState, useEffect } from 'react';
import DataView from "@/views/DataView";
import { 
    Box, 
    Typography, 
    Chip, 
    Avatar,
    IconButton,
    Tooltip
} from "@mui/material";
import { useCatalogUsers, useUnassignFromCatalog } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import toast from "react-hot-toast";
import { useTranslation } from '@/@core/contexts/translationContext';

const AssignedUsers = ({ catalog }) => {
    const { translate } = useTranslation();

    // State management for pagination, sorting, filtering, selection
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    
    // State for delete confirmation dialog
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        userIds: [],
        isMultiple: false
    });

    // Fetch catalog users data
    const { 
        data: usersData, 
        isLoading, 
        error,
        refetch
    } = useCatalogUsers({
        catalogId: catalog?.id,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort_attr: sorting[0]?.id || 'fullname',
        sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    });

    const removeUsersFromCatalogMutation = useUnassignFromCatalog();

    // Table columns definition
    const columns = [
        {
            id: 'fullname',
            header: translate('Catalog management.TABLE_HEADER_USER', 'User'),
            accessorKey: 'fullname',
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                        src={row.original.avatar} 
                        alt={row.original.fullname}
                        sx={{ 
                            width: 36, 
                            height: 36,
                            bgcolor: !row.original.avatar ? `primary.main` : undefined
                        }}
                    >
                        {!row.original.avatar && row.original.fullname?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight="medium">
                            {row.original.fullname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {row.original.email}
                        </Typography>
                    </Box>
                </Box>
            ),
            size: 250,
        },
        {
            id: 'username',
            header: translate('common.username', 'Username'),
            accessorKey: 'username',
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.username}
                </Typography>
            ),
        },
        {
            id: 'status',
            header: translate('Catalog management.TABLE_HEADER_STATUS', 'Status'),
            accessorKey: 'status',
            cell: ({ row }) => {
                const status = row.original.status === "1" ? "active" : "inactive";
                const color = status === "active" ? "success" : "error";
                
                return (
                    <Chip 
                        label={status === "active" ? translate('Catalog management.ACTIVE', 'active') : translate('Catalog management.INACTIVE', 'inactive')} 
                        size="small" 
                        color={color}
                        variant="outlined"
                    />
                );
            },
            size: 120,
        },
        {
            id: 'language',
            header: translate('Catalog management.TABLE_HEADER_LANGUAGE', 'Language'),
            accessorKey: 'language',
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                        {row.original.language}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ({row.original.lang_code})
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'actions',
            header: translate('Catalog management.TABLE_HEADER_ACTIONS', 'Actions'),
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={translate('Catalog management.TOOLTIP_REMOVE_FROM_CATALOG', 'Remove from catalog')}>
                        <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleRemoveUser(row.original)}
                        >
                            <i className="solar-trash-bin-trash-bold" style={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
            enableSorting: false,
            size: 80,
        }
    ];

    // Handle removing a single user
    const handleRemoveUser = (user) => {
        setDeleteConfirmation({
            open: true,
            userIds: [user.id],
            isMultiple: false,
            userName: user.fullname
        });
    };

    // Handle removing multiple users
    const handleRemoveSelectedUsers = () => {
        if (selectedRows.length === 0) return;
        
        setDeleteConfirmation({
            open: true,
            userIds: selectedRows.map(row => row.id),
            isMultiple: true
        });
    };

    // Remove users from catalog function
    const removeUsersFromCatalog = async () => {
        try {
            await removeUsersFromCatalogMutation.mutateAsync({
                catalogId: catalog.id,
                users_ids: deleteConfirmation.userIds,
                groups_ids: deleteConfirmation.groups_ids,
                branches_ids: deleteConfirmation.branches_ids
            });

            // Clear selection and close dialog
            setSelectedRows([]);
            setDeleteConfirmation({ open: false, userIds: [], isMultiple: false });
            
            // Refetch the data
            refetch();
            
            return true;
        } catch (error) {
            console.error('Error removing users from catalog:', error);
            toast.error(error.message || 'Failed to remove users from catalog');
            return false;
        }
    };

    // Action groups for the selection action bar
    const actionGroups = [
        [
            {
                id: 'remove-from-catalog',
                label: translate('Catalog management.BUTTON_REMOVE_FROM_CATALOG', 'Remove from Catalog'),
                icon: <i className="solar-trash-bin-trash-bold-duotone" size={18} />,
                handler: handleRemoveSelectedUsers,
                disabled: selectedRows.length === 0,
            },
        ]
    ];

    return (
        <>
            <DataView
                columns={columns}
                data={usersData?.items || []}
                isLoading={isLoading}
                error={error}
                pagination={{
                    ...pagination,
                    total: usersData?.pagination?.total || 0
                }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
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
                        message: translate('Catalog management.EMPTY_STATE_NO_USERS', "No users assigned"),
                        description: translate('Catalog management.EMPTY_STATE_NO_USERS_DESC', "There are no users assigned to this catalog yet."),
                        height: '400px'
                    }
                }}
                actionGroups={actionGroups}
                enableSelection={true}
                noToolBar={true}
                height="calc(100vh - 380px)"
                getRowId={(row) => row.id}
            />

            {/* Confirmation Dialog for Removing Users */}
            {deleteConfirmation.open && (
                <ConfirmationDialog
                    type="error"
                    isOpen={deleteConfirmation.open}
                    title={translate(
                        deleteConfirmation.isMultiple
                            ? 'Catalog management.DIALOG_TITLE_REMOVE_USERS_MULTIPLE'
                            : 'Catalog management.DIALOG_TITLE_REMOVE_USERS_SINGLE'
                    )}
                    message={translate(
                        deleteConfirmation.isMultiple
                            ? 'Catalog management.DIALOG_MESSAGE_REMOVE_USERS_MULTIPLE'
                            : 'Catalog management.DIALOG_MESSAGE_REMOVE_USERS_SINGLE',
                        deleteConfirmation.isMultiple
                            ? { count: deleteConfirmation.userIds.length }
                            : { name: deleteConfirmation.userName }
                    )}
                    onClose={() => setDeleteConfirmation({ open: false, userIds: [], isMultiple: false })}
                    actions={{
                        toast: {
                            show: true,
                            success: translate('Catalog management.TOAST_SUCCESS_USERS_REMOVED', 
                                `Successfully removed ${deleteConfirmation.isMultiple ? 'users' : 'user'} from catalog`),
                            error: translate('Catalog management.TOAST_ERROR_USERS_REMOVAL', 'Failed to remove from catalog')
                        },
                        buttons: {
                            confirm: translate('Catalog management.BUTTON_REMOVE', 'Remove'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('Catalog management.PROCESSING_REMOVING', 'Removing...')
                        },
                        onConfirm: removeUsersFromCatalog
                    }}
                    isAsync={true}
                />
            )}
        </>
    );
};

export default AssignedUsers;