'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    Stack,
    FormControlLabel,
    Switch,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useForm, FormProvider, set } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import TextInput from '@/components/inputs/TextInput';
import SwitchInput from '@/components/inputs/SwitchInput';
import { createSchema } from '@/constants/manager-service/ManagerTypes';
import { useCreateManagerType, useUpdateManagerType } from '@/hooks/api/tenant/useManager';

// Default form values
const defaultValues = {
    code: '',
    name: {
        type: 'multi_lang',
        values: {
            en: '',
            fr: ''
        }
    },
    description: {
        type: 'multi_lang',
        values: {
            en: '',
            fr: ''
        }
    },
    is_active: true
};

const ManagerTypeDrawer = ({ open, onClose, data = null }) => {
    // State for language selection
    const [currentLang, setCurrentLang] = useState('en');

    // State for universal name (apply to all languages)
    const [isNameUniversal, setIsNameUniversal] = useState(false);
    const [isDescriptionUniversal, setIsDescriptionUniversal] = useState(false);

    // Schema setup
    const schema = createSchema();

    // Initialize form with react-hook-form
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = methods;

    // Mutations for API calls
    const createManagerType = useCreateManagerType();
    const updateManagerType = useUpdateManagerType();

    // Reset form when drawer opens/closes or data changes
    useEffect(() => {
        if (open) {
            if (data) {
                // Determine if name is universal or multi-language
                const nameIsUniversal = data.name?.type === 'single_value';
                setIsNameUniversal(nameIsUniversal);

                const descriptionIsUniversal = data.description?.type === 'single_value';
                setIsDescriptionUniversal(descriptionIsUniversal);

                // Map API data to form structure for editing
                const formData = {
                    code: data.code || '',
                    name: nameIsUniversal
                        ? {
                            type: 'single_value',
                            value: data.name?.value || ''
                        }
                        : {
                            type: 'multi_lang',
                            values: {
                                en: data.name?.values?.en || '',
                                fr: data.name?.values?.fr || ''
                            }
                        },
                    description: descriptionIsUniversal
                        ? {
                            type: 'single_value',
                            value: data.description?.value || ''
                        }
                        : {
                            type: 'multi_lang',
                            values: {
                                en: data.description?.values?.en || '',
                                fr: data.description?.values?.fr || ''
                            }
                        },
                    is_active: data.is_active ?? true
                };
                reset(formData);
            } else {
                reset(defaultValues);
                setIsNameUniversal(false);
            }
        }
    }, [open, data, reset]);

    // Handle switching between universal and multi-language for name
    const handleNameTranslationTypeChange = (isUniversal) => {
        setIsNameUniversal(isUniversal);

        if (isUniversal) {
            // Switch to single value
            setValue('name.type', 'single_value');
            setValue('name.value', '');
            // Clear multi-language values
            setValue('name.values', undefined);
        } else {
            // Switch to multi-language
            setValue('name.type', 'multi_lang');
            setValue('name.values', { en: '', fr: '' });
            // Clear single value
            setValue('name.value', undefined);
        }
    };

    const handleDescriptionTranslationTypeChange = (isUniversal) => {
        setIsDescriptionUniversal(isUniversal);

        if (isUniversal) {
            // Switch to single value
            setValue('description.type', 'single_value');
            setValue('description.value', '');
            // Clear multi-language values
            setValue('description.values', undefined);
        } else {
            // Switch to multi-language
            setValue('description.type', 'multi_lang');
            setValue('description.values', { en: '', fr: '' });
            // Clear single value
            setValue('description.value', undefined);
        }
    };

    const handleUniversalTranslationChange = (e) => {
        const isChecked = e.target.checked;
        handleNameTranslationTypeChange(isChecked);
        handleDescriptionTranslationTypeChange(isChecked);
    };

    // Form submission handler
    const onSubmit = (formData) => {
        // Prepare data for API
        const apiData = {
            code: formData.code,
            name: isNameUniversal
                ? {
                    type: 'single_value',
                    value: formData.name.value
                }
                : {
                    type: 'multi_lang',
                    values: formData.name.values
                },
            description: isDescriptionUniversal
                ? {
                    type: 'single_value',
                    value: formData.description.value
                }
                : {
                    type: 'multi_lang',
                    values: formData.description.values
                },
            is_active: formData.is_active
        };

        if (data?.id) {
            // Update existing manager type
            updateManagerType.mutate(
                { id: data.id, data: apiData },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        console.error('Error updating manager type:', error);
                    }
                }
            );
        } else {
            // Create new manager type
            createManagerType.mutate(
                apiData,
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        console.error('Error creating manager type:', error);
                    }
                }
            );
        }
    };

    // Loading state
    const isLoading = createManagerType.isPending || updateManagerType.isPending;

    // Determine errors
    const apiError = createManagerType.error || updateManagerType.error;

    return (
        <DrawerFormContainer
            open={open}
            onClose={onClose}
            title={data ? "Edit Manager Type" : "Create Manager Type"}
            width={500}
        >
            <FormProvider {...methods}>
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
                    }}>
                        {apiError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {apiError.message || 'An error occurred. Please try again.'}
                            </Alert>
                        )}

                        <Stack spacing={3}>
                            {/* Code field */}
                            <TextInput
                                name="code"
                                control={control}
                                label="Code"
                                placeholder="e.g. TL"
                                required
                                helperText="Unique code for the manager type (max 50 characters)"
                            />

                            {/* Universal Translation Toggle for Name */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isNameUniversal && isDescriptionUniversal}
                                        onChange={handleUniversalTranslationChange}
                                        aria-label="Toggle universal translation"
                                    />
                                }
                                label="Use same name for all languages"
                            />

                            {/* Name fields */}
                            {isNameUniversal ? (
                                <TextInput
                                    name="name.value"
                                    control={control}
                                    label="Name (All Languages)"
                                    placeholder="Enter universal name"
                                    required
                                />
                            ) : (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Name
                                    </Typography>
                                    <MultilingualTextInput
                                        name="name.values"
                                        control={control}
                                        label="Name"
                                        currentLang={currentLang}
                                        onLanguageChange={setCurrentLang}
                                        defaultLanguage="en"
                                        languages={[
                                            { code: 'en', label: 'English' },
                                            { code: 'fr', label: 'French' }
                                        ]}
                                        required
                                        applyToAllLanguages={false}
                                    />
                                    {errors.name?.values?.en && (
                                        <Typography color="error" variant="caption">
                                            {errors.name.values.en.message}
                                        </Typography>
                                    )}
                                    {errors.name?.values?.fr && (
                                        <Typography color="error" variant="caption">
                                            {errors.name.values.fr.message}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Description field */}
                            {isDescriptionUniversal ? (
                                <TextInput
                                    name="description.value"
                                    control={control}
                                    label="Description (All Languages)"
                                    placeholder="Enter universal description"
                                />
                            ) : (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Description
                                    </Typography>
                                    <MultilingualTextInput
                                        name="description.values"
                                        control={control}
                                        label="Description"
                                        currentLang={currentLang}
                                        onLanguageChange={setCurrentLang}
                                        defaultLanguage="en"
                                        languages={[
                                            { code: 'en', label: 'English' },
                                            { code: 'fr', label: 'French' }
                                        ]}
                                        applyToAllLanguages={false}
                                    />
                                    {errors.description?.values?.en && (
                                        <Typography color="error" variant="caption">
                                            {errors.description.values.en.message}
                                        </Typography>
                                    )}
                                    {errors.description?.values?.fr && (
                                        <Typography color="error" variant="caption">
                                            {errors.description.values.fr.message}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Active status */}
                            <SwitchInput
                                name="is_active"
                                control={control}
                                label="Active Status"
                            />
                        </Stack>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, gap: 2 }}>
                        <Button
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : data ? 'Update' : 'Create'}
                        </Button>
                    </CardActions>
                </Card>
            </FormProvider>
        </DrawerFormContainer>
    );
};

export default ManagerTypeDrawer;