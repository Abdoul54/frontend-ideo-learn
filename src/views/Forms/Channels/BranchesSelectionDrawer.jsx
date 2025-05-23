'use client';

import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    IconButton,
    List,
    ListItem,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import DataView from "@/views/DataView";
import { useEffect, useMemo, useState } from "react";
import useHistoryNavigation from "@/hooks/useHistoryNavigation";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";

const BranchesSelectionDrawer = ({ open, onClose, data, setBranches }) => {

    const {
        history,
        goForward,
        goBack,
        currentItem,
        goToBreadcrumb,
        setCurrentItem
    } = useHistoryNavigation(
        { id: 1, title: "", code: "", },
        null
    );

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [search, setSearch] = useState('');
    const [customVisibility, setCustomVisibility] = useState({});
    const [sorting, setSorting] = useState([]);

    const { data: branches, isLoading, error } = useHaykal({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: search,
        sort: sorting,
        haykal_id: currentItem?.id,
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

    useEffect(() => {
        if (data) {
            setSelectedBranches(data);
        }
        if (branches?.extra_data && branches?.extra_data?.id === 1) {
            setCurrentItem({ id: 1, title: branches?.extra_data?.title, code: branches?.extra_data?.code });
        }
    }, [data, branches]);

    const onSubmit = () => {
        setBranches(selectedBranches.map((branch) => ({
            id: branch.id,
            name: branch.title,
        })));
        onClose();
    };

    return (
        <DrawerFormContainer
            title="Create Channel"
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
                            <DataView
                                columns={[
                                    {
                                        accessorKey: 'title',
                                        header: 'Title',
                                        flex: 1
                                    },
                                    {
                                        accessorKey: "action",
                                        header: "",
                                        cell: ({ row }) =>
                                            row.original.has_child && (
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
                                ]}
                                data={branches?.data?.items}
                                isLoading={isLoading}
                                error={error}
                                enableSelection
                                height="calc(100vh - 250px)"
                                pagination={{
                                    ...pagination,
                                    total: branches?.data?.pagination?.total
                                }}
                                setPagination={setPagination}
                                selectedRows={selectedBranches}
                                setSelectedRows={setSelectedBranches}
                                disableMultiSelect
                                slots={{
                                    globalFilter: search,
                                    setGlobalFilter: setSearch,
                                    columnVisibility: customVisibility,
                                    setColumnVisibility: setCustomVisibility,
                                    sorting: sorting,
                                    setSorting: setSorting,
                                    goBack,
                                    breadcrumbs: clickableBreadcrumbs,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true,
                                        breadcrumbs: true,
                                        goBack: true,
                                    },
                                    emptyState: {
                                        height: 'calc(100vh - 410px)'
                                    }
                                }}
                                noToolBar
                                noMobileDataTable
                            />
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
                    >
                        Save
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default BranchesSelectionDrawer;