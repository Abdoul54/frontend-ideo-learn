'use client'

import { useCallback, useMemo } from 'react'

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    TablePagination,
    TableSortLabel,
    CircularProgress,
    Alert,
    AlertTitle,
    Checkbox,
    Skeleton
} from '@mui/material'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table'
import Error from '../illustrations/Error'
import NoData from '../illustrations/NoData'


const FlexTable = ({ children }) => <Table sx={{
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%'
}}>{children}</Table>

const FlexTableHead = ({ children }) => <TableHead sx={{
    display: 'flex',
    width: '100%',
    backgroundColor: 'var(--mui-palette-background-default)',
}}>{children}</TableHead>

const FlexTableBody = ({ children }) => <TableBody sx={{
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
        width: '0.4em',
        height: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
        background: 'var(--mui-palette-background-paper)'
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'var(--mui-palette-primary-main)',
        borderRadius: 2
    }
}}>{children}</TableBody>

const FlexTableRow = ({ children }) => <TableRow sx={{
    display: 'flex',
    width: '100%'
}}>{children}</TableRow>

const FlexTableCell = ({ children, flex }) => <TableCell sx={{
    display: 'flex',
    alignItems: 'center',
    flex: flex || 1,
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textWrap: 'wrap'
}}>{children}</TableCell>


const RootContainer = ({ height, variant, children }) => <Paper elevation={0} variant={variant} sx={{
    display: 'flex',
    flexDirection: 'column',
    height: height,
    width: '100%'
}}>{children}</Paper>


const PaginationContainer = ({ children }) => <Box sx={{
    flexShrink: 0
}}>{children}</Box>

