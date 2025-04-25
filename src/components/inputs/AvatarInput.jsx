import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
    Avatar,
    Badge,
    FormControl,
    FormHelperText,
    Box,
    styled,
    Tooltip
} from '@mui/material';
import { stringAvatar } from '@/utils/avatarGenerator';

// Styled Badge component to overlay the camera icon
const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid currentColor',
            content: '""',
        },
    },
}));

/**
 * AvatarInput component renders an Avatar that acts as a file input
 * using Material-UI components and React Hook Form.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.alt - Alt text for the avatar
 * @param {string} props.defaultName - Name to use for generating avatar placeholder
 * @param {string[]} [props.accept] - Accepted file types (defaults to image/*)
 * @param {number} [props.maxSize=4194304] - Maximum file size in bytes (default 4MB)
 * @param {Object} [props.avatarProps] - Props to pass to the Avatar component
 * @returns {JSX.Element} Rendered AvatarInput component
 */
export default function AvatarInput({
    name,
    control,
    alt,
    initialAvatar = '',
    defaultName,
    accept = ['image/*'],
    maxSize = 4 * 1024 * 1024, // 4MB default
    avatarProps = {},
    ...props
}) {

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => {
                const [fileError, setFileError] = useState('');
                const [preview, setPreview] = useState(initialAvatar);

                // Create preview URL when value (File object) changes
                useEffect(() => {
                    if (!value) {
                        setPreview(initialAvatar);
                        return;
                    }

                    // If value is already a string (URL/data URL), use it directly
                    if (typeof value === 'string') {
                        setPreview(value);
                        return;
                    }

                    // Create object URL from File object
                    const objectUrl = URL.createObjectURL(value);
                    setPreview(objectUrl);

                    // Clean up on unmount
                    return () => URL.revokeObjectURL(objectUrl);
                }, [value]);

                const handleChange = (event) => {
                    const files = event.target.files;
                    if (!files || files.length === 0) return;

                    const file = files[0];

                    // Validate file size
                    if (file.size > maxSize) {
                        setFileError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
                        return;
                    }

                    setFileError('');

                    // Set the File object as the field value
                    onChange(file);
                };

                return (
                    <FormControl error={!!error || !!fileError}>
                        <Tooltip title="Click to change avatar">
                            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                                <input
                                    id={`avatar-input-${name}`}
                                    type="file"
                                    accept={accept?.join(',')}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                    disabled={props.disabled || control.isSubmitting}
                                    {...field}
                                    value=""
                                />
                                <label htmlFor={`avatar-input-${name}`}>
                                    <StyledBadge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={<i className='solar-camera-linear' />}
                                    >
                                        <Avatar
                                            alt={alt || defaultName}
                                            src={preview}
                                            {...stringAvatar(defaultName)}
                                            {...avatarProps}
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                fontSize: '1.25rem',
                                                cursor: 'pointer',
                                                ...avatarProps.sx
                                            }}
                                        />
                                    </StyledBadge>
                                </label>
                            </Box>
                        </Tooltip>

                        {(error || fileError) && (
                            <FormHelperText error>{error?.message || fileError}</FormHelperText>
                        )}
                    </FormControl>
                );
            }}
        />
    );
}