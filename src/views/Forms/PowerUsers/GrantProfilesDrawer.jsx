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
import { useProfiles } from "@/hooks/api/tenant/useProfiles";
import DataTable from "@/components/datatable/DataTable";
import * as yup from 'yup';
import { useAssignPowerUserPorfiles } from "@/hooks/api/tenant/usePowerUsers";
import { yupResolver } from "@hookform/resolvers/yup";


const schema = yup.object({
    user_ids: yup.array(),
    profile_ids: yup.array().min(1, 'Please select at least one profile'),
})

const GrantProfilesDrawer = ({ open, onClose, data }) => {

    const assignPowerUser = useAssignPowerUserPorfiles()
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    const { data: profiles, isLoading, error } = useProfiles({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search,
        sort: sorting
    })

    const columns = [
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
        }
    ]

    console.log('profiles', profiles);

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
                user_ids: [data?.id],
                profile_ids: data?.profiles?.map(item => item.id),
            })
        }
    }, [data])

    const { watch, handleSubmit, setValue, formState: { errors } } = methods;

    const selectedProfiles = watch('profile_ids');

    const onSubmit = (formData) => {
        console.log('formData', formData);

        if (data?.id)
            assignPowerUser.mutateAsync(formData)
                .then(() => {
                    onClose();
                    methods.reset();
                })
    };

    return (
        <DrawerFormContainer
            title="Grant Profiles"
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
                            <ListItemText primary='Grant the power user profiles.' secondary={errors?.user_ids?.message} secondaryTypographyProps={{
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
                                totalRows={profiles?.pagination?.total}
                                pageIndex={pagination.pageIndex}
                                pageSize={pagination.pageSize}
                                data={profiles?.items || []}
                                onPaginationChange={(pagination) => setPagination(pagination)}
                                onSortingChange={(sorting) => setSorting(sorting)}
                                sorting={sorting}
                                selectedRows={profiles?.items.filter(item => selectedProfiles?.includes(item.id))}
                                onRowSelectionChange={(value) => {
                                    setValue('profile_ids', value?.map(item => item.id))
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
                    <Button onClick={onClose} disabled={assignPowerUser?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={assignPowerUser?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default GrantProfilesDrawer;