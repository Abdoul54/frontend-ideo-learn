import TextInput from "@/components/inputs/TextInput";
import {
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    Paper,
    Divider,
    Box,
    Stack,
    Chip,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { useProfile, useUpdateProfile } from "@/hooks/api/tenant/useProfiles";
import OptionMenu from "@/@core/components/option-menu";
import PermissionsDrawer from "@/views/Forms/Profiles/PermissionsDrawer";

const Properties = ({ profileId }) => {
    const { data, isLoading } = useProfile({ id: profileId });
    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null,
    });

    const updateProfile = useUpdateProfile();

    const { control, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            id: '',
            name: '',
            description: '',
            permissions: {},  // Initialize as empty object, not array
        },
    });

    useEffect(() => {
        if (data) {
            reset({
                id: data?.id,
                name: data?.name || '',
                description: data?.description || '',
                permissions: data?.permissions || {},  // Ensure this is an object
            });
        }
    }, [data, reset]);


    const watchedPermissions = watch('permissions');

    const onSubmit = async (formData) => {
        try {
            const permissions = formData.permissions;
            const allCodes = Object.keys(permissions).flatMap((category) =>
                permissions[category].map((perm) => perm.code)
            );

            await updateProfile.mutateAsync({
                id: profileId,
                data: {
                    name: formData?.name,
                    description: formData?.description,
                    permissions: allCodes
                }
            });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    // Function to handle permission deletion
    const handleDeletePermission = (area) => {
        // Create a deep copy of the permissions object
        const updatedPermissions = JSON.parse(JSON.stringify(watchedPermissions));

        // Remove the entire area
        if (updatedPermissions[area]) {
            delete updatedPermissions[area];
        }

        setValue('permissions', updatedPermissions);
    };

    // Function to handle permission editing
    const handleEditPermission = (area, permissions) => {
        setDrawerState({
            open: true,
            data: {
                area,
                permissions
            }
        });
    };

    return (
        <>
            <Grid container spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid item xs={12}>
                    <Typography variant="h4">General</Typography>
                </Grid>
                <Grid item xs={12}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Profile information"
                                primaryTypographyProps={{ variant: 'h5' }}
                            />
                        </ListItem>
                        <ListItem>
                            <TextInput
                                name="name"
                                label="Name"
                                control={control}
                                type="text"
                            />
                        </ListItem>
                        <ListItem>
                            <TextInput
                                name="description"
                                label="Description"
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                            />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12} component={Stack} direction="row" justifyContent="space-between">
                    <Typography variant="h4">Manage permissions</Typography>
                    <Button
                        variant='text'
                        color="primary"
                        startIcon={<i className="solar-add-circle-outline" />}
                        onClick={() => setDrawerState({ open: true, data: null })}
                    >
                        Add Permission
                    </Button>
                </Grid>
                <Grid item xs={12} >
                    <List>
                        {watchedPermissions && Object.keys(watchedPermissions).map(area => (
                            <ListItem key={area}>
                                <Paper elevation={0} sx={{ width: 1, border: 1, borderColor: 'text.primary', padding: 3 }} >
                                    <Stack direction="row" gap={2} width={1}>
                                        <Stack direction="row" gap={2} width={1}>
                                            <Typography variant="h5">{area.charAt(0).toUpperCase() + area.slice(1)}</Typography>
                                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
                                            <Stack direction="row" gap={1} flexWrap="wrap">
                                                {watchedPermissions[area]?.map((permission) => (
                                                    <Chip
                                                        key={permission.code}
                                                        label={permission.name}
                                                    />
                                                ))}
                                            </Stack>
                                        </Stack>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <OptionMenu
                                                icon="solar-menu-dots-circle-outline"
                                                options={[
                                                    {
                                                        text: 'Edit',
                                                        icon: <i className='solar-pen-2-outline' />,
                                                        menuItemProps: {
                                                            onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleEditPermission(area, watchedPermissions[area]);
                                                            },
                                                            className: 'flex items-center gap-2',
                                                        }
                                                    },
                                                    {
                                                        text: 'Delete',
                                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                                        menuItemProps: {
                                                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                                                            onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleDeletePermission(area);
                                                            }
                                                        }
                                                    }
                                                ]}
                                            />
                                        </Box>
                                    </Stack>
                                </Paper>
                            </ListItem>
                        ))}
                    </List>
                </Grid>


                {/* Form Actions */}
                <Grid item xs={12}
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={updateProfile?.isPending || isLoading}
                        startIcon={updateProfile?.isPending ? <CircularProgress size={20} /> : null}
                    >
                        {updateProfile?.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Grid>
            </Grid>
            {
                drawerState.open && (
                    <PermissionsDrawer
                        open={drawerState.open}
                        onClose={() => setDrawerState({ open: false, data: null })}
                        data={drawerState.data}
                        setValue={setValue}
                        permissionsValue={watchedPermissions}
                    />
                )
            }
        </>
    );
};

export default Properties;