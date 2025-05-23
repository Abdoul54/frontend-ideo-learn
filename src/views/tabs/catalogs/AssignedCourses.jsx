'use client'

import { useState } from 'react';
import DataView from "@/views/DataView";
import {
    Box,
    Typography,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import { useCatalogContents, useRemoveContentFromCatalog, useUnassignContentsFromCatalog } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import toast from "react-hot-toast";
import { useTranslation } from '@/@core/contexts/translationContext';

// Mapping for content types to display properties
const contentTypeConfig = {
    elearning: {
        label: 'E-Learning',
        icon: 'solar-monitor-smartphone-bold-duotone',
        color: 'info',
        bgColor: 'rgba(33, 150, 243, 0.1)'
    },
    webinar: {
        label: 'Webinar',
        icon: 'solar-videocamera-bold-duotone',
        color: 'secondary',
        bgColor: 'rgba(156, 39, 176, 0.1)'
    },
    classroom: {
        label: 'Classroom',
        icon: 'solar-buildings-2-bold-duotone',
        color: 'success',
        bgColor: 'rgba(76, 175, 80, 0.1)'
    },
    scorm: {
        label: 'SCORM',
        icon: 'solar-widget-bold-duotone',
        color: 'warning',
        bgColor: 'rgba(255, 152, 0, 0.1)'
    },
    assessment: {
        label: 'Assessment',
        icon: 'solar-clipboard-check-bold-duotone',
        color: 'error',
        bgColor: 'rgba(244, 67, 54, 0.1)'
    },
    learningplan: {
        label: 'Learning Plan',
        icon: 'solar-library-bold-duotone',
        color: 'secondary',
        bgColor: 'rgba(103, 58, 183, 0.1)'
    },
    default: {
        label: 'learningplan',
        icon: 'solar-book-bold-duotone',
        color: 'default',
        bgColor: 'rgba(96, 125, 139, 0.1)'
    }
};

const AssignedCourses = ({ catalog }) => {
    const { translate } = useTranslation();
    // State management for pagination, sorting, filtering, selection
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    // State for delete confirmation dialog
    const [removeConfirmation, setRemoveConfirmation] = useState({
        open: false,
        contentIds: [],
        isMultiple: false,
        contentName: ''
    });

    // Fetch catalog contents
    const {
        data: contentsData,
        isLoading,
        error,
        refetch
    } = useCatalogContents({
        catalogId: catalog?.id,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort_attr: sorting[0]?.id || 'content.name',
        sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    });

    // Content removal mutation
    const removeContentMutation = useRemoveContentFromCatalog();
    const unassignContentsMutation = useUnassignContentsFromCatalog();

    // Function to get content type and name safely
    const getContentInfo = (item) => {
        const content = item.content || {};
        // Determine if it's a course or learning plan
        const contentType = content.course_type ||
            (content.content_type === 'learningplan' ? 'learningplan' : 'default');
        const contentName = content.name || content.title || 'Unnamed Content';

        return { contentType, contentName };
    };

    // Table columns definition
    const columns = [
        {
            id: 'content_type',
            header: translate('Catalog management.TABLE_HEADER_TYPE', 'Type'),
            accessorKey: 'content_type',
            cell: ({ row }) => {
                const { contentType } = getContentInfo(row.original);
                const config = contentTypeConfig[contentType] || contentTypeConfig.default;

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: config.bgColor
                            }}
                        >
                            <i className={config.icon} style={{ fontSize: 18, color: `var(--mui-palette-${config.color}-main)` }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                            {config.label}
                        </Typography>
                    </Box>
                );
            },
            size: 170,
        },
        {
            id: 'name',
            header: translate('Catalog management.TABLE_HEADER_NAME', 'Name'),
            accessorFn: (row) => getContentInfo(row).contentName,
            cell: ({ row }) => {
                const { contentName } = getContentInfo(row.original);
                return (
                    <Typography variant="body2" fontWeight="medium">
                        {contentName}
                    </Typography>
                );
            },
            size: 250,
        },
        {
            id: 'code',
            header: translate('Catalog management.TABLE_HEADER_CODE', 'Code'),
            accessorFn: (row) => row.content?.code || '',
            cell: ({ row }) => (
                <Typography variant="body2">
                    {row.original.content?.code || '—'}
                </Typography>
            ),
        },
        {
            id: 'status',
            header: translate('Catalog management.TABLE_HEADER_STATUS', 'Status'),
            accessorFn: (row) => row.content?.status || '',
            cell: ({ row }) => {
                const status = row.original.content?.status || 'unpublished';
                const statusColor = status === 'published' ? 'success' : 'warning';

                return (
                    <Chip
                        label={status}
                        size="small"
                        color={statusColor}
                        variant="outlined"
                    />
                );
            },
            size: 120,
        },
        {
            id: 'language',
            header: translate('Catalog management.TABLE_HEADER_LANGUAGE', 'Language'),
            accessorFn: (row) => row.content?.language || row.content?.lang_string || '',
            cell: ({ row }) => {
                const language = row.original.content?.lang_string ||
                    row.original.content?.language || '—';
                const langCode = row.original.content?.lang_code || '';

                return (
                    <Typography variant="body2">
                        {language} {langCode ? `(${langCode})` : ''}
                    </Typography>
                );
            },
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
                            onClick={() => handleRemoveContent(row.original)}
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

    // Handle removing a single content
    const handleRemoveContent = (content) => {
        const { contentName } = getContentInfo(content);
        setRemoveConfirmation({
            open: true,
            contentIds: [content.id],
            isMultiple: false,
            contentName
        });
    };

    // Handle removing multiple contents
    const handleRemoveSelectedContents = () => {
        if (selectedRows.length === 0) return;

        setRemoveConfirmation({
            open: true,
            contentIds: selectedRows.map(row => row.id),
            isMultiple: true,
            count: selectedRows.length
        });
    };

    // Remove content from catalog function
    const removeContentsFromCatalog = async () => {
        try {
            if (!catalog?.id) {
                throw new Error("Catalog ID is required");
            }

            // For bulk content removal, use the new API endpoint
            if (removeConfirmation.isMultiple) {
                await unassignContentsMutation.mutateAsync({
                    catalogId: catalog.id,
                    contentIds: removeConfirmation.contentIds
                });
            } else {
                // Single content removal - can use either approach
                await removeContentMutation.mutateAsync({
                    catalogId: catalog.id,
                    contentId: removeConfirmation.contentIds[0]
                });
            }

            // Clear selection and close dialog
            setSelectedRows([]);
            setRemoveConfirmation({ open: false, contentIds: [], isMultiple: false, contentName: '' });

            // Refetch the data
            refetch();

            return true;
        } catch (error) {
            console.error('Error removing content from catalog:', error);
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
                handler: handleRemoveSelectedContents,
                disabled: selectedRows.length === 0,
            },
        ]
    ];

    return (
        <>
            <Box sx={{ mt: 2 }}>
                {/* Summary header */}
                <Box
                    sx={{
                        p: 2,
                        mb: 3,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'background.paper'
                    }}
                >
                    <Typography variant="subtitle1">
                        <Badge
                            badgeContent={contentsData?.pagination?.total || 0}
                            color="primary"
                            sx={{
                                '& .MuiBadge-badge': {
                                    position: 'relative',
                                    transform: 'none',
                                    mr: 1
                                }
                            }}
                        >
                        </Badge>
                        {translate('Catalog management.TEXT_COURSES_ASSIGNED', 'Courses and learning plans assigned to this catalog')}
                    </Typography>
                </Box>

                <DataView
                    columns={columns}
                    data={contentsData?.items || []}
                    isLoading={isLoading}
                    error={error}
                    pagination={{
                        ...pagination,
                        total: contentsData?.pagination?.total || 0
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
                            message: translate('Catalog management.EMPTY_STATE_NO_CONTENT', 'No content assigned'),
                            description: translate('Catalog management.EMPTY_STATE_NO_CONTENT_DESC', 'There are no courses or learning plans assigned to this catalog yet.'),
                            height: '400px'
                        }
                    }}
                    actionGroups={actionGroups}
                    enableSelection={true}
                    noToolBar={true}
                    height="calc(100vh - 380px)"
                    getRowId={(row) => row.id}
                />
            </Box>

            {/* Confirmation Dialog for Removing Content */}
            {removeConfirmation.open && (
                <ConfirmationDialog
                    type="error"
                    isOpen={removeConfirmation.open}
                    title={translate(
                        removeConfirmation.isMultiple
                            ? 'Catalog management.DIALOG_TITLE_REMOVE_CONTENT_MULTIPLE'
                            : 'Catalog management.DIALOG_TITLE_REMOVE_CONTENT_SINGLE'
                    )}
                    message={translate(
                        removeConfirmation.isMultiple
                            ? 'Catalog management.DIALOG_MESSAGE_REMOVE_CONTENT_MULTIPLE'
                            : 'Catalog management.DIALOG_MESSAGE_REMOVE_CONTENT_SINGLE',
                        removeConfirmation.isMultiple
                            ? { count: removeConfirmation.contentIds.length }
                            : { name: removeConfirmation.contentName }
                    )}
                    onClose={() => setRemoveConfirmation({ open: false, contentIds: [], isMultiple: false, contentName: '' })}
                    actions={{
                        toast: {
                            show: true,
                            success: translate(removeConfirmation.isMultiple ? 'Catalog management.TOAST_SUCCESS_CONTENT_REMOVED_MULTIPLE' : 'Catalog management.TOAST_SUCCESS_CONTENT_REMOVED_SINGLE', 'Content removed from catalog'),
                            error: translate('Catalog management.TOAST_ERROR_CONTENT_REMOVAL', 'Failed to remove content from catalog')
                        },
                        buttons: {
                            confirm: translate('common.remove', 'Remove'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('common.removing', 'Removing...')
                        },
                        onConfirm: removeContentsFromCatalog
                    }}
                    isAsync={true}
                />
            )}
        </>
    );
};

export default AssignedCourses;