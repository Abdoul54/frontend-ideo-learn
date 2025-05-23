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
import { useProfiles } from "@/hooks/api/tenant/useProfiles";
import * as yup from 'yup';
import { useAssignPowerUserPorfiles } from "@/hooks/api/tenant/usePowerUsers";
import { yupResolver } from "@hookform/resolvers/yup";
import DataView from "@/views/DataView";


const schema = yup.object({
    user_ids: yup.array(),
    profile_ids: yup.array().min(1, 'Please select at least one profile'),
})

const GrantProfilesDrawer = ({ open, onClose, data, translate }) => {

    const assignPowerUser = useAssignPowerUserPorfiles()
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [columnVisibility, setColumnVisibility] = useState({});

    const { data: profiles, isLoading, error } = useProfiles({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search,
        sort: sorting
    })

    const columns = [
        {
            header: translate('Power User & Profile Management.FIELD_NAME'),
            accessorKey: 'name',
            flex: 1,
            enableSorting: true
        },
        {
            header: translate('Power User & Profile Management.FIELD_DESCRIPTION'),
            accessorKey: 'description',
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
                user_ids: [data?.id],
                profile_ids: data?.profiles?.map(item => item.id),
            })
        }
    }, [data])

    const { watch, handleSubmit, setValue, formState: { errors } } = methods;

    const selectedProfiles = watch('profile_ids');

    const onSubmit = (formData) => {
        if (data?.id)
            assignPowerUser.mutateAsync(formData)
                .then(() => {
                    onClose();
                    methods.reset();
                })
    };

    return (
        <DrawerFormContainer
            title={translate('Power User & Profile Management.GRANT_PROFILES')}
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
                            <ListItemText
                                primary={translate('Power User & Profile Management.FIELD_GRANT_PROFILES')}
                                secondary={errors?.user_ids?.message}
                                slotProps={{
                                    secondary: {
                                        color: 'error.main'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <DataView
                                columns={columns}
                                data={profiles?.items || []}
                                isLoading={isLoading}
                                error={error}
                                height="calc(100vh - 335px)"
                                enableSelection
                                pagination={{ ...pagination, total: profiles?.pagination?.total }}
                                setPagination={setPagination}
                                selectedRows={profiles?.items.filter(item => selectedProfiles?.includes(item.id))}
                                setSelectedRows={(value => {
                                    setValue('profile_ids', value?.map(item => item.id))
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
                    <Button onClick={onClose} disabled={assignPowerUser?.isPending}>{translate('common.cancel')}</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={assignPowerUser?.isPending}>
                        {assignPowerUser?.isPending ? translate('common.saving') : translate('common.save')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default GrantProfilesDrawer;