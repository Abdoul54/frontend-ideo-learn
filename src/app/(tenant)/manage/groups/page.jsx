'use client'
import { useState } from "react";
import DataView from "@/views/DataView";
import { columns } from "@/constants/Groups";
import DeleteConfirmationDialog from "@/views/Dialogs/DeleteConfirmation";
import { useDeleteGroup, useGroups } from "@/hooks/api/tenant/useGroups";
import GroupsDrawer from "@/views/Forms/Groups/GroupsDrawer";
import { useRouter } from "next/navigation";

export default function Page() {
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

  const deleteGroup = useDeleteGroup();
  const router = useRouter();
  const [columnVisibility, setColumnVisibility] = useState({});

  const { data, isLoading, error } = useGroups({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
    sort: sorting
  });


  const handleDeleteSubmit = (data) => {
    return deleteGroup.mutateAsync({ id: data?.id });
  };

  return (
    <>
      <DataView
        title="Groups"
        columns={columns(setDrawerState, setDeleteConfirmation, router)}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        pagination={{ ...pagination, total: data?.pagination?.total, rowsPerPageOptions: [5, 15, 25] }}
        setPagination={setPagination}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        toolbar={{
          breadcrumbs: [{ label: 'Groups', link: '/manage/groups' }],
          buttonGroup: [{
            text: 'New Field',
            variant: 'contained',
            tooltip: 'New Field',
            icon: 'solar-add-circle-linear',
            onClick: () => setDrawerState({ open: true, data: null })
          }]
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
            columnVisibility: true
          }
        }}
        enableSelection={false}
      />
      <GroupsDrawer
        open={drawerState.open}
        onClose={() => setDrawerState({ open: false, data: null })}
        data={drawerState.data}
      />
      <DeleteConfirmationDialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, data: null })}
        data={deleteConfirmation.data}
        title={deleteConfirmation?.data?.name}
        onSubmit={handleDeleteSubmit}
      />
    </>
  );
}