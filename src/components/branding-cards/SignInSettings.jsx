import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup
} from '@mui/material';
import FileDropzone from '../inputs/FileDropzone';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSignInSettings, useUpdateSignInSettings } from "@/hooks/api/tenant/useSignInSettings";
import ColorInput from '../inputs/ColorInput';
import { defaultValues, schema } from '@/constants/SignInSettings';

const SignInSettings = () => {
    const { control, watch, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
        mode: 'onChange'
    });

    const { data } = useSignInSettings();
    const updateSignInSettings = useUpdateSignInSettings();

    useEffect(() => {
        if (data) {
            // the data structure match the form structure
            const adjustedData = {
                sign_in_page: {
                    type: data?.type || 'color',
                    background_color: data?.color_data || '#FFFFFF',
                    bg_data: data?.bg_data || null,
                    bg_video_data: {
                        video: data?.bg_video_data?.video || null,
                        fallback_image: data?.bg_video_data?.fallback_image || null
                    }
                }
            };
            reset(adjustedData);
        }
    }, [data, reset]);

    const onSubmit = async (formData) => {
        try {
            const { sign_in_page } = formData;
            const requestData = {
                type: sign_in_page.type,
                color_data: sign_in_page.type === 'color' ? sign_in_page.background_color : undefined,
                bg_data: sign_in_page.type === 'image' ? sign_in_page.bg_data : undefined,
                bg_video_data: sign_in_page.type === 'video' ? {
                    video: sign_in_page.bg_video_data.video,
                    fallback_image: sign_in_page.bg_video_data.fallback_image
                } : undefined
            };

            // Filter out undefined values
            Object.keys(requestData).forEach(key =>
                requestData[key] === undefined && delete requestData[key]
            );

            await updateSignInSettings.mutateAsync(requestData);
        } catch (error) {
            console.error('Failed to save sign-in settings:', error);
        }
    };

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader title="Sign-In Page" />
            <CardContent
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    "&:last-child": {
                        paddingBottom: 2
                    }
                }}
            >
                <FormControl fullWidth>
                    <FormLabel>Sign in page background</FormLabel>
                    <Controller
                        name="sign_in_page.type"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup {...field} sx={{ mt: 2, mb: 5 }}>
                                <FormControlLabel value="color" control={<Radio />} label="Color" />
                                <FormControlLabel value="image" control={<Radio />} label="Full width background image" />
                                <FormControlLabel value="video" control={<Radio />} label="Full width background video" />
                            </RadioGroup>
                        )}
                    />
                    {watch("sign_in_page.type") === "color" && (
                        <Controller
                            name="sign_in_page.background_color"
                            control={control}
                            render={({ field }) => (
                                <ColorInput
                                    {...field}
                                    control={control}
                                    label="Background color"
                                    fullWidth
                                />
                            )}
                        />
                    )}
                    {watch("sign_in_page.type") === "image" && (
                        <Controller
                            name="sign_in_page.bg_data"
                            control={control}
                            render={({ field }) => (
                                <FileDropzone
                                    type="image"
                                    className="mb-5"
                                    maxSize={5242880}
                                    label="Upload Background Image"
                                    onFileSelect={(file) => {
                                        field.onChange(file);
                                    }}
                                />
                            )}
                        />
                    )}
                    {watch("sign_in_page.type") === "video" && (
                        <Box display={{ xs: "block", md: "flex" }} gap={3}>
                            <Controller
                                name="sign_in_page.bg_video_data.video"
                                control={control}
                                render={({ field }) => (
                                    <FileDropzone
                                        type="video"
                                        className="mb-5 max-w-xs"
                                        maxSize={52428800}
                                        label="Upload Background Video"
                                        onFileSelect={(file) => {
                                            field.onChange(file);
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="sign_in_page.bg_video_data.fallback_image"
                                control={control}
                                render={({ field }) => (
                                    <FileDropzone
                                        type="image"
                                        className="mb-5"
                                        maxSize={52428800}
                                        label="Upload Fallback Image"
                                        onFileSelect={(file) => {
                                            field.onChange(file);
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    )}
                </FormControl>
            </CardContent>
            <CardActions
                sx={{
                    justifyContent: "flex-end",
                    p: 2,
                    flexShrink: 0
                }}
            >
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    Save changes
                </Button>
            </CardActions>
        </Card>
    );
};

export default SignInSettings;