export default function DataTable({
    data = [],
    totalRows = 0,
    isLoading = false,
    isError = false,
    error = null,
    columns = [],
    pageIndex = 0,
    pageSize = 10,
    onPaginationChange,
    rowsPerPageOptions,
    sorting = [],
    filterOpen = false,
    onSortingChange,
    onRowSelectionChange,
    variant,
    selectedRows = [],
    columnVisibility = {},
    setColumnVisibility,
    getRowId = row => row.id,
    height = '100vh',
    emptyStateProps = { height: 'calc(100vh - 400px)' },
    enableSelection = false, // Selection optional prop
    selectAll = false, // New prop to select all rows across all pages
    allData = [], // Optional prop to provide all data when selectAll is true
    onSelectAllChange, // Callback when selectAll checkbox state changes
    isColumnsLoading = false, // New prop for columns loading state
}) {
    const handleSortingChange = updaterOrValue => {
        // Ensure we're always passing an array to onSortingChange
        const newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(Array.isArray(sorting) ? sorting : [])
            : (Array.isArray(updaterOrValue) ? updaterOrValue : []);

        onSortingChange?.(newSorting);
    }
    // Function to check if all rows in current page are selected
    const areAllRowsSelected = useCallback(() => {
        if (!data.length) return false

        // If selectAll is true, then all rows are considered selected
        if (selectAll) return true

        return data.every(row => selectedRows.some(selectedRow => selectedRow.id === row.id))
    }, [data, selectedRows, selectAll])

    // Function to check if some rows in current page are selected
    const areSomeRowsSelected = useCallback(() => {
        if (!data.length) return false

        // If selectAll is true, then all rows are selected (not "some")
        if (selectAll) return false

        return data.some(row => selectedRows.some(selectedRow => selectedRow.id === row.id)) && !areAllRowsSelected()
    }, [data, selectedRows, areAllRowsSelected, selectAll])

    // Handle select all rows in current page
    const handleSelectAllClick = useCallback(
        event => {
            // If selectAll is true, we don't want to change anything from the header checkbox
            // since selection is managed by the SelectionActionBar
            if (selectAll) return;

            if (event.target.checked) {
                // Add all current page rows that aren't already selected
                const newSelected = [...selectedRows]

                data.forEach(row => {
                    if (!selectedRows.some(selectedRow => selectedRow.id === row.id)) {
                        newSelected.push(row)
                    }
                })
                onRowSelectionChange(newSelected)
            } else {
                // Remove all current page rows from selection
                const newSelected = selectedRows.filter(selectedRow => !data.some(row => row.id === selectedRow.id))

                onRowSelectionChange(newSelected)
            }
        },
        [data, selectedRows, onRowSelectionChange, selectAll]
    )

    const selectionColumn = useMemo(
        () => ({
            id: 'select',
            header: () => (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%'
                }} >
                    <Checkbox
                        checked={selectAll || areAllRowsSelected()}
                        indeterminate={!selectAll && areSomeRowsSelected()}
                        onChange={handleSelectAllClick}
                        title="Select all rows on this page"
                    />
                </Box>
            ),
            cell: ({ row }) => (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%'
                }}>
                    <Checkbox
                        checked={selectAll || selectedRows.some(selectedRow => selectedRow.id === row.original.id)}
                        onChange={e => {
                            e.stopPropagation()

                            // If selectAll is true and we're unchecking a box, turn off selectAll
                            if (selectAll) {
                                if (onSelectAllChange) {
                                    onSelectAllChange(false) // Turn off selectAll
                                }
                                // Add all data except this row to selectedRows
                                const newSelected = allData ?
                                    allData.filter(dataRow => dataRow.id !== row.original.id) :
                                    data.filter(dataRow => dataRow.id !== row.original.id);
                                onRowSelectionChange(newSelected);
                                return;
                            }

                            // Normal individual row selection logic
                            const isSelected = selectedRows.some(selectedRow => selectedRow.id === row.original.id)
                            if (isSelected) {
                                onRowSelectionChange(selectedRows.filter(selectedRow => selectedRow.id !== row.original.id))
                            } else {
                                onRowSelectionChange([...selectedRows, row.original])
                            }
                        }}
                        onClick={e => e.stopPropagation()}
                    />
                </Box>
            ),
            flex: 0.1
        }),
        [
            selectedRows,
            onRowSelectionChange,
            areAllRowsSelected,
            areSomeRowsSelected,
            handleSelectAllClick,
            selectAll,
            allData,
            onSelectAllChange,
            data
        ]
    )

    // Only include selection column if enableSelection is true
    const allColumns = useMemo(() =>
        enableSelection ? [selectionColumn, ...columns] : columns,
        [enableSelection, selectionColumn, columns]
    )

    const table = useReactTable({
        data,
        columns: allColumns,
        state: {
            sorting: Array.isArray(sorting) ? sorting : [],
            pagination: {
                pageIndex,
                pageSize,
            },
            columnVisibility,
        },
        enableSorting: true,
        enableMultiSort: true,
        onSortingChange: handleSortingChange,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: Math.ceil(totalRows / pageSize),
        getRowId: getRowId,
    });

    // Render loading skeleton for columns
    const renderColumnLoadingSkeleton = () => {
        // Create an array with 5 placeholder columns (adjust as needed)
        const placeholderColumns = Array(8).fill(0);

        return (
            <>
                <FlexTableRow>
                    {placeholderColumns.map((_, index) => (
                        <FlexTableCell key={index} flex={1}>
                            <Skeleton variant="text" width="100%" height={24} />
                        </FlexTableCell>
                    ))}
                </FlexTableRow>
            </>
        );
    };


    const renderBody = () => {
        if (isColumnsLoading || isLoading && !data.length) {
            return (
                <FlexTableRow>
                    <FlexTableCell flex={1}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4,
                            width: '100%',
                            minHeight: emptyStateProps?.height
                        }}>
                            <CircularProgress size={60} />
                        </Box>
                    </FlexTableCell>
                </FlexTableRow>
            )
        } else if (isError) {
            return (
                <FlexTableRow>
                    <FlexTableCell flex={1}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4,
                            width: '100%',
                            minHeight: emptyStateProps?.height
                        }}>
                            <Error
                                width='150px'
                                height='150px'
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {error?.message || "An error occurred while fetching data"}
                            </Typography>
                        </Box>
                    </FlexTableCell>
                </FlexTableRow>
            )
        } else if (data.length === 0) {
            return (
                <FlexTableRow>
                    <FlexTableCell colSpan={allColumns.length}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 4,
                                width: '100%',
                                minHeight: emptyStateProps?.height,
                            }}
                        >
                            <NoData
                                width='150px'
                                height='150px'
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {emptyStateProps.message || "No data available"}
                            </Typography>
                            {emptyStateProps.description && (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    {emptyStateProps.description}
                                </Typography>
                            )}
                        </Box>
                    </FlexTableCell>
                </FlexTableRow>
            );
        } else {
            return table.getRowModel().rows.map(row => (
                <FlexTableRow
                    key={row.id}
                    hover
                    onClick={() => {
                        if (!enableSelection) return; // Skip selection logic if not enabled

                        // If selectAll is true and we're unchecking a row, turn off selectAll
                        if (selectAll) {
                            if (onSelectAllChange) {
                                onSelectAllChange(false) // Turn off selectAll
                            }
                            // Add all data except this row to selectedRows
                            const newSelected = allData ?
                                allData.filter(dataRow => dataRow.id !== row.original.id) :
                                data.filter(dataRow => dataRow.id !== row.original.id);
                            onRowSelectionChange(newSelected);
                            return;
                        }

                        // Normal individual row selection logic
                        const isSelected = selectedRows.some(selectedRow => selectedRow.id === row.original.id)
                        if (isSelected) {
                            onRowSelectionChange(selectedRows.filter(selectedRow => selectedRow.id !== row.original.id))
                        } else {
                            onRowSelectionChange([...selectedRows, row.original])
                        }
                    }}
                    sx={{
                        cursor: enableSelection ? 'pointer' : 'default', // Only show pointer cursor if selection is enabled
                        bgcolor: enableSelection && (selectAll || selectedRows.some(selectedRow => selectedRow.id === row.original.id))
                            ? 'action.selected'
                            : 'inherit',
                        '&:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }}
                >
                    {row.getVisibleCells().map(cell => (
                        <FlexTableCell key={cell.id} flex={cell.column.columnDef.flex}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </FlexTableCell>
                    ))}
                </FlexTableRow>
            ))
        }
    }

    return (
        <RootContainer height={height} variant={variant}>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    position: 'relative'
                }}
            >
                <FlexTable>
                    <FlexTableHead>
                        {isColumnsLoading ? (
                            renderColumnLoadingSkeleton()
                        ) : (
                            table.getHeaderGroups().map(headerGroup => (
                                <FlexTableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => {
                                        const canSort = header.column.getCanSort()
                                        const columnDef = header.column.columnDef

                                        return (
                                            <FlexTableCell
                                                key={header.id}
                                                sortDirection={header.column.getIsSorted()}
                                                flex={columnDef.flex}
                                                sx={{
                                                    backgroundColor: 'background.paper',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 2,
                                                    '& .MuiTableSortLabel-icon': {
                                                        opacity: header.column.getIsSorted() ? 1 : 0.4
                                                    }
                                                }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            cursor: canSort ? 'pointer' : 'default',
                                                            width: '100%'
                                                        }}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {header.column.id === 'select' ? (
                                                            flexRender(header.column.columnDef.header, header.getContext())
                                                        ) : canSort ? (
                                                            <TableSortLabel
                                                                active={!!header.column.getIsSorted()}
                                                                direction={header.column.getIsSorted() || 'asc'}
                                                                hideSortIcon={!!header.column.getCanSort()}
                                                            >
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                            </TableSortLabel>
                                                        ) : (
                                                            flexRender(header.column.columnDef.header, header.getContext())
                                                        )}
                                                    </Box>
                                                )}
                                            </FlexTableCell>
                                        )
                                    })}
                                </FlexTableRow>
                            ))
                        )}
                    </FlexTableHead>
                    <FlexTableBody>{renderBody()}</FlexTableBody>
                </FlexTable>
            </TableContainer>
            <PaginationContainer>
                <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions || [5, 15, 25]}
                    component={Paper}
                    elevation={0}
                    count={totalRows}
                    rowsPerPage={pageSize}
                    page={pageIndex}
                    sx={{
                        borderRadius: 0,
                    }}
                    onPageChange={(_, newPage) => {
                        onPaginationChange?.({ pageIndex: newPage, pageSize })
                    }}
                    onRowsPerPageChange={e => {
                        const newPageSize = Number(e.target.value)

                        onPaginationChange?.({ pageIndex: 0, pageSize: newPageSize })
                    }}
                />
            </PaginationContainer>
        </RootContainer>
    )
}