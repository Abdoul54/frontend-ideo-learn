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
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import TextInput from '@/components/inputs/TextInput';
import SwitchInput from '@/components/inputs/SwitchInput';
import { createSchema } from '@/constants/manager-service/ManagerTypes';
import { useCreateManagerType, useUpdateManagerType } from '@/hooks/api/tenant/useManager';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';

const ManagerTypeDrawer = ({ open, onClose, data = null, isLoading: isLoadingDetails }) => {
    console.log("Drawer received data:", data); // Debugging log

    // Fetch active languages
    const { data: activeLanguages, isLoading: isLoadingLanguages } = useActiveLanguages();

    // Find default language from active languages
    const defaultLocale = activeLanguages?.find(lang => lang.is_default)?.code || 'fr';

    // State for language selection - initialize with default locale
    const [currentLang, setCurrentLang] = useState(defaultLocale);

    // State for universal name (apply to all languages)
    const [isNameUniversal, setIsNameUniversal] = useState(false);
    const [isDescriptionUniversal, setIsDescriptionUniversal] = useState(false);

    // Create default values dynamically based on active languages
    const getDefaultValues = () => {
        // Initialize with empty values for all possible languages
        const languageValues = {};

        // If active languages are available, add them to default values
        if (activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                languageValues[lang.code] = '';
            });
        } else {
            // Fallback to common languages if API data not available
            languageValues.fr = '';
            languageValues.id = '';
        }

        return {
            code: '',
            name: {
                type: 'multi_lang',
                values: languageValues
            },
            description: {
                type: 'multi_lang',
                values: { ...languageValues }
            },
            is_active: true
        };
    };

    // Schema setup - pass active languages to createSchema
    const schema = createSchema(activeLanguages);

    // Initialize form with react-hook-form
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: getDefaultValues()
    });

    const { control, handleSubmit, reset, setValue, watch, formState: { errors }, setError } = methods;

    // Mutations for API calls
    const createManagerType = useCreateManagerType();
    const updateManagerType = useUpdateManagerType();

    // Update default values when active languages change
    useEffect(() => {
        if (!open) return;

        // Get fresh default values based on latest active languages
        if (!data) {
            const newDefaults = getDefaultValues();
            reset(newDefaults);
        }
    }, [activeLanguages, open, data]);

    // Reset form when drawer opens/closes or data changes
    useEffect(() => {
        if (open && !isLoadingDetails) {
            if (data) {
                console.log("Processing data for form:", data);

                // Handle the different possible structures
                // The data might come directly from API (data.title) or from the page component (data.name)
                const apiName = data.name || data.title || {};
                const apiDescription = data.description || {};

                // Determine if name/description is universal or multi-language
                const nameIsUniversal = apiName?.type === 'single_value';
                const descriptionIsUniversal = apiDescription?.type === 'single_value';

                setIsNameUniversal(nameIsUniversal);
                setIsDescriptionUniversal(descriptionIsUniversal);

                // Initialize translation values for all active languages
                const nameValues = {};
                const descriptionValues = {};

                // First set empty values for all active languages to ensure we have all required fields
                if (activeLanguages && activeLanguages.length > 0) {
                    activeLanguages.forEach(lang => {
                        // For single value, use the same value for all languages
                        if (nameIsUniversal) {
                            nameValues[lang.code] = apiName?.value || '';
                        } else {
                            nameValues[lang.code] = '';
                        }

                        if (descriptionIsUniversal) {
                            descriptionValues[lang.code] = apiDescription?.value || '';
                        } else {
                            descriptionValues[lang.code] = '';
                        }
                    });
                }

                // Then override with actual values from data for multi-language
                if (!nameIsUniversal && apiName?.values) {
                    Object.entries(apiName.values).forEach(([key, value]) => {
                        nameValues[key] = value || '';
                    });
                }

                if (!descriptionIsUniversal && apiDescription?.values) {
                    Object.entries(apiDescription.values).forEach(([key, value]) => {
                        descriptionValues[key] = value || '';
                    });
                }

                // Map API data to form structure for editing
                const formData = {
                    code: data.code || '',
                    name: nameIsUniversal
                        ? {
                            type: 'single_value',
                            value: apiName?.value || ''
                        }
                        : {
                            type: 'multi_lang',
                            values: nameValues
                        },
                    description: descriptionIsUniversal
                        ? {
                            type: 'single_value',
                            value: apiDescription?.value || ''
                        }
                        : {
                            type: 'multi_lang',
                            values: descriptionValues
                        },
                    // Handle both possible formats for active status
                    is_active: data.is_active !== undefined ? data.is_active : data.active === 1
                };

                console.log("Form data prepared:", formData);
                reset(formData);

                // Set current language to default language to start
                setCurrentLang(defaultLocale);
            } else {
                reset(getDefaultValues());
                setIsNameUniversal(false);
                setIsDescriptionUniversal(false);
            }
        }
    }, [open, data, reset, activeLanguages, defaultLocale, isLoadingDetails]);

    // Prepare language options for the MultilingualTextInput
    const getLanguageOptions = () => {
        // Use active languages from API if available
        if (activeLanguages && activeLanguages.length > 0) {
            return activeLanguages.map(lang => ({
                code: lang.code,
                label: lang.name || lang.native_name,
                isDefault: lang.is_default
            }));
        }

        // Default languages if API data is not available
        return [
            { code: 'fr', label: 'French', isDefault: true },
            { code: 'id', label: 'Indonesian' }
        ];
    };

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
            // Initialize empty translations for all active languages
            const languageValues = {};
            if (activeLanguages && activeLanguages.length > 0) {
                activeLanguages.forEach(lang => {
                    languageValues[lang.code] = '';
                });
            } else {
                // Fallback to common languages
                languageValues.fr = '';
                languageValues.id = '';
            }

            // Switch to multi-language
            setValue('name.type', 'multi_lang');
            setValue('name.values', languageValues);
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
            // Initialize empty translations for all active languages
            const languageValues = {};
            if (activeLanguages && activeLanguages.length > 0) {
                activeLanguages.forEach(lang => {
                    languageValues[lang.code] = '';
                });
            } else {
                // Fallback to common languages
                languageValues.fr = '';
                languageValues.id = '';
            }

            // Switch to multi-language
            setValue('description.type', 'multi_lang');
            setValue('description.values', languageValues);
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
        // Check if required fields are provided
        let hasError = false;

        // For multi-language name, check if all active languages are provided
        if (!isNameUniversal && formData.name.type === 'multi_lang') {
            if (activeLanguages && activeLanguages.length > 0) {
                activeLanguages.forEach(lang => {
                    const langValue = formData.name.values[lang.code];
                    if (!langValue || langValue.trim() === '') {
                        // Only the default language is required, others can be empty
                        if (lang.is_default) {
                            setError(`name.values.${lang.code}`, {
                                type: 'manual',
                                message: `The ${lang.name || lang.native_name} translation is required`
                            });
                            hasError = true;
                        } else {
                            // For non-default languages, copy the default language value
                            const defaultLang = activeLanguages.find(l => l.is_default);
                            if (defaultLang && formData.name.values[defaultLang.code]) {
                                formData.name.values[lang.code] = formData.name.values[defaultLang.code];
                            }
                        }
                    }
                });
            }
        }

        if (hasError) {
            return;
        }

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
                    values: { ...formData.name.values }  // Make a copy to avoid reference issues
                },
            description: isDescriptionUniversal
                ? {
                    type: 'single_value',
                    value: formData.description.value || ''
                }
                : {
                    type: 'multi_lang',
                    values: { ...formData.description.values }  // Make a copy
                },
            is_active: formData.is_active
        };

        // Ensure all active languages have a value (even if empty) for multi-language mode
        if (apiData.name.type === 'multi_lang' && activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                if (!apiData.name.values[lang.code]) {
                    // Use the default language value if available
                    const defaultLang = activeLanguages.find(l => l.is_default);
                    if (defaultLang && apiData.name.values[defaultLang.code]) {
                        apiData.name.values[lang.code] = apiData.name.values[defaultLang.code];
                    } else {
                        apiData.name.values[lang.code] = '';
                    }
                }
            });
        }

        if (apiData.description.type === 'multi_lang' && activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                if (!apiData.description.values[lang.code]) {
                    // Use the default language value if available
                    const defaultLang = activeLanguages.find(l => l.is_default);
                    if (defaultLang && apiData.description.values[defaultLang.code]) {
                        apiData.description.values[lang.code] = apiData.description.values[defaultLang.code];
                    } else {
                        apiData.description.values[lang.code] = '';
                    }
                }
            });
        }

        if (data?.id) {
            // Update existing manager type
            updateManagerType.mutate(
                { id: data.id, data: apiData },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        const errorMessage = error?.response?.data?.message;
                        console.error('API Error:', errorMessage);

                        if (Array.isArray(errorMessage)) {
                            // Check for specific validation errors
                            errorMessage.forEach(msg => {
                                if (msg.includes('name.values.') && msg.includes('required')) {
                                    const langCode = msg.split('name.values.')[1].split(' ')[0];
                                    setCurrentLang(langCode);
                                    setError(`name.values.${langCode}`, {
                                        type: 'manual',
                                        message: msg
                                    });
                                }
                            });
                        } else if (errorMessage && typeof errorMessage === 'string') {
                            // Handle string error message
                            if (errorMessage.includes('name.values.') && errorMessage.includes('required')) {
                                const langCode = errorMessage.split('name.values.')[1].split(' ')[0];
                                setCurrentLang(langCode);
                                setError(`name.values.${langCode}`, {
                                    type: 'manual',
                                    message: errorMessage
                                });
                            }
                        } else {
                            console.error('Error updating manager type:', error);
                        }
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
                        const errorMessage = error?.response?.data?.message;
                        console.error('API Error:', errorMessage);

                        if (Array.isArray(errorMessage)) {
                            // Check for specific validation errors
                            errorMessage.forEach(msg => {
                                if (msg.includes('name.values.') && msg.includes('required')) {
                                    const langCode = msg.split('name.values.')[1].split(' ')[0];
                                    setCurrentLang(langCode);
                                    setError(`name.values.${langCode}`, {
                                        type: 'manual',
                                        message: msg
                                    });
                                }
                            });
                        } else if (errorMessage && typeof errorMessage === 'string') {
                            // Handle string error message
                            if (errorMessage.includes('name.values.') && errorMessage.includes('required')) {
                                const langCode = errorMessage.split('name.values.')[1].split(' ')[0];
                                setCurrentLang(langCode);
                                setError(`name.values.${langCode}`, {
                                    type: 'manual',
                                    message: errorMessage
                                });
                            }
                        } else {
                            console.error('Error creating manager type:', error);
                        }
                    }
                }
            );
        }
    };

    // Loading state
    const isLoading = createManagerType.isPending || updateManagerType.isPending || isLoadingDetails;

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

                        {isLoadingDetails ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Loading manager type details...
                            </Alert>
                        ) : (
                            <Stack spacing={3}>
                                {/* Code field */}
                                <TextInput
                                    name="code"
                                    control={control}
                                    label="Code"
                                    placeholder="e.g. DG"
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

                                {!isNameUniversal && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        When using multiple languages, make sure to provide a translation for all languages.
                                        The default language ({defaultLocale}) is required.
                                    </Alert>
                                )}

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
                                            defaultLanguage={defaultLocale}
                                            languages={getLanguageOptions()}
                                            required
                                            defaultLocale={defaultLocale}
                                            applyToAllLanguages={false}
                                        />
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
                                            defaultLanguage={defaultLocale}
                                            languages={getLanguageOptions()}
                                            defaultLocale={defaultLocale}
                                            applyToAllLanguages={false}
                                        />
                                    </Box>
                                )}

                                {/* Active status */}
                                <SwitchInput
                                    name="is_active"
                                    control={control}
                                    label="Active Status"
                                />
                            </Stack>
                        )}
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