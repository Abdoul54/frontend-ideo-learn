'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Alert,
    TextField,
    Button,
    FormHelperText
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { useSession } from 'next-auth/react';
import FileDropzone from '@/components/inputs/FileDropzone';
import MiniCardsOrdering from './MiniCardsOrdering';

// Custom hook for banner management
import { useBanners, useAddBanner, useUpdateBanners } from '@/hooks/api/tenant/widgets/useBanners';

const MiniCardSettings = () => {
    const { data: session } = useSession();
    const { data: banners, isLoading, error, refetch } = useBanners();
    const addBannerMutation = useAddBanner();
    const updateBannersMutation = useUpdateBanners();

    const [images, setImages] = useState([]);
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [urlError, setUrlError] = useState('');

    // Update local state when data changes
    useEffect(() => {
        if (banners) {
            setImages(banners);
        }
    }, [banners]);

    // URL validation function
    const validateUrl = (inputUrl) => {
        if (!inputUrl) return true; // Empty is considered valid (we'll handle the empty case separately)
        try {
            new URL(inputUrl);
            return true;
        } catch (err) {
            return false;
        }
    };

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        
        if (newUrl && !validateUrl(newUrl)) {
            setUrlError('Please enter a valid URL (e.g., https://example.com)');
        } else {
            setUrlError('');
        }
    };

    const handleFileUpload = (file) => {
        if (!file || !file.file) return;
        setSelectedFile(file.file);
    };

    const handleSaveBanner = async () => {
        if (!selectedFile || !session?.accessToken) return;
        
        // Final validation before submission
        if (url && !validateUrl(url)) {
            setUrlError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        try {
            // Include URL with the banner upload
            addBannerMutation.mutate({ 
                banner: selectedFile, 
                url: url || '#' // Default to '#' if no URL provided
            }, {
                onSuccess: () => {
                    refetch(); // Refetch banners after successful upload
                    setUrl(''); // Reset URL field
                    setSelectedFile(null); // Reset selected file
                }
            });
        } catch (error) {
            console.error('Error in banner upload:', error);
        }
    };

    const handleSaveOrder = async () => {
        if (!session?.accessToken) return;

        try {
            updateBannersMutation.mutate(images);
        } catch (error) {
            console.error('Error saving banner order:', error);
        }
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load mini card settings. Please try again later.
            </Alert>
        );
    }

    const isSaveButtonDisabled = !selectedFile || (url && !validateUrl(url));

    return (
        <Grid container spacing={4}>
            <Grid item size={{ xs: 12 }}>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Upload New Mini Card</Typography>
                    <TextField
                        fullWidth
                        label="Banner URL"
                        placeholder="https://example.com/page"
                        value={url}
                        onChange={handleUrlChange}
                        sx={{ mb: 2 }}
                        helperText={urlError || "Enter the URL where this banner should link to"}
                        error={!!urlError}
                    />
                    <FileDropzone
                        type="image"
                        maxSize={5242880}
                        onFileSelect={handleFileUpload}
                        label="Upload Banner Image"
                        helperText="Drag and drop images for mini card banners"
                        isLoading={false}
                    />
                    {selectedFile && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            File selected: {selectedFile.name}
                        </Typography>
                    )}
                    <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }}
                        disabled={isSaveButtonDisabled}
                        onClick={handleSaveBanner}
                    >
                        {addBannerMutation.isLoading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                                Saving...
                            </>
                        ) : 'Save Banner'}
                    </Button>
                    {isSaveButtonDisabled && !urlError && (
                        <FormHelperText>
                            Please select a file and provide a valid URL to save
                        </FormHelperText>
                    )}
                </Box>
            </Grid>

            <Grid item size={{ xs: 12 }}>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Arrange Mini Cards</Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        images?.length > 0 ? (
                            <MiniCardsOrdering
                                images={images}
                                setImages={setImages}
                                onSave={handleSaveOrder}
                                isSaving={updateBannersMutation.isLoading}
                            />
                        ) : (
                            <Typography color="text.secondary" textAlign="center" py={4}>
                                No mini card banners available
                            </Typography>
                        )
                    )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default MiniCardSettings;