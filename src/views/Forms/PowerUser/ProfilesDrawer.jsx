'use client';

import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    List,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import DataView from "@/views/DataView";
import { useProfiles } from "@/hooks/api/tenant/useProfiles";

const ProfilesDrawer = ({ open, onClose, data, setProfiles }) => {
    // states 
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});
    const [selectedProfiles, setSelectedProfiles] = useState([]);

    console.log('selectedProfiles', selectedProfiles);
    console.log('data', data);


    // hooks
    const { data: profiles, isLoading: profilesLoading, error: profilesError } = useProfiles({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });


    useEffect(() => {
        if (data?.length > 0) {
            setSelectedProfiles(data);
        }
    }, [data]);


    const onSubmit = () => {
        setProfiles(selectedProfiles);
        onClose();
    }

    return (
        <DrawerFormContainer
            title="Select profiles"
            description="Select one or more profiles to assign to the selected Power User"
            open={open}
            onClose={onClose}
        >
            <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: '0.4em'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item size={12}>
                            <DataView
                                title="Courses"
                                columns={[
                                    {
                                        header: 'Name',
                                        accessorKey: 'name',
                                        flex: 1,
                                        enableSorting: true
                                    },
                                    {
                                        header: 'Description',
                                        accessorKey: 'description',
                                        flex: 1,
                                        enableSorting: true
                                    },
                                    {
                                        header: 'Assigned Power Users',
                                        accessorKey: 'assigned_power_users',
                                        flex: 1,
                                        enableSorting: true,
                                        type: 'number'
                                    },
                                ]}
                                data={profiles?.items}
                                isLoading={profilesLoading}
                                error={profilesError}
                                enableSelection
                                height="calc(100vh - 352px)"
                                pagination={{ ...pagination, total: profiles?.pagination?.total }}
                                setPagination={setPagination}
                                selectedRows={selectedProfiles}
                                setSelectedRows={setSelectedProfiles}
                                slots={{
                                    globalFilter,
                                    setGlobalFilter,
                                    columnVisibility,
                                    setColumnVisibility,
                                    sorting,
                                    setSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        height: 'calc(100vh - 506px)'
                                    }
                                }}
                                noToolBar
                                disableMultiSelect
                            />
                        </Grid>
                    </Grid>
                </CardContent >
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} >Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={selectedProfiles.length === 0} onClick={onSubmit}>Grant Profiles</Button>
                </CardActions>
            </Card >
        </DrawerFormContainer >
    );
};

export default ProfilesDrawer;