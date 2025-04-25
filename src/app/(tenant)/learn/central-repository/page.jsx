'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataView from "@/views/DataView";
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation';
import { useRouter } from 'next/navigation';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';

// Import mock data hooks instead of real API hooks
import { useRepositoryFolders } from '@/hooks/api/tenant/learn/central-repo/useRepositoryFoldersMock';
import { useRepositoryMaterials } from '@/hooks/api/tenant/learn/central-repo/useRepositoryMaterialsMock';
import { IconButton } from '@mui/material';

// import { useMaterialsColumns } from '@/hooks/api/repository/useMaterialsColumns';
// import AddFolderDrawer from '@/views/Drawers/AddFolderDrawer';
// import AddMaterialDrawer from '@/views/Drawers/AddMaterialDrawer';
// import EditMaterialDrawer from '@/views/Drawers/EditMaterialDrawer';
// import DeleteConfirmationDialog from '@/views/Dialogs/DeleteConfirmation';
// import MoveMaterialsDrawer from '@/views/Drawers/MoveMaterialsDrawer';
import OptionMenu from '@/@core/components/option-menu';
import { useDeleteMaterial, useMoveMaterials, useUpdateMaterialStatus } from '@/hooks/api/tenant/learn/central-repo/useRepositoryFolders';

