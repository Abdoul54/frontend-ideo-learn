import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    Stack,
    Grid,
    CircularProgress
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useAddHaykal, useHaykal } from '@/hooks/api/tenant/useHaykal';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';
import { Controller, useForm } from 'react-hook-form';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import BranchSelector from '@/components/BranchSelector';

const AddHaykalDrawer = ({ open, onClose, currentParentId = 1 }) => {
    // Fetch active languages
    const { data: activeLanguages, isLoading: isLoadingLanguages, error: languagesError } = useActiveLanguages();

    // Find default language from active languages
    const defaultLanguage = activeLanguages?.find(lang => lang.is_default)?.code || 'fr';

    // Create initial form data
    const getInitialFormData = () => {
        const translations = { all: '' };
        
        // Add active languages
        if (activeLanguages && activeLanguages.length > 0) {
            activeLanguages.forEach(lang => {
                translations[lang.code] = '';
            });
        }
        
        return {
            code: '',
            id_parent: currentParentId,
            use_secondary_identifier: false,
            translations: translations
        };
    };

    const methods = useForm({
        defaultValues: getInitialFormData(),
    });

    // Form state
    const { handleSubmit, control, formState: { errors }, setValue, watch, setError, reset } = methods;
    const [currentLang, setCurrentLang] = useState('all');

    // Branch selector state
    const [showBranchSelector, setShowBranchSelector] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState({
        id: currentParentId,
        title: 'Platform'
    });

    // Update form when languages load
    useEffect(() => {
        if (activeLanguages && activeLanguages.length > 0) {
            // Update form with current values
            const currentValues = methods.getValues();
            const updatedTranslations = { all: currentValues.translations?.all || '' };
            
            // Add each active language
            activeLanguages.forEach(lang => {
                updatedTranslations[lang.code] = currentValues.translations?.[lang.code] || '';
            });
            
            // Update form
            methods.setValue('translations', updatedTranslations);
        }
    }, [activeLanguages]);

    // Reset form when drawer opens/closes
    useEffect(() => {
        if (!open) {
            reset(getInitialFormData());
            setGeneralError('');
            setSelectedBranch({
                id: currentParentId,
                title: 'Platform'
            });
        }
    }, [open, activeLanguages]);

    // Mutation hook
    const { mutate: addHaykal, isLoading, isError, error, isSuccess } = useAddHaykal();

    // Error handling
    const [generalError, setGeneralError] = useState('');

    const handleCloseDrawer = () => {
        reset(getInitialFormData());
        setGeneralError('');
        onClose();
    };

    // Effect to close drawer on successful submission
    useEffect(() => {
        if (isSuccess) {
            handleCloseDrawer();
        }
    }, [isSuccess, onClose]);

    // Handle branch selection
    const handleBranchChange = (selectedValues) => {
        // Since we're using single selection mode, we'll only have one value
        if (selectedValues && selectedValues.length === 1) {
            const selectedId = selectedValues[0];
            setValue('id_parent', parseInt(selectedId, 10));
        }
    };

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
            // Fallback languages
            options.push({ code: 'fr', label: 'French', isDefault: true });
            options.push({ code: 'id', label: 'Indonesian' });
        }

        return options;
    };

    // Form submission handler
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

        // Prepare API payload - only include non-empty translations
        const cleanTranslations = Object.entries(translations).reduce((acc, [key, value]) => {
            const trimmedValue = value?.trim() || '';
            if (trimmedValue) {
                acc[key] = trimmedValue;
            }
            return acc;
        }, {});

        // Create final payload
        const payload = {
            ...data,
            translations: cleanTranslations
        };

        // Submit to API
        addHaykal(payload, {
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
                    }
                } else {
                    setGeneralError('Failed to create branch');
                }
            }
        });
    };

    return (
        <DrawerFormContainer
            open={open}
            onClose={onClose}
            title="Create a new branch"
            description="Add a new branch to your hierarchy"
            width={500}
        >
            {isError && generalError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {generalError}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <Stack spacing={3}>
                            {/* General Information */}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                                General Information
                            </Typography>

                            <Controller
                                name="code"
                                control={control}
                                rules={{ required: 'Code is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Code"
                                        error={!!errors.code}
                                        helperText={errors.code?.message || "The code of the branch"}
                                    />
                                )}
                            />

                            {/* Destination/Parent Selection */}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                                Destination
                            </Typography>

                            <Box sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                p: 2,
                                position: 'relative'
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <i className="lucide-folder" style={{ width: 20, height: 20 }} />
                                        <Typography variant="body2">
                                            {watch('id_parent') === currentParentId ? 'Platform' : selectedBranch.title}
                                        </Typography>
                                    </Stack>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setShowBranchSelector(!showBranchSelector)}
                                        startIcon={<i className={`lucide-${showBranchSelector ? 'x' : 'folder'}`} style={{ width: 16, height: 16 }} />}
                                    >
                                        {showBranchSelector ? 'Close Panel' : 'Select Branch'}
                                    </Button>
                                </Stack>

                                {showBranchSelector && (
                                    <Box sx={{ mt: 2, height: 400 }}>
                                        <Controller
                                            name="id_parent"
                                            control={control}
                                            render={({ field }) => (
                                                <BranchSelector
                                                    control={control}
                                                    name="id_parent"
                                                    selectedValues={field.value != null ? [field.value] : []}
                                                    onChange={(selectedIds) => {
                                                        handleBranchChange(selectedIds);
                                                        // Update selected branch info for display
                                                        if (selectedIds && selectedIds.length === 1) {
                                                            // This would be set from BranchSelector's onBranchSelect callback
                                                            // For now, we'll just update the ID
                                                            setSelectedBranch(prev => ({
                                                                ...prev,
                                                                id: selectedIds[0]
                                                            }));
                                                        }
                                                    }}
                                                    singleSelect={true} // Enable single select mode
                                                    onBranchSelect={(branch) => {
                                                        setSelectedBranch({
                                                            id: branch.id,
                                                            title: branch.title
                                                        });
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Translations */}
                            <Typography variant="subtitle1" fontWeight="bold">
                                Translations
                            </Typography>

                            {isLoadingLanguages ? (
                                <Box display="flex" justifyContent="center" py={2}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : languagesError ? (
                                <Alert severity="error">
                                    Failed to load languages. Please try again.
                                </Alert>
                            ) : (
                                <>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        {defaultLanguage ?
                                            `You must provide either an "All Languages" translation or a translation in the default language (${defaultLanguage}).` :
                                            "You must provide at least one translation."
                                        }
                                    </Alert>
                                    <Controller
                                        name="translations"
                                        control={control}
                                        render={({ field }) => (
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
                                        )}
                                    />
                                </>
                            )}

                            {errors.translations && (
                                <Typography color="error" variant="body2">
                                    {errors.translations.message}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ p: 2, mt: 2, backgroundColor: 'background.paper' }}>
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create branch'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </form>
        </DrawerFormContainer>
    );
};

export default AddHaykalDrawer;