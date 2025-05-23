'use client';

import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    List,
    ListItem,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import DataView from "@/views/DataView";
import { useEffect, useState } from "react";
import { useGroups } from "@/hooks/api/tenant/useGroups";

const GroupsSelectionDrawer = ({ open, onClose, data, setGroups }) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [search, setSearch] = useState('');
    const [customVisibility, setCustomVisibility] = useState({});
    const [sorting, setSorting] = useState([]);

    const { data: groups, isLoading, error } = useGroups({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: search,
        sort: sorting
    });


    useEffect(() => {
        if (data) {
            setSelectedGroups(data);
        }
    }, [data]);

    const onSubmit = () => {
        setGroups(selectedGroups);
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
                                        accessorKey: 'name',
                                        header: 'Name',
                                        flex: 1
                                    },
                                    {
                                        accessorKey: 'description',
                                        header: 'Description',
                                        flex: 1
                                    }
                                ]}
                                data={groups?.items}
                                isLoading={isLoading}
                                error={error}
                                enableSelection
                                height="calc(100vh - 250px)"
                                pagination={{
                                    ...pagination,
                                    total: groups?.pagination?.total
                                }}
                                setPagination={setPagination}
                                selectedRows={selectedGroups}
                                setSelectedRows={setSelectedGroups}
                                disableMultiSelect
                                slots={{
                                    globalFilter: search,
                                    setGlobalFilter: setSearch,
                                    columnVisibility: customVisibility,
                                    setColumnVisibility: setCustomVisibility,
                                    sorting: sorting,
                                    setSorting: setSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
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

export default GroupsSelectionDrawer;