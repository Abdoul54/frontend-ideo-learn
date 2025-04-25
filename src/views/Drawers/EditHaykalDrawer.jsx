import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Typography,
    Divider,
    Alert,
    Stack,
    Grid,
    Box,
    CircularProgress
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useUpdateHaykal } from '@/hooks/api/tenant/useHaykal';
import { useQuery } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { axiosInstance } from '@/lib/axios';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import { useForm, Controller } from 'react-hook-form';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';

const EditHaykalDrawer = ({ open, onClose, haykalId }) => {
    const isHaykalIdNumeric = !isNaN(haykalId) && !isNaN(parseFloat(haykalId));

    // Fetch active languages
    const { data: activeLanguages, isLoading: isLoadingLanguages } = useActiveLanguages();

    // Find default language from active languages
    const defaultLanguage = activeLanguages?.find(lang => lang.is_default)?.code || 'fr';

    const [currentLang, setCurrentLang] = useState('all');

    // Use React Hook Form
    const { control, handleSubmit, setValue, formState: { errors }, reset, setError } = useForm({
        defaultValues: {
            code: '',
            use_secondary_identifier: !isHaykalIdNumeric,
            translations: {
                all: '',
                fr: '',
                en: ''
            }
        }
    });

    // Fetch haykal details
    const { data: haykalDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['haykal', haykalId],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/tenant/tanzim/v1/haykal/${haykalId}`);
            return data;
        },
        enabled: !!haykalId && open, // Only fetch when the drawer is open and haykalId is provided
    });

    // Update form data when details load
    useEffect(() => {
        if (haykalDetails) {
            // Initialize translations object with empty strings for all available languages
            const translations = { all: '' };

            if (activeLanguages) {
                activeLanguages.forEach(lang => {
                    translations[lang.code] = '';
                });
            } else {
                // Fallback to common languages if API data not available
                translations.fr = '';
                translations.en = '';
            }

            // Now merge with actual translations from API
            if (haykalDetails.data.translations) {
                Object.entries(haykalDetails.data.translations).forEach(([key, value]) => {
                    translations[key] = value || '';
                });
            }

            reset({
                code: haykalDetails.data.code,
                translations: translations,
                use_secondary_identifier: !isHaykalIdNumeric,
            });
        }
    }, [haykalDetails, isHaykalIdNumeric, reset, activeLanguages]);

    // Mutation hook for update
    const { mutate: updateHaykal, isLoading, isError } = useUpdateHaykal();

    // Error state
    const [generalError, setGeneralError] = useState('');

    // Prepare language options for the MultilingualTextInput
    const getLanguageOptions = () => {
        // Always include "All Languages" option
        const options = [{ code: 'all', label: 'All Languages' }];

        // Add active languages from API
        if (activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                options.push({
                    code: lang.code,
                    label: lang.name || lang.native_name,
                    isDefault: lang.is_default
                });
            });
        } else {
            // Fallback to common languages if API data not available
            options.push({ code: 'fr', label: 'French' });
            options.push({ code: 'en', label: 'English' });
        }

        return options;
    };

    // Submit handler
    const onSubmit = (data) => {
        const translations = data.translations || {};

        // Check if at least one translation is provided (either 'all' or the default language)
        const hasAllTranslation = translations.all && translations.all.trim() !== '';
        const hasDefaultTranslation = defaultLanguage && translations[defaultLanguage] &&
            translations[defaultLanguage].trim() !== '';

        if (!hasAllTranslation && !hasDefaultTranslation) {
            setError('translations', {
                type: 'manual',
                message: `Either "All Languages" or the default language (${defaultLanguage}) translation is required`
            });
            return;
        }

        // Prepare API payload - only include non-empty translations for active languages
        const activeLanguageCodes = activeLanguages ?
            activeLanguages.map(lang => lang.code) :
            [defaultLanguage]; // Fallback to just the default language

        const cleanTranslations = Object.entries(translations).reduce((acc, [key, value]) => {
            const trimmedValue = value?.trim() || '';
            // Include if it's 'all', an active language, or the default language, and it has content
            if ((key === 'all' || activeLanguageCodes.includes(key) || key === defaultLanguage) && trimmedValue) {
                acc[key] = trimmedValue;
            }
            return acc;
        }, {});

        const payload = {
            code: data.code,
            use_secondary_identifier: data.use_secondary_identifier,
            translations: cleanTranslations
        };

        updateHaykal(
            { haykalId, formData: payload },
            {
                onSuccess: () => {
                    onClose();
                },
                onError: (err) => {
                    if (err?.response?.data?.message) {
                        // Handle array or string error messages
                        const errorMessage = Array.isArray(err.response.data.message)
                            ? err.response.data.message[0]
                            : err.response.data.message;

                        setGeneralError(errorMessage);

                        // If the error is about default language, focus on that field
                        if (errorMessage.includes('default language') && defaultLanguage) {
                            setCurrentLang(defaultLanguage);
                            setError(`translations.${defaultLanguage}`, {
                                type: 'manual',
                                message: errorMessage
                            });
                        }
                    } else {
                        setGeneralError('Failed to update haykal');
                    }
                }
            }
        );
    };

    return (
        <DrawerFormContainer
            open={open}
            onClose={onClose}
            title="Edit Haykal"
            description="Modify the selected haykal"
            width={500}
        >
            {isError && generalError && (
                <Alert severity="error" sx={{ mb: 2 }}>{generalError}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Stack spacing={3}>
                        {/* General Info */}
                        <Typography variant="subtitle1" fontWeight="bold">General Information</Typography>
                        <Controller
                            name="code"
                            control={control}
                            rules={{ required: "Code is required" }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Code"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                />
                            )}
                        />

                        {/* Translations - Using MultilingualTextInput */}
                        <Typography variant="subtitle1" fontWeight="bold">Translations</Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            {defaultLanguage ?
                                `You must provide either an "All Languages" translation or a translation in the default language (${defaultLanguage}).` :
                                "You must provide at least one translation."
                            }
                        </Alert>

                        <MultilingualTextInput
                            name="translations"
                            control={control}
                            label="Branch Name"
                            currentLang={currentLang}
                            onLanguageChange={setCurrentLang}
                            defaultLanguage="all"
                            languages={getLanguageOptions()}
                            applyToAllLanguages={currentLang === 'all'}
                            required
                            defaultLocale={defaultLanguage}
                            InputProps={{
                                startAdornment: <i className="lucide-globe" style={{ marginRight: 8 }} />,
                            }}
                            error={!!errors.translations}
                            helperText={errors.translations?.message}
                        />
                    </Stack>
                </Box>

                {/* Actions */}
                <Box
                    sx={{
                        p: 2,
                        mt: 2,
                        backgroundColor: 'background.paper'
                    }}
                >
                    <Grid container spacing={2} justifyContent="flex-end">
                        <Grid item>
                            <Button onClick={onClose} variant="outlined">
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading}
                                startIcon={isLoading ? <CircularProgress size={16} /> : null}
                            >
                                {isLoading ? 'Updating...' : 'Update Haykal'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </DrawerFormContainer>
    );
};

export default EditHaykalDrawer;