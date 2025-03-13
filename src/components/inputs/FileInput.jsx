import React, { useCallback, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    FormControl,
    FormHelperText
} from '@mui/material';


const BaseFileInput = ({
    onChange,
    value,
    label,
    error,
    accept
}) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    const updatePreview = useCallback((file) => {
        if (file && file instanceof File && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, []);

    React.useEffect(() => {
        updatePreview(value);
    }, [value, updatePreview]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        console.log('Selected file:', file);
        console.log('event.target.files:', event.target.files);
        console.log('Is file instanceof File?', file instanceof File);
        onChange(file);
    };

    const handleRemove = () => {
        onChange(null);
    };

    const handleContainerClick = () => {
        // Programmatically click the hidden file input
        fileInputRef.current?.click();
    };

    return (
        <FormControl fullWidth error={!!error}>
            {label && (
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {label}
                </Typography>
            )}

            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: error ? 'error.main' : 'divider',
                    bgcolor: 'background.paper',
                    position: 'relative',
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={accept}
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
                        gap: 1,
                        padding: 4,
                        cursor: 'pointer'
                    }}
                    onClick={handleContainerClick}
                >
                    {!value ? (
                        <>
                            <i className="solar-upload-bold-duotone text-4xl" />
                            <Typography variant="body1">
                                Drag and drop your file here, or click to select
                            </Typography>
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
                                        <i className='solar-file-bold-duotone' />
                                    )}
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                        {value.name}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent container click
                                        handleRemove();
                                    }}
                                >
                                    <i className='solar-close-circle-line-duotone' />
                                </IconButton>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Paper>
            {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    );
};

const FileInput = ({
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
                    <BaseFileInput
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

export default FileInput;