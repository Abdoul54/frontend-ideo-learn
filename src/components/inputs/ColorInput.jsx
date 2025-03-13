import { Controller } from 'react-hook-form';
import { FormControl, FormHelperText, Box, TextField } from '@mui/material';
import { HexColorPicker } from "react-colorful";
import { useState } from 'react';

/**
 * ColorInput component renders a color input field with a color picker.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {string} props.name - The name of the input field.
 * @param {Object} props.control - The control object from react-hook-form.
 * @param {string} [props.label] - The label for the input field.
 * @param {string} [props.defaultValue="#ffffff"] - The default color value.
 * @returns {JSX.Element|null} The rendered ColorInput component or null if control is not provided.
 */
export default function ColorInput({
    name,
    control,
    label,
    defaultValue = "#ffffff"
}) {
    const [displayPicker, setDisplayPicker] = useState(false);

    if (!control) return null;

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                    <TextField
                        label={label}
                        value={String(value || defaultValue).replace('#', '')}
                        onChange={(e) => onChange('#' + e.target.value)}
                        variant='standard'
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <Box
                                    onClick={() => setDisplayPicker(!displayPicker)}
                                    sx={{
                                        width: 40,
                                        height: 34,
                                        borderRadius: 1,
                                        backgroundColor: value || defaultValue,
                                        border: '1px solid #ccc',
                                        cursor: 'pointer',
                                        mr: 1,
                                        '&:hover': {
                                            opacity: 0.8
                                        }
                                    }}
                                />
                            ),
                            sx: {
                                paddingLeft: 1,
                                height: 48,
                                alignItems: 'center'
                            }
                        }}
                    />
                    {displayPicker && (
                        <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0
                                }}
                                onClick={() => setDisplayPicker(false)}
                            />
                            <HexColorPicker
                                color={value || defaultValue}
                                onChange={onChange}
                            />
                        </Box>
                    )}
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
            )}
        />
    );
}