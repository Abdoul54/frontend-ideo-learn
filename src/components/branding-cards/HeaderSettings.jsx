import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    FormControlLabel,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import FileDropzone from '../inputs/FileDropzone';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { defaultValues, schema } from "@/constants/HeaderSettings";
import { useHeaderSettings, useUpdateHeaderSettings } from "@/hooks/api/tenant/useHeaderSettings";

const HeaderSettings = () => {
    const { control, watch, handleSubmit, setValue, formState: { isSubmitting, errors }, reset } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema)
    });

    const { data } = useHeaderSettings();
    const updateHeaderSettings = useUpdateHeaderSettings();

    useEffect(() => {
        if (data) {
            reset({
                page_title: data.page_title,
                header_message: {
                    status: data.header_message.status,
                    content: data.header_message.content
                },
                // Store URL and file separately
                logo: { url: data.logo, file: null },
                favicon: { url: data.favicon, file: null }
            });
        }
    }, [data, reset]);

    const onSubmit = async (data) => {
        console.log('Form data Header settings:', data);
        try {
            await updateHeaderSettings.mutateAsync(data);
        } catch (error) {
            console.error('Failed to save header settings:', error);
        }
    };

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader title="Header settings" />
            <CardContent
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    "&:last-child": {
                        paddingBottom: 2
                    }
                }}
            >
                <Controller
                    name="page_title"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Page Title"
                            fullWidth
                            margin="normal"
                            error={!!errors.page_title}
                            helperText={errors.page_title?.message}
                        />
                    )}
                />
                <Box display="flex" alignItems="center" gap={1} mb={5}>
                    <Typography variant="subtitle1">Header Message</Typography>
                    <FormControlLabel
                        control={
                            <Controller
                                name="header_message.status"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value === 'enabled'}
                                        onChange={(e) => field.onChange(e.target.checked ? 'enabled' : 'disabled')}
                                    />
                                )}
                            />
                        }
                    />
                </Box>
                {watch("header_message.status") === 'enabled' && (
                    <Controller
                        name="header_message.content"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Header Message Content"
                                fullWidth
                                margin="normal"
                                error={!!errors.header_message?.content}
                                helperText={errors.header_message?.content?.message}
                            />
                        )}
                    />
                )}
                <Box display={{ xs: "block", md: "flex" }} gap={3}>
                    <Controller
                        name="logo"
                        control={control}
                        render={({ field }) => (
                            <FileDropzone
                                label="Upload Logo"
                                className='max-w-xs'
                                onFileSelect={(fileData) => {
                                    field.onChange({
                                        url: fileData?.url || null,
                                        file: fileData?.file || null
                                    });
                                }}
                                defaultValue={field.value?.url}
                                maxSize={2048 * 1024}
                                type="image"
                            />
                        )}
                    />
                    <Controller
                        name="favicon"
                        control={control}
                        render={({ field }) => (
                            <FileDropzone
                                label="Upload Favicon"
                                className='max-w-xs'
                                onFileSelect={(fileData) => {
                                    field.onChange({
                                        url: fileData?.url || null,
                                        file: fileData?.file || null
                                    });
                                }}
                                defaultValue={field.value?.url}
                                maxSize={512 * 1024}
                                type="image"
                            />
                        )}
                    />
                </Box>
            </CardContent>
            <CardActions sx={{
                justifyContent: "flex-end",
                p: 2,
                flexShrink: 0
            }}>
                <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    Save Changes
                </Button>
            </CardActions>
        </Card>
    );
};

export default HeaderSettings;