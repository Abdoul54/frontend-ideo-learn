'use client';

import { Button, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { defaultValues, schema } from "@/constants/advanced-settings/Users";
import { usePostUserSettings, useUsers } from "@/hooks/api/tenant/advanced-settings/useUsers";
import { useEffect } from "react";
import { useAdvancedSettings } from "@/@core/contexts/advancedSettingsContext";

export default function Users() {

    const { control, reset, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    const { data } = useUsers();
    const addUserSettings = usePostUserSettings();
    const { refreshAdvancedSettings } = useAdvancedSettings()

    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data]);

    const onSubmit = (data) => {
        addUserSettings.mutateAsync(data).then(() => refreshAdvancedSettings())
    }


    return (
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h4">Users</Typography>
            </Grid>
            <Grid item xs={12} component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid container component={List}>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="enable_email_verification"
                            label={<ListItemText
                                primary="Enable email verification"
                                secondary="Require users to verify their email address before they can log in."
                            />}
                            control={control}
                            error={!!errors.enable_email_verification}
                            helperText={errors.enable_email_verification?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="hide_personal_info"
                            label={<ListItemText primary="Hide Personal Info" secondary="Hide personal information on public profiles." />}
                            control={control}
                            error={!!errors.hide_personal_info}
                            helperText={errors.hide_personal_info?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="hide_preferences_tab"
                            label={<ListItemText primary="Hide Preferences Tab" secondary="Remove the preferences tab from user settings." />}
                            control={control}
                            error={!!errors.hide_preferences_tab}
                            helperText={errors.hide_preferences_tab?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="use_node_fields_visibility"
                            label={<ListItemText primary="Use Node Fields Visibility" secondary="Apply custom visibility rules to node fields." />}
                            control={control}
                            error={!!errors.use_node_fields_visibility}
                            helperText={errors.use_node_fields_visibility?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="show_first_name_first"
                            label={<ListItemText primary="Show First Name First" secondary="Display the first name before the last name." />}
                            control={control}
                            error={!!errors.show_first_name_first}
                            helperText={errors.show_first_name_first?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="auto_calculate_password"
                            label={<ListItemText primary="Auto Calculate Password" secondary="Automatically generate passwords for new users." />}
                            control={control}
                            error={!!errors.auto_calculate_password}
                            helperText={errors.auto_calculate_password?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="use_email_as_username"
                            label={<ListItemText primary="Use Email as Username" secondary="Set the email field as the username." />}
                            control={control}
                            error={!!errors.use_email_as_username}
                            helperText={errors.use_email_as_username?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="privacy_policy"
                            label={<ListItemText primary="Privacy Policy" secondary="Require users to accept the privacy policy." />}
                            control={control}
                            error={!!errors.privacy_policy}
                            helperText={errors.privacy_policy?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="terms_and_conditions"
                            label={<ListItemText primary="Terms and Conditions" secondary="Require acceptance of the terms and conditions." />}
                            control={control}
                            error={!!errors.terms_and_conditions}
                            helperText={errors.terms_and_conditions?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="anonymize_deleted_user"
                            label={<ListItemText primary="Anonymize Deleted User" secondary="Remove personal data from deleted user records." />}
                            control={control}
                            error={!!errors.anonymize_deleted_user}
                            helperText={errors.anonymize_deleted_user?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="allow_password_change"
                            label={<ListItemText primary="Allow Password Change" secondary="Permit users to change their passwords." />}
                            control={control}
                            error={!!errors.allow_password_change}
                            helperText={errors.allow_password_change?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="remenber_me_enabled"
                            label={<ListItemText primary="Remember Me Enabled" secondary="Enable the 'remember me' functionality at login." />}
                            control={control}
                            error={!!errors.remenber_me_enabled}
                            helperText={errors.remenber_me_enabled?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="max_log_attemps"
                            label="Max Login Attempts"
                            control={control}
                            type="number"
                            error={!!errors.max_log_attemps}
                            helperText={errors.max_log_attemps?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="user_logout_redirect.url"
                            label="User Logout Redirect URL"
                            control={control}
                            error={!!errors.user_logout_redirect?.url}
                            helperText={errors.user_logout_redirect?.url?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="max_delete_users"
                            label="Max Delete Users"
                            control={control}
                            type="number"
                            error={!!errors.max_delete_users}
                            helperText={errors.max_delete_users?.message}
                        />
                    </Grid>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                    <Button type="submit" variant="contained">Save</Button>
                </Grid>
            </Grid>
        </Grid>
    );
}