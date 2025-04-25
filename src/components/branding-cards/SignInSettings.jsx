import React, { useEffect, useState } from 'react';
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
    RadioGroup,
    Alert,
    Collapse,
    IconButton
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

    const [showFileReuploadAlert, setShowFileReuploadAlert] = useState(false);
    const [selectedType, setSelectedType] = useState('color');

    const { data } = useSignInSettings();
    const updateSignInSettings = useUpdateSignInSettings();

    useEffect(() => {
        if (data) {
            // the data structure match the form structure
            const adjustedData = {
                sign_in_page: {
                    type: data?.type || 'color',
                    background_color: data?.color_data || '#FFFFFF',
                    // Store bg_data for image type
                    bg_data: data?.bg_data ? {
                        url: data.bg_data,
                        file: null
                    } : null,
                    // Store video data if available
                    bg_video_data: {
                        video: data?.bg_video_data?.video ? {
                            url: data.bg_video_data.video,
                            file: null
                        } : null,
                        fallback_image: data?.bg_video_data?.fallback_image ? {
                            url: data.bg_video_data.fallback_image,
                            file: null
                        } : null
                    }
                }
            };
            reset(adjustedData);
            setSelectedType(data?.type || 'color');
        }
    }, [data, reset]);

    // Monitor type changes to show appropriate alerts
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'sign_in_page.type') {
                setSelectedType(value.sign_in_page.type);

                // If changing from color to image/video, show the alert about needing to upload files
                if (value.sign_in_page.type !== 'color') {
                    setShowFileReuploadAlert(true);
                } else {
                    setShowFileReuploadAlert(false);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = async (formData) => {
        try {
            const { sign_in_page } = formData;

            // Create request data in the format expected by our hook
            const requestData = {
                type: sign_in_page.type,
                color_data: sign_in_page.type === 'color' ? sign_in_page.background_color : undefined,
                bg_data: sign_in_page.type === 'image' ? sign_in_page.bg_data : undefined,
                bg_video_data: sign_in_page.type === 'video' ? sign_in_page.bg_video_data : undefined
            };

            console.log('Submitting sign-in settings:', requestData);
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
                            <RadioGroup {...field} sx={{ mt: 2, mb: 2 }}>
                                <FormControlLabel value="color" control={<Radio />} label="Color" />
                                <FormControlLabel value="image" control={<Radio />} label="Full width background image" />
                                <FormControlLabel value="video" control={<Radio />} label="Full width background video" />
                            </RadioGroup>
                        )}
                    />

                    {/* Alert for image/video types */}
                    <Collapse in={showFileReuploadAlert}>
                        <Alert
                            severity="info"
                            sx={{ mb: 3 }}
                            onClose={() => setShowFileReuploadAlert(false)}
                        >
                            {selectedType === 'image' ?
                                "You must upload an image file. The existing image cannot be reused without uploading it again." :
                                "You must upload a video file and fallback image. Existing files cannot be reused without uploading them again."}
                        </Alert>
                    </Collapse>

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
                                    defaultValue={field.value?.url}
                                    helperText="Select a new image file (required)"
                                    onFileSelect={(fileData) => {
                                        field.onChange({
                                            url: fileData?.url || null,
                                            file: fileData?.file || null
                                        });
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
                                        defaultValue={field.value?.url}
                                        helperText="Select a new video file (required)"
                                        onFileSelect={(fileData) => {
                                            field.onChange({
                                                url: fileData?.url || null,
                                                file: fileData?.file || null
                                            });
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
                                        defaultValue={field.value?.url}
                                        helperText="Select a new image file (required)"
                                        onFileSelect={(fileData) => {
                                            field.onChange({
                                                url: fileData?.url || null,
                                                file: fileData?.file || null
                                            });
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