'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Button,
    FormControl,
    Alert,
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import SmartMultilangTextInput from '@/components/inputs/MultilangInput';

// Import widget hooks
import { useWelcome, useUpdateWelcome } from '@/hooks/api/tenant/widgets/useWidgets';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';
import MultilangTextEditor from '@/components/inputs/MultilangTexEditor';

const WelcomeSettings = () => {
    const { data: session } = useSession();
    const { data: welcome, isLoading, error, refetch } = useWelcome();
    const updateWelcomeMutation = useUpdateWelcome();
    const { data: languagesData, isLoading: languagesLoading } = useActiveLanguages();

    // Transform languages data - ensure it's always an array
    const languages = Array.isArray(languagesData) ? languagesData : [];

    // Form state management - add defaultValues when we have data
    const { control, handleSubmit, formState: { errors }, setValue, getValues, watch, reset } = useForm({
        defaultValues: {
            title: {},
            content: {}
        }
    });

    // Extract welcome data, handling different potential structures
    const extractWelcomeData = () => {
        if (!welcome) return null;

        // Try direct access first
        if (welcome.title && welcome.content) {
            return welcome;
        }

        // Then check for data.title and data.content
        if (welcome.data && welcome.data.title && welcome.data.content) {
            return welcome.data;
        }

        // For other structures, log and return null
        console.log("Unexpected welcome data structure:", welcome);
        return null;
    };

    // Update form when data is loaded
    useEffect(() => {
        const welcomeData = extractWelcomeData();

        if (welcomeData) {
            // Ensure title is always an object
            let title = welcomeData.title || {};
            if (Array.isArray(title)) {
                title = {}; // Reset to empty object if invalid type
            }

            // Convert content values to proper HTML format
            const formattedContent = {};
            Object.entries(welcomeData.content || {}).forEach(([lang, text]) => {
                formattedContent[lang] = text.startsWith('<') ? text : `<p>${text}</p>`;
            });

            // Reset form with proper structure
            reset({
                title: title,
                content: formattedContent
            });
        }
    }, [welcome, reset]);

    const onSubmit = async (data) => {
        // Ensure title is always an object
        const sanitizedData = {
            ...data,
            title: data.title || {}, // Prevent array values
            content: Object.fromEntries(
                Object.entries(data.content).map(([lang, text]) => [
                    lang,
                    text.replace(/<p>\s*<\/p>/g, '') // Clean empty paragraphs
                ])
            )
        };

        console.log("Submitting sanitized data:", sanitizedData);
        updateWelcomeMutation.mutate(sanitizedData);
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load welcome settings. Please try again later.
            </Alert>
        );
    }

    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12 }}>
                <Box>
                    {isLoading || languagesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={3}>
                                <Grid item size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <SmartMultilangTextInput
                                            name="title"
                                            control={control}
                                            label="Welcome Title"
                                            setValue={setValue}
                                            getValues={getValues}
                                            watch={watch}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item size={{ xs: 12 }}>
                                    <MultilangTextEditor
                                        name="content"
                                        languages={languages}
                                        setValue={setValue}
                                        getValues={getValues}
                                        watch={watch}
                                        label="Welcome Content"
                                        isLoading={isLoading}
                                        errors={errors?.content}
                                    />
                                </Grid>

                                <Grid item size={{ xs: 12 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        disabled={updateWelcomeMutation.isLoading || languages.length === 0}
                                        startIcon={updateWelcomeMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                                    >
                                        {updateWelcomeMutation.isLoading ? 'Saving...' : 'Save Welcome Section'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default WelcomeSettings;