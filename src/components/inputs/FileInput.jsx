import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    FormControl,
    FormHelperText,
    Button,
    Avatar,
    CircularProgress,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Fade
} from '@mui/material';

/**
 * Helper function to determine the appropriate icon based on file type
 */
const getFileIcon = (fileType) => {
    if (!fileType) return 'solar-file-bold-duotone';
    if (fileType.startsWith('image/')) return 'solar-gallery-bold-duotone';
    if (fileType.startsWith('video/')) return 'solar-video-bold-duotone';
    if (fileType.startsWith('audio/')) return 'solar-music-note-bold-duotone';
    if (fileType.startsWith('application/pdf')) return 'solar-file-pdf-bold-duotone';
    if (fileType.startsWith('application/msword') || fileType.includes('document')) return 'solar-file-text-bold-duotone';
    if (fileType.startsWith('application/vnd.ms-excel') || fileType.includes('spreadsheet')) return 'solar-file-sheet-bold-duotone';
    return 'solar-file-bold-duotone';
};

/**
 * Extracts initials from a full name
 */
const extractInitialsFromName = (fullName) => {
    if (!fullName) return '';

    // Split by spaces, dashes, and other common separators
    const nameParts = fullName.split(/[\s-_]+/).filter(part => part.length > 0);

    if (nameParts.length === 0) return '';

    if (nameParts.length === 1) {
        // For single name, use first two letters
        return nameParts[0].substring(0, 2).toUpperCase();
    } else {
        // For multiple parts, use first letter of first and last parts
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
};

/**
 * Extracts initials from a filename
 */
const extractInitialsFromFilename = (fileName) => {
    if (!fileName) return '';
    const nameParts = fileName.split('.')[0].split(/[-_\s]/);
    if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
    } else if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
    return '';
};

/**
 * Converts a string to a color code with good contrast for text
 */
