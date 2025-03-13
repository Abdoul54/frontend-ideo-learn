'use client';

import { useForm } from "react-hook-form";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { usePermissions, usePostPermission, useUpdatePermission } from "@/hooks/api/tenant/usePermissions";
import CheckboxesGroup from "@/components/inputs/CheckboxesGroup";
import { yupResolver } from "@hookform/resolvers/yup";
import { defaultValues, schema } from "@/constants/Permission";

const PermissionsDrawer = ({ open, onClose, data }) => {

    const addPermission = usePostPermission()
    const updatePermission = useUpdatePermission()
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    const { data: permissions, isLoading, error } = usePermissions({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search,
    })

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        if (data) {
            methods.reset({
                code: data?.code,
                name: data?.name,
                description: data?.description,
                area: data?.area,
                is_system: data?.is_system,
                is_active: data?.is_active,
                dependencies: data?.dependencies?.map(item => item.code) || [],
            })
        }
    }, [data])

    const { control, handleSubmit, watch, formState: { errors } } = methods;

    const onSubmit = (formData) => {
        console.log('formData', formData);

        if (data)
            updatePermission.mutateAsync({ id: data?.id, data: formData })
                .then(() => {
                    onClose();
                    methods.reset();
                })
        else
            addPermission.mutateAsync(formData)
                .then(() => {
                    onClose();
                    methods.reset();
                })
    };

    return (
        <DrawerFormContainer
            title="Permissions"
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
                        {/* Field Type Selection */}
                        <Grid item xs={6} component={ListItem}>
                            <TextInput
                                name="code"
                                label="Code"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item xs={6} component={ListItem}>
                            <TextInput
                                name="name"
                                label="Name"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="description"
                                label="Description"
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="area"
                                label="Area"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item xs={6} component={ListItem}>
                            <SwitchInput
                                name="is_system"
                                label={<ListItemText primary='Default' secondary='Indicates if this is a system-level permission.' />}
                                control={control}
                            />
                        </Grid>
                        <Grid item xs={6} component={ListItem}>
                            <SwitchInput
                                name="is_active"
                                label={<ListItemText primary="Status" secondary='Indicates if the permission is active.' />}
                                control={control}
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    width: 1,
                                }}
                            >
                                <Stack>
                                    <Typography variant='h6' gutterBottom>
                                        Select permissions that this permission depends on
                                    </Typography>
                                    {errors?.dependencies && (
                                        <Typography variant='caption' className="text-error">{errors?.dependencies?.message}</Typography>
                                    )}
                                </Stack>
                                {/* Permissions Search */}
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search permissions"
                                        variant="outlined"
                                        size="small"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <i className="lucide-search" style={{ width: 16, height: 16 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: search ? (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => setSearch('')}
                                                        size="small"
                                                        aria-label="clear search"
                                                    >
                                                        <i className="lucide-x" style={{ width: 16, height: 16 }} />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null
                                        }}
                                    />
                                </Box>

                                {isLoading ? (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        py: 4
                                    }}>
                                        <CircularProgress size={24} />
                                        <Typography variant="body2" sx={{ ml: 2 }}>
                                            Loading permissions...
                                        </Typography>
                                    </Box>
                                ) : error ? (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        py: 4
                                    }}>
                                        <Typography variant="body2" sx={{ ml: 2, color: 'text.error' }}>
                                            Error loading permissions
                                        </Typography>
                                    </Box>
                                )
                                    : (permissions?.items?.length === 0) ? (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            py: 4,
                                            borderRadius: 1,
                                            bgcolor: 'background.paper',
                                            border: '1px dashed',
                                            borderColor: 'divider'
                                        }}>
                                            <i className="lucide-folder" style={{ width: 40, height: 40, opacity: 0.5 }} />
                                            <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                                                {search
                                                    ? 'No permissions found matching your search'
                                                    : 'No permissions found'}
                                            </Typography>
                                            {search && (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => setSearch('')}
                                                    startIcon={<i className="lucide-refresh-cw" style={{ width: 16, height: 16 }} />}
                                                >
                                                    Clear search
                                                </Button>
                                            )}
                                        </Box>
                                    ) : (
                                        <CheckboxesGroup
                                            items={[
                                                // Items from API with enhanced display
                                                ...(permissions?.items || []).map(item => ({
                                                    ...item,
                                                    _style: {
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider',
                                                        transition: 'background-color 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.04)'
                                                        }
                                                    }
                                                }))
                                            ]}
                                            control={control}
                                            name="dependencies"
                                            getItemId={(item) => item.code}
                                            getItemLabel={(item) => item.name}
                                            getItemStyle={(item) => item._style || {}}
                                            pagination={{
                                                count: permissions?.pagination?.total || 0,
                                                page: pagination?.pageIndex,
                                                rowsPerPage: pagination?.pageSize,
                                            }}
                                            rowsPerPageOptions={[5, 15, 25]}
                                            onPaginationChange={(newPagination) => {
                                                setPagination({
                                                    pageIndex: newPagination?.pageIndex,
                                                    pageSize: newPagination?.pageSize
                                                });
                                            }}
                                        />
                                    )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={addPermission?.isPending || updatePermission?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={addPermission?.isPending || updatePermission?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default PermissionsDrawer;