'use client';

import TextInput from "@/components/inputs/TextInput";
import { useChangePassword } from "@/hooks/api/tenant/useUsers";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, CardActions, CardContent, CardHeader, Grid, IconButton, InputAdornment, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from 'yup';

const schema = yup.object().shape({
    current_password: yup.string().required('Current password is required'),
    new_password: yup.string().required('New password is required'),
    new_password_confirmation: yup.string().required('Confirmation password is required')
        .oneOf([yup.ref('new_password'), null], 'Passwords must match')
});

const ChangePassword = () => {

    const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false);
    const [isNewPasswordShown, setIsNewPasswordShown] = useState(false);
    const [isConfirmationPasswordShown, setIsConfirmationPasswordShown] = useState(false);
    const changePassword = useChangePassword();

    const { control, handleSubmit } = useForm({
        defaultValues: {
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
        },
        resolver: yupResolver(schema)

    });

    const onSubmit = (data) => {
        console.log('Form submitted with:', data);

        changePassword.mutateAsync({ data })
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
                    <Typography variant="caption" color="textSecondary">
                        Protect your account by choosing a strong, unique password. Remember, changing your password will sign you out of all sessions, requiring you to log in again with the new one.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextInput
                        name="current_password"
                        label="Current Password"
                        type={isCurrentPasswordShown ? 'text' : 'password'}
                        control={control}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                        onClick={() => setIsCurrentPasswordShown(!isCurrentPasswordShown)}
                                        edge="end"
                                        size="large"
                                        className="transition-colors duration-300 hover:text-primary"
                                        aria-label={isCurrentPasswordShown ? 'Hide password' : 'Show password'}
                                    >
                                        <i className={`${isCurrentPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}

                    />
                </Grid>
                <Grid item xs={12}>
                    <TextInput
                        name="new_password"
                        label="New Password"
                        type={isNewPasswordShown ? 'text' : 'password'}
                        control={control}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                        onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                                        edge="end"
                                        size="large"
                                        className="transition-colors duration-300 hover:text-primary"
                                        aria-label={isNewPasswordShown ? 'Hide password' : 'Show password'}
                                    >
                                        <i className={`${isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextInput
                        name="new_password_confirmation"
                        label="Confirm New Password"
                        type={isConfirmationPasswordShown ? 'text' : 'password'}
                        control={control}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                        onClick={() => setIsConfirmationPasswordShown(!isConfirmationPasswordShown)}
                                        edge="end"
                                        size="large"
                                        className="transition-colors duration-300 hover:text-primary"
                                        aria-label={isConfirmationPasswordShown ? 'Hide password' : 'Show password'}
                                    >
                                        <i className={`${isConfirmationPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary" disabled={changePassword.isPending} >
                            {changePassword.isPending ? "Changing Password.." : "Change Password"}
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card>
    );
}

export default ChangePassword;