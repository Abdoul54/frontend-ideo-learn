'use client'
import { useState } from "react";
import DataView from "@/views/DataView";
import { columns } from "@/constants/UserFields";
import UserFieldDrawer from "@/views/Forms/UserField/UserFieldDrawer";
import { useDeleteUserField, useUserFields } from "@/hooks/api/tenant/useUserFields";
import DeleteConfirmationDialog from "@/views/Dialogs/DeleteConfirmation";
import AssignUserFieldsToHaykalDrawer from "@/views/Drawers/AssignUserFieldsToHaykaDrawer";

export default function Page() {
  const [filters, setFilters] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [drawerState, setDrawerState] = useState({
    open: false,
    data: null
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    data: null
  });

  const deleteUserField = useDeleteUserField();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [assignUserFieldsToHaykalDrawerOpen, setAssignUserFieldsToHaykalDrawerOpen] = useState(false);
  const [userFieldIds, setUserFieldIds] = useState([]);
  const { data, isLoading, error } = useUserFields({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
    sort: sorting,
    filters
  });

  const handleAssignUserFieldsToHaykalDrawerClose = () => {
    setAssignUserFieldsToHaykalDrawerOpen(false);
    setUserFieldIds([]);
  };

  const handleAssignUserFieldsToHaykalClick = (ids) => {
    if (ids.length === 0) {
      toast.error("Please select at least one user field");
      return;
    }
    setUserFieldIds(ids); // Set the userFieldIds
    setAssignUserFieldsToHaykalDrawerOpen(true); // Open the drawer
  };


  const handleDeleteSubmit = (data) => {
    return deleteUserField.mutateAsync({ id: data?.id });
  };

  // Handle delete action for selected rows
  const handleDeleteSelected = (rows) => {
    console.log('Deleting rows:', rows);
    // Implement your API call here
    // After successful deletion:
    setSelectedRows([]);
  };

  // const actionGroups = [
  //   [
  //     {
  //       id: 'assign-userfields-to-haykal',
  //       label: 'Assign userFields to haykal',
  //       icon: <i className="solar-text-field-bold-duotone" />,
  //       handler: (rows) => {
  //         const ids = rows.map(row => row.id); // Extract IDs from selected rows
  //         handleAssignUserFieldsToHaykalClick(ids);
  //       }
  //     }
  //   ]
  // ];


  return (
    <>
      <DataView
        title="User Fields"
        columns={columns(setDrawerState, setDeleteConfirmation, (ids) => handleAssignUserFieldsToHaykalClick(ids))}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        pagination={{ ...pagination, total: data?.pagination?.total }}
        setPagination={setPagination}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        toolbar={{
          breadcrumbs: [{ label: 'User Fields', link: '/manage/user-fields' }],
          buttonGroup: [{
            text: 'New Field',
            variant: 'contained',
            tooltip: 'New Field',
            icon: 'solar-add-circle-linear',
            onClick: () => setDrawerState({ open: true, data: null })
          }]
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
        // actionGroups={actionGroups}
        onDeleteSelected={handleDeleteSelected}
      />
      <UserFieldDrawer
        open={drawerState.open}
        onClose={() => setDrawerState({ open: false, data: null })}
        data={drawerState.data}
      />
      <DeleteConfirmationDialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, data: null })}
        data={deleteConfirmation.data}
        onSubmit={handleDeleteSubmit}
      />
      {/* <AssignUserFieldsToHaykalDrawer
        open={assignUserFieldsToHaykalDrawerOpen}
        onClose={handleAssignUserFieldsToHaykalDrawerClose}
        userFieldIds={userFieldIds}
      /> */}
    </>
  );
}