const stringToColor = (string) => {
    if (!string) return '#1976d2'; // Default primary color if no string

    let hash = 0;
    let i;

    // Generate hash value based on string
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Ensure the color is dark enough for good contrast with white text
    let r = (hash & 0xFF) % 150; // Limit to 0-149
    let g = ((hash >> 8) & 0xFF) % 150;
    let b = ((hash >> 16) & 0xFF) % 150;

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Creates avatar props based on a name
 */
const stringAvatar = (name, sx = {}, icon = null, textColor = '#fff') => {
    if (!name || name.trim() === '') {
        return {
            sx: {
                bgcolor: '#1976d2',
                color: textColor,
                ...sx
            },
            children: icon ? <i className={icon} /> : null
        };
    }

    const nameParts = name.split(' ');
    let initials = '';

    if (nameParts.length >= 2) {
        initials = `${nameParts[0][0]}${nameParts[1][0]}`;
    } else if (nameParts.length === 1) {
        initials = nameParts[0][0];
    }

    return {
        sx: {
            bgcolor: stringToColor(name),
            color: textColor,
            ...sx
        },
        children: icon ? <i className={icon} /> : initials
    };
};

/**
 * Custom hook for generating file previews
 */
const useFilePreview = (file, options = {}) => {
    const [preview, setPreview] = useState(null);
    const [name, setName] = useState('');
    const { isImage = true } = options;

    useEffect(() => {
        if (!file) {
            setPreview(null);
            setName('');
            return;
        }

        if (file instanceof File) {
            setName(file.name);

            if (isImage && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (!isImage) {
                setPreview(null);
            }
        } else if (typeof file === 'string') {
            setPreview(file);
            setName(file.split('/').pop() || 'File');
        }
    }, [file, isImage]);

    return { preview, name };
};

/**
 * Enhanced FileInput Component with improved drag and drop
 */
const BaseFileInput = ({
    onChange,
    value,
    label,
    error,
    accept,
    variant = 'default',
    // Common props
    helperText,
    placeholder,
    disabled = false,
    // Form props
    setFormError,
    name,
    // Multiple file props
    maxFiles,
    // Image crop props
    aspectRatio = 1,
    previewSize = 150,
    cropperTitle = 'Crop Image',
    // Avatar props
    avatarSize = 'large',
    defaultIcon = 'solar-user-bold-duotone',
    customInitials = '',
    avatarName = '',
    avatarColor = '',
    avatarTextColor = '#fff',
    useNameColors = true,
    allowRemove = true,
    // Dropzone props
    maxSize, // Removed default value to allow unlimited file size
    height = 180,
    uploading = false,
    successText = 'File uploaded successfully!',
    uploadingText = 'Uploading file...',
    dropText = 'Drag and drop your file here',
    invalidFileTypeText = 'Invalid file type',
    fileTooLargeText = 'File too large',
    // Enhanced drag and drop options
    showDropEffect = true,
    dropIndicatorTimeout = 3000,
    dragActiveColor = 'primary.main',
    dragRejectColor = 'error.main'
}) => {
    // Common state
    const fileInputRef = useRef(null);
    const [customError, setCustomError] = useState('');

    // Multiple files state
    const [previews, setPreviews] = useState([]);

    // Determine if we have a file limit (if maxFiles is undefined, we have no limit)
    const hasFileLimit = maxFiles !== undefined;
    // Default to 5 only if maxFiles is explicitly provided
    const fileLimit = hasFileLimit ? maxFiles : Infinity;

    // Determine if we have a file size limit
    const hasFileSizeLimit = maxSize !== undefined && maxSize !== null;

    // Image crop state
    const [cropOpen, setCropOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [originalImage, setOriginalImage] = useState(null);
    const [cropperImage, setCropperImage] = useState(null);
    const cropAreaRef = useRef(null);
    const imageRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    // Avatar state
    const [initials, setInitials] = useState('');

    // Drag and drop state
    const [isDragActive, setIsDragActive] = useState(false);
    const [isDragAccept, setIsDragAccept] = useState(false);
    const [isDragReject, setIsDragReject] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showDropSuccess, setShowDropSuccess] = useState(false);
    const dropSuccessTimeoutRef = useRef(null);
    const dragCounterRef = useRef(0); // Counter to track drag enter/leave events

    // Common preview handling
    const { preview, name: displayName } = useFilePreview(
        variant !== 'multiple' ? value : null,
        { isImage: variant === 'default' || variant === 'image-crop' || variant === 'avatar' }
    );

    // Multiple files preview handling
    const updateMultiplePreviews = useCallback((files) => {
        if (!files || files.length === 0) {
            setPreviews([]);
            return;
        }

        const newPreviews = [];

        // Process files for previews
        files.forEach((file, index) => {
            if (file instanceof File && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews[index] = {
                        preview: reader.result,
                        name: file.name,
                        type: file.type
                    };
                    setPreviews([...newPreviews]);
                };
                reader.readAsDataURL(file);
            } else if (typeof file === 'string') {
                newPreviews[index] = {
                    preview: file,
                    name: file.split('/').pop() || 'Existing Image',
                    type: 'image/*'
                };
                setPreviews([...newPreviews]);
            } else if (file instanceof File) {
                newPreviews[index] = {
                    preview: null,
                    name: file.name,
                    type: file.type
                };
                setPreviews([...newPreviews]);
            }
        });
    }, []);

    // Update avatar initials
    const updateAvatarInitials = useCallback((fileOrUrl) => {
        // Priority 1: If custom initials are provided, use them
        if (customInitials) {
            setInitials(customInitials);
            return;
        }

        // Priority 2: If a name is provided, extract initials from it
        if (avatarName) {
            setInitials(extractInitialsFromName(avatarName));
            return;
        }

        // Priority 3: Extract initials from filename (fallback)
        if (fileOrUrl instanceof File) {
            setInitials(extractInitialsFromFilename(fileOrUrl.name));
        } else if (typeof fileOrUrl === 'string') {
            const fileName = fileOrUrl.split('/').pop();
            setInitials(extractInitialsFromFilename(fileName));
        } else {
            setInitials('');
        }
    }, [customInitials, avatarName]);

    // Effect to handle different variant initializations
    useEffect(() => {
        if (variant === 'multiple' && Array.isArray(value)) {
            updateMultiplePreviews(value);
        } else if (variant === 'avatar') {
            updateAvatarInitials(value);
        } else if (variant === 'dropzone' || variant === 'default') {
            if (value) {
                setIsSuccess(true);
            } else {
                setIsSuccess(false);
            }
        }
    }, [value, variant, updateMultiplePreviews, updateAvatarInitials]);

    // Effect to reset drag counter when unmounting
    useEffect(() => {
        return () => {
            dragCounterRef.current = 0;
            if (dropSuccessTimeoutRef.current) {
                clearTimeout(dropSuccessTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Validates files for size and type
     */
    const validateFiles = (files) => {
        if (!files || files.length === 0) return null;

        const fileList = Array.from(files);
        const multiple = variant === 'multiple';

        // Check file types if accept prop is provided
        if (accept) {
            const acceptedTypes = accept.split(',').map(type => type.trim());
            const invalidFile = fileList.find(file => {
                return !acceptedTypes.some(acceptType => {
                    if (acceptType.endsWith('/*')) {
                        const category = acceptType.split('/')[0];
                        return file.type.startsWith(`${category}/`);
                    } else if (acceptType.startsWith('.')) {
                        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
                    }
                    return file.type === acceptType;
                });
            });

            if (invalidFile) {
                setIsDragReject(true);
                setCustomError(invalidFileTypeText);
                return null;
            }
        }

        // Check file sizes only if maxSize is provided
        if (hasFileSizeLimit) {
            const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
            const oversizedFile = fileList.find(file => file.size > maxSizeBytes);

            if (oversizedFile) {
                setIsDragReject(true);
                setCustomError(`${fileTooLargeText} (Max: ${maxSize}MB)`);
                return null;
            }
        }

        setIsDragAccept(true);
        return multiple ? fileList : fileList[0];
    };

    /**
     * Handles file input change
     */
    const handleFileChange = (event) => {
        const files = event.target.files;

        if (!files || files.length === 0) return;

        // Handle different variants
        if (variant === 'multiple') {
            const newFiles = Array.from(files);

            // Validate file sizes only if maxSize is provided
            if (hasFileSizeLimit) {
                const maxSizeBytes = maxSize * 1024 * 1024;
                const oversizedFile = newFiles.find(file => file.size > maxSizeBytes);

                if (oversizedFile) {
                    setCustomError(`${fileTooLargeText} (Max: ${maxSize}MB)`);
                    // Only call setFormError if it exists and name is provided
                    if (typeof setFormError === 'function' && name) {
                        setFormError(name, { message: `File too large (Max: ${maxSize}MB)` });
                    }
                    return;
                }
            }

            // Only apply file limit if maxFiles is specified
            const updatedFiles = hasFileLimit
                ? [...(Array.isArray(value) ? value : []), ...newFiles].slice(0, fileLimit)
                : [...(Array.isArray(value) ? value : []), ...newFiles];

            onChange(updatedFiles);
            event.target.value = null; // Reset input
        } else if (variant === 'image-crop' && files[0]?.type.startsWith('image/')) {
            const file = files[0];
            // Read the file for cropper preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(file);
                setCropperImage(reader.result);
                setCropOpen(true);
            };
            reader.readAsDataURL(file);
        } else if (variant === 'dropzone' || variant === 'default') {
            const validatedFiles = validateFiles(files);
            if (validatedFiles) {
                onChange(validatedFiles);
                setCustomError('');

                if (showDropEffect) {
                    setShowDropSuccess(true);

                    // Clear previous timeout
                    if (dropSuccessTimeoutRef.current) {
                        clearTimeout(dropSuccessTimeoutRef.current);
                    }

                    // Set new timeout to hide the success message
                    dropSuccessTimeoutRef.current = setTimeout(() => {
                        setShowDropSuccess(false);
                    }, dropIndicatorTimeout);
                }
            }
            event.target.value = null; // Reset input
        } else {
            // Avatar variant
            onChange(files[0]);
        }
    };

    /**
     * Handles file removal
     */
    const handleRemove = (index) => {
        if (variant === 'multiple' && Array.isArray(value)) {
            const updatedFiles = [...value];
            updatedFiles.splice(index, 1);
            onChange(updatedFiles);
        } else {
            onChange(null);
            setShowDropSuccess(false);
        }
    };

    /**
     * Handles container click to open file dialog
     */
    const handleContainerClick = () => {
        // Skip if disabled
        if (disabled) return;

        // For multiple files, only allow selecting more if under the limit (when a limit exists)
        if (variant === 'multiple' && Array.isArray(value) && hasFileLimit && value.length >= fileLimit) {
            return;
        }

        fileInputRef.current?.click();
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Increment counter to track nested elements
        dragCounterRef.current++;

        // Only update state if this is the first dragenter
        if (dragCounterRef.current === 1) {
            setIsDragActive(true);
            setIsDragReject(false);
            setIsDragAccept(false);

            // Check file types and sizes when dragging over
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                // We can only check type at this point, not size
                if (accept) {
                    const acceptedTypes = accept.split(',').map(type => type.trim());
                    const hasInvalidType = Array.from(e.dataTransfer.items).some(item => {
                        return !acceptedTypes.some(acceptType => {
                            if (acceptType.endsWith('/*')) {
                                const category = acceptType.split('/')[0];
                                return item.type.startsWith(`${category}/`);
                            }
                            return item.type === acceptType;
                        });
                    });

                    if (hasInvalidType) {
                        setIsDragReject(true);
                    } else {
                        setIsDragAccept(true);
                    }
                } else {
                    setIsDragAccept(true);
                }
            }
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Decrement counter
        dragCounterRef.current--;

        // Only reset state when the last dragleave happens
        if (dragCounterRef.current === 0) {
            setIsDragActive(false);
            setIsDragReject(false);
            setIsDragAccept(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // No need to update state here, just prevent default
        // to allow drop
    };

    /**
     * Handles file drop event
     */
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Reset drag counter
        dragCounterRef.current = 0;

        setIsDragActive(false);
        setIsDragReject(false);
        setIsDragAccept(false);

        const files = e.dataTransfer.files;
        const validatedFiles = validateFiles(files);

        if (validatedFiles) {
            onChange(validatedFiles);
            setCustomError('');

            if (showDropEffect) {
                setShowDropSuccess(true);

                // Clear previous timeout
                if (dropSuccessTimeoutRef.current) {
                    clearTimeout(dropSuccessTimeoutRef.current);
                }

                // Set new timeout to hide the success message
                dropSuccessTimeoutRef.current = setTimeout(() => {
                    setShowDropSuccess(false);
                }, dropIndicatorTimeout);
            }
        }
    };

    // Image Crop handlers
    const handleMouseDown = (e) => {
        setDragging(true);
        setStartPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleTouchStart = (e) => {
        setDragging(true);
        setStartPosition({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;

        // Calculate new position with boundaries
        const cropArea = cropAreaRef.current;
        const image = imageRef.current;

        if (!cropArea || !image) return;

        const cropRect = cropArea.getBoundingClientRect();
        const imageRect = {
            width: image.width * zoom,
            height: image.height * zoom
        };

        // Calculate boundaries
        const minX = cropRect.width - imageRect.width;
        const minY = cropRect.height - imageRect.height;
        const maxX = 0;
        const maxY = 0;

        // Calculate new position
        let newX = e.clientX - startPosition.x;
        let newY = e.clientY - startPosition.y;

        // Enforce boundaries
        newX = Math.min(maxX, Math.max(minX, newX));
        newY = Math.min(maxY, Math.max(minY, newY));

        setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e) => {
        if (!dragging) return;

        // Similar to handleMouseMove but for touch events
        const cropArea = cropAreaRef.current;
        const image = imageRef.current;

        if (!cropArea || !image) return;

        const cropRect = cropArea.getBoundingClientRect();
        const imageRect = {
            width: image.width * zoom,
            height: image.height * zoom
        };

        const minX = cropRect.width - imageRect.width;
        const minY = cropRect.height - imageRect.height;
        const maxX = 0;
        const maxY = 0;

        let newX = e.touches[0].clientX - startPosition.x;
        let newY = e.touches[0].clientY - startPosition.y;

        newX = Math.min(maxX, Math.max(minX, newX));
        newY = Math.min(maxY, Math.max(minY, newY));

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    /**
     * Applies crop to the image and creates a new file
     */
    const applyCrop = async () => {
        try {
            // Create a canvas to crop the image
            const canvas = document.createElement('canvas');
            const cropArea = cropAreaRef.current;
            const image = imageRef.current;

            if (!cropArea || !image) return;

            const cropRect = cropArea.getBoundingClientRect();

            // Set canvas dimensions to match crop area
            canvas.width = cropRect.width;
            canvas.height = cropRect.height;

            const ctx = canvas.getContext('2d');

            // Draw the image onto the canvas
            ctx.drawImage(
                image,
                -position.x / zoom, -position.y / zoom, // Source position
                image.width, image.height, // Source dimensions
                0, 0, // Destination position
                image.width * zoom, image.height * zoom // Destination dimensions
            );

            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

            // Create a new file from the blob
            const croppedFile = new File([blob], originalImage.name, {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
            });

            onChange(croppedFile);
            setCropOpen(false);

        } catch (error) {
            console.error('Error cropping image:', error);
            setCropOpen(false);
        }
    };

    /**
     * Gets the avatar dimensions based on size prop
     */
    const getAvatarSize = () => {
        switch (avatarSize) {
            case 'small': return { width: 64, height: 64 };
            case 'medium': return { width: 96, height: 96 };
            case 'large': return { width: 128, height: 128 };
            case 'xlarge': return { width: 160, height: 160 };
            default: return { width: 128, height: 128 };
        }
    };

    /*
     * Render helpers for each variant
     */
    const renderDefaultVariant = () => {
        // Determine the border color based on the drag state
        let borderColor = error || customError ? 'error.main' : 'divider';

        if (isDragActive) {
            if (isDragReject) {
                borderColor = dragRejectColor;
            } else if (isDragAccept) {
                borderColor = dragActiveColor;
            } else {
                borderColor = dragActiveColor;
            }
        }

        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor,
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    position: 'relative',
                    opacity: disabled ? 0.7 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onDragEnter={disabled ? undefined : handleDragEnter}
                onDragLeave={disabled ? undefined : handleDragLeave}
                onDragOver={disabled ? undefined : handleDragOver}
                onDrop={disabled ? undefined : handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={accept}
                    disabled={disabled}
                    style={{
                        display: 'none'
                    }}
                />

                {/* Success overlay when a file is dropped */}
                {showDropSuccess && value && (
                    <Fade in={showDropSuccess}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                zIndex: 1,
                                borderRadius: 1
                            }}
                        >
                            <i className="solar-check-circle-bold-duotone text-4xl" style={{ color: 'var(--mui-palette-success-main)' }} />
                            <Typography variant="body1" color="success.main" sx={{ mt: 1 }}>
                                File uploaded successfully!
                            </Typography>
                        </Box>
                    </Fade>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 1,
                        padding: 4,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        zIndex: showDropSuccess ? 0 : 1,
                        position: 'relative',
                    }}
                    onClick={disabled ? undefined : handleContainerClick}
                >
                    {/* Drag instruction overlay */}
                    {isDragActive && !isDragReject && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                zIndex: 1,
                                borderRadius: 1
                            }}
                        >
                            <i className="solar-download-minimalistic-bold-duotone text-4xl" style={{ color: 'var(--mui-palette-primary-main)' }} />
                            <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                                Drop your file here
                            </Typography>
                        </Box>
                    )}

                    {/* Reject message when invalid file is dragged */}
                    {isDragActive && isDragReject && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                zIndex: 1,
                                borderRadius: 1
                            }}
                        >
                            <i className="solar-close-circle-bold-duotone text-4xl" style={{ color: 'var(--mui-palette-error-main)' }} />
                            <Typography variant="body1" color="error" sx={{ mt: 1 }}>
                                {customError || invalidFileTypeText}
                            </Typography>
                        </Box>
                    )}

                    {!value ? (
                        <>
                            <i className="solar-upload-bold-duotone text-4xl" />
                            <Typography variant="body1">
                                {placeholder || 'Drag and drop your file here, or click to select'}
                            </Typography>
                            {accept && (
                                <Typography variant="body2" color="text.secondary">
                                    Accepts: {accept.replace(/,/g, ', ')}
                                </Typography>
                            )}
                            {hasFileSizeLimit && (
                                <Typography variant="caption" color="text.secondary">
                                    Max size: {maxSize}MB
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    bgcolor: 'grey.50'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {preview ? (
                                        <Box
                                            component="img"
                                            src={preview}
                                            alt="Preview"
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                objectFit: 'cover',
                                                borderRadius: 1
                                            }}
                                        />
                                    ) : (
                                        <i className={getFileIcon(value instanceof File ? value.type : null)} />
                                    )}
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                        {displayName || (value instanceof File ? value.name : 'File')}
                                    </Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent container click
                                        handleRemove();
                                    }}
                                    disabled={disabled}
                                >
                                    <i className='solar-close-circle-line-duotone' />
                                </IconButton>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Paper>
        );
    };

    const renderMultipleVariant = () => (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                border: '2px dashed',
                borderColor: error || customError ? 'error.main' : 'divider',
                bgcolor: 'background.paper',
                position: 'relative',
                opacity: disabled ? 0.7 : 1,
                cursor: disabled ? 'not-allowed' : 'default'
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept={accept}
                multiple
                disabled={disabled}
                style={{
                    display: 'none'
                }}
            />

            {/* File List */}
            {Array.isArray(value) && value.length > 0 && (
                <List dense sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                    {value.map((file, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                borderRadius: 1,
                                bgcolor: 'grey.50',
                                mb: 1
                            }}
                        >
                            <ListItemIcon>
                                {previews[index]?.preview ? (
                                    <Box
                                        component="img"
                                        src={previews[index].preview}
                                        alt={previews[index].name}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            objectFit: 'cover',
                                            borderRadius: 1
                                        }}
                                    />
                                ) : (
                                    <i className={getFileIcon(file instanceof File ? file.type : null)} />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={file instanceof File ? file.name : file.split('/').pop() || 'File'}
                                primaryTypographyProps={{ noWrap: true, sx: { maxWidth: '70%' } }}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleRemove(index)}
                                    disabled={disabled}
                                >
                                    <i className="solar-close-circle-line-duotone" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Upload Area */}
            {(!Array.isArray(value) || !hasFileLimit || value.length < fileLimit) && !disabled && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 1,
                        padding: 3,
                        cursor: 'pointer'
                    }}
                    onClick={handleContainerClick}
                >
                    <i className="solar-upload-bold-duotone text-4xl" />
                    <Typography variant="body1">
                        {Array.isArray(value) && value.length > 0 && hasFileLimit
                            ? `Add more files (${value.length}/${fileLimit})`
                            : (Array.isArray(value) && value.length > 0
                                ? "Add more files"
                                : (placeholder || "Drag and drop your files here, or click to select"))}
                    </Typography>
                    {hasFileSizeLimit && (
                        <Typography variant="caption" color="text.secondary">
                            Max size: {maxSize}MB
                        </Typography>
                    )}
                </Box>
            )}

            {/* Max Files Reached Message */}
            {hasFileLimit && Array.isArray(value) && value.length >= fileLimit && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Maximum number of files reached ({fileLimit})
                </Typography>
            )}
        </Paper>
    );

    const renderImageCropVariant = () => (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: error || customError ? 'error.main' : 'divider',
                    bgcolor: 'background.paper',
                    position: 'relative',
                    opacity: disabled ? 0.7 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={accept || 'image/*'}
                    disabled={disabled}
                    style={{
                        display: 'none'
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 2,
                        cursor: preview || disabled ? 'default' : 'pointer'
                    }}
                    onClick={preview || disabled ? undefined : handleContainerClick}
                >
                    {!preview ? (
                        <>
                            <i className="solar-gallery-add-bold-duotone text-4xl" />
                            <Typography variant="body1">
                                {placeholder || 'Drag and drop your image here, or click to select'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {aspectRatio === 1
                                    ? 'Square images work best (1:1)'
                                    : `Aspect ratio: ${aspectRatio}`}
                            </Typography>
                            {hasFileSizeLimit && (
                                <Typography variant="caption" color="text.secondary">
                                    Max size: {maxSize}MB
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: previewSize,
                                        height: previewSize / aspectRatio,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        boxShadow: 1,
                                        mb: 1
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={preview}
                                        alt="Cropped Preview"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={disabled ? undefined : handleContainerClick}
                                        startIcon={<i className="solar-pen-bold-duotone" />}
                                        disabled={disabled}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={disabled ? undefined : () => handleRemove()}
                                        startIcon={<i className="solar-trash-bin-trash-bold-duotone" />}
                                        disabled={disabled}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Image Cropper Dialog */}
            <Dialog
                open={cropOpen}
                onClose={() => setCropOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{cropperTitle}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                        {/* Crop Preview Area */}
                        <Box
                            ref={cropAreaRef}
                            sx={{
                                width: '100%',
                                height: 300,
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                cursor: dragging ? 'grabbing' : 'grab',
                                touchAction: 'none'
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {cropperImage && (
                                <Box
                                    component="img"
                                    ref={imageRef}
                                    src={cropperImage}
                                    alt="Crop Preview"
                                    sx={{
                                        position: 'absolute',
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                        transformOrigin: '0 0',
                                        maxWidth: 'none'
                                    }}
                                    onLoad={(e) => {
                                        // Center image on load
                                        const img = e.target;
                                        const cropArea = cropAreaRef.current;
                                        if (img && cropArea) {
                                            const rect = cropArea.getBoundingClientRect();
                                            setPosition({
                                                x: (rect.width - img.width * zoom) / 2,
                                                y: (rect.height - img.height * zoom) / 2
                                            });
                                        }
                                    }}
                                />
                            )}
                        </Box>

                        {/* Zoom Slider */}
                        <Box sx={{ width: '100%', px: 2 }}>
                            <Typography id="zoom-slider" gutterBottom>
                                Zoom
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <i className="solar-minimize-square-bold-duotone" />
                                <Slider
                                    value={zoom}
                                    onChange={(_, newValue) => setZoom(newValue)}
                                    min={0.5}
                                    max={3}
                                    step={0.01}
                                    aria-labelledby="zoom-slider"
                                    sx={{ mx: 2 }}
                                />
                                <i className="solar-maximize-bold-duotone" />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCropOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={applyCrop}>Apply</Button>
                </DialogActions>
            </Dialog>
        </>
    );

    const renderAvatarVariant = () => {
        const avatarDimensions = getAvatarSize();

        // Get avatar props for background color and initials
        const avatarProps = useNameColors && !preview
            ? stringAvatar(
                avatarName,
                { bgcolor: avatarColor || undefined },
                !avatarName && customInitials ? null : (!avatarName ? defaultIcon : null),
                avatarTextColor
            )
            : {};

        // Determine what to display inside the avatar
        let avatarContent;
        if (preview) {
            avatarContent = null; // No content when we have an image
        } else if (customInitials) {
            avatarContent = customInitials; // Custom initials take priority
        } else if (avatarProps.children) {
            avatarContent = avatarProps.children; // Generated initials or icon from stringAvatar
        } else {
            avatarContent = <i className={defaultIcon} />; // Fallback to default icon
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    opacity: disabled ? 0.7 : 1
                }}
            >
                {/* Avatar with overlay */}
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={preview}
                        alt={avatarName || "User Avatar"}
                        sx={{
                            ...avatarDimensions,
                            bgcolor: preview
                                ? 'transparent'
                                : (avatarColor || (useNameColors ? avatarProps.sx?.bgcolor : 'text.secondary')),
                            color: avatarTextColor,
                            fontSize: avatarDimensions.height / 2.5,
                            border: 3,
                            borderColor: 'background.paper',
                            boxShadow: 2,
                            ...(avatarProps.sx || {})
                        }}
                    >
                        {avatarContent}
                    </Avatar>

                    {/* Upload/Change button overlay */}
                    {!uploading && !disabled && (
                        <IconButton
                            onClick={handleContainerClick}
                            sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: -4,
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                                boxShadow: 1,
                                width: 40,
                                height: 40
                            }}
                            aria-label={preview ? "Change avatar" : "Upload avatar"}
                        >
                            <i className={preview ? "solar-pen-bold" : "solar-camera-bold"} />
                        </IconButton>
                    )}

                    {/* Loading overlay */}
                    {uploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '50%'
                            }}
                        >
                            <CircularProgress size={avatarDimensions.width / 2} color="primary" />
                        </Box>
                    )}
                </Box>

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={accept || 'image/*'}
                    disabled={disabled}
                    style={{ display: 'none' }}
                />

                {/* Remove button (optional) */}
                {preview && allowRemove && !disabled && (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemove()}
                        startIcon={<i className="solar-trash-bin-trash-bold-duotone" />}
                        disabled={uploading || disabled}
                    >
                        Remove
                    </Button>
                )}
            </Box>
        );
    };

    const renderDropzoneVariant = () => (
        <>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept={accept}
                multiple={variant === 'multiple'}
                disabled={disabled}
                style={{ display: 'none' }}
                id="dropzone-file-input"
            />

            <label htmlFor={!disabled ? "dropzone-file-input" : undefined} style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' }}>
                <Paper
                    variant="outlined"
                    sx={{
                        height,
                        border: '2px dashed',
                        borderColor: error || customError ? 'error.main' :
                            isDragActive ? 'primary.main' :
                                isSuccess ? 'success.main' : 'divider',
                        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        opacity: disabled ? 0.7 : 1,
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                    onDragEnter={disabled ? undefined : handleDragEnter}
                    onDragLeave={disabled ? undefined : handleDragLeave}
                    onDragOver={disabled ? undefined : handleDragOver}
                    onDrop={disabled ? undefined : handleDrop}
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
                                    {value instanceof File ? value.name : (
                                        Array.isArray(value) ? `${value.length} files selected` : 'File uploaded'
                                    )}
                                </Typography>
                            </>
                        )}

                        {/* Error state */}
                        {!uploading && !isSuccess && customError && (
                            <>
                                <i className="solar-close-circle-bold-duotone text-4xl" style={{ color: 'var(--mui-palette-error-main)' }} />
                                <Typography variant="body1" color="error">{customError}</Typography>
                                <Typography variant="body2">{dropText}</Typography>
                            </>
                        )}

                        {/* Default state */}
                        {!uploading && !isSuccess && !customError && (
                            <>
                                <i className="solar-upload-bold-duotone text-4xl" style={{ color: isDragActive ? 'var(--mui-palette-primary-main)' : undefined }} />
                                <Typography variant="body1">
                                    {isDragActive ? 'Drop your file here' : (placeholder || dropText)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isDragActive ? '' : (helperText || `Click or drag to upload${variant === 'multiple' ? ' files' : ''}`)}
                                </Typography>
                                {hasFileSizeLimit && (
                                    <Typography variant="caption" color="text.secondary">
                                        Max size: {maxSize}MB
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                </Paper>
            </label>
        </>
    );

    // Render the component based on variant
    return (
        <FormControl fullWidth error={!!error || !!customError}>
            {label && (
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {label}
                </Typography>
            )}

            {variant === 'default' && renderDefaultVariant()}
            {variant === 'multiple' && renderMultipleVariant()}
            {variant === 'image-crop' && renderImageCropVariant()}
            {variant === 'avatar' && renderAvatarVariant()}
            {variant === 'dropzone' && renderDropzoneVariant()}

            {(error || customError) && !isDragActive && (
                <FormHelperText>{error?.message || customError}</FormHelperText>
            )}
            {!error && !customError && helperText && variant !== 'dropzone' && !isDragActive && (
                <FormHelperText>{helperText}</FormHelperText>
            )}
        </FormControl>
    );
};

/**
 * File Input component with React Hook Form integration
 */
const FileInput = ({ name, control, setFormError, ...props }) => {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={props.variant === 'multiple' ? [] : null}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                // Now you could pass setFormError to BaseFileInput
                return (
                    <BaseFileInput
                        {...props}
                        onChange={(file) => {
                            onChange(file);
                        }}
                        value={value}
                        error={error?.message}
                        name={name}
                        setFormError={typeof setFormError === 'function' ?
                            ((message) => setFormError(name, { message })) :
                            undefined}
                    />
                );
            }}
        />
    );
};

export default FileInput;