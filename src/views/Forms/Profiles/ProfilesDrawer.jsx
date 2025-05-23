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
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
import { usePostProfile, useUpdateProfile } from "@/hooks/api/tenant/useProfiles";
import { yupResolver } from "@hookform/resolvers/yup";
import { defaultValues, schema } from "@/constants/Profile";

const ProfilesDrawer = ({ open, onClose, data, translate }) => {

    const addProfile = usePostProfile()
    const updateProfile = useUpdateProfile()

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        if (data) {
            methods.reset({
                name: data?.name,
                description: data?.description,
            })
        }
    }, [data])

    const { control, handleSubmit } = methods;

    const onSubmit = (formData) => {
        if (data)
            updateProfile.mutateAsync({ id: data?.id, data: formData })
                .then(() => {
                    onClose();
                    methods.reset();
                })
        else
            addProfile.mutateAsync(formData)
                .then(() => {
                    onClose();
                    methods.reset();
                })
    };

    return (
        <DrawerFormContainer
            title={
                data ? data?.name : translate('Power User & Profile Management.CREATE_PROFILE')
            }
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
                            <TextInput
                                name="name"
                                label={translate('common.FIELD_NAME')}
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="description"
                                label={translate('common.FIELD_DESCRIPTION')}
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={addProfile?.isPending || updateProfile?.isPending}>{translate('common.cancel')}</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={addProfile?.isPending || updateProfile?.isPending}>
                        {data ? addProfile?.isPending || updateProfile?.isPending ? translate('common.saving') : translate('common.save') : addProfile?.isPending || updateProfile?.isPending ? translate('common.creating') : translate('common.create')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default ProfilesDrawer;
