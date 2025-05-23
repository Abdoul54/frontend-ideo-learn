'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataView from "@/views/DataView";
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';

import OptionMenu from '@/@core/components/option-menu';
import { useDeleteFolder, useFolders } from '@/hooks/api/tenant/repos/useFolders';
import { columns } from '@/constants/LearningUnits';
import { useDeleteLearningUnit, useLearningUnits } from '@/hooks/api/tenant/repos/useLeaningUnits';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LearningUnitDrawer from '@/views/Forms/LearningUnits/LearningUnitDrawer';
import Previewer from '@/views/Dialogs/LearningUnit/Previewer';
import { useTranslation } from '@/@core/contexts/translationContext';
import LearningUnitAssignmentToCourseDrawer from '@/views/Forms/LearningUnits/LearningUnitAssignmentToCourseDrawer';
import FolderDrawer from '@/views/Forms/Folders/FolderDrawer';
// import FolderDrawer from '@/views/Forms/Folders/FolderDrawer';

const page = () => {
  // State management

  const [foldersPagination, setFoldersPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [materialsPagination, setMaterialsPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [learningUnitSearchQuery, setLearningUnitSearchQuery] = useState("");
  const [foldersSearchQuery, setFoldersSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [drawerState, setDrawerState] = useState({ open: false, data: null, type: null });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, data: null, type: null });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchType, setSearchType] = useState(1);

  const handleSearchTypeChange = useCallback((newSearchType) => {
    setSearchType(newSearchType);
    // Reset pagination when search type changes
    setFoldersPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const { language, translate } = useTranslation()

  const {
    history: navigationHistory,
    currentItem: currentFolder,
    goForward,
    goBack,
    goToBreadcrumb,
    setCurrentItem
  } = useHistoryNavigation(
    { id: 1, title: "", code: "", },
    null
  );

  const { data: folders, isLoading: isFoldersLoading, error: foldersError } = useFolders({
    page: foldersPagination.pageIndex + 1,
    page_size: foldersPagination.pageSize,
    search_text: foldersSearchQuery || undefined,
    lang: language,
    folderId: currentFolder?.id,
    search_type: 2
  });


  const { data: learningUnits, isLoading: isLearningUnitsLoading, error: learnigUnitsError } = useLearningUnits({
    page: materialsPagination.pageIndex + 1,
    page_size: materialsPagination.pageSize,
    search_text: learningUnitSearchQuery || undefined,
    folderId: currentFolder?.id,
    sort: sorting,
  });

  useEffect(() => {
    if (folders?.extra_data && folders?.extra_data?.id === 1) {
      setCurrentItem({ id: 1, title: folders?.extra_data?.title, code: folders?.extra_data?.code });
    }
  }, [folders?.extra_data, setCurrentItem]);

  const deleteLearningUnit = useDeleteLearningUnit()
  const deleteFolder = useDeleteFolder()

  // Transform Folders API response for navigation
  const transformedFoldersData = useMemo(() => {
    return {
      items: folders?.items,
      total: folders?.pagination?.total || 0,
      current_page: folders?.pagination?.current_page || 1,
      per_page: folders?.pagination?.per_page || 10,
      parent: folders?.extra_data?.parent_folder || null,
    };
  }, [folders]);

  // Navigation handlers
  const handleNavigateForward = useCallback((id, title) => {
    const matchingItem = folders?.items.find(item => item.id === id);
    if (!matchingItem) return;

    goForward({
      id,
      title,
      code: matchingItem.code
    });
    setFoldersPagination(prev => ({ ...prev, pageIndex: 0 }));
    setMaterialsPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [folders?.items, goForward]);

  const handleNavigateBack = useCallback(() => {
    goBack();
    setFoldersPagination(prev => ({ ...prev, pageIndex: 0 }));
    setMaterialsPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [goBack]);

  const handleDeleteSubmit = async () => {
    try {
      if (deleteConfirmation?.type === 'delete_folder') {
        const result = await deleteFolder.mutateAsync(deleteConfirmation?.data?.id);

        return result;
      } else if (deleteConfirmation?.type === 'delete_learning_unit') {
        const result = await deleteLearningUnit.mutateAsync(deleteConfirmation?.data?.id);

        return result;
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error; // Re-throw so dialog can handle it
    }
  }

  const actionItems = [
    [
      {
        id: 'add-material',
        label: translate('CR management.MENU_ADD_MATERIAL'),
        icon: <i className="lucide-file-plus" />,
        handler: setDrawerState.bind(null, { open: true, data: null, type: 'add_learning_unit' }),
      },
      {
        id: 'add-folder',
        label: translate('CR management.MENU_ADD_FOLDER'),
        icon: <i className="lucide-folder-plus" />,
        handler: setDrawerState.bind(null, { open: true, data: null, type: 'add_folder' }),
      },
    ],
  ];

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
        title="Central Repository"
        columns={columns(setDrawerState, setDeleteConfirmation, translate)}
        pagination={{
          ...materialsPagination,
          total: learningUnits?.pagination?.total
        }}
        setPagination={setMaterialsPagination}
        data={learningUnits?.items}
        isLoading={isLearningUnitsLoading}
        error={learnigUnitsError}
        getRowId={(row) => row.material_id}
        initialNavigationOpen={true}
        navigation={{
          data: folders?.items,
          currentItem: currentFolder,
          GoBack: handleNavigateBack,
          GoForward: handleNavigateForward,
          searchQuery: foldersSearchQuery,
          onSearchChange: (e) => setFoldersSearchQuery(e.target.value),
          searchType: searchType,
          onSearchTypeChange: handleSearchTypeChange,
          enableSearchType: false,
          isLoading: isFoldersLoading,
          pagination: {
            count: folders?.pagination?.total,
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
          footerComponent: selectionStatusSwitch,
          actions: [
            {
              label: "Edit",
              icon: "solar-pen-outline text-base",
              className: "flex items-center gap-2 text-base",
              onClick: (item) => {
                setDrawerState({ open: true, data: item, type: 'edit_folder' });
              }
            },
            {
              label: 'Delete',
              icon: <i className="solar-trash-bin-minimalistic-2-outline text-base" />,
              onClick: (item) => {
                setDeleteConfirmation({ open: true, data: item, type: 'delete_folder' });
              },
              className: 'flex items-center gap-2 text-error hover:bg-errorLight text-base',
            },
          ]

        }}
        toolbar={{
          breadcrumbs: [
            { label: translate('CR management.BREADCRUMB_CENTRAL_REPOSITORY'), link: '/learn/central-repository' }
          ],
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
        datatablemulti
        enableSelection
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        slots={{
          globalFilter: learningUnitSearchQuery,
          setGlobalFilter: setLearningUnitSearchQuery,
          sorting,
          setSorting,
          columnVisibility,
          setColumnVisibility,
          features: {
            search: true,
            filter: false,
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
        multiselectionActionBar={{
          selectedRows,
          total: learningUnits?.data?.count,
          onClearSelection: () => setSelectedRows([]),
          primaryActions: [
            {
              id: 'delete',
              label: 'Delete',
              color: 'error',
              handler: () => { console.log('Delete') },
            }
          ]
        }}
      />
      {
        drawerState?.open && (drawerState?.type === 'edit_folder' || drawerState?.type === 'add_folder') && (
          <FolderDrawer
            open={drawerState.open}
            onClose={() => setDrawerState({ open: false, data: null, type: null })}
            data={drawerState.data}
            translate={translate}
          />
        )
      }
      {
        drawerState?.open && (drawerState?.type === 'edit_learning_unit' || drawerState?.type === 'add_learning_unit') && (
          <LearningUnitDrawer
            open={drawerState.open}
            onClose={() => setDrawerState({ open: false, data: null, type: null })}
            data={drawerState.data}
            translate={translate}
          />
        )
      }
      {
        drawerState?.open && drawerState?.type === 'assign_learning_unit_to_course' && (
          <LearningUnitAssignmentToCourseDrawer
            open={drawerState.open}
            onClose={() => setDrawerState({ open: false, data: null, type: null })}
            data={drawerState.data}
            translate={translate}
          />
        )
      }
      {
        drawerState?.open && drawerState?.type === 'preview_learning_unit' && (
          <Previewer
            open={drawerState.open}
            onClose={() => setDrawerState({ open: false, data: null, type: null })}
            data={drawerState.data}
            translate={translate}
          />
        )
      }
      {
        deleteConfirmation.open && <ConfirmationDialog
          type='error'
          isOpen={deleteConfirmation.open}
          title={`Delete "${deleteConfirmation?.data?.title}"`}
          message={deleteConfirmation?.type === 'delete_folder' ? 'Are you sure you want to delete the folder?' : `Are you sure you want to delete the the learning unit`}
          onClose={() => setDeleteConfirmation({ open: false, data: null })}
          actions={{
            toast: {
              success: deleteConfirmation?.type === 'delete_folder' ? 'Folder deleted successfully' : 'Learning unit deleted successfully',
              error: deleteConfirmation?.type === 'delete_folder' ? 'Error deleting folder' : 'Error deleting learning unit',
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
            isLoading: deleteFolder.isPending || deleteLearningUnit.isPending,
          }}
          confirmationWord={deleteConfirmation?.data?.title}
          typingConfirmation
          isAsync
        />
      }
    </>
  );
};

export default page;