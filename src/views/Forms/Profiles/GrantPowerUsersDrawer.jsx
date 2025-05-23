'use client';

import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import { useAssignPorfilePowerUsers } from "@/hooks/api/tenant/useProfiles";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { usePowerUsers } from "@/hooks/api/tenant/usePowerUsers";
import DataView from "@/views/DataView";


const schema = yup.object({
    user_ids: yup.array().min(1, 'Please select at least one power user'),
    profile_ids: yup.array(),
})

const GrantPowerUsersDrawer = ({ open, onClose, data, translate }) => {

    const assignProfile = useAssignPorfilePowerUsers()
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [columnVisibility, setColumnVisibility] = useState({});

    const { data: powerUsers, isLoading, error } = usePowerUsers({
        id: data?.id,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search,
        sort: sorting
    })



    const columns = [
        {
            header: translate('Power User & Profile Management.TABLE_HEADER_USERNAME'),
            accessorKey: 'username',
            flex: 1,
            enableSorting: true
        },
        {
            header: translate('Power User & Profile Management.TABLE_HEADER_EMAIL'),
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

    const { watch, handleSubmit, setValue, formState: { errors } } = methods;

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
            title={translate('Power User & Profile Management.DRAWER_TITLE_GRANT_PROFILE')}
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
                        <Grid item size={12} component={ListItem}>
                            <ListItemText primary={translate('Power User & Profile Management.FIELD_GRANT_USERS')} secondary={errors?.user_ids?.message}
                                slotProps={{
                                    secondary: {
                                        color: 'error'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <DataView
                                columns={columns}
                                data={powerUsers?.items || []}
                                isLoading={isLoading}
                                error={error}
                                height="calc(100vh - 335px)"
                                enableSelection
                                pagination={{ ...pagination, total: powerUsers?.pagination?.total }}
                                setPagination={setPagination}
                                selectedRows={powerUsers?.items.filter(item => selectedPowerUsers?.includes(item.id))}
                                setSelectedRows={(value => {
                                    setValue('user_ids', value?.map(item => item.id))
                                })}
                                disableMultiSelect
                                slots={{
                                    globalFilter: search,
                                    setGlobalFilter: setSearch,
                                    columnVisibility: columnVisibility,
                                    setColumnVisibility: setColumnVisibility,
                                    sorting: sorting,
                                    setSorting: setSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        height: 'calc(100vh - 495px)',
                                        message: isLoading
                                            ? 'Loading Power Users...'
                                            : search
                                                ? 'No power users found matching your search'
                                                : 'No power users found'
                                    }
                                }}
                                noToolBar
                                noMobileDataTable
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={assignProfile?.isPending}>{translate('common.cancel')}</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={assignProfile?.isPending}>
                        {assignProfile?.isPending ? translate('common.saving') : translate('common.save')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default GrantPowerUsersDrawer;