import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    Stack,
    Grid
} from '@mui/material';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useAddHaykal, useHaykal } from '@/hooks/api/tenant/useHaykal';
import { Controller, useForm } from 'react-hook-form';
import MultilingualTextInput from '@/components/inputs/MultilingualTextInput';
import BranchSelector from '@/components/BranchSelector';

const AddHaykalDrawer = ({ open, onClose, currentParentId = 1 }) => {
    const initialFormData = {
        code: '',
        id_parent: currentParentId,
        use_secondary_identifier: false,
        translations: {
            all: '',
            fr: ''
        }
    };

    const methods = useForm({
        defaultValues: initialFormData,
    });

    // Form state
    const { handleSubmit, control, formState: { errors }, setValue, watch } = methods;
    const [currentLang, setCurrentLang] = useState('all');

    // Branch selector state
    const [showBranchSelector, setShowBranchSelector] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState({
        id: currentParentId,
        title: 'Platform'
    });

    useEffect(() => {
        if (!open) {
            methods.reset(initialFormData); // Reset form values
            setGeneralError('');
            setSelectedBranch({
                id: currentParentId,
                title: 'Platform'
            });
        }
    }, [open]);

    // Mutation hook
    const { mutate: addHaykal, isLoading, isError, error, isSuccess } = useAddHaykal();

    // Error handling
    const [generalError, setGeneralError] = useState('');

    const handleCloseDrawer = () => {
        methods.reset(initialFormData); // Reset form values
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

    // Form submission handler
    const onSubmit = (data) => {
        if (!data.translations?.all?.trim() && !data.translations?.fr?.trim()) {
            methods.setError('translations', {
                type: 'manual',
                message: 'At least one translation (All or French) is required'
            });
            return;
        }

        // Prepare API payload
        const payload = {
            ...data,
            translations: {
                all: data.translations.all.trim(),
                fr: data.translations.fr.trim()
            }
        };

        // Submit to API
        addHaykal(payload, {
            onError: (err) => {
                setGeneralError(err?.response?.data?.message || 'Failed to create haykal');
            }
        });
    };

    return (
        <DrawerFormContainer
            open={open}
            onClose={onClose}
            title="Create a new haykal"
            description="Add a new haykal to your hierarchy"
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
                                        helperText={errors.code?.message || "The code of the haykal"}
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

                            <Controller
                                name="translations"
                                control={control}
                                render={({ field }) => (
                                    <MultilingualTextInput
                                        name="translations"
                                        control={control}
                                        label="Translations"
                                        currentLang={currentLang}
                                        onLanguageChange={setCurrentLang}
                                        defaultLanguage="all"
                                        languages={[
                                            { code: 'all', label: 'All Languages' },
                                            { code: 'fr', label: 'French' }
                                        ]}
                                        applyToAllLanguages={currentLang === 'all'}
                                        required
                                        InputProps={{
                                            startAdornment: <i className="lucide-globe" style={{ marginRight: 8 }} />,
                                        }}
                                        error={!!errors.translations}
                                        helperText={errors.translations?.message}
                                    />
                                )}
                            />

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
                                    {isLoading ? 'Creating...' : 'Create Haykal'}
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