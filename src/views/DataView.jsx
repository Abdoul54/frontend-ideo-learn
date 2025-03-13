'use client'

import DataTable from "@/components/datatable/DataTable";
import DataTableFilter from "@/components/datatable/DataTableFilter";
import DataTableMultiSelectActionBar from "@/components/datatable/DataTableMultiSelectActionBar";
import DataTableNavigation from "@/components/datatable/DataTableNavigation";
import DataTableToolbar from "@/components/datatable/DataTableToolBar";
import MobileDataTable from "@/components/datatable/MobileDataTable";
import MobileDataTableNavigation from "@/components/datatable/MobileDataTableNavigation";
import Error from "@/components/illustrations/Error";
import SelectionActionBar from "@/components/SelectionActionBar";
import ToolBar from "@/components/ToolBar";
import { Box, Collapse, Grid, Paper, Typography, useMediaQuery } from "@mui/material";
import { useState } from "react";


/**
 * A component for displaying and managing tabular data with advanced features.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the data view
 * @param {string|number} props.height - The height of the data table
 * @param {Array} props.columns - Column definitions for the data table
 * @param {boolean} props.isColumnsLoading - Loading state for columns
 * @param {Object|null} props.columnsError - Error object for columns
 * @param {Object} props.pagination - Pagination configuration object
 * @param {number} props.pagination.pageSize - Number of rows per page
 * @param {number} props.pagination.pageIndex - Current page index
 * @param {number} props.pagination.total - Total number of rows
 * @param {Array} [props.pagination.rowsPerPageOptions] - Options for rows per page selector
 * @param {Function} props.setPagination - Function to update pagination state
 * @param {Array} props.data - Data array to be displayed in the table
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {Object|null} props.error - Error object if data fetching failed
 * @param {Object} [props.navigation] - Navigation panel configuration
 * @param {number} [props.navigation.height] - Height of the navigation panel
 * @param {Array} [props.navigation.data] - Navigation items data
 * @param {Function} [props.navigation.setCurrentItem] - Function to set the current selected item
 * @param {Object} [props.navigation.currentItem] - Currently selected navigation item
 * @param {Function} [props.navigation.GoBack] - Function to navigate to the previous item
 * @param {Function} [props.navigation.GoForward] - Function to navigate to the next item
 * @param {number} [props.navigation.total_count] - Total count of navigation items
 * @param {boolean} [props.navigation.isLoading] - Loading state for navigation
 * @param {Function} [props.navigation.setSearch] - Function to set search query
 * @param {string} [props.navigation.search] - Current search query
 * @param {Object} [props.navigation.pagination] - Pagination for navigation panel
 * @param {boolean} [props.initialNavigationOpen=false] - Whether navigation panel should be open initially
 * @param {Object} [props.toolbar] - Toolbar configuration
 * @param {Array} [props.toolbar.breadcrumbs] - Breadcrumbs for the toolbar
 * @param {Array} [props.toolbar.buttonGroup] - Button group for the toolbar
 * @param {Object} [props.multiselectionActionBar] - Configuration for multi-selection action bar
 * @param {Array} [props.multiselectionActionBar.selectedRows] - Selected rows for multi-selection
 * @param {boolean} [props.multiselectionActionBar.selectAll] - Whether all items are selected
 * @param {Function} [props.multiselectionActionBar.onSelectAll] - Handler for select all action
 * @param {Function} [props.multiselectionActionBar.onUnselectAll] - Handler for unselect all action
 * @param {number} [props.multiselectionActionBar.total] - Total number of selectable items
 * @param {Object} [props.multiselectionActionBar.deleteConfirmationProps] - Props for delete confirmation
 * @param {Array} [props.multiselectionActionBar.primaryActions] - Primary action buttons
 * @param {Array} [props.multiselectionActionBar.actionGroups] - Grouped action buttons
 * @param {string} [props.multiselectionActionBar.actionButtonLabel] - Label for action button
 * @param {Object} [props.multiselectionActionBar.style] - Custom styles for the action bar
 * @param {Object} [props.multiselectionActionBar.paperProps] - Props for Paper component
 * @param {Array} props.selectedRows - Currently selected rows
 * @param {Function} props.setSelectedRows - Function to update selected rows
 * @param {Object} [props.slots] - Additional component slots and functions
 * @param {Function} [props.slots.setGlobalFilter] - Function to set global filter
 * @param {string} [props.slots.globalFilter] - Current global filter value
 * @param {Array} [props.slots.filters] - Custom filter configurations
 * @param {Function} [props.slots.setFilters] - Function to update filters
 * @param {Object} [props.slots.columnVisibility] - Column visibility state
 * @param {Function} [props.slots.setColumnVisibility] - Function to update column visibility
 * @param {Array} [props.slots.sorting] - Sorting configuration
 * @param {Function} [props.slots.setSorting] - Function to update sorting
 * @param {Object} [props.slots.features] - Additional features configuration
 * @param {Object} [props.slots.emptyState] - Empty state configuration
 * @param {Function} [props.onDeleteSelected] - Function to handle deletion of selected rows
 * @param {Array} [props.actionGroups=[]] - Groups of actions for the selection action bar
 * @param {boolean} [props.enableSelection=true] - Whether row selection is enabled
 * @param {boolean} [props.datatablemulti=false] - Whether to use multi-selection action bar
 * 
 * @returns {JSX.Element} The DataView component
 */

