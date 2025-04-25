'use client';

import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    List,
    ListItem,
    TextField,
    FormControlLabel,
    Switch,
    IconButton,
    Typography,
    Stack,
    ListItemText,
    Alert
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useState, useEffect } from "react";
import MultilingualTextInput from "@/components/inputs/MultilingualTextInput";
import SelectInput from "@/components/inputs/SelectInput";
import TextInput from "@/components/inputs/TextInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { usePostUserField, useUpdateUserField } from "@/hooks/api/tenant/useUserFields";
import { createSchema, fieldTypes } from "@/constants/UserFields";
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';

const UserFieldDrawer = ({ open, onClose, data, defaultLanguage = 'fr' }) => {
    // Fetch active languages
    const { data: activeLanguages, isLoading: isLoadingLanguages } = useActiveLanguages();

    // Find default language from active languages if available
    const systemDefaultLanguage = activeLanguages?.find(lang => lang.is_default)?.code || defaultLanguage;

    const [isUniversal, setIsUniversal] = useState(false);
    const [schema, setSchema] = useState(() => createSchema(false, systemDefaultLanguage));
    const [currentLang, setCurrentLang] = useState(systemDefaultLanguage);
    const addUserField = usePostUserField();
    const updateUserField = useUpdateUserField();

    // Create default values dynamically based on active languages
    const getDefaultValues = () => {
        // Initialize with all universal language
        const translations = { all: '' };

        // Add all active languages with empty values
        if (activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                translations[lang.code] = '';
            });
        } else {
            // Fallback translations if no active languages
            translations.fr = '';
            translations.en = '';
            translations.ar = '';
            translations.es = '';
        }

        return {
            type: 'textfield',
            mandatory: false,
            invisible_to_user: false,
            translations: translations,
            //sequence: 1,
            dropdown_options: [],
            settings: {}
        };
    };

    // Update schema when isUniversal or defaultLanguage changes
    useEffect(() => {
        setSchema(createSchema(isUniversal, systemDefaultLanguage, activeLanguages));
    }, [isUniversal, systemDefaultLanguage, activeLanguages]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: getDefaultValues(activeLanguages)
    });

    useEffect(() => {
        if (!open) return;

        if (data) {
            // Build translations object with all active languages
            const translations = { all: '' };

            if (activeLanguages && activeLanguages.length > 0) {
                activeLanguages.forEach(lang => {
                    translations[lang.code] = '';
                });
            } else {
                translations.fr = '';
                translations.en = '';
                translations.ar = '';
                translations.es = '';
            }

            // Override with actual translations from data
            if (data.translations) {
                Object.entries(data.translations).forEach(([key, value]) => {
                    if (translations.hasOwnProperty(key)) {
                        translations[key] = value || '';
                    }
                });
            }

            const newData = {
                type: data?.type || 'textfield',
                mandatory: data?.mandatory || false,
                invisible_to_user: data?.invisible_to_user || false,
                translations: translations,
                //sequence: data?.sequence || 1
            };

            if (data?.type === 'dropdownfield') {
                // Process dropdown options to include all languages
                newData.dropdown_options = (data?.dropdown_options || []).map(option => {
                    const optionTranslations = { all: '' };

                    if (activeLanguages && activeLanguages.length > 0) {
                        activeLanguages.forEach(lang => {
                            optionTranslations[lang.code] = '';
                        });
                    } else {
                        optionTranslations.fr = '';
                        optionTranslations.en = '';
                        optionTranslations.ar = '';
                        optionTranslations.es = '';
                    }

                    // Override with actual option translations
                    if (option.translations) {
                        Object.entries(option.translations).forEach(([key, value]) => {
                            if (optionTranslations.hasOwnProperty(key)) {
                                optionTranslations[key] = value || '';
                            }
                        });
                    }

                    return {
                        ...option,
                        translations: optionTranslations
                    };
                });
            }

            if (data?.type === 'iframe') {
                newData.settings = data?.settings || {};
            }

            methods.reset(newData);

            // Set universal mode if 'all' translation is present
            setIsUniversal(!!data.translations?.all);
        } else {
            methods.reset(getDefaultValues(activeLanguages));
            setIsUniversal(false);
        }
    }, [data, open, activeLanguages]);

    const { control, handleSubmit, watch, setValue, setError } = methods;
    const selectedType = watch('type');

    // Prepare language options for the MultilingualTextInput
    const getLanguageOptions = () => {
        // Start with All Languages option
        const options = [{ code: 'all', label: 'All Languages' }];

        // Add active languages from API if available
        if (activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                options.push({
                    code: lang.code,
                    label: lang.name || lang.native_name,
                    isDefault: lang.is_default
                });
            });
        } else {
            // Fallback to default languages
            options.push({ code: 'en', label: 'English' });
            options.push({ code: 'fr', label: 'French' });
            options.push({ code: 'ar', label: 'Arabic' });
            options.push({ code: 'es', label: 'Spanish' });
        }

        return options;
    };

    const onSubmit = (formData) => {
        console.log("Form being submitted", formData);
        console.log("Form state", methods.formState);

        // Create a copy of the form data to modify
        const submissionData = structuredClone(formData);

        // Handle dropdown options
        if (submissionData.type !== 'dropdownfield') {
            submissionData.dropdown_options = [];
        }

        // Handle iframe settings
        if (submissionData.type !== 'iframe') {
            submissionData.settings = {}; // Use empty object instead of null
        }

        // Check if translations are valid
        if (!isUniversal) {
            // Check if default language translation is provided when universal is not used
            const hasDefaultTranslation = systemDefaultLanguage &&
                submissionData.translations[systemDefaultLanguage] &&
                submissionData.translations[systemDefaultLanguage].trim() !== '';

            if (!hasDefaultTranslation) {
                setError(`translations.${systemDefaultLanguage}`, {
                    type: 'manual',
                    message: `The default language (${systemDefaultLanguage}) translation is required when not using universal translation`
                });
                return;
            }

            // Check dropdown options if applicable
            if (submissionData.type === 'dropdownfield' && submissionData.dropdown_options?.length > 0) {
                let hasOptionError = false;

                submissionData.dropdown_options.forEach((option, index) => {
                    const hasOptionDefaultTranslation = option.translations[systemDefaultLanguage] &&
                        option.translations[systemDefaultLanguage].trim() !== '';

                    if (!hasOptionDefaultTranslation) {
                        setError(`dropdown_options.${index}.translations.${systemDefaultLanguage}`, {
                            type: 'manual',
                            message: `The default language (${systemDefaultLanguage}) translation is required`
                        });
                        hasOptionError = true;
                    }
                });

                if (hasOptionError) {
                    return;
                }
            }
        }

        // Get active language codes
        const activeLanguageCodes = activeLanguages ?
            activeLanguages.map(lang => lang.code) :
            [systemDefaultLanguage]; // Fallback to just the default language

        // Handle translations based on universal flag
        if (isUniversal) {
            // Keep only the universal translation and remove language-specific ones
            const universalValue = submissionData.translations.all || '';

            // Start with empty object and only add 'all' if it has content
            const cleanTranslations = {};
            if (universalValue.trim()) {
                cleanTranslations.all = universalValue.trim();
            }

            submissionData.translations = cleanTranslations;

            if (submissionData.dropdown_options?.length > 0) {
                submissionData.dropdown_options.forEach(option => {
                    const optionUniversalValue = option.translations.all || '';

                    // Start with empty object and only add 'all' if it has content
                    const cleanOptionTranslations = {};
                    if (optionUniversalValue.trim()) {
                        cleanOptionTranslations.all = optionUniversalValue.trim();
                    }

                    option.translations = cleanOptionTranslations;
                });
            }
        } else {
            // If not universal, remove the all translation but ensure language-specific ones exist
            const cleanTranslations = Object.entries(submissionData.translations).reduce((acc, [key, value]) => {
                const trimmedValue = value?.trim() || '';
                // Include if it's an active language or the default language, and it has content
                if (key !== 'all' && (activeLanguageCodes.includes(key) || key === systemDefaultLanguage) && trimmedValue) {
                    acc[key] = trimmedValue;
                }
                return acc;
            }, {});

            submissionData.translations = cleanTranslations;

            if (submissionData.dropdown_options?.length > 0) {
                submissionData.dropdown_options.forEach(option => {
                    // Clean option translations - only include non-empty values for active languages
                    const cleanOptionTranslations = Object.entries(option.translations).reduce((acc, [key, value]) => {
                        const trimmedValue = value?.trim() || '';
                        // Include if it's an active language or the default language, and it has content
                        if (key !== 'all' && (activeLanguageCodes.includes(key) || key === systemDefaultLanguage) && trimmedValue) {
                            acc[key] = trimmedValue;
                        }
                        return acc;
                    }, {});

                    option.translations = cleanOptionTranslations;
                });
            }
        }

        // Convert boolean values to integers
        submissionData.mandatory = submissionData.mandatory ? 1 : 0;
        submissionData.invisible_to_user = submissionData.invisible_to_user ? 1 : 0;

        if (data) {

            if (submissionData?.dropdown_options) {
                // compare the new dropdown options with the old ones
                const oldOptions = data.dropdown_options || [];
                const newOptions = submissionData.dropdown_options || [];
                const deletedOpts = oldOptions.filter(oldOption => {
                    return !newOptions.some(newOption => newOption.id_option === oldOption.id_option);
                });
                const updatedOpts = newOptions.filter(newOption => {
                    return oldOptions.some(oldOption => oldOption.id_option === newOption.id_option);
                });
                const addedOpts = newOptions.filter(newOption => {
                    return !oldOptions.some(oldOption => oldOption.id_option === newOption.id_option);
                });

                submissionData.dropdown_options = {}
                submissionData.dropdown_options.updated = updatedOpts;
                submissionData.dropdown_options.deleted = deletedOpts;
                submissionData.dropdown_options.new = addedOpts;
            }

            updateUserField.mutateAsync({ id: data?.id, data: submissionData })
                .then(() => {
                    onClose();
                    methods.reset(getDefaultValues());
                })
                .catch(error => {
                    console.error('Error updating user field:', error);

                    // Handle API error response
                    if (error?.response?.data?.message) {
                        const errorMessage = Array.isArray(error.response.data.message)
                            ? error.response.data.message[0]
                            : error.response.data.message;

                        // If the error is about default language, focus on that field
                        if (errorMessage.includes('default language') && systemDefaultLanguage) {
                            setCurrentLang(systemDefaultLanguage);
                            setError(`translations.${systemDefaultLanguage}`, {
                                type: 'manual',
                                message: errorMessage
                            });
                        }
                    }

                    // Reset form state for re-submission
                    methods.clearErrors();
                });
        } else {
            addUserField.mutateAsync(submissionData)
                .then(() => {
                    onClose();
                    methods.reset(getDefaultValues());
                })
                .catch(error => {
                    console.error('Error adding user field:', error);

                    // Handle API error response
                    if (error?.response?.data?.message) {
                        const errorMessage = Array.isArray(error.response.data.message)
                            ? error.response.data.message[0]
                            : error.response.data.message;

                        // If the error is about default language, focus on that field
                        if (errorMessage.includes('default language') && systemDefaultLanguage) {
                            setCurrentLang(systemDefaultLanguage);
                            setError(`translations.${systemDefaultLanguage}`, {
                                type: 'manual',
                                message: errorMessage
                            });
                        }
                    }

                    // Reset form state for re-submission
                    methods.clearErrors();
                });
        }
    };

    const handleTranslationTypeChange = (value) => {
        setIsUniversal(value);

        // Get all active language codes
        const languageCodes = activeLanguages ?
            activeLanguages.map(lang => lang.code) :
            ['fr', 'en', 'es', 'ar'];

        // Reset main translations
        const resetTranslations = { all: '' };
        languageCodes.forEach(code => {
            resetTranslations[code] = '';
        });
        setValue('translations', resetTranslations);

        // Reset all dropdown options translations
        const currentOptions = watch('dropdown_options') || [];
        const resetOptions = currentOptions.map(option => {
            const optionTranslations = { all: '' };
            languageCodes.forEach(code => {
                optionTranslations[code] = '';
            });

            return {
                ...option,
                translations: optionTranslations
            };
        });
        setValue('dropdown_options', resetOptions);
    };

    const handleAddDropdownOption = () => {
        const currentOptions = watch('dropdown_options') || [];

        // Create new option with all language translations
        const newOptionTranslations = { all: '' };

        if (activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                newOptionTranslations[lang.code] = '';
            });
        } else {
            // Fallback
            newOptionTranslations.fr = '';
            newOptionTranslations.en = '';
            newOptionTranslations.es = '';
            newOptionTranslations.ar = '';
        }

        setValue('dropdown_options', [...currentOptions, {
            translations: newOptionTranslations
        }]);
    };

    const handleRemoveDropdownOption = (index) => {
        const currentOptions = watch('dropdown_options');
        setValue('dropdown_options', currentOptions.filter((_, i) => i !== index));
    };

    return (
        <DrawerFormContainer
            title="User Field"
            open={open}
            onClose={onClose}
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
                        p: 2,
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'var(--mui-palette-background-paper)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}>
                        <Grid container rowSpacing={3} padding={2} component={List}>
                            {/* Field Type Selection */}
                            <Grid item xs={12} component={ListItem}>
                                <SelectInput
                                    control={control}
                                    name="type"
                                    options={fieldTypes}
                                />
                            </Grid>

                            {/* Universal Translation Toggle */}
                            <Grid item xs={12} component={ListItem}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isUniversal}
                                            onChange={(e) => handleTranslationTypeChange(e.target.checked)}
                                        />
                                    }
                                    label={<ListItemText
                                        primary="Apply to all languages"
                                        secondary="Enable to use a single translation across all languages."
                                    />}
                                />
                            </Grid>

                            {!isUniversal && (
                                <Grid item xs={12} component={ListItem}>
                                    <Alert severity="info">
                                        When using multiple languages, make sure to provide a translation for the default language ({systemDefaultLanguage}).
                                    </Alert>
                                </Grid>
                            )}

                            {/* Main Translation Fields */}
                            {isUniversal ? (
                                <Grid item xs={12} component={ListItem}>
                                    <TextInput
                                        name="translations.all"
                                        control={control}
                                        label="Universal"
                                        type="text"
                                    />
                                </Grid>
                            ) : (
                                <Grid item xs={12} component={ListItem}>
                                    <MultilingualTextInput
                                        name="translations"
                                        control={control}
                                        label="Field Translation"
                                        applyToAllLanguages={false}
                                        currentLang={currentLang}
                                        onLanguageChange={setCurrentLang}
                                        defaultLanguage={systemDefaultLanguage}
                                        defaultLocale={systemDefaultLanguage}
                                        languages={getLanguageOptions()}
                                        required
                                    />
                                </Grid>
                            )}

                            {/* Other Fields */}
                            {/* <Grid item xs={12} component={ListItem}>
                                <TextInput
                                    name="sequence"
                                    control={control}
                                    label="Sequence"
                                    type="number"
                                />
                            </Grid> */}

                            {/* Switches */}
                            <Grid item xs={12} component={ListItem}>
                                <SwitchInput
                                    name="mandatory"
                                    control={control}
                                    label={
                                        <ListItemText
                                            primary="Mandatory"
                                            secondary="Field must be completed"
                                        />
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} component={ListItem}>
                                <SwitchInput
                                    name="invisible_to_user"
                                    control={control}
                                    label={
                                        <ListItemText
                                            primary="Invisible to User"
                                            secondary="Field exists but isn't displayed"
                                        />
                                    }
                                />
                            </Grid>

                            {/* IFrame Fields */}
                            {selectedType === 'iframe' && (
                                <>
                                    <Grid item xs={12} component={ListItem}>
                                        <TextInput
                                            name="settings.url"
                                            control={control}
                                            label="URL"
                                            type="text"
                                        />
                                    </Grid>
                                    <Grid item xs={12} component={ListItem}>
                                        <TextInput
                                            name="settings.iframe_height"
                                            control={control}
                                            label="Height"
                                            type="text"
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Dropdown Options */}
                            {selectedType === 'dropdownfield' && (
                                <Grid container sx={{
                                    backgroundColor: 'background.paper',
                                    border: !watch('dropdown_options') || watch('dropdown_options')?.length === 0 ? 0 : 1,
                                    borderStyle: 'dashed',
                                    borderRadius: 1,
                                    p: 2
                                }}>
                                    {(!watch('dropdown_options') || watch('dropdown_options')?.length === 0) && (
                                        <Grid item xs={12} sx={{ mb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<i className="solar-add-circle-outline" />}
                                                onClick={handleAddDropdownOption}
                                                size="small"
                                            >
                                                Add Option
                                            </Button>
                                        </Grid>
                                    )}

                                    {watch('dropdown_options')?.map((option, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            key={index}
                                            sx={{
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 2,
                                                backgroundColor: 'background.paper',
                                                mb: 2
                                            }}
                                        >
                                            <Grid container spacing={2} sx={{ p: 2 }}>
                                                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="h5">Option {index + 1}</Typography>
                                                    <Stack direction="row" spacing={2}>
                                                        <IconButton onClick={handleAddDropdownOption}
                                                            sx={{
                                                                color: 'text.secondary'
                                                            }}
                                                        >
                                                            <i className="solar-add-circle-outline" />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleRemoveDropdownOption(index)}
                                                            sx={{
                                                                color: 'error.main'
                                                            }}
                                                        >
                                                            <i className="solar-trash-bin-trash-outline" />
                                                        </IconButton>
                                                    </Stack>
                                                </Grid>
                                                {isUniversal ? (
                                                    <Grid item xs={12}>
                                                        <Controller
                                                            name={`dropdown_options.${index}.translations.all`}
                                                            control={control}
                                                            render={({ field, fieldState }) => (
                                                                <TextField
                                                                    {...field}
                                                                    label={`Option ${index + 1} - Universal`}
                                                                    fullWidth
                                                                    size="small"
                                                                    error={!!fieldState.error}
                                                                    helperText={fieldState.error?.message || ''}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                ) : (
                                                    <Grid item xs={12}>
                                                        <MultilingualTextInput
                                                            name={`dropdown_options.${index}.translations`}
                                                            control={control}
                                                            label={`Option ${index + 1}`}
                                                            applyToAllLanguages={false}
                                                            currentLang={currentLang}
                                                            onLanguageChange={setCurrentLang}
                                                            defaultLanguage={systemDefaultLanguage}
                                                            defaultLocale={systemDefaultLanguage}
                                                            languages={getLanguageOptions()}
                                                            required
                                                        />
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                        <Button onClick={onClose} disabled={addUserField?.isPending || updateUserField?.isPending}>Cancel</Button>
                        <Button variant="contained" color="primary" type="submit"
                            disabled={addUserField?.isPending || updateUserField?.isPending}>Submit</Button>
                    </CardActions>
                </Card>
            </FormProvider>
        </DrawerFormContainer>
    );
};

export default UserFieldDrawer;