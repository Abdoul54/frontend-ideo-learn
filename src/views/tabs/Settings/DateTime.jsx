'use client';

import { useEffect } from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDateSettings, useUpdateDateSettings } from "@/hooks/api/tenant/useDateSettings";
import { useLangsTenant, useTimezonesTenant } from "@/hooks/api/tenant/useTimeLangSettings";
import SelectInput from "@/components/inputs/SelectInput";
import { defaultValues, schema } from "@/constants/advanced-settings/DateTime";
import { useAdvancedSettings } from "@/@core/contexts/advancedSettingsContext";

function DateTime() {
    const { data } = useDateSettings();
    const { mutate: updateSettings, isPending } = useUpdateDateSettings();
    const { data: timezones } = useTimezonesTenant();
    const { data: language } = useLangsTenant();
    const { refreshAdvancedSettings } = useAdvancedSettings();

    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    // Reset form when data loads
    useEffect(() => {
        if (data) {
            reset({
                timezone_default: data.timezone_default || 'Europe/Paris',
                date_format: data.date_format || 'd/m/Y',
                date_language: data.date_language || 'fr'
            });
        }
    }, [data, reset]);

    const onSubmit = (formData) => {
        updateSettings(formData, {
            onSuccess: () => refreshAdvancedSettings(),
        })
    };

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)} >
            <CardHeader title={
                <ListItemText
                    primary="Date and Time"
                    secondary="Manage your date and time settings"
                    primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                />
            } />
            <CardContent>
                <Grid container spacing={3} component={List}>
                    <Grid item xs={12} component={ListItem}>
                        <SelectInput
                            label="Timezone"
                            name="timezone_default"
                            labelKey="text"
                            valueKey="id"
                            control={control}
                            options={timezones}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SelectInput
                            label="Date Format"
                            name="date_format"
                            control={control}
                            options={[
                                { label: 'Y-m-d', value: 'Y-m-d' },
                                { label: 'd/m/Y', value: 'd/m/Y' },
                                { label: 'm/d/Y', value: 'm/d/Y' },
                                { label: 'd-m-Y', value: 'd-m-Y' },
                                { label: 'm-d-Y', value: 'm-d-Y' },
                            ]}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SelectInput
                            label="Date Language"
                            name="date_language"
                            control={control}
                            options={language}
                            labelKey="name"
                            valueKey="code"
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

export default DateTime;