const DataView = ({
    title,
    height,
    columns,
    pagination,
    setPagination,
    data,
    isLoading,
    error,
    navigation,
    toolbar,
    multiselectionActionBar,
    selectedRows,
    setSelectedRows,
    selectAll,
    onSelectAllChange,
    slots,
    onDeleteSelected,
    actionGroups = [],
    enableSelection = true,
    datatablemulti = false,
    footerComponent,
    isColumnsLoading = false, // New prop for columns loading state
    columnsError = null,
    initialNavigationOpen = false // New prop to control initial navigation state
}) => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [navigationOpen, setNavigationOpen] = useState(initialNavigationOpen);

    const handleApplyFilters = (newFilters) => {
        slots?.setFilters(newFilters);
        setFiltersOpen(false);
    };

    const handleClearSelection = () => {
        setSelectedRows([]);
    };

    // Handler for deletion (you can customize this)
    const handleDelete = () => {
        if (typeof onDeleteSelected === 'function') {
            onDeleteSelected(selectedRows);
        }
        // Clear selection after deletion
        handleClearSelection();
    };

    return (
        <Grid container sx={{
            maxWidth: '100vw',
            overflowX: 'hidden',
        }} spacing={4}>
            <Grid item xs={12}>
                <ToolBar
                    breadcrumbs={toolbar?.breadcrumbs}
                    buttonGroup={toolbar?.buttonGroup}
                />
            </Grid>
            <Grid item xs={12}>
                <Grid
                    container
                    component={Paper}
                    elevation={0}
                    sx={{
                        width: '100%',
                        margin: 0,
                        overflowX: 'hidden',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                    }}
                >
                    <Grid item xs={12}>
                        <DataTableToolbar
                            onSearch={slots?.setGlobalFilter}
                            query={slots?.globalFilter}
                            onFilterClick={() => setFiltersOpen(!filtersOpen)}
                            showFilter={filtersOpen}
                            showNavigation={() => setNavigationOpen(!navigationOpen)}
                            columns={columns}
                            hasFilters={slots?.filters}
                            columnVisibility={slots?.columnVisibility}
                            onColumnVisibilityChange={slots?.setColumnVisibility}
                            navigationOpen={navigationOpen}
                            features={slots?.features}
                            isColumnsLoading={isColumnsLoading} // Pass isColumnsLoading prop here
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
                        {!isMobile && <Paper
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
                                    filters={slots?.filters}
                                    columns={columns}
                                    onFilter={handleApplyFilters}
                                />
                            </Collapse>
                        </Paper>}

                        <Grid container sx={{ width: '100%', margin: 0 }}>
                            {!isMobile && navigationOpen && (
                                <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={3}
                                    lg={2}
                                    xl={2}
                                    sx={{
                                        display: {
                                            xs: 'block',
                                            sm: 'block',
                                            md: 'block',
                                        },
                                        overflow: 'hidden',
                                        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        opacity: 1
                                    }}
                                >

                                    <DataTableNavigation
                                        height={navigation?.height || 'calc(100vh - 244px)'}
                                        data={navigation?.data || []}
                                        setCurrentItem={navigation?.setCurrentItem}
                                        currentItem={navigation?.currentItem}
                                        GoBack={navigation?.GoBack}
                                        count={navigation?.total_count}
                                        GoForward={navigation?.GoForward}
                                        isLoading={navigation?.isLoading}
                                        onSearchChange={navigation?.onSearchChange}
                                        searchQuery={navigation?.searchQuery}
                                        searchType={navigation?.searchType}
                                        onSearchTypeChange={navigation?.onSearchTypeChange}
                                        enableSearchType={navigation?.enableSearchType || false}
                                        pagination={navigation?.pagination}
                                        footerComponent={navigation?.footerComponent}
                                    />
                                </Grid>
                            )}

                            <Grid
                                item
                                xs={12}
                                sm={navigationOpen ? 12 : 12}
                                md={navigationOpen ? 9 : 12}
                                lg={navigationOpen ? 10 : 12}
                                xl={navigationOpen ? 10 : 12}
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
                                        borderTopLeftRadius: navigationOpen && !isMobile ? 0 : "10px",
                                        borderBottomLeftRadius: navigationOpen && !isMobile ? 0 : "10px",
                                        borderTopRightRadius: '10px',
                                        borderBottomRightRadius: "10px",
                                        transition: 'border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        minWidth: '100%',
                                        overflowX: 'auto'
                                    }}
                                >
                                    {isMobile ? (
                                        <>
                                            <Collapse in={filtersOpen} timeout="auto">
                                                <DataTableFilter
                                                    filters={slots?.filters}
                                                    columns={columns}
                                                    onFilter={handleApplyFilters}
                                                />
                                            </Collapse>
                                            <MobileDataTableNavigation
                                                open={navigationOpen}
                                                onClose={() => setNavigationOpen(false)}
                                                currentItem={navigation?.currentItem}
                                                GoBack={navigation?.GoBack}
                                                GoForward={navigation?.GoForward}
                                                searchQuery={navigation?.searchQuery}
                                                onSearchChange={navigation?.onSearchChange}
                                                searchType={navigation?.searchType}
                                                onSearchTypeChange={navigation?.onSearchTypeChange}
                                                enableSearchType={navigation?.enableSearchType || false}
                                                isLoading={navigation?.isLoading}
                                                data={navigation?.data || []}
                                                pagination={navigation?.pagination}
                                            />
                                            <MobileDataTable
                                                data={data || []}
                                                columns={columns}
                                                isLoading={isLoading}
                                                isError={error}
                                                error={error}
                                                selectedRows={selectedRows}
                                                onRowSelectionChange={setSelectedRows}
                                                pageSize={pagination.pageSize}
                                                pageIndex={pagination.pageIndex}
                                                onPaginationChange={setPagination}
                                                totalRows={pagination.total ?? 0}
                                                filterOpen={filtersOpen}
                                                onSearch={slots?.setGlobalFilter}
                                                query={slots?.globalFilter}
                                                hasFilters={slots?.filters}
                                                sorting={slots?.sorting}
                                                onSortingChange={slots?.setSorting}
                                                navigationOpen={navigationOpen}
                                                onFilterClick={() => setFiltersOpen(!filtersOpen)}
                                                showNavigation={() => setNavigationOpen(!navigationOpen)}
                                                emptyStateProps={slots?.emptyState}
                                                features={slots?.features}
                                                enableRowSelection={enableSelection}
                                                isColumnsLoading={isColumnsLoading} // Pass isColumnsLoading prop here
                                            />
                                        </>
                                    ) : (
                                        (!isColumnsLoading && columns?.length <= 0) || columnsError ?
                                            <Paper elevation={0} sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: height || 'calc(100vh - 246px)',
                                                width: '100%'
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 4,
                                                    width: '100%',
                                                    minHeight: slots?.emptyState?.height
                                                }}>
                                                    <Error
                                                        width='300px'
                                                        height='300px'
                                                    />
                                                    <Typography variant="h4" color="text.secondary" gutterBottom>
                                                        {columnsError?.message || "No columns found"}
                                                    </Typography>
                                                    {columnsError?.description && <Typography variant='caption' color="text.secondary" gutterBottom>
                                                        {columnsError?.description}
                                                    </Typography>}
                                                </Box>
                                            </Paper>
                                            :
                                            <>
                                                <DataTable
                                                    columns={columns}
                                                    data={data || []}
                                                    totalRows={pagination.total ?? 0}
                                                    isLoading={isLoading}
                                                    isError={error}
                                                    error={error}
                                                    height={height || 'calc(100vh - 246px)'}
                                                    pageIndex={pagination.pageIndex}
                                                    pageSize={pagination.pageSize}
                                                    onPaginationChange={setPagination}
                                                    sorting={slots?.sorting}
                                                    onSortingChange={slots?.setSorting}
                                                    rowsPerPageOptions={pagination.rowsPerPageOptions}
                                                    selectedRows={selectedRows}
                                                    onRowSelectionChange={setSelectedRows}
                                                    filterOpen={filtersOpen}
                                                    columnVisibility={slots?.columnVisibility}
                                                    setColumnVisibility={slots?.setColumnVisibility}
                                                    emptyStateProps={slots?.emptyState}
                                                    enableSelection={enableSelection}
                                                    onSelectAllChange={onSelectAllChange}
                                                    selectAll={selectAll}
                                                    isColumnsLoading={isColumnsLoading} // Pass isColumnsLoading prop here
                                                    columnsError={columnsError}
                                                />
                                                {footerComponent}
                                            </>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {!datatablemulti && enableSelection && <SelectionActionBar
                selectedRows={selectedRows}
                onClearSelection={handleClearSelection}
                onDelete={handleDelete}
                actionItems={actionGroups || [
                    // Default first group
                    [
                        {
                            id: 'add-to-branch',
                            label: 'Add to branch',
                            icon: <i className='solar-user-bold' size={18} />,
                            handler: (rows) => console.log('Add to branch', rows)
                        },
                        {
                            id: 'remove-from-branch',
                            label: 'Remove from branch',
                            icon: <i className='solar-user-bold' size={18} />,
                            handler: (rows) => console.log('Remove from branch', rows)
                        },
                    ],
                    // Second group (separated by divider)
                    [
                        {
                            id: 'export',
                            label: 'Export',
                            icon: <i className='solar-user-bold' size={18} />,
                            handler: (rows) => console.log('Export', rows)
                        }
                    ]
                ]}
            />
            }
            {multiselectionActionBar?.selectedRows && datatablemulti && enableSelection && <DataTableMultiSelectActionBar
                selectedRows={multiselectionActionBar?.selectedRows || []}
                selectAll={selectAll}
                onSelectAll={multiselectionActionBar?.onSelectAll}
                onUnselectAll={multiselectionActionBar?.onUnselectAll}
                total={multiselectionActionBar?.total}
                onClearSelection={multiselectionActionBar?.onClearSelection}
                deleteConfirmationProps={multiselectionActionBar?.deleteConfirmationProps}
                primaryActions={multiselectionActionBar?.primaryActions}
                actionGroups={multiselectionActionBar?.actionGroups}
                actionButtonLabel={multiselectionActionBar?.actionButtonLabel}
                style={multiselectionActionBar?.style}
                paperProps={multiselectionActionBar?.paperProps}
            />
            }

        </Grid>
    );
};

export default DataView;