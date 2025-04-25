import React, { useCallback, useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    FormHelperText,
    CircularProgress
} from '@mui/material';

const BaseDropzoneInput = ({
    onChange,
    value,
    label,
    error,
    accept,
    multiple = false,
    maxSize = 5, // Max size in MB
    height = 180,
    uploading = false,
    helpText,
    successText = 'File uploaded successfully!',
    uploadingText = 'Uploading file...',
    dropText = 'Drag and drop your file here',
    invalidFileTypeText = 'Invalid file type',
    fileTooLargeText = 'File too large'
}) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fileName, setFileName] = useState('');

    // Reset success state when value changes
    useEffect(() => {
        if (value) {
            setIsSuccess(true);
            setFileName(multiple ?
                `${Array.isArray(value) ? value.length : 0} files selected` :
                (value instanceof File ? value.name : 'File uploaded')
            );
        } else {
            setIsSuccess(false);
            setFileName('');
        }
        // Clear custom error message when value changes
        setErrorMessage('');
    }, [value, multiple]);

    // Handle drag events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    // Validate files before accepting
    const validateFiles = (files) => {
        if (!files || files.length === 0) return null;

        const fileList = Array.from(files);

        // Check file types if accept prop is provided
        if (accept) {
            const acceptedTypes = accept.split(',').map(type => type.trim());
            const invalidFile = fileList.find(file => {
                // Check if file type matches any of the accepted types
                return !acceptedTypes.some(acceptType => {
                    // Handle wildcards like image/* or .pdf
                    if (acceptType.endsWith('/*')) {
                        const category = acceptType.split('/')[0];
                        return file.type.startsWith(`${category}/`);
                    } else if (acceptType.startsWith('.')) {
                        // Check file extension
                        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
                    }
                    return file.type === acceptType;
                });
            });

            if (invalidFile) {
                setErrorMessage(invalidFileTypeText);
                return null;
            }
        }

        // Check file sizes
        const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
        const oversizedFile = fileList.find(file => file.size > maxSizeBytes);

        if (oversizedFile) {
            setErrorMessage(`${fileTooLargeText} (Max: ${maxSize}MB)`);
            return null;
        }

        return multiple ? fileList : fileList[0];
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        const validatedFiles = validateFiles(files);

        if (validatedFiles) {
            onChange(validatedFiles);
            setErrorMessage('');
        }
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        const files = e.target.files;
        const validatedFiles = validateFiles(files);

        if (validatedFiles) {
            onChange(validatedFiles);
            setErrorMessage('');
        }

        // Reset the input value so the same file can be selected again
        e.target.value = '';
    };

    return (
        <FormControl fullWidth error={!!error || !!errorMessage}>
            {label && (
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {label}
                </Typography>
            )}

            <input
                type="file"
                id="dropzone-file-input"
                multiple={multiple}
                accept={accept}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
            />

            <label htmlFor="dropzone-file-input" style={{ width: '100%', cursor: 'pointer' }}>
                <Paper
                    variant="outlined"
                    sx={{
                        height,
                        border: '2px dashed',
                        borderColor: error || errorMessage ? 'error.main' :
                            isDragActive ? 'primary.main' :
                                isSuccess ? 'success.main' : 'divider',
                        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            p: 2,
                            gap: 2,
                            height: '100%',
                            width: '100%'
                        }}
                    >
                        {/* Uploading state */}
                        {uploading && (
                            <>
                                <CircularProgress size={48} />
                                <Typography variant="body1">{uploadingText}</Typography>
                            </>
                        )}

                        {/* Success state */}
                        {!uploading && isSuccess && (
                            <>
                                <i className="solar-check-circle-bold-duotone text-4xl" style={{ color: 'var(--mui-palette-success-main)' }} />
                                <Typography variant="body1">{successText}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {fileName}
                                </Typography>
                            </>
                        )}

                        {/* Error state */}
                        {!uploading && !isSuccess && errorMessage && (
                            <>
                                <i className="solar-close-circle-bold-duotone text-4xl" style={{ color: 'var(--mui-palette-error-main)' }} />
                                <Typography variant="body1" color="error">{errorMessage}</Typography>
                                <Typography variant="body2">{dropText}</Typography>
                            </>
                        )}

                        {/* Default state */}
                        {!uploading && !isSuccess && !errorMessage && (
                            <>
                                <i className="solar-upload-bold-duotone text-4xl" style={{ color: isDragActive ? 'var(--mui-palette-primary-main)' : undefined }} />
                                <Typography variant="body1">
                                    {isDragActive ? 'Drop your file here' : dropText}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isDragActive ? '' : (helpText || `Click or drag to upload${multiple ? ' files' : ''}`)}
                                </Typography>
                                {maxSize && (
                                    <Typography variant="caption" color="text.secondary">
                                        Max size: {maxSize}MB
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                </Paper>
            </label>

            {(error || errorMessage) && (
                <FormHelperText>{error?.message || errorMessage}</FormHelperText>
            )}
        </FormControl>
    );
};

const DropzoneInput = ({
    name,
    control,
    ...props
}) => {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={null}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                return (
                    <BaseDropzoneInput
                        {...props}
                        onChange={(file) => {
                            onChange(file);
                        }}
                        value={value}
                        error={error?.message}
                    />
                );
            }}
        />
    );
};

export default DropzoneInput;