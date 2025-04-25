// frontend/src/views/Settings-tabs/SelfRegistration.jsx
'use client';

import { useEffect } from "react";
import { Grid, Button, Typography, List, ListItem, ListItemText, Card, CardActions, CardHeader, CardContent } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegistrationSettings, useUpdateRegistrationSettings } from "@/hooks/api/tenant/useUpdateSettings";
import toast from "react-hot-toast";
import SelectInput from "@/components/inputs/SelectInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { defaultValues, schema } from "@/constants/advanced-settings/SelfRegistration";
import { useAdvancedSettings } from "@/@core/contexts/advancedSettingsContext";

function SelfRegistration() {
    const { data } = useRegistrationSettings();
    const { mutate: updateSettings, isPending } = useUpdateRegistrationSettings();
    const { refreshAdvancedSettings } = useAdvancedSettings();
    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });


    // Reset form when data loads
    useEffect(() => {
        if (data) {
            reset({
                registerType: data.registerType || 'self',
                disable_registration_email_confirrmation: data.disable_registration_email_confirrmation || false,
                allow_quick_registration: data.allow_quick_registration || false,
                mail_sender: data.mail_sender || '',
                last_first_modatory: data.last_first_modatory || false
            });
        }
    }, [data, reset]);

    const onSubmit = (formData) => {
        updateSettings(formData, {
            onSuccess: () => {
                refreshAdvancedSettings()
                toast.success('Settings updated successfully')
            },
            onError: (error) => toast.error(error.response?.data?.message || 'Update failed')
        });
    };

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)} >
            <CardHeader title={
                <ListItemText
                    primary="Registration"
                    secondary="Manage your registration settings"
                    primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                />
            } />
            <CardContent>
                <Grid container spacing={3} component={List}>
                    <Grid item xs={12} component={ListItem}>
                        <SelectInput
                            name="registerType"
                            control={control}
                            label="Registration Type"
                            options={[
                                { label: 'Self Registration', value: 'self' },
                                { label: 'Admin Registration', value: 'admin' },
                                { label: 'Moderate Registration', value: 'moderate' }
                            ]}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SwitchInput
                            name="disable_registration_email_confirrmation"
                            control={control}
                            label={<ListItemText
                                primary="Disable Registration Email Confirmation"
                                secondary="Disable the email confirmation step for new registrations."
                            />}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SwitchInput
                            name="allow_quick_registration"
                            control={control}
                            label={<ListItemText
                                primary="Allow Quick Registration"
                                secondary="Allow users to register without entering a password."
                            />}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="mail_sender"
                            control={control}
                            label="Mail Sender"
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SwitchInput
                            name="last_first_modatory"
                            control={control}
                            label={<ListItemText
                                primary="Last Name and First Name Mandatory"
                                secondary="Require users to enter their last name and first name during registration."
                            />}
                        />
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary" disabled={isPending}>
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card>
    );
}

export default SelfRegistration;