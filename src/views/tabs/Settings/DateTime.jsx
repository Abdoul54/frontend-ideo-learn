'use client';

import { useEffect } from "react";
import { Button, Grid, List, ListItem, Typography } from "@mui/material";
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
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h4">Date and Time</Typography>
            </Grid>
            <Grid item xs={12} component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid container component={List}>
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

export default DateTime;
