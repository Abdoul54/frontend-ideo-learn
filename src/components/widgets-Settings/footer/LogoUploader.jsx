'use client';
import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import FileDropzone from '@/components/inputs/FileDropzone'; // Using your existing component
import { useUploadFooterLogo } from '@/hooks/api/tenant/widgets/useWidgets';

const LogoUploader = ({ logo, setLogo, refetchData }) => {
    const uploadLogoMutation = useUploadFooterLogo();
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileSelect = (fileData) => {
        setSelectedFile(fileData);
    };

    const handleUpload = async () => {
        if (!selectedFile?.file) return;

        try {
            await uploadLogoMutation.mutateAsync(selectedFile.file, {
                onSuccess: (data) => {
                    setLogo(data.logo);
                    setSelectedFile(null);
                    refetchData?.();
                }
            });
        } catch (error) {
            console.error('Error uploading logo:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Current Logo Display */}
            {logo && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Current Logo:
                    </Typography>
                    <Box
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'background.default',
                            height: 100
                        }}
                    >
                        <img
                            src={logo}
                            alt="Current Logo"
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                    </Box>
                </Box>
            )}

            {/* Using your existing FileDropzone component */}
            <FileDropzone
                type="image"
                maxSize={2097152} // 2MB
                onFileSelect={handleFileSelect}
                label="Upload New Logo"
                helperText="Drag and drop your logo here, or click to select"
                defaultValue={logo} // Pass the current logo as default value
            />

            {/* Upload Button */}
            <Button
                variant="contained"
                color="primary"
                disabled={!selectedFile?.file || uploadLogoMutation.isLoading}
                onClick={handleUpload}
                startIcon={uploadLogoMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ mt: 2 }}
            >
                {uploadLogoMutation.isLoading ? 'Uploading...' : 'Upload Logo'}
            </Button>
        </Box>
    );
};

export default LogoUploader;