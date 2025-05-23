'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
import TextInput from "@/components/inputs/TextInput";
import { usePostGroup } from "@/hooks/api/tenant/useGroups";
import RadioInput from "@/components/inputs/RadioInput";
import { defaultValues, schema } from "@/constants/Groups";

const GroupsDrawer = ({ open, onClose, translate }) => {

    const addGroup = usePostGroup()

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    const { control, handleSubmit } = methods;

    const onSubmit = (formData) => {
        addGroup.mutateAsync(formData)
            .then(() => {
                onClose();
                methods.reset();
            })
            .catch(error => {
                console.error('Error adding user field:', error);
                // Optionally handle error state here
            });
    };

    return (
        <DrawerFormContainer
            title={translate('Group management.MODAL_TITLE_CREATE_GROUP')}
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
                        <Grid item size={12} component={ListItem}>
                            <ListItemText primary={translate('Group management.SECTION_DETAILS')} secondary={translate('Group management.SECTION_SUBTITLE_GENERAL')}
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }} />
                        </Grid>
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
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <RadioInput
                                control={control}
                                name="type"
                                label={<ListItemText primary={translate('Group management.SECTION_GROUP_TYPE')} secondary={translate('Group management.SECTION_SUBTITLE_GROUP_TYPE')}
                                    sx={{ mb: 4 }}
                                    primaryTypographyProps={{
                                        variant: 'h5',
                                        sx: {
                                            fontWeight: 600,
                                            fontSize: '1.2rem',
                                        }
                                    }} />}
                                options={[
                                    { label: <ListItemText primary={translate('Group management.RADIO_MANUAL_CREATION')} secondary={translate('Group management.RADIO_DESCRIPTION_MANUAL')} />, value: 'manual' },
                                    { label: <ListItemText primary={translate('Group management.RADIO_AUTOMATIC_CREATION')} secondary={translate('Group management.RADIO_DESCRIPTION_AUTOMATIC')} />, value: 'automatic' },

                                ]}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={addGroup?.isPending}>{translate('common.cancel')}</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={addGroup?.isPending} startIcon={addGroup?.isPending ? <i className="svg-spinners-90-ring" /> : null}>
                        {addGroup?.isPending ? translate('common.creating') : translate('common.create')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default GroupsDrawer;