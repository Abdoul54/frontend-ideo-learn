'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
import { usePostGroup, useUpdateGroup } from "@/hooks/api/tenant/useGroups";
import RadioInput from "@/components/inputs/RadioInput";
import { defaultValues, schema } from "@/constants/Groups";

const GroupsDrawer = ({ open, onClose, data }) => {

    const addGroup = usePostGroup()
    const updateGroup = useUpdateGroup()

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        if (data) {
            methods.reset(data)
        }
    }, [data])

    const { control, handleSubmit } = methods;

    const onSubmit = (formData) => {
        if (data)
            updateGroup.mutateAsync({ id: data?.id, data: formData })
                .then(() => {
                    onClose();
                    methods.reset();
                })
                .catch(error => {
                    console.error('Error updating user field:', error);
                    // Optionally handle error state here
                });
        else
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
            title="User Field"
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
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText primary='Details' primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }} />                        </Grid>
                        <Grid item xs={12} component={ListItem}>
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
                            <RadioInput
                                control={control}
                                name="type"
                                label={<ListItemText primary='Group Type' secondary="Choose the group creation method" sx={{ mb: 4 }} primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }} />}
                                options={[
                                    { label: <ListItemText primary='Manual creation' secondary="Add Users to your group manually" />, value: 'manual' },
                                    { label: <ListItemText primary='Automatic creation' secondary="Use rules to automatically populate your group" />, value: 'automatic' },

                                ]}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={addGroup?.isPending || updateGroup?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={addGroup?.isPending || updateGroup?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default GroupsDrawer;