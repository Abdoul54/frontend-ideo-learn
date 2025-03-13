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
import { useAssignPorfilePowerUsers } from "@/hooks/api/tenant/useProfiles";
import DataTable from "@/components/datatable/DataTable";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { usePowerUsers } from "@/hooks/api/tenant/usePowerUsers";


const schema = yup.object({
    user_ids: yup.array().min(1, 'Please select at least one power user'),
    profile_ids: yup.array(),
})

const GrantPowerUsersDrawer = ({ open, onClose, data }) => {

    const assignProfile = useAssignPorfilePowerUsers()
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    const { data: powerUsers, isLoading, error } = usePowerUsers({
        id: data?.id,
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
            header: 'Email',
            accessorKey: 'email',
            flex: 1,
            enableSorting: true
        }
    ]

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            user_ids: [],
            profile_ids: [],
        }
    });

    useEffect(() => {
        if (data) {
            methods.reset({
                user_ids: [],
                profile_ids: [data?.id],
            })
        }
    }, [data])

    const { control, watch, handleSubmit, setValue, formState: { errors } } = methods;

    const selectedPowerUsers = watch('user_ids');

    const onSubmit = (formData) => {
        console.log('formData', formData);
        if (data?.id)
            assignProfile.mutateAsync(formData)
                .then(() => {
                    onClose();
                    methods.reset();
                })
    };

    return (
        <DrawerFormContainer
            title="Grant Power Users"
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
                            <ListItemText primary='Grant the selected power users a profile.' secondary={errors?.user_ids?.message} secondaryTypographyProps={{
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
                                columns={columns}
                                isLoading={isLoading}
                                error={error}
                                totalRows={powerUsers?.pagination?.total}
                                pageIndex={pagination.pageIndex}
                                pageSize={pagination.pageSize}
                                data={powerUsers?.items || []}
                                onPaginationChange={(pagination) => setPagination(pagination)}
                                onSortingChange={(sorting) => setSorting(sorting)}
                                sorting={sorting}
                                selectedRows={powerUsers?.items.filter(item => selectedPowerUsers?.includes(item.id))}
                                onRowSelectionChange={(value) => {
                                    setValue('user_ids', value?.map(item => item.id))
                                }}
                                height="calc(100vh - 335px)"
                                variant='outlined'
                                emptyStateProps={{
                                    height: 'calc(100vh - 495px)',
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
                    <Button onClick={onClose} disabled={assignProfile?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={assignProfile?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default GrantPowerUsersDrawer;