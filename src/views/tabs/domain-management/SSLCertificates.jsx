// MainDomain.tsx
import OptionMenu from "@/@core/components/option-menu";
import DataTable from "@/components/datatable/DataTable";
import DataTableFilter from "@/components/datatable/DataTableFilter";
import DataTableToolBar from "@/components/datatable/DataTableToolBar";
import MobileDataTable from "@/components/datatable/MobileDataTable";
import { Collapse, Grid, Paper, useMediaQuery } from "@mui/material";
import { useState } from "react";


const SSLCertificates = () => {

    const isMobile = useMediaQuery('(max-width: 768px)');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, pageIndex: newPage }));
    };

    const columns = [
        {
            header: 'NAME',
            accessorKey: 'name',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'CERTIFICATE AUTHORITY',
            accessorKey: 'certificate_authority',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'VALID FROM',
            accessorKey: 'valid_from',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'VALID TO',
            accessorKey: 'valid_to',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'STATUS',
            accessorKey: 'status',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'ASSIGNED DOMAINS',
            accessorKey: 'assigned_domains',
            flex: 1,
            enableSorting: true
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <OptionMenu
                    options={[
                        {
                            text: 'Edit',
                            icon: <i className='solar-pen-outline' />,
                            menuItemProps: {
                                disabled: true,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('edit', row);
                                },
                                className: 'flex items-center gap-2',

                            }
                        },
                        {
                            text: 'Assign domain',
                            icon: <i className='solar-checklist-line-duotone' />,
                            menuItemProps: {
                                className: 'flex items-center gap-2',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('assign domain', row);
                                }
                            }
                        },
                        {
                            text: 'Delete',
                            icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                            menuItemProps: {
                                className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('delete', row);
                                }
                            }
                        }
                    ]}
                />
            ),
            enableSorting: false,
            flex: .1
        }
    ];

    return (
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
                    columns={columns}
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
                            columns={columns}
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
                                    columns={columns}
                                    data={[]}
                                    selectedRows={selectedRows}
                                    onSelectedRowsChange={setSelectedRows}
                                />
                            ) : (
                                <DataTable
                                    height='calc(100vh - 312px)'
                                    columns={columns}
                                    data={[]}
                                    pageIndex={pagination.pageIndex}
                                    onPaginationChange={handlePageChange}
                                    pageSize={pagination.pageSize}
                                    sorting={sorting}
                                    onSortingChange={setSorting}
                                    selectedRows={selectedRows}
                                    onSelectedRowsChange={setSelectedRows}
                                    emptyStateProps={{
                                        height: 'calc(100vh - 452px)',
                                    }}
                                />
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}


export default SSLCertificates;