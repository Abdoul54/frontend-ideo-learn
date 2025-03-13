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

const EditHaykalDrawer = ({ open, onClose, haykalId }) => {
    const isHaykalIdNumeric = !isNaN(haykalId) && !isNaN(parseFloat(haykalId));
    const [currentLang, setCurrentLang] = useState('all');

    // Use React Hook Form
    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
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
            reset({
                code: haykalDetails.data.code,
                translations: {
                    all: haykalDetails.data.translations.all || '',
                    fr: haykalDetails.data.translations.fr || '',
                    en: haykalDetails.data.translations.en || ''
                },
                use_secondary_identifier: !isHaykalIdNumeric,
            });
        }
    }, [haykalDetails, isHaykalIdNumeric, reset]);

    // Mutation hook for update
    const { mutate: updateHaykal, isLoading, isError } = useUpdateHaykal();

    // Error state
    const [generalError, setGeneralError] = useState('');

    // Handle translation changes from MultilingualTextInput
    const handleTranslationChange = (lang, value) => {
        setValue(`translations.${lang}`, value);
    };

    // Submit handler
    const onSubmit = (data) => {
        const payload = {
            code: data.code,
            use_secondary_identifier: data.use_secondary_identifier,
            translations: {
                ...(data.translations.all && { all: data.translations.all.trim() }),
                ...(data.translations.fr && { fr: data.translations.fr.trim() }),
                ...(data.translations.en && { en: data.translations.en.trim() })
            }
        };

        updateHaykal(
            { haykalId, formData: payload },
            {
                onSuccess: () => {
                    onClose();
                },
                onError: (err) => {
                    setGeneralError(err?.response?.data?.message || 'Failed to update haykal');
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
                        <MultilingualTextInput
                            name="translations"
                            control={control}
                            label="Branch Name"
                            // onChange={handleTranslationChange}
                            currentLang={currentLang}
                            onLanguageChange={setCurrentLang}
                            defaultLanguage="all"
                            languages={[
                                { code: 'all', label: 'Universal' },
                                { code: 'fr', label: 'French' },
                                { code: 'en', label: 'English' }
                            ]}
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