'use client';
import { useEffect } from "react";
import { Button, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAdvancedOptions, useUpdateAdvancedOptions } from "@/hooks/api/tenant/useAdvancedOptions";
import TextInput from "@/components/inputs/TextInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { defaultValues, schema } from "@/constants/advanced-settings/AdvancedOptions";
import { useAdvancedSettings } from "@/@core/contexts/advancedSettingsContext";



function AdvancedOptions() {
    const { data } = useAdvancedOptions();
    const { mutate: updateSettings, isPending } = useUpdateAdvancedOptions();
    const { refreshAdvancedSettings } = useAdvancedSettings();

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    // Reset form when data loads
    useEffect(() => {
        if (data) {
            reset({
                send_cc_from_system_emails: data.send_cc_from_system_emails || '',
                sender_event: data.sender_event || '',
                ttl_session: data.ttl_session || 1,
                stop_concurrent_user: data.stop_concurrent_user || false
            });
        }
    }, [data, reset]);

    const onSubmit = (formData) => {
        updateSettings(formData, {
            onSuccess: () => refreshAdvancedSettings()
        });
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h4">Advanced Options</Typography>
            </Grid>
            <Grid item xs={12} component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid container component={List}>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="send_cc_from_system_emails"
                            label="Send CC From System Emails"
                            control={control}
                            error={!!errors.send_cc_from_system_emails}
                            helperText={errors.send_cc_from_system_emails?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="sender_event"
                            label="Sender Event"
                            control={control}
                            error={!!errors.sender_event}
                            helperText={errors.sender_event?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="ttl_session"
                            label="TTL Session"
                            control={control}
                            type="number"
                            error={!!errors.ttl_session}
                            helperText={errors.ttl_session?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SwitchInput
                            name="stop_concurrent_user"
                            control={control}
                            label={<ListItemText
                                primary="Stop Concurrent User"
                                secondary="This setting prevents concurrent usage."
                            />}
                        />
                    </Grid>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                    <Button type="submit" variant="contained" disabled={isPending}>Save</Button>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default AdvancedOptions;