const RepositoryPageWithMockData = () => {
  // State management
  const [filters, setFilters] = useState(null);
  const [foldersPagination, setFoldersPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [materialsPagination, setMaterialsPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState("");
  const [foldersSearchQuery, setFoldersSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [materialId, setMaterialId] = useState(null);

  const [addFolderDrawerOpen, setAddFolderDrawerOpen] = useState(false);
  const [addMaterialDrawerOpen, setAddMaterialDrawerOpen] = useState(false);
  const [moveMaterialsDrawerOpen, setMoveMaterialsDrawerOpen] = useState(false);
  const [batchDeleteConfirmation, setBatchDeleteConfirmation] = useState({
    open: false,
    materialIds: [],
  });

  const [searchType, setSearchType] = useState(1);

  const router = useRouter();

  // Delete material mutation
  const deleteMaterialMutation = useDeleteMaterial();
  
  // Update material status mutation
  const updateMaterialStatusMutation = useUpdateMaterialStatus();
  
  // Move materials mutation
  const moveMaterialsMutation = useMoveMaterials();

  const handleBatchDelete = (rows) => {
    const materialIds = rows.map((row) => row.material_id);
    setBatchDeleteConfirmation({ open: true, materialIds });
  };

  const handleDeleteMaterial = async (material) => {
    try {
      await deleteMaterialMutation.mutateAsync(material.material_id);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  // Handle delete action for selected rows
  const handleDeleteSelected = async (rows) => {
    try {
      const materialIds = rows.map(row => row.material_id);
      for (const id of materialIds) {
        await deleteMaterialMutation.mutateAsync(id);
      }
      setSelectedRows([]);
    } catch (error) {
      console.error('Error deleting materials:', error);
    }
  };

  const handleCreateMaterialClick = useCallback(() => {
    setMaterialId(null);
    setMaterialDrawerOpen(true);
  }, []);

  // Drawer handlers
  const handleAddMaterialClick = useCallback(() => {
    setAddMaterialDrawerOpen(true);
  }, []);

  const handleAddMaterialDrawerClose = useCallback(() => {
    setAddMaterialDrawerOpen(false);
  }, []);

  const handleAddFolderClick = useCallback(() => {
    setAddFolderDrawerOpen(true);
  }, []);

  const handleAddFolderDrawerClose = useCallback(() => {
    setAddFolderDrawerOpen(false);
  }, []);

  const handleSearchTypeChange = useCallback((newSearchType) => {
    setSearchType(newSearchType);
    // Reset pagination when search type changes
    setFoldersPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Navigation history management
  const {
    history: navigationHistory,
    currentItem: currentFolder,
    goForward,
    goBack,
    goToBreadcrumb
  } = useHistoryNavigation(
    { folder_id: 1, name: 'IDEO', code: 'IDEO' },
    (newItem, direction) => {
      // Optional callback when navigation changes
    }
  );

  // Fetch folders data
  const { data: foldersData, isLoading: isFoldersLoading, error: foldersError } = useRepositoryFolders({
    page: foldersPagination.pageIndex + 1,
    page_size: foldersPagination.pageSize,
    search: foldersSearchQuery || undefined,
    sort_attr: sorting[0]?.id || 'name',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    folder_id: currentFolder?.folder_id,
    search_type: searchType
  });

  // Fetch materials data for the selected folder
  const {
    data: materialsData,
    isLoading: isMaterialsLoading,
    error: materialsError,
  } = useRepositoryMaterials({
    search_text: materialsSearchQuery || '',
    page: materialsPagination.pageIndex + 1,
    page_size: materialsPagination.pageSize,
    sort_attr: sorting[0]?.id || 'created_on',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    folder_id: currentFolder?.folder_id,
    filters
  });

  // Transform Folders API response for navigation
  const transformedFoldersData = useMemo(() => {
    const items = foldersData?.data?.items || [];
    const total = foldersData?.data?.total_count || 0;
    
    return {
      items: items.map(item => ({
        id: item.folder_id,
        title: item.name,
        code: item.code,
        has_children: item.children_count > 0
      })),
      total,
      current_page: foldersData?.data?.current_page || 1,
      per_page: foldersData?.data?.current_page_size || 10,
      parent: foldersData?.extra_data?.parent_folder || null,
    };
  }, [foldersData]);

  // Transform Materials API response for the table
  const transformedMaterialsData = useMemo(() => ({
    items: materialsData?.data?.items?.map(item => ({
      ...item,
      id: item.material_id
    })) || [],
    total: materialsData?.data?.total_count || 0,
    current_page: materialsData?.data?.current_page || 1,
    per_page: materialsData?.data?.current_page_size || 15,
  }), [materialsData]);

  // Navigation handlers
  const handleNavigateForward = useCallback((id, title) => {
    const matchingItem = transformedFoldersData.items.find(item => item.id === id);
    if (!matchingItem) return;
    
    goForward({
      folder_id: id,
      name: title,
      code: matchingItem.code
    });
    setFoldersPagination(prev => ({ ...prev, pageIndex: 0 }));
    setMaterialsPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [transformedFoldersData.items, goForward]);

  const handleNavigateBack = useCallback(() => {
    goBack();
    setFoldersPagination(prev => ({ ...prev, pageIndex: 0 }));
    setMaterialsPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [goBack]);

  const handleEditMaterial = (material) => {
    setMaterialId(material.material_id);
    setMaterialDrawerOpen(true);
  };

  // Define action groups for multi-selection
  const actionGroups = [
    // Status actions grouped
    [
      {
        id: 'status',
        label: 'Status',
        icon: <i className='solar-check-square-bold-duotone' size={18} />,
        subMenu: [
          {
            id: 'set-available',
            label: 'Set Available',
            icon: <i className='solar-check-circle-bold-duotone' size={18} />,
            handler: (rows) => {
              const materialIds = rows.map(row => row.material_id);
              updateMaterialStatusMutation.mutate({ materialIds, status: 'available' });
            }
          },
          {
            id: 'set-unavailable',
            label: 'Set Unavailable',
            icon: <i className='solar-close-circle-bold-duotone' size={18} />,
            handler: (rows) => {
              const materialIds = rows.map(row => row.material_id);
              updateMaterialStatusMutation.mutate({ materialIds, status: 'unavailable' });
            }
          }
        ]
      },
      {
        id: 'move-materials',
        label: 'Move Materials',
        icon: <i className="solar-move-to-folder-bold-duotone" size={18} />,
        handler: (rows) => {
          setSelectedRows(rows);
          setMoveMaterialsDrawerOpen(true);
        },
      },
    ],
    // Keep Delete in its own group
    [
      {
        id: 'delete-selected',
        label: 'Delete',
        icon: <i className="solar-trash-bin-2-bold-duotone" size={18} />,
        handler: (rows) => {
          handleBatchDelete(rows);
        },
        disabled: selectedRows.length === 0,
      },
    ],
  ];

  const actionItems = [
    [
      {
        id: 'add-material',
        label: 'Add Material',
        icon: <i className="lucide-file-plus" />,
        handler: handleAddMaterialClick,
      },
      {
        id: 'add-folder',
        label: 'Add Folder',
        icon: <i className="lucide-folder-plus" />,
        handler: handleAddFolderClick,
      },
    ],
  ];

  // Navigation data
  const navigationData = useMemo(() => 
    Array.isArray(transformedFoldersData.items) ? transformedFoldersData.items : []
  , [transformedFoldersData.items]);

  // Define columns manually for mock implementation
  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      meta: { type: 'text', width: 250, flex: 1 },
      minWidth: 250,
      cell: (info) => info.getValue()
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      meta: { type: 'text', width: 120 },
      minWidth: 120,
      cell: (info) => {
        const typeMap = {
          'scormorg': 'SCORM',
          'document': 'Document',
          'video': 'Video',
          'assessment': 'Assessment'
        };
        
        return typeMap[info.getValue()] || info.getValue();
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      meta: { type: 'text', width: 120 },
      minWidth: 120,
      cell: (info) => {
        const value = info.getValue();
        const color = value === 'available' ? 'success' : 'error';
        const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
        
        return (
          <Box 
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1,
              bgcolor: theme => `${theme.palette[color].lighter}`,
              color: theme => `${theme.palette[color].main}`
            }}
          >
            {formattedValue}
          </Box>
        );
      }
    },
    {
      id: 'versions_count',
      header: 'Versions',
      accessorKey: 'versions_count',
      meta: { type: 'number', width: 100 },
      minWidth: 100,
      cell: (info) => info.getValue()
    },
    {
      id: 'assigned_courses_counts',
      header: 'Courses',
      accessorFn: (row) => row.assigned_courses_counts?.total || 0,
      meta: { type: 'number', width: 100 },
      minWidth: 100,
      cell: (info) => info.getValue()
    },
    {
      id: 'created_on',
      header: 'Created On',
      accessorKey: 'created_on',
      meta: { type: 'date', width: 150 },
      minWidth: 150,
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleString();
      }
    },
    {
      id: 'created_by',
      header: 'Created By',
      accessorFn: (row) => row.created_by?.fullname || '',
      meta: { type: 'text', width: 180 },
      minWidth: 180,
      cell: (info) => info.getValue()
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { type: 'actions', width: 100 },
      minWidth: 100,
      cell: (info) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => handleEditMaterial(info.row.original)}
            size="small"
            color="primary"
          >
            <i className="solar-pen-2-linear" style={{ fontSize: '1.25rem' }} />
          </IconButton>
          <IconButton 
            onClick={() => handleDeleteMaterial(info.row.original)}
            size="small"
            color="error"
          >
            <i className="solar-trash-bin-trash-linear" style={{ fontSize: '1.25rem' }} />
          </IconButton>
        </Box>
      )
    }
  ], []);

// Add state for subfolders content toggle
const [showSubfoldersContent, setShowSubfoldersContent] = useState(false);

// Handler for the switch toggle
const handleShowSubfoldersContentChange = useCallback((event) => {
    setShowSubfoldersContent(event.target.checked);
    // You could trigger a data refresh here if needed
}, []);

const selectionStatusSwitch = (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 2,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider'
        }}
    >
        <Typography variant="body2" color="text.secondary" mr={1}>
            Show subfolders content
        </Typography>
        <FormControlLabel
            control={
                <Switch
                    checked={showSubfoldersContent}
                    onChange={handleShowSubfoldersContentChange}
                    color="primary"
                />
            }
        />
    </Box>
);

  return (
    <>
      <DataView
        title="Central Repository (Mock Data)"
        columns={columns}
        isColumnsLoading={false}
        columnsError={null}
        pagination={{
          pageIndex: materialsPagination.pageIndex,
          pageSize: materialsPagination.pageSize,
          total: transformedMaterialsData.total
        }}
        setPagination={setMaterialsPagination}
        data={transformedMaterialsData.items}
        isLoading={isMaterialsLoading}
        error={materialsError}
        getRowId={(row) => row.material_id}
        initialNavigationOpen={true}
        navigation={{
          data: navigationData,
          currentItem: currentFolder,
          GoBack: handleNavigateBack,
          GoForward: handleNavigateForward,
          searchQuery: foldersSearchQuery,
          onSearchChange: (e) => setFoldersSearchQuery(e.target.value),
          searchType: searchType,
          onSearchTypeChange: handleSearchTypeChange,
          enableSearchType: true,
          isLoading: isFoldersLoading,
          pagination: {
            count: transformedFoldersData.total,
            page: foldersPagination.pageIndex,
            rowsPerPage: foldersPagination.pageSize,
            onPageChange: (newPage) => {
              setFoldersPagination(prev => ({ ...prev, pageIndex: newPage }));
            },
            onRowsPerPageChange: (newRowsPerPage) => {
              setFoldersPagination({ pageIndex: 0, pageSize: newRowsPerPage });
            }
          },
          parent: transformedFoldersData.parent,
          footerComponent: selectionStatusSwitch
        }}
        toolbar={{
          buttonGroup: [
            {
              component: (
                <OptionMenu
                  menuProps={{ 
                    elevation: 2,
                    sx: { '& .MuiMenu-paper': { minWidth: 200 } }
                  }}
                  iconButtonProps={{ color: 'primary' }}
                  icon={<i className="lucide-plus" />}
                  options={actionItems.flatMap((group, groupIndex) => [
                    ...(groupIndex > 0 ? [{ divider: true }] : []),
                    ...group.map(action => ({
                      text: action.label,
                      icon: action.icon,
                      menuItemProps: { 
                        onClick: () => action.handler(),
                        sx: { py: 1.5 }
                      }
                    }))
                  ])}
                />
              ),
              tooltip: "Add options",
            }
          ]
        }}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        slots={{
          filters,
          setFilters,
          globalFilter: materialsSearchQuery,
          setGlobalFilter: setMaterialsSearchQuery,
          sorting,
          setSorting,
          columnVisibility,
          setColumnVisibility,
          features: {
            search: true,
            filter: true,
            navigation: true,
            columnVisibility: true,
            breadcrumbs: true
          },
          emptyState: {
            message: "No materials found",
            description: "Try adjusting your filters or add a new material.",
            height: 'calc(100vh - 400px)',
            icon: <i className="lucide-file-x" style={{ fontSize: '2rem' }} />
          }
        }}
        onDeleteSelected={handleDeleteSelected}
        actionGroups={actionGroups}
      />

      {/* Add Folder Drawer */}
      {/* <AddFolderDrawer
        open={addFolderDrawerOpen}
        onClose={handleAddFolderDrawerClose}
        parentFolderId={currentFolder?.folder_id}
      /> */}

      {/* Add Material Drawer
      <AddMaterialDrawer
        open={addMaterialDrawerOpen}
        onClose={handleAddMaterialDrawerClose}
        folderId={currentFolder?.folder_id}
      /> */}

      {/* Edit Material Drawer
      <EditMaterialDrawer
        open={materialDrawerOpen}
        onClose={() => {
          setMaterialDrawerOpen(false);
          setMaterialId(null);
        }}
        materialId={materialId}
      /> */}

      {/* Move Materials Drawer
      <MoveMaterialsDrawer
        open={moveMaterialsDrawerOpen}
        onClose={() => setMoveMaterialsDrawerOpen(false)}
        selectedRows={selectedRows}
      /> */}

      {/* Batch delete confirmation dialog
      <DeleteConfirmationDialog
        open={batchDeleteConfirmation.open}
        onClose={() => setBatchDeleteConfirmation({ open: false, materialIds: [] })}
        data={{ ids: batchDeleteConfirmation.materialIds }}
        title={`DELETE ${batchDeleteConfirmation.materialIds.length} MATERIALS`}
        onSubmit={async () => {
          try {
            for (const id of batchDeleteConfirmation.materialIds) {
              await deleteMaterialMutation.mutateAsync(id);
            }
            setBatchDeleteConfirmation({ open: false, materialIds: [] });
            setSelectedRows([]);
          } catch (error) {
            console.error('Error deleting materials:', error);
          }
        }}
      /> */}
    </>
  );
};

export default RepositoryPageWithMockData;