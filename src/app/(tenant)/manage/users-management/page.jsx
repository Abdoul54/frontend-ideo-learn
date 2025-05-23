'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataView from "@/views/DataView";
import { useDeleteHaykal, useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation';
import { Breadcrumbs, FormControlLabel, Link, Switch } from '@mui/material';
import AddHaykalDrawer from '@/views/Drawers/AddHaykalDrawer';
import { useBatchRemoveUsersFromHaykal, useHaykalUsers } from '@/hooks/api/tenant/useHaykalUsers';
import AddUserToBranchDrawer from '@/views/Drawers/AddUserToBranchDrawer';
import { actionColumn, usersColumns } from '@/constants/Users';
import { useRouter } from 'next/navigation';
import { Box, Button, Menu, MenuItem, Divider, Typography } from '@mui/material';
import UserForm from '@/views/Forms/Tenant/UserForm';
import { useBatchDeleteUsers, useGetListUsers, useUpdateUserStatus } from '@/hooks/api/useUsers';
import AddToMultipleBranchesDrawer from '@/views/Drawers/AddToMultipleBranchesDrawer';
import RemoveFromMultipleBranchesDrawer from '@/views/Drawers/RemoveFromMultipleBranchesDrawer';
import DeleteConfirmationDialog from '@/views/Dialogs/DeleteConfirmation';
import MoveUsersToBranchDrawer from '@/views/Drawers/MoveUsersToBranchDrawer';
import EditUserForm from '@/views/Forms/Tenant/EditUserForm';
import CreateUserForm from '@/views/Forms/Tenant/CreateUserForm';
import MassUpdateUserForm from '@/views/Forms/Tenant/MassUpdateUserForm';
import { useUsersColumns } from '@/hooks/api/tenant/useUsers';
import OptionMenu from '@/@core/components/option-menu';
import UserBranchErrorDialog from '@/views/Dialogs/UserBranchErrorDialog';
import BranchDeleteConfirmationDialog from '@/views/Dialogs/BranchDeleteConfirmationDialog';
import HaykalDeleteWarningDialog from '@/views/Dialogs/HaykalDeleteWarningDialog';
import AssignUserFieldsToBranchDrawer from '@/views/Drawers/AssignUserFieldsToBranchDrawer';
import EditHaykalDrawer from '@/views/Drawers/EditHaykalDrawer';
import MoveHaykalDrawer from '@/views/Drawers/MoveHaykalDrawer';
import { useAdvancedSettings } from '@/hooks/api/tenant/useAdvancedSettings';
import { useTranslation } from '@/@core/contexts/translationContext';

const HaykalPage = () => {
  // State management
  const [filters, setFilters] = React.useState(null);
  const [haykalPagination, setHaykalPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [usersPagination, setUsersPagination] = React.useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = React.useState([]);
  const [usersSearchQuery, setUsersSearchQuery] = React.useState("");
  const [haykalSearchQuery, setHaykalSearchQuery] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [columns, setColumns] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [userId, setUserId] = useState(null); // Add this line to track the selected user ID

  const [addHaykalDrawerOpen, setAddHaykalDrawerOpen] = useState(false);
  const [addUserToBranchDrawerOpen, setAddUserToBranchDrawerOpen] = useState(false);
  const [addToMultipleBranchesDrawerOpen, setAddToMultipleBranchesDrawerOpen] = useState(false);
  const [removeFromMultipleBranchesDrawerOpen, setRemoveFromMultipleBranchesDrawerOpen] = useState(false);
  const [batchDeleteConfirmation, setBatchDeleteConfirmation] = useState({
    open: false,
    userIds: [],
  });

  // Add these near your other state variables
  const [moveHaykalDrawerOpen, setMoveHaykalDrawerOpen] = useState(false);
  const [editHaykalDrawerOpen, setEditHaykalDrawerOpen] = useState(false);
  const [selectedHaykalId, setSelectedHaykalId] = useState(null);
  const [assignUserFieldsDrawerOpen, setAssignUserFieldsDrawerOpen] = useState(false);
  const [haykalDeleteWarningOpen, setHaykalDeleteWarningOpen] = useState(false);
  const [haykalDeleteConfirmOpen, setHaykalDeleteConfirmOpen] = useState(false);
  const [currentHaykalItem, setCurrentHaykalItem] = useState(null);
  const [userBranchErrorOpen, setUserBranchErrorOpen] = useState(false);

  const [moveUsersDrawerOpen, setMoveUsersDrawerOpen] = useState(false);

  const batchDeleteUsers = useBatchDeleteUsers();

  const batchRemoveUsersMutation = useBatchRemoveUsersFromHaykal();

  const [massUpdateDrawerOpen, setMassUpdateDrawerOpen] = useState(false);

  const [selectionStatus, setSelectionStatus] = useState(2);

  const [searchType, setSearchType] = useState(1);

  const router = useRouter();

  const deleteHaykalMutation = useDeleteHaykal();

  // Handle confirmed deletion of a haykal/branch
  const handleConfirmedDelete = async (haykalId) => {
    try {
      await deleteHaykalMutation.mutateAsync(haykalId);
      console.log('Branch deleted successfully:', haykalId);
    } catch (error) {
      console.error('Error deleting Branch:', error);

      const errorMessage = error.response?.data?.message;
      if (Array.isArray(errorMessage) &&
        errorMessage.some(msg =>
          typeof msg === 'string' &&
          (msg.includes('user_branches') || msg.includes('column "id" does not exist'))
        )) {
        setUserBranchErrorOpen(true);
        toast.error('Cannot delete branch that contains users');
      } else {
        toast.error('Error deleting branch');
      }
    } finally {
      setHaykalDeleteConfirmOpen(false);
    }
  };

  const { data: advancedSettings } = useAdvancedSettings();
  const { translate } = useTranslation();

  // Define actions for the DataTableNavigation component
  const navigationActions = useMemo(() => {
    const shouldShowUserFields = advancedSettings?.user?.use_node_fields_visibility || false;

    return [
      {
        label: translate('User Management.CONTEXT_MENU_MOVE', 'Move'),
        icon: <i className="solar-square-transfer-horizontal-linear" style={{ width: '18px', height: '18px' }} />,
        onClick: (item, { openDrawer }) => {
          setCurrentHaykalItem(item);
          setMoveHaykalDrawerOpen(true);
        }
      },
      ...(shouldShowUserFields ? [{
        label: translate('User Management.CONTEXT_MENU_ASSIGN_USER_FIELDS', 'Assign User Fields'),
        icon: <i className="solar-user-id-linear" style={{ width: '18px', height: '18px' }} />,
        onClick: (item, { openDrawer }) => {
          setSelectedHaykalId(item.id);
          setAssignUserFieldsDrawerOpen(true);
        }
      }] : []),
      {
        label: translate('User Management.MENU_EDIT', 'Edit'),
        icon: <i className="solar-pen-2-linear" style={{ width: '18px', height: '18px' }} />,
        onClick: (item, { openDrawer }) => {
          setSelectedHaykalId(item.id);
          setEditHaykalDrawerOpen(true);
        }
      },
      {
        label: translate('User Management.MENU_DELETE', 'Delete'),
        icon: <i className="solar-trash-bin-trash-linear" style={{ width: '18px', height: '18px', color: 'error.main' }} />,
        className: "text-error",
        onClick: (item, { openDrawer }) => {
          setCurrentHaykalItem(item);
          if (item.has_children) {
            setHaykalDeleteWarningOpen(true); // Directly set the warning dialog state
          } else {
            setHaykalDeleteConfirmOpen(true); // Directly set the confirm dialog state
          }
        }
      }
    ];
  }, [advancedSettings]);

  const handleBatchDelete = (rows) => {
    const userIds = rows.map((row) => row.id);
    setBatchDeleteConfirmation({ open: true, userIds });
  };

  const handleDeleteUser = async (user) => {
    try {
      const payload = [
        {
          id_user: user.user_id,
          id_branch: currentHaykal?.id,
          branch_code: currentHaykal?.code,
        },
      ];
      await batchRemoveUsersMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Handle delete action for selected rows
  const handleDeleteSelected = async (rows) => {
    try {
      const items = rows.map((row) => ({
        id_user: row.user_id || (row.original && row.original.user_id),
        id_branch: currentHaykal?.id,
        branch_code: currentHaykal?.code,
      }));
      await batchRemoveUsersMutation.mutateAsync(items);
      setSelectedRows([]);
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  };

  const handleCreateUserClick = useCallback(() => {
    //setUserId(null);
    setUserDrawerOpen(true);
  }, []);

  // Drawer handlers for Add Haykal and Add User to Branch
  const handleAddUserToBranchClick = useCallback(() => {
    setAddUserToBranchDrawerOpen(true);
  }, []);

  const handleAddUserToBranchDrawerClose = useCallback(() => {
    setAddUserToBranchDrawerOpen(false);
  }, []);

  const handleAddHaykalClick = useCallback(() => {
    setAddHaykalDrawerOpen(true);
  }, []);

  const handleAddHaykalDrawerClose = useCallback(() => {
    setAddHaykalDrawerOpen(false);
  }, []);

  const handleAddToMultipleBranchesDrawerClose = () => {
    setAddToMultipleBranchesDrawerOpen(false);
  };

  const handleSelectionStatusChange = (event) => {
    setSelectionStatus(event.target.checked ? 2 : 1);
  };

  const handleGroupsClick = () => {
    router.push('/manage/groups');
  };

  const handlePowerUsersClick = () => {
    router.push('/powerusers');
  };

  const handleUserFieldsClick = () => {
    router.push('/manage/user-fields');
  };

  // Navigation history management
  const {
    history: navigationHistory,
    currentItem: currentHaykal,
    goForward,
    goBack,
    goToBreadcrumb
  } = useHistoryNavigation(
    { id: 1, title: 'Platform', code: 'platform' },
    (newItem, direction) => {
      //console.log(`Navigated ${direction} to:`, newItem);
    }
  );

  //fetch haykals data
  const [appLanguage, setAppLanguage] = useState(null);

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem('app_language');
      console.log('Stored language:', storedLanguage);
      if (storedLanguage) {
        const languageData = JSON.parse(storedLanguage);
        if (languageData && languageData.locale) {
          setAppLanguage(languageData.locale);
        }
      }
    } catch (error) {
      console.error('Error retrieving language from localStorage:', error);
    }
  }, []);

  const { data: haykalData, isLoading: isHaykalLoading, error: haykalError } = useHaykal({
    page: haykalPagination.pageIndex + 1,
    page_size: haykalPagination.pageSize,
    search: haykalSearchQuery || undefined,
    sort_attr: sorting[0]?.id || 'name',
    lang: appLanguage,
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    haykal_id: currentHaykal?.id === 1 ? undefined : currentHaykal?.id,
    search_type: searchType
  });

  // Fetch users data for the selected Haykal
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetListUsers({
    search_text: usersSearchQuery || '',
    page: usersPagination.pageIndex + 1,
    page_size: usersPagination.pageSize,
    sort_attr: sorting[0]?.id || 'username',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    branch_id: currentHaykal?.id || 1,
    selection_status: selectionStatus,
    filters
  });

  const handleSearchTypeChange = useCallback((newSearchType) => {
    setSearchType(newSearchType);
    // Reset pagination when search type changes
    setUsersPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Transform Haykal API response for navigation
  const transformedHaykalData = useMemo(() => {
    const items = haykalData?.data?.items || [];
    const total = haykalData?.data?.pagination?.total || 0;

    return {
      items,
      total,
      current_page: haykalData?.data?.pagination?.current_page || 1,
      per_page: haykalData?.data?.pagination?.per_page || 10,
      parent: haykalData?.data?.extra_data || null,
    };
  }, [haykalData]);

  // Transform Users API response for the table
  const transformedUsersData = useMemo(() => ({
    items: usersData?.items?.map(item => ({
      ...item,
      user_id: item.id,
      id: item.id
    })) || [],
    total: usersData?.pagination?.total || 0,
    current_page: usersData?.pagination?.current_page || 1,
    per_page: usersData?.pagination?.per_page || 10,
  }), [usersData]);

  // Navigation handlers
  const handleNavigateForward = useCallback((id, title) => {
    const matchingItem = transformedHaykalData.items.find(item => item.id === id);
    if (!matchingItem) return;

    goForward({
      id,
      title,
      code: matchingItem.code,
      has_children: matchingItem.has_children
    });
    setHaykalPagination(prev => ({ ...prev, pageIndex: 0 }));
    setUsersPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [transformedHaykalData.items, goForward]);

  const handleNavigateBack = useCallback(() => {
    goBack();
    setHaykalPagination(prev => ({ ...prev, pageIndex: 0 }));
    setUsersPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [goBack]);

  // Breadcrumbs component
  // const CustomBreadcrumbs = useMemo(() => (
  //   <Breadcrumbs separator={<i className='lucide-chevron-right' />}>
  //     {navigationHistory.map((item, index) => (
  //       <Link
  //         key={item.id}
  //         component="button"
  //         onClick={() => goToBreadcrumb(item)}
  //         sx={{ textDecoration: 'none', color: 'inherit' }}
  //       >
  //         {item.title}
  //       </Link>
  //     ))}
  //   </Breadcrumbs>
  // ), [navigationHistory, goToBreadcrumb]);

  // Navigation data
  const navigationData = useMemo(() => (
    Array.isArray(transformedHaykalData.items) ? transformedHaykalData.items : []
  ), [transformedHaykalData.items]);

  // Update status mutation
  const updateStatusMutation = useUpdateUserStatus();

  // Define custom action groups
  const actionGroups = [
    // Branch management actions grouped under "Branches"
    [
      {
        id: 'branches',
        label: translate('User Management.MENU_BRANCHES', 'Branches'),
        icon: <i className='solar-folder-bold-duotone' size={18} />,
        subMenu: [
          {
            id: 'add-to-branch',
            label: translate('User Management.SUBMENU_ADD_TO_BRANCH', 'Add to branch'),
            icon: <i className='solar-add-folder-bold-duotone' size={18} />,
            handler: (rows) => {
              setSelectedRows(rows);
              console.log('Selected rows:', rows);
              handleAddUserToBranchClick();
            }
          },
          {
            id: 'remove-from-branch',
            label: translate('User Management.SUBMENU_REMOVE_FROM_BRANCH', 'Remove from branch'),
            icon: <i className='solar-folder-error-line-duotone' size={18} />,
            handler: (rows) => {
              handleDeleteSelected(rows);
            },
          },
          {
            id: 'move-to-branch',
            label: translate('User Management.SUBMENU_MOVE_TO_BRANCH', 'Move to branch'),
            icon: <i className="solar-move-to-folder-bold-duotone" size={18} />,
            handler: (rows) => {
              setSelectedRows(rows);
              setMoveUsersDrawerOpen(true);
            },
          },
          {
            id: 'add-to-multiple-branches',
            label: translate('User Management.SUBMENU_ADD_TO_MULTIPLE_BRANCHES', 'Add to Multiple Branches'),
            icon: <i className='solar-add-folder-bold-duotone' size={18} />,
            handler: (rows) => {
              setSelectedRows(rows);
              setAddToMultipleBranchesDrawerOpen(true);
            }
          },
          {
            id: 'remove-from-multiple-branches',
            label: translate('User Management.SUBMENU_REMOVE_FROM_MULTIPLE_BRANCHES', 'Remove from Multiple Branches'),
            icon: <i className="solar-folder-error-line-duotone" size={18} />,
            handler: (rows) => {
              setSelectedRows(rows);
              setRemoveFromMultipleBranchesDrawerOpen(true);
            },
          }
        ]
      }
    ],
    // Second group with Status submenu and Edit action
    [
      {
        id: 'status',
        label: translate('User Management.MENU_STATUS', 'Status'),
        icon: <i className='solar-user-check-bold-duotone' size={18} />,
        subMenu: [
          {
            id: 'activate',
            label: translate('User Management.SUBMENU_ACTIVATE', 'Activate'),
            handler: (rows) => {
              const userIds = rows.map(row => row.id);
              updateStatusMutation.mutate({ userIds, status: 1 });
            },
            disabled: selectedRows.length === 0,
          },
          {
            id: 'deactivate',
            label: translate('User Management.SUBMENU_DEACTIVATE', 'Deactivate'),
            handler: (rows) => {
              const userIds = rows.map(row => row.id);
              updateStatusMutation.mutate({ userIds, status: 0 });
            },
            disabled: selectedRows.length === 0,
          },
        ]
      },
      {
        id: 'mass-update',
        label: translate('User Management.MENU_EDIT', 'Edit'),
        icon: <i className="solar-pen-2-bold-duotone" size={18} />,
        handler: (rows) => {
          setSelectedRows(rows);
          setMassUpdateDrawerOpen(true);
        },
        disabled: selectedRows.length === 0,
      },
    ],
    // Delete action
    [
      {
        id: 'delete-selected',
        label: translate('User Management.MENU_DELETE', 'Delete'),
        icon: <i className="solar-trash-bin-2-bold-duotone" size={18} />,
        handler: (rows) => {
          handleBatchDelete(rows);
        },
        disabled: selectedRows.length === 0,
      },
    ],
  ];

  const handleEditUser = (user) => {
    setUserId(user.id);
    setUserDrawerOpen(true);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const actionItemsGroups = [
    [
      {
        id: 'manage-groups',
        label: translate('User Management.RIGHT_MENU_MANAGE_GROUPS', 'Groups'),
        icon: <i className="solar-users-group-two-rounded-bold" />,
        handler: handleGroupsClick,
      },
      {
        id: 'manage-power-users',
        label: translate('User Management.RIGHT_MENU_MANAGE_POWER_USERS', 'Power Users'),
        icon: <i className="solar-shield-user-line-duotone" />,
        handler: handlePowerUsersClick,
      },
      {
        id: 'manage-user-fields',
        label: translate('User Management.RIGHT_MENU_ADDITIONAL_FIELDS', 'Additional Fields'),
        icon: <i className="solar-hamburger-menu-line-duotone" />,
        handler: handleUserFieldsClick,
      },
      {
        id: 'advanced-settings',
        label: translate('User Management.RIGHT_MENU_ADVANCED_SETTINGS', 'Advanced Settings'),
        icon: <i className="solar-settings-minimalistic-bold" />,
        handler: () => router.push('/settings/advanced-settings'),
      },
    ],
  ];

  const actionItemsTeam = [
    [
      {
        id: 'manage-team-request',
        label: translate('User Management.MENU_MANAGE_TEAM_REQUEST', 'Manage team request'),
        icon: <i className="solar-user-plus-broken" />,
        handler: () => router.push('/manage/manage-team-requests'),
      },
      {
        id: 'manage-manager-types',
        label: translate('User Management.MENU_MANAGE_MANAGER_TYPES', 'Manage manager types'),
        icon: <i className="solar-user-id-bold" />,
        handler: () => router.push('/manage/manager-types'),
      }
    ],
  ];

  const actionItems = [
    [
      {
        id: 'add-user',
        label: translate('User Management.MENU_ADD_USER', 'Add User'),
        icon: <i className="lucide-user-plus" />,
        handler: handleCreateUserClick,
      },
      {
        id: 'add-haykal',
        label: translate('User Management.MENU_ADD_HAYKAL', 'Add Haykal'),
        icon: <i className="lucide-folder-plus" />,
        handler: handleAddHaykalClick,
      },
    ],
  ];

  const handleAction = (action) => {
    action.handler();
    handleClose();
  };

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
        {translate('User Management.TOGGLE_SHOW_USERS_IN_SUBBRANCHES', 'Show users in sub-branches:')}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={selectionStatus === 2}
            onChange={handleSelectionStatusChange}
            color="primary"
          />
        }
      />
    </Box>
  );

  // const { isLoading: isColumnsLoading, error: columnsError } = useUsersColumns(setColumns, setColumnVisibility, { actionColumn: actionColumn(handleDeleteUser, handleEditUser) })
  const {
    data: columnsData,
    isLoading: isColumnsLoading,
    error: columnsError
  } = useUsersColumns({
    actionColumn: actionColumn(handleDeleteUser, handleEditUser)
  });

  // Initialize column visibility when data loads
  useEffect(() => {
    if (columnsData?.initialVisibility) {
      setColumnVisibility(columnsData.initialVisibility);
    }
  }, [columnsData?.initialVisibility]);

  return (
    <>
      <DataView
        title={translate('User Management.PAGE_TITLE_USER_MANAGEMENT', 'User Management')}
        // columns={usersColumns(handleDeleteUser, handleEditUser)}
        columns={columnsData?.columns || []}
        isColumnsLoading={isColumnsLoading}
        columnsError={columnsError}
        pagination={{
          pageIndex: usersPagination.pageIndex,
          pageSize: usersPagination.pageSize,
          total: transformedUsersData.total
        }}
        setPagination={setUsersPagination}
        data={transformedUsersData.items}
        isLoading={isUsersLoading}
        error={usersError}
        getRowId={(row) => row.id}
        initialNavigationOpen={true} // Set the navigation to be open by default
        navigation={{
          data: navigationData,
          currentItem: currentHaykal,
          GoBack: handleNavigateBack,
          GoForward: handleNavigateForward,
          searchQuery: haykalSearchQuery,
          onSearchChange: (e) => setHaykalSearchQuery(e.target.value),
          searchType: searchType,
          onSearchTypeChange: handleSearchTypeChange,
          enableSearchType: true,
          isLoading: isHaykalLoading,
          pagination: {
            count: transformedHaykalData.total,
            page: haykalPagination.pageIndex,
            rowsPerPage: haykalPagination.pageSize,
            onPageChange: (newPage) => {
              setHaykalPagination(prev => ({ ...prev, pageIndex: newPage }));
            },
            onRowsPerPageChange: (newRowsPerPage) => {
              setHaykalPagination({ pageIndex: 0, pageSize: newRowsPerPage });
            }
          },
          parent: transformedHaykalData.parent,
          isLoading: isHaykalLoading,
          footerComponent: selectionStatusSwitch,
          actions: navigationActions,
        }}
        toolbar={{
          //breadcrumbs: CustomBreadcrumbs,
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
              tooltip: translate('User Management.ADD_OPTIONS', "Add options"),
            },
            {
              component: (
                <OptionMenu
                  menuProps={{
                    elevation: 2,
                    sx: { '& .MuiMenu-paper': { minWidth: 200 } }
                  }}
                  iconButtonProps={{ color: 'primary' }}
                  icon={<i className="solar-users-group-two-rounded-bold" />}
                  options={actionItemsTeam.flatMap((group, groupIndex) => [
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
              tooltip: translate('User Management.MANAGE_TEAM_AND_MANAGERS', "Manage team and managers"),
            },
            {
              component: (
                <OptionMenu
                  menuProps={{
                    elevation: 2,
                    sx: { '& .MuiMenu-paper': { minWidth: 200 } }
                  }}
                  iconButtonProps={{ color: 'primary' }}
                  icon={<i className="solar-menu-dots-broken" />}
                  options={actionItemsGroups.flatMap((group, groupIndex) => [
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
              tooltip: translate('User Management.RELATED_SECTIONS', "Related sections"),
            }
          ]
        }}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        slots={{
          filters,
          setFilters,
          globalFilter: usersSearchQuery,
          setGlobalFilter: setUsersSearchQuery,
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
            message: translate('User Management.NO_USERS_FOUND', "No users found"),
            description: translate('User Management.NO_USERS_DESCRIPTION', "Try adjusting your filters or add a new user."),
            height: 'calc(100vh - 400px)',
            icon: <i className="lucide-user-x" style={{ fontSize: '2rem' }} />
          }
        }}
        onDeleteSelected={handleDeleteSelected}
        actionGroups={actionGroups}
      //footerComponent={selectionStatusSwitch}
      />

      <AddUserToBranchDrawer
        open={addUserToBranchDrawerOpen}
        onClose={handleAddUserToBranchDrawerClose}
        selectedRows={selectedRows}
      />

      {/* Add Haykal Drawer */}
      <AddHaykalDrawer
        open={addHaykalDrawerOpen}
        onClose={handleAddHaykalDrawerClose}
        currentPrentid={currentHaykal?.id || 1}
      />

      {/* Add User Drawer */}
      <UserForm
        open={userDrawerOpen}
        onClose={() => {
          setUserDrawerOpen(false);
          setUserId(null); // Reset userId when closing the drawer
        }}
        userId={userId}
      />

      {/* {userId ? (
        <EditUserForm
          open={userDrawerOpen}
          onClose={() => {
            setUserDrawerOpen(false);
            setUserId(null);
          }}
          userId={userId}
        />
      ) : (
        <CreateUserForm
          open={userDrawerOpen}
          onClose={() => setUserDrawerOpen(false)}
        />
      )} */}

      {/* Add to multiple branches drawer */}
      <AddToMultipleBranchesDrawer
        open={addToMultipleBranchesDrawerOpen}
        onClose={handleAddToMultipleBranchesDrawerClose}
        selectedRows={selectedRows}
      />

      {/* Remove from multiple branches drawer */}
      <RemoveFromMultipleBranchesDrawer
        open={removeFromMultipleBranchesDrawerOpen}
        onClose={() => setRemoveFromMultipleBranchesDrawerOpen(false)}
        selectedRows={selectedRows}
        haykalId={currentHaykal?.id || 1}
      />

      {/* Batch delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={batchDeleteConfirmation.open}
        onClose={() => setBatchDeleteConfirmation({ open: false, userIds: [] })}
        data={{ ids: batchDeleteConfirmation.userIds }}
        title={translate('User Management.DIALOG_TITLE_DELETE_USERS', `DELETE ${batchDeleteConfirmation.userIds.length} USERS`)}
        onSubmit={() => batchDeleteUsers.mutateAsync(batchDeleteConfirmation.userIds)}
      />

      <MoveUsersToBranchDrawer
        open={moveUsersDrawerOpen}
        onClose={() => setMoveUsersDrawerOpen(false)}
        selectedRows={selectedRows}
      />

      <MassUpdateUserForm
        open={massUpdateDrawerOpen}
        onClose={() => setMassUpdateDrawerOpen(false)}
        selectedRows={selectedRows}
      />

      {/* Haykal-related Drawers and Dialogs */}
      <MoveHaykalDrawer
        open={moveHaykalDrawerOpen}
        onClose={() => setMoveHaykalDrawerOpen(false)}
        haykalId={currentHaykalItem?.id}
        currentTitle={currentHaykalItem?.title}
      />

      <EditHaykalDrawer
        open={editHaykalDrawerOpen}
        onClose={() => {
          setEditHaykalDrawerOpen(false);
          setSelectedHaykalId(null);
        }}
        haykalId={selectedHaykalId}
      />

      <AssignUserFieldsToBranchDrawer
        open={assignUserFieldsDrawerOpen}
        onClose={() => {
          setAssignUserFieldsDrawerOpen(false);
          setSelectedHaykalId(null);
        }}
        haykalId={selectedHaykalId}
      />

      <HaykalDeleteWarningDialog
        open={haykalDeleteWarningOpen}
        onClose={() => setHaykalDeleteWarningOpen(false)}
        haykalTitle={currentHaykalItem?.title}
      />

      <BranchDeleteConfirmationDialog
        open={haykalDeleteConfirmOpen}
        onClose={() => setHaykalDeleteConfirmOpen(false)}
        onConfirm={() => handleConfirmedDelete(currentHaykalItem?.id)}
        haykalTitle={currentHaykalItem?.title}
      />

      <UserBranchErrorDialog
        open={userBranchErrorOpen}
        onClose={() => setUserBranchErrorOpen(false)}
        haykalTitle={currentHaykalItem?.title}
      />
    </>
  );
};

export default HaykalPage;