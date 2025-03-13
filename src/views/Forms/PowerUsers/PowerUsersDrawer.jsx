'use client';

import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    TextField,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePostPowerUser, useUpdatePowerUser } from "@/hooks/api/tenant/usePowerUsers";
import DataTable from "@/components/datatable/DataTable";
import { useUsers } from "@/hooks/api/tenant/useUsers";
import * as yup from 'yup';


const schema = yup.object().shape({
    user_ids: yup.array().min(1, 'Please select at least one user'),
});

const PowerUsersDrawer = ({ open, onClose, data }) => {

    const addPowerUser = usePostPowerUser()
    const updatePowerUser = useUpdatePowerUser()
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const { data: users, isLoading, error } = useUsers({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search,
        sort: sorting
    })

    const columns = [
        {
            header: 'Username',
            accessorKey: 'username',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'Full Name',
            accessorKey: 'fullname',
            flex: 1,
            enableSorting: true
        },
        {
            header: 'Email',
            accessorKey: 'email',
            flex: 1,
            enableSorting: true
        }
    ]

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            user_ids: []
        }
    });

    useEffect(() => {
        if (data) {
            methods.reset({
                name: data?.name,
                description: data?.description,
            })
        }
    }, [data])

    const { handleSubmit, formState: { errors }, watch, setValue } = methods;

    const selectedUsers = watch('user_ids');

    const onSubmit = (formData) => {
        if (data)
            updatePowerUser.mutateAsync({ id: data?.id, data: formData })
                .then(() => {
                    onClose();
                    methods.reset();
                })
        else
            addPowerUser.mutateAsync(formData)
                .then(() => {
                    onClose();
                    methods.reset();
                })
    };

    return (
        <DrawerFormContainer
            title="Profiles"
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
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
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText primary='Select users to be promoted to power users' secondary={errors?.user_ids?.message} secondaryTypographyProps={{
                                color: 'error',
                            }} />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextField
                                name="search"
                                placeholder="Search .."
                                fullWidth
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><i className="solar-magnifer-outline" /></InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <DataTable
                                variant='outlined'
                                columns={columns}
                                isLoading={isLoading}
                                error={error}
                                totalRows={users?.pagination?.total}
                                pageIndex={pagination?.pageIndex}
                                pageSize={pagination?.pageSize}
                                data={users?.items || []}
                                onPaginationChange={(pagination) => setPagination(pagination)}
                                onSortingChange={(sorting) => setSorting(sorting)}
                                sorting={sorting}
                                selectedRows={users?.items.filter(item => selectedUsers?.includes(item.id))}
                                onRowSelectionChange={(value) => setValue('user_ids', value?.map(item => item.id))}
                                height="calc(100vh - 275px)"
                                emptyStateProps={{
                                    height: 'calc(100vh - 439px)',
                                    message: isLoading
                                        ? 'Loading Power Users...'
                                        : search
                                            ? 'No power users found matching your search'
                                            : 'No power users found'
                                }}
                                enableSelection
                            />

                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={addPowerUser?.isPending || updatePowerUser?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={addPowerUser?.isPending || updatePowerUser?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default PowerUsersDrawer;
