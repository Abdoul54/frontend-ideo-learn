// MainDomain.tsx
import DataTable from "@/components/datatable/DataTable";
import DataTableFilter from "@/components/datatable/DataTableFilter";
import DataTableMultiSelectActionBar from "@/components/datatable/DataTableMultiSelectActionBar";
import DataTableToolBar from "@/components/datatable/DataTableToolBar";
import MobileDataTable from "@/components/datatable/MobileDataTable";
import { groupsUsersColumns } from "@/constants/Groups";
import { columns, profilePowerUsersColumns } from "@/constants/PowerUser";
import { useRemoveUsersFromGroup } from "@/hooks/api/tenant/useGroups";
import { useRemovePowerUser, useUnassignPowerUserProfiles } from "@/hooks/api/tenant/usePowerUsers";
import { useProfilePowerUsers } from "@/hooks/api/tenant/useProfiles";
import DeleteConfirmationDialog from "@/views/Dialogs/DeleteConfirmation";
import GrantProfilesDrawer from "@/views/Forms/PowerUsers/GrantProfilesDrawer";
import PowerUsersDrawer from "@/views/Forms/PowerUsers/PowerUsersDrawer";
import { Collapse, Grid, Paper, useMediaQuery } from "@mui/material";
import { useState } from "react";


const PowerUsers = ({ profileId }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});
    const { data, isLoading, error } = useProfilePowerUsers({
        id: profileId,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
        filters
    });


    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, pageIndex: newPage }));
    };


    const unassignPowerUser = useUnassignPowerUserProfiles();

    // Clear selection helper function
    const clearSelection = () => {
        setSelectedRows([]);
        setSelectAll(false);
    };

    const handleDeleteSubmit = (data) => {
        if (deleteConfirmation?.type === 'unassign-poweruser') {
            if (selectAll) {
                return unassignPowerUser.mutateAsync({ user_all: true, profile_ids: [profileId] });
            }
            return unassignPowerUser.mutateAsync({ user_ids: selectedRows?.map(row => row?.id), profile_ids: [profileId] });
        }
    };

    return (
        <>
            <Grid
                container
                elevation={0}
                sx={{
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    width: '100%',
                    backgroundColor: 'background.paper',
                    boxShadow: 0,
                }}
            >
                <Grid item xs={12}>
                    <DataTableToolBar
                        onSearch={setGlobalFilter}
                        query={globalFilter}
                        onFilterClick={() => setFiltersOpen(!filtersOpen)}
                        showFilter={filtersOpen}
                        columns={profilePowerUsersColumns(setDeleteConfirmation)}
                        hasFilters={filters?.length}
                        columnVisibility={columnVisibility}
                        onColumnVisibilityChange={setColumnVisibility}
                        features={{
                            search: true,
                            filter: false,
                            columnVisibility: true,
                            breadcrumbs: true,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            zIndex: 1000,
                            width: '100%',
                            backgroundColor: 'background.paper',
                            boxShadow: 3,
                            overflow: 'hidden'
                        }}
                    >
                        <Collapse in={filtersOpen} timeout="auto">
                            <DataTableFilter
                                columns={groupsUsersColumns(setDeleteConfirmation)}
                                filters={filters}
                                onFilter={(newFilters) => setFilters(newFilters)}
                            />
                        </Collapse>
                    </Paper>

                    <Grid container sx={{ width: '100%', margin: 0 }}>
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            sx={{
                                width: '100%',
                                overflowX: 'auto'
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    transition: 'border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    minWidth: '100%',
                                    overflowX: 'auto'
                                }}
                            >
                                {isMobile ? (
                                    <MobileDataTable
                                        columns={profilePowerUsersColumns(setDeleteConfirmation)}
                                        data={data?.items}
                                        isLoading={isLoading}
                                        error={error}
                                        selectedRows={selectedRows}
                                        onSelectedRowsChange={setSelectedRows}
                                    />
                                ) : (
                                    <DataTable
                                        height='calc(100vh - 324px)'
                                        emptyStateProps={{
                                            height: 'calc(100vh - 478px)'
                                        }}
                                        columns={profilePowerUsersColumns(setDeleteConfirmation)}
                                        data={data?.items}
                                        isLoading={isLoading}
                                        error={error}
                                        pageIndex={pagination.pageIndex}
                                        onPaginationChange={handlePageChange}
                                        pageSize={pagination.pageSize}
                                        sorting={sorting}
                                        onSortingChange={setSorting}
                                        selectedRows={selectedRows}
                                        onRowSelectionChange={(value) => {
                                            console.log('Selected Rows', value);
                                            setSelectedRows(value)
                                        }}
                                        totalRows={data?.pagination?.total}
                                        enableSelection
                                        selectAll={selectAll}
                                        onSelectAllChange={setSelectAll}
                                    />
                                )}
                                <DataTableMultiSelectActionBar
                                    selectAll={selectAll}
                                    onSelectAll={() => setSelectAll(true)}
                                    onUnselectAll={() => clearSelection()}
                                    total={data?.pagination?.total}
                                    deleteConfirmationProps={{
                                        variant: 'simple',
                                    }}
                                    selectedRows={selectedRows}
                                    onClearSelection={() => setSelectedRows([])}
                                    primaryActions={[
                                        {
                                            id: 'unassign-poweruser',
                                            label: 'Unassign Power Users',
                                            color: 'error',
                                            handler: () => setDeleteConfirmation({
                                                open: true,
                                                data: null,
                                                type: 'unassign-poweruser',
                                                variant: 'simple'
                                            }),
                                        }
                                    ]}
                                    actionGroups={[
                                    ]}
                                    actionButtonLabel="Actions"
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {
                deleteConfirmation.open && <DeleteConfirmationDialog
                    open={deleteConfirmation.open}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    data={deleteConfirmation?.data}
                    title={deleteConfirmation?.data?.username}
                    onSubmit={handleDeleteSubmit}
                    variant={deleteConfirmation?.variant}
                    set={clearSelection} // Pass the clearSelection function
                />}
        </>
    );
}


export default PowerUsers;