'use client';

import SelectInput from "@/components/inputs/SelectInput";
import { useActiveLanguages } from "@/hooks/api/tenant/useLocalization";
import { useTimezonesTenant } from "@/hooks/api/tenant/useTimeLangSettings";
import { useGetPreferences, usePostPreferences } from "@/hooks/api/tenant/useUsers";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, CardActions, CardContent, CardHeader, Grid, ListItemText } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from 'yup';

const schema = yup.object().shape({
    language: yup.string().required('Language is required'),
    timezone: yup.string().required('Timezone is required')
});

const Preferences = () => {

    const { data: activeLanguages, isLoading: isLoadingActiveLanguages, error: errorActiveLanguages } = useActiveLanguages();
    const { data: timezones, isLoading: isLoadingTimezones, error: errorTimezones } = useTimezonesTenant();
    const { data: preferences } = useGetPreferences();
    const updatePreferences = usePostPreferences();

    const { control, handleSubmit, setError, setValue } = useForm({
        defaultValues: {
            language: '',
            timezone: '',
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        // Set default values for language and timezone if available
        if (preferences) {
            setValue('language', preferences?.language || '');
            setValue('timezone', preferences?.timezone || '');
        }
    }, [preferences, setValue]);

    if (errorActiveLanguages) {
        setError('language', {
            type: 'manual',
            message: 'Error loading languages'
        });
    }

    if (errorTimezones) {
        setError('timezone', {
            type: 'manual',
            message: 'Error loading timezones'
        });
    }

    const onSubmit = (data) => {
        updatePreferences.mutateAsync({ data })
    };

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)}>
            <CardHeader title={
                <ListItemText
                    primary="Change password"
                    secondary="Change your password to access the platform"
                    primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                />
            }
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }} />
            <CardContent component={Grid} container spacing={3} >
                {/* Avatar input section */}
                <Grid item xs={12} mt={4} >
                    <SelectInput
                        name="language"
                        label="Language"
                        control={control}
                        options={activeLanguages}
                        labelKey="name"
                        valueKey="code"
                        disabled={isLoadingActiveLanguages || errorActiveLanguages}
                    />
                </Grid>
                <Grid item xs={12}>
                    <SelectInput
                        name="timezone"
                        label="Timezone"
                        control={control}
                        options={timezones}
                        labelKey="text"
                        valueKey="id"
                        disabled={isLoadingTimezones || errorTimezones}
                    />
                </Grid>

            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary" disabled={updatePreferences.isPending}>
                            {updatePreferences?.isPending ? "Saving changes.." : "Save Changes"}
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card>
    );
}

export default Preferences;