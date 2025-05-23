// frontend/src/components/widgets-Settings/slider/SliderSettings.jsx
'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Alert
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { useSession } from 'next-auth/react';
import FileDropzone from '@/components/inputs/FileDropzone';
import SliderOrdering from '@/components/widgets-Settings/slider/SliderOrdering';

// Import widget hooks
import { useSliders, useAddSlider, useUpdateSliders } from '@/hooks/api/tenant/widgets/useWidgets';

const SliderSettings = () => {
    const { data: session } = useSession();
    const { data: sliders, isLoading, error, refetch } = useSliders();
    const addSliderMutation = useAddSlider();
    const updateSlidersMutation = useUpdateSliders();

    const [images, setImages] = useState([]);

    // Update local state when data changes
    useEffect(() => {
        if (sliders) {
            setImages(sliders);
        }
    }, [sliders]);

    const handleFileUpload = async (file) => {
        if (!file || !file.file || !session?.accessToken) return;

        try {
            addSliderMutation.mutate(file.file, {
                onSuccess: () => {
                    refetch(); // Refetch sliders after successful upload
                }
            });
        } catch (error) {
            console.error('Error in file upload:', error);
        }
    };

    const handleSaveOrder = async () => {
        if (!session?.accessToken) return;

        try {
            updateSlidersMutation.mutate(images);
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load slider settings. Please try again later.
            </Alert>
        );
    }

    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12 }}>
                <Box>
                    <FileDropzone
                        type="image"
                        maxSize={5242880}
                        onFileSelect={handleFileUpload}
                        label="Upload Banner Image"
                        helperText="Drag and drop images for the banner slider"
                        isLoading={addSliderMutation.isLoading}
                    />
                </Box>
            </Grid>

            <Grid item size={{ xs: 12 }}>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Arrange Order</Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        images?.length > 0 ? (
                            <SliderOrdering
                                images={images}
                                setImages={setImages}
                                onSave={handleSaveOrder}
                                isSaving={updateSlidersMutation.isLoading}
                            />
                        ) : (
                            <Typography color="text.secondary" textAlign="center" py={4}>
                                No banner images available
                            </Typography>
                        )
                    )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default SliderSettings;