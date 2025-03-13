'use client';

import { Button, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { defaultValues, schema } from "@/constants/advanced-settings/Password";
import { useEffect } from "react";
import { usePassword, usePostPasswordSettings } from "@/hooks/api/tenant/advanced-settings/usePassword";
import { useAdvancedSettings } from "@/@core/contexts/advancedSettingsContext";

export default function Password() {

    const { control, reset, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    const { data } = usePassword();
    const addPasswordSettings = usePostPasswordSettings();
    const { refreshAdvancedSettings } = useAdvancedSettings()

    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data]);

    const onSubmit = (data) => {
        addPasswordSettings.mutateAsync(data).then(() => refreshAdvancedSettings())
    }


    return (
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h4">Password</Typography>
            </Grid>
            <Grid item xs={12} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container component={List}>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="pass_alpha_numeric"
                            label={
                                <ListItemText
                                    primary="Require Alpha Numeric Password"
                                    secondary="Require users to have at least one letter and one number in their password."
                                />
                            }
                            control={control}
                            error={!!errors.pass_alpha_numeric}
                            helperText={errors.pass_alpha_numeric?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="pass_not_username"
                            label={
                                <ListItemText primary="The password cannot be the same as the username."
                                    secondary="Prevent users from using their username as their password."
                                />
                            }
                            control={control}
                            error={!!errors.pass_not_username}
                            helperText={errors.pass_not_username?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="pass_change_first_login"
                            label={
                                <ListItemText
                                    primary="Require Password Change on First Login"
                                    secondary="Require users to change their password on first login."
                                />
                            }
                            control={control}
                            error={!!errors.pass_change_first_login}
                            helperText={errors.pass_change_first_login?.message}
                        />
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <SwitchInput
                            name="pass_dictionary_check"
                            label={
                                <ListItemText
                                    primary="Check Password Against Dictionary"
                                    secondary="Prevent users from using common passwords."
                                />
                            }
                            control={control}
                            error={!!errors.pass_dictionary_check}
                            helperText={errors.pass_dictionary_check?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="pass_min_char"
                            label="Min Password Length"
                            control={control}
                            type="number"
                            error={!!errors.pass_min_char}
                            helperText={errors.pass_min_char?.message}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="pass_max_time_valid"
                            label="Max Password Validity (Days)"
                            control={control}
                            type="number"
                            error={!!errors.pass_max_time_valid}
                            helperText={errors.pass_max_time_valid?.message}
                        />
                    </Grid>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
}