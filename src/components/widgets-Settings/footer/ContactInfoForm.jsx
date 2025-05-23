'use client';
import React, { useEffect } from 'react';
import {
    Button,
    Grid,
    TextField,
    FormControl,
    FormHelperText,
    CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateFooterContact } from '@/hooks/api/tenant/widgets/useWidgets';

const ContactInfoForm = ({ contact, setContact, refetchData }) => {
    const updateContactMutation = useUpdateFooterContact();
    
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: contact?.title || '',
            tel: contact?.tel || '',
            email: contact?.email || ''
        }
    });

    // Reset form when contact prop changes
    useEffect(() => {
        reset({
            title: contact?.title || '',
            tel: contact?.tel || '',
            email: contact?.email || ''
        });
    }, [contact, reset]);

    const onSubmit = async (data) => {
        try {
            await updateContactMutation.mutateAsync(data, {
                onSuccess: () => {
                    setContact(data);
                    refetchData?.();
                }
            });
        } catch (error) {
            console.error('Error updating contact info:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: 'Title is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Title"
                                    placeholder="Support Center"
                                    error={Boolean(errors.title)}
                                    disabled={updateContactMutation.isLoading}
                                />
                            )}
                        />
                        {errors.title && (
                            <FormHelperText error>
                                {errors.title.message}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            name="tel"
                            control={control}
                            rules={{ required: 'Phone number is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phone"
                                    placeholder="+1 234 567 890"
                                    error={Boolean(errors.tel)}
                                    disabled={updateContactMutation.isLoading}
                                />
                            )}
                        />
                        {errors.tel && (
                            <FormHelperText error>
                                {errors.tel.message}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ 
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    placeholder="support@example.com"
                                    error={Boolean(errors.email)}
                                    disabled={updateContactMutation.isLoading}
                                />
                            )}
                        />
                        {errors.email && (
                            <FormHelperText error>
                                {errors.email.message}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={updateContactMutation.isLoading}
                        startIcon={updateContactMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {updateContactMutation.isLoading ? 'Saving...' : 'Save Contact Information'}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default ContactInfoForm;