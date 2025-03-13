import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  IconButton,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Checkbox,
  Typography,
  Collapse,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  TextField,
  Pagination,
  TablePagination,
  Skeleton
} from "@mui/material";
import OptionMenu from "@/@core/components/option-menu";
import Error from "../illustrations/Error";
import NoData from "../illustrations/NoData";

const LoadingState = () => (
  <Box className="flex justify-center items-center h-full p-8">
    <CircularProgress />
  </Box>
);

const MobileDataTable = ({
  data = [],
  columns,
  isLoading,
  isError,
  error,
  selectedRows = [],
  onRowSelectionChange,
  onPaginationChange,
  onSortingChange,
  sorting = [],
  pageSize,
  pageIndex,
  totalRows,
  filterOpen,
  onSearch,
  query,
  hasFilters,
  onFilterClick,
  showNavigation,
  navigationOpen,
  emptyStateProps,
  features,
  enableRowSelection = true, // Control row selection
  // New props added from DataTable
  isColumnsLoading = false,
  selectAll = false,
  allData = [],
  onSelectAllChange,
  getRowId = row => row.id,
  height = '100vh',
  rowsPerPageOptions = [5, 15, 25],
  columnVisibility = {},
  setColumnVisibility,
  variant,
}) => {
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  // Find the actions column
  const actionsColumn = columns.find((col) => col.id === "actions");

  const handleRowClick = (row) => {
    setSelectedItem(row);
    setDetailDrawer(true);
  };

  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortingChange = updaterOrValue => {
    // Ensure we're always passing an array to onSortingChange
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue(Array.isArray(sorting) ? sorting : [])
      : (Array.isArray(updaterOrValue) ? updaterOrValue : []);

    onSortingChange?.(newSorting);
  };

  const handleSort = (column) => {
    if (!column.enableSorting) return;

    const currentSort = sorting.find((s) => s.id === column.accessorKey);
    let newSort = [];

    if (!currentSort) {
      // Add new sort
      newSort = [...sorting, { id: column.accessorKey, desc: false }];
    } else if (!currentSort.desc) {
      // Change to descending
      newSort = sorting.map((s) =>
        s.id === column.accessorKey ? { ...s, desc: true } : s
      );
    } else {
      // Remove sort
      newSort = sorting.filter((s) => s.id !== column.accessorKey);
    }

    handleSortingChange(newSort);
  };

  const getSortIcon = (column) => {
    const sort = sorting.find((s) => s.id === column.accessorKey);
    if (!sort) return null;
    return sort.desc ? (
      <i className="solar-sort-from-top-to-bottom-bold-duotone" />
    ) : (
      <i className="solar-sort-from-bottom-to-top-bold-duotone" />
    );
  };

  // Function to check if all rows in current page are selected - from DataTable
  const areAllRowsSelected = useCallback(() => {
    if (!data.length) return false;

    // If selectAll is true, then all rows are considered selected
    if (selectAll) return true;

    return data.every(row => selectedRows.some(selectedRow => selectedRow.id === row.id));
  }, [data, selectedRows, selectAll]);

  // Function to check if some rows in current page are selected - from DataTable
  const areSomeRowsSelected = useCallback(() => {
    if (!data.length) return false;

    // If selectAll is true, then all rows are selected (not "some")
    if (selectAll) return false;

    return data.some(row => selectedRows.some(selectedRow => selectedRow.id === row.id)) && !areAllRowsSelected();
  }, [data, selectedRows, areAllRowsSelected, selectAll]);

  // Handle select all rows in current page - from DataTable
  const handleSelectAllClick = useCallback(
    event => {
      // If selectAll is true, we don't want to change anything from the header checkbox
      // since selection is managed by the SelectionActionBar
      if (selectAll) return;

      if (event.target.checked) {
        // Add all current page rows that aren't already selected
        const newSelected = [...selectedRows];

        data.forEach(row => {
          if (!selectedRows.some(selectedRow => selectedRow.id === row.id)) {
            newSelected.push(row);
          }
        });
        onRowSelectionChange(newSelected);
      } else {
        // Remove all current page rows from selection
        const newSelected = selectedRows.filter(selectedRow => !data.some(row => row.id === selectedRow.id));

        onRowSelectionChange(newSelected);
      }
    },
    [data, selectedRows, onRowSelectionChange, selectAll]
  );

  // Render loading skeleton for columns - from DataTable
  const renderColumnLoadingSkeleton = () => {
    // Create an array with placeholder columns
    const placeholderColumns = Array(3).fill(0);

    return (
      <div className="p-4 space-y-2">
        {placeholderColumns.map((_, index) => (
          <Skeleton key={index} variant="text" width="100%" height={24} />
        ))}
      </div>
    );
  };

  const renderMobileHeader = (features) => (
    <Box className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between p-4">
        {features?.navigation && (
          <IconButton
            onClick={() => showNavigation()}
            className="hover:bg-gray-100"
          >
            <i className={`solar-folder-2-bold-duotone w-6 h-6 ${navigationOpen ? "text-primary" : ""}`} />
          </IconButton>
        )}

        <div className="flex items-center gap-2">
          {features?.search && (
            <IconButton
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:bg-gray-100"
            >
              <Badge
                badgeContent={query?.length > 0 ? 1 : 0}
                variant="dot"
                color="primary"
              >
                <i className={`solar-magnifer-bold-duotone w-6 h-6 ${searchOpen ? "text-primary" : ""}`} />
              </Badge>
            </IconButton>
          )}
          {features?.filter && (
            <IconButton
              onClick={onFilterClick}
              className={`hover:bg-gray-100 ${filterOpen ? "text-primary" : ""}`}
            >
              <Badge
                badgeContent={hasFilters} color="primary" variant="dot"
              >
                <i className="solar-filter-bold-duotone w-6 h-6" />
              </Badge>
            </IconButton>
          )}
          <IconButton
            onClick={handleSortMenuOpen}
            className="hover:bg-gray-100"
          >
            <Badge
              badgeContent={sorting.length}
              color="primary"
              variant="standard"
            >
              <i className="solar-sort-bold-duotone w-6 h-6" />
            </Badge>
          </IconButton>
          {enableRowSelection && (
            <IconButton
              onClick={(e) => handleSelectAllClick({ target: { checked: !areAllRowsSelected() } })}
              className="hover:bg-gray-100"
            >
              <Badge
                badgeContent={selectedRows.length}
                color="primary"
                variant="standard"
              >
                <i className={`solar-checklist-minimalistic-bold-duotone w-6 h-6 ${selectAll || areAllRowsSelected() ? "text-primary" : ""}`} />
              </Badge>
            </IconButton>
          )}
        </div>
      </div>
      {
        features?.search &&
        <Collapse in={searchOpen}>
          <div className="p-2">
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search..."
              value={query || ""}
              onChange={(e) => onSearch(e.target.value)}
              InputProps={{
                endAdornment: query && (
                  <IconButton
                    onClick={() => onSearch("")}
                    className="hover:bg-gray-100"
                  >
                    <i className="solar-close-circle-bold-duotone" />
                  </IconButton>
                ),
              }}
            />
          </div>
        </Collapse>
      }

      {features?.columnVisibility && (
        <Menu
          anchorEl={sortMenuAnchor}
          open={Boolean(sortMenuAnchor)}
          onClose={handleSortMenuClose}
          PaperProps={{
            elevation: 0,
            className: "shadow-lg",
          }}
        >
          {columns
            .filter(
              (col) =>
                col.id !== "actions" &&
                col.id !== "select" &&
                col.enableSorting !== false
            )
            .map((column) => (
              <MenuItem
                key={column.accessorKey}
                onClick={() => {
                  handleSort(column);
                  if (sorting.length > 2) handleSortMenuClose();
                }}
                className="min-w-[200px]"
              >
                <ListItemIcon>
                  {getSortIcon(column) || <div className="w-6" />}
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {column.header}
                </Typography>
                {sorting.findIndex((s) => s.id === column.accessorKey) > -1 && (
                  <Typography className="ml-auto text-gray-400" variant="caption">
                    {sorting.findIndex((s) => s.id === column.accessorKey) + 1}
                  </Typography>
                )}
              </MenuItem>
            ))}
          {sorting.length > 0 && (
            <>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleSortingChange([]);
                  handleSortMenuClose();
                }}
                className="text-error"
              >
                <ListItemIcon>
                  <i className="solar-close-circle-bold-duotone text-error" />
                </ListItemIcon>
                Clear All
              </MenuItem>
            </>
          )}
        </Menu>
      )}
    </Box>
  );

  const renderMobileRow = (row, index) => {
    const isSelected = enableRowSelection && (
      selectAll ||
      selectedRows.some(selectedRow => selectedRow.id === row.id)
    );

    // Get display columns (excluding actions and select columns)
    const displayColumns = columns.filter(
      (col) => col.id !== "actions" && col.id !== "select"
    );

    // Get primary and secondary display values
    const primaryColumn = displayColumns[0];
    const secondaryColumns = displayColumns.slice(1, 3);

    return (
      <ListItem
        key={index}
        className={`hover:bg-gray-50 ${isSelected ? "bg-primary-50" : ""}`}
      >
        <div className="flex items-center w-full">
          {enableRowSelection && (
            <Checkbox
              checked={isSelected}
              onClick={(e) => {
                e.stopPropagation();

                // If selectAll is true and we're unchecking a box, turn off selectAll
                if (selectAll) {
                  if (onSelectAllChange) {
                    onSelectAllChange(false); // Turn off selectAll
                  }
                  // Add all data except this row to selectedRows
                  const newSelected = allData ?
                    allData.filter(dataRow => dataRow.id !== row.id) :
                    data.filter(dataRow => dataRow.id !== row.id);
                  onRowSelectionChange(newSelected);
                  return;
                }

                // Normal individual row selection logic
                if (isSelected) {
                  onRowSelectionChange(
                    selectedRows.filter(
                      (selectedRow) => selectedRow.id !== row.id
                    )
                  );
                } else {
                  onRowSelectionChange([...selectedRows, row]);
                }
              }}
              className="mr-3"
            />
          )}

          <div
            className="cursor-pointer flex-1"
            onClick={() => handleRowClick(row)}
          >
            <Typography variant="subtitle1" className="font-medium">
              {row[primaryColumn?.accessorKey]}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {secondaryColumns
                .map((col) => row[col?.accessorKey])
                .filter(Boolean)
                .join(" • ")}
            </Typography>
          </div>

          {actionsColumn && (
            <div onClick={(e) => e.stopPropagation()}>
              {actionsColumn.cell({ row: { original: row } })}
            </div>
          )}
        </div>
      </ListItem>
    );
  };

  const renderDetailDrawer = () => (
    <SwipeableDrawer
      anchor="right"
      open={detailDrawer}
      onClose={() => setDetailDrawer(false)}
      onOpen={() => { }}
      PaperProps={{
        className: "w-full max-w-md",
      }}
    >
      <Box className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Typography variant="h6">Details</Typography>
          <IconButton onClick={() => setDetailDrawer(false)}>
            <i className="solar-close-circle-bold-duotone" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedItem &&
            columns
              .filter((col) => col.id !== "actions" && col.id !== "select")
              .map((column, index) => (
                <div key={index} className="mb-4">
                  <Typography variant="caption" className="text-gray-500">
                    {column.header}
                  </Typography>
                  <Typography>{selectedItem[column.accessorKey]}</Typography>
                  <Divider className="mt-2" />
                </div>
              ))}
        </div>

        {selectedItem && actionsColumn && (
          <div className="border-t p-4">
            <OptionMenu
              options={
                actionsColumn.cell({ row: { original: selectedItem } }).props
                  .options
              }
              fullWidth
              variant="contained"
            />
          </div>
        )}
      </Box>
    </SwipeableDrawer>
  );

  return (
    <Paper
      elevation={0}
      variant={variant}
      className="h-full flex flex-col"
      sx={{ height }}
    >
      {renderMobileHeader(features)}

      {sorting.length > 0 && (
        <Box className="px-4 py-2 border-b bg-gray-50">
          <Typography variant="caption" className="text-gray-600">
            Sorted by:{" "}
            {sorting.map((sort, index) => {
              const column = columns.find((col) => col.accessorKey === sort.id);
              return `${column?.header} (${sort.desc ? "desc" : "asc"})${index < sorting.length - 1 ? ", " : ""}`;
            })}
          </Typography>
        </Box>
      )}

      {isColumnsLoading ? (
        renderColumnLoadingSkeleton()
      ) : (!data || data?.length === 0) ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            width: '100%',
            minHeight: emptyStateProps?.height || 'calc(100vh - 324px)',
          }}
        >
          {isLoading && <LoadingState />}
          {isError && (
            <>
              <Error
                width='150px'
                height='150px'
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {error?.message || "An error occurred while fetching data"}
              </Typography>
            </>
          )}
          {!isLoading && !isError && (
            <>
              <NoData
                width='150px'
                height='150px'
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {emptyStateProps?.message || "No data available"}
              </Typography>
              {emptyStateProps?.description && (
                <Typography variant="body2" color="text.secondary" align="center">
                  {emptyStateProps.description}
                </Typography>
              )}
            </>
          )}
        </Box>
      ) : (
        <List className="flex-1 overflow-y-auto">
          {data?.map(renderMobileRow)}
        </List>
      )}

      {renderDetailDrawer()}

      {data.length > 0 && (
        <Box
          sx={{
            padding: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <TablePagination
            component={Paper}
            elevation={0}
            count={totalRows}
            rowsPerPage={pageSize}
            page={pageIndex}
            onPageChange={(_, newPage) => {
              onPaginationChange?.({ pageIndex: newPage, pageSize });
            }}
            onRowsPerPageChange={e => {
              const newPageSize = Number(e.target.value);
              onPaginationChange?.({ pageIndex: 0, pageSize: newPageSize });
            }}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage={""}
            sx={{
              width: 1,
              '& .MuiTablePagination-selectLabel': {
                display: 'none',
              },
              '& .MuiTablePagination-spacer': {
                display: 'none',
              },
              '& .MuiTablePagination-actions': {
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                alignItems: 'center',
              },
              '& .MuiTablePagination-toolbar': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default MobileDataTable;