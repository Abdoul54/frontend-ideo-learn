// Fixed DataTableDrawer.jsx
'use client';

import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    FormControl,
    FormControlLabel,
    Grid2 as Grid,
    IconButton,
    List,
    ListItem,
    Radio,
    RadioGroup,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import DataView from "@/views/DataView";
import { useEffect, useMemo, useState } from "react";
import useHistoryNavigation from "@/hooks/useHistoryNavigation";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useCourses } from "@/hooks/api/tenant/learn/course/useCourse";

const DataTableDrawer = ({ open, onClose, data, onsubmit, type }) => {
    const { settings } = useSettings();
    const {
        history,
        goForward,
        goBack,
        currentItem,
        goToBreadcrumb,
        setCurrentItem
    } = useHistoryNavigation(
        { id: 1, title: settings?.header?.page_title, code: settings?.header?.page_title },
        null
    );

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [selectedRow, setSelectedRow] = useState(null);
    const [search, setSearch] = useState('');
    const [customVisibility, setCustomVisibility] = useState({});
    const [sorting, setSorting] = useState([]);

    const { data: results, isLoading, error } = type === 'branches' ? useHaykal({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: search,
        sort: sorting,
        haykal_id: currentItem?.id,
    }) : useCourses({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: search,
        sort: sorting,
    });

    const clickableBreadcrumbs = useMemo(
        () =>
            history?.map(item => ({
                ...item,
                onClick: () => goToBreadcrumb(item),
                isActive: item.id === currentItem.id,
            })),
        [history, currentItem, goToBreadcrumb]
    );

    const getColumns = (type) => {
        switch (type) {
            case 'branches':
                return [
                    {
                        accessorKey: "id",
                        header: "",
                        cell: ({ row }) => <FormControlLabel
                            value={row?.original.id.toString()} // Convert to string for Radio component
                            control={<Radio />}
                        />,
                        flex: .3
                    },
                    {
                        accessorKey: 'title',
                        header: 'Title',
                        flex: 1
                    },
                    {
                        accessorKey: "action",
                        header: "",
                        cell: ({ row }) =>
                            row.original?.has_children && (
                                <IconButton
                                    onClick={() => {
                                        const next = {
                                            id: row.original.id,
                                            title: row.original.title
                                        };
                                        goForward(next);
                                    }}
                                    size="small"
                                >
                                    <i className="ri-arrow-right-s-line" />
                                </IconButton>
                            ),
                        flex: .075
                    }
                ];

            case 'courses':
                return [
                    {
                        accessorKey: "id",
                        header: "",
                        cell: ({ row }) => <FormControlLabel
                            value={row?.original.id.toString()} // Convert to string for Radio component
                            control={<Radio />}
                        />,
                        flex: .3
                    },
                    {
                        accessorKey: "name",
                        header: "Name",
                        flex: 1
                    },
                    {
                        accessorKey: "course_type",
                        header: "Type",
                        cell: ({ row }) => {
                            const type = row?.original?.course_type;
                            return (
                                <Chip
                                    variant='outlined'
                                    size='small'
                                    color='primary'
                                    label={type?.toUpperCase()}
                                />
                            );
                        },
                        flex: 1
                    },
                    {
                        accessorKey: "status",
                        header: "Status",
                        cell: ({ row }) => {
                            const status = row?.original?.status;
                            return (
                                <Chip
                                    variant='outlined'
                                    size='small'
                                    color={status === '"unpublished"' ? 'error' : 'success'}
                                    label={status?.toUpperCase()}
                                />
                            );
                        },
                        flex: 1
                    }
                ]

            default:
                return [];
        }
    };

    // Reset the selected row when the drawer opens with new data
    useEffect(() => {
        if (open) {
            setSelectedRow(data || null);
        }
    }, [open, data]);

    // Set root item if available
    // useEffect(() => {
    //     if (results?.extra_data && results?.data?.extra_data?.id === 1) {
    //         setCurrentItem({ id: 1, title: results?.data?.extra_data?.title, code: results?.data?.extra_data?.code });
    //     }
    // }, [results, setCurrentItem]);

    const onSubmit = () => {
        // Make sure to pass the complete selected row data to the parent component
        onsubmit(selectedRow);
        onClose();
    };

    return (
        <DrawerFormContainer
            title={type === 'branches' ? "Select a Branch" : "Select a Course"}
            open={open}
            onClose={onClose}
        >
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 0
                }}
            >
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': { width: '0.4em' },
                        '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}
                >
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item size={12} component={ListItem}>
                            <FormControl fullWidth>
                                <RadioGroup
                                    value={selectedRow?.id?.toString()} // Convert to string for Radio component
                                    onChange={(e) => {
                                        const selectedId = parseInt(e.target.value, 10); // Parse back to integer
                                        let selected;

                                        if (type === 'branches') {
                                            selected = results?.data?.items?.find(item => item.id === selectedId);
                                        } else {
                                            selected = results?.items?.find(item => item.id === selectedId);
                                        }

                                        if (selected) {
                                            setSelectedRow(selected);
                                        }
                                    }}
                                >
                                    <DataView
                                        columns={getColumns(type)}
                                        data={type === 'branches' ? results?.data?.items : results?.items}
                                        isLoading={isLoading}
                                        error={error}
                                        enableSelection={false}
                                        height="calc(100vh - 250px)"
                                        pagination={{
                                            ...pagination,
                                            total: type === 'branches' ?
                                                results?.data?.pagination?.total :
                                                results?.pagination?.total
                                        }}
                                        setPagination={setPagination}
                                        disableMultiSelect
                                        slots={{
                                            globalFilter: search,
                                            setGlobalFilter: setSearch,
                                            columnVisibility: customVisibility,
                                            setColumnVisibility: setCustomVisibility,
                                            sorting: sorting,
                                            setSorting: setSorting,
                                            goBack: type === 'branches' && goBack,
                                            breadcrumbs: type === 'branches' && clickableBreadcrumbs,
                                            features: {
                                                search: true,
                                                filter: false,
                                                columnVisibility: true,
                                                breadcrumbs: type === 'branches',
                                                goBack: type === 'branches',
                                            },
                                            emptyState: {
                                                height: 'calc(100vh - 410px)'
                                            }
                                        }}
                                        noToolBar
                                        noMobileDataTable
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!selectedRow?.id}
                    >
                        Save
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default DataTableDrawer;