'use client'

import { useUpdatePowerUser } from "@/hooks/api/tenant/usePowerUsers";
import { useProfileByIds } from "@/hooks/api/tenant/useProfiles";
import ProfilesDrawer from "@/views/Forms/PowerUser/ProfilesDrawer";
import {
    Grid2 as Grid,
    Button,
    Typography,
    ListItemText,
    ListItem,
    List,
    Chip,
    Stack,
    Divider,
    Box,
    Paper
} from "@mui/material";
import { useEffect, useState } from "react";

const Properties = ({ powerUser }) => {

    const [profiles, setProfiles] = useState(powerUser?.profiles || []);
    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null,
    });

    const { data: profilesByIds } = useProfileByIds({ ids: profiles?.map((profile) => profile.id) });

    const updatePowerUser = useUpdatePowerUser();

    const onSubmit = () => {
        updatePowerUser.mutate({
            id: powerUser?.id,
            data: {
                profile_ids: profiles.map((profile) => profile.id),
            }
        });
    };

    const handleDeleteProfile = (profileId) => {
        setProfiles((prevProfiles) => prevProfiles.filter((profile) => profile.id !== profileId));
    };


    useEffect(() => {
        if (powerUser) {
            setProfiles(powerUser?.profiles || []);
        }
    }, [powerUser]);

    const Permissions = profilesByIds?.reduce((acc, profile) => {
        if (!profile?.permissions) return acc;

        for (const [area, perms] of Object.entries(profile.permissions)) {
            if (!acc[area]) acc[area] = [];

            const existingCodes = new Set(acc[area].map(p => p.code));
            const newPerms = perms.filter(p => !existingCodes.has(p.code));

            acc[area].push(...newPerms);
        }

        return acc;
    }, {});

    return (
        <>
            <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }}>
                <Grid container spacing={3}>
                    <Grid item size={12}>
                        <Typography variant="h4">Granted profiles and permissions</Typography>
                    </Grid>
                    <Grid item size={12}>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Granted profiles"
                                    primaryTypographyProps={{ variant: 'h5' }}
                                />
                            </ListItem>
                            <ListItem
                            >
                                <Stack gap={2} direction="row" sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    padding: 3,
                                    width: 1,
                                    backgroundColor: 'background.default',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
                                        {
                                            profiles?.map((profile) => (
                                                <Chip
                                                    key={profile.id}
                                                    label={profile.name}
                                                    variant="outlined"
                                                    color="primary"
                                                    deleteIcon={<i className="solar-close-circle-outline" />}
                                                    onDelete={() => handleDeleteProfile(profile.id)}
                                                />
                                            ))
                                        }
                                    </Stack>
                                    <Button
                                        variant='text'
                                        color="primary"
                                        sx={{ mt: 2 }}
                                        onClick={() => setDrawerState({ open: true, data: profiles })}
                                        startIcon={<i className="solar-add-circle-outline" />}
                                    >
                                        Grant profile
                                    </Button>
                                </Stack>
                            </ListItem>
                        </List>
                    </Grid>
                    <Grid item size={12}>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Permissions recap"
                                    secondary="Summary of the permissions granted to the selected Power User, based on the granted profiles. This recap is read-only."
                                    primaryTypographyProps={{ variant: 'h5' }}
                                />
                            </ListItem>
                            {Permissions && Object.entries(Permissions).map(([area, permissions]) => (
                                <ListItem key={area}>
                                    <Stack gap={2} direction="row" sx={{
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        padding: 3,
                                        width: 1,
                                        backgroundColor: 'background.default',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <Typography
                                                fontWeight={700}

                                            >{area.charAt(0).toUpperCase() + area.slice(1)}</Typography>
                                        </Box>
                                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
                                        <Stack gap={1} direction="row" alignItems='flex-start' width={1} flexWrap="wrap">
                                            {permissions.map((permission) => (
                                                <Chip
                                                    key={permission.code}
                                                    label={permission.name}
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>


                    {/* Form Actions */}
                    <Grid item size={12}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={updatePowerUser.isLoading}
                            onClick={onSubmit}
                        >
                            {updatePowerUser.isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </Grid>
                </Grid >
            </Paper>
            {
                drawerState.open && <ProfilesDrawer open={drawerState.open} data={drawerState.data} onClose={() => setDrawerState({ open: false, data: null })} setProfiles={setProfiles} />
            }
        </>
    );
};

export default Properties
