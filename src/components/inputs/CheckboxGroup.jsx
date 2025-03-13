'use client';

import { Controller } from 'react-hook-form';
import {
    Box,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    Paper,
    Stack,
    Typography,
    alpha
} from '@mui/material';

/**
 * CheckboxGroup component for rendering a styled group of checkboxes with React Hook Form
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} [props.label] - Group label
 * @param {Array} props.options - Array of options to render as checkboxes
 * @param {string} [props.optionLabelKey='label'] - Key to use from options for label text
 * @param {string} [props.optionValueKey='value'] - Key to use from options for values
 * @param {boolean} [props.row=false] - Whether to display checkboxes in a row
 * @param {Object} [props.formControlProps] - Props to pass to FormControl
 * @param {Object} [props.formGroupProps] - Props to pass to FormGroup
 * @param {boolean} [props.disabled=false] - Whether the entire group is disabled
 * @param {string} [props.variant='outlined'] - Visual variant: 'outlined', 'elevated', or 'plain'
 * @returns {JSX.Element} Rendered CheckboxGroup component
 */
export default function CheckboxGroup({
    name,
    control,
    label,
    options = [],
    optionLabelKey = 'label',
    optionValueKey = 'value',
    row = false,
    formControlProps = {},
    formGroupProps = {},
    disabled = false,
    variant = 'outlined'
}) {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={[]}
            render={({ field, fieldState: { error } }) => {
                const selectedValues = field.value || [];

                const handleChange = (optionValue, checked) => {
                    const newValue = [...selectedValues];

                    if (checked) {
                        // Add value if it doesn't exist
                        if (!newValue.includes(optionValue)) {
                            newValue.push(optionValue);
                        }
                    } else {
                        // Remove value if it exists
                        const index = newValue.indexOf(optionValue);
                        if (index !== -1) {
                            newValue.splice(index, 1);
                        }
                    }

                    field.onChange(newValue);
                };

                // Determine Paper elevation based on variant
                const elevation = variant === 'elevated' ? 1 : 0;

                // Style the container based on variant
                const containerStyling = {
                    p: 2,
                    mt: 1,
                    border: variant === 'outlined' ? 1 : 0,
                    borderColor: variant === 'outlined' ? 'divider' : 'transparent',
                    borderRadius: 1,
                    bgcolor: variant === 'plain' ? 'transparent' : 'background.paper',
                    ...(variant === 'elevated' && { boxShadow: 1 })
                };

                return (
                    <FormControl
                        error={!!error}
                        component="fieldset"
                        variant="standard"
                        fullWidth
                        {...formControlProps}
                    >
                        {label && (
                            <FormLabel
                                component="legend"
                                sx={{
                                    fontWeight: 500,
                                    color: 'text.primary',
                                    mb: 1
                                }}
                            >
                                {label}
                            </FormLabel>
                        )}

                        <Paper
                            variant={variant === 'plain' ? 'outlined' : 'elevation'}
                            elevation={elevation}
                            sx={containerStyling}
                        >
                            <FormGroup row={row} {...formGroupProps}>
                                <Stack spacing={1} width="100%">
                                    {options.map((option, index) => {
                                        const optionValue = option[optionValueKey] || option;
                                        const optionLabel = option[optionLabelKey] || option;
                                        const isChecked = selectedValues.includes(optionValue);

                                        return (
                                            <Box key={`${optionValue}-${index}`}>
                                                {index > 0 && <Divider sx={{ my: 0.5 }} />}
                                                <FormControlLabel
                                                    sx={{
                                                        margin: 0,
                                                        padding: 1,
                                                        borderRadius: 1,
                                                        width: '100%',
                                                        '&:hover': {
                                                            bgcolor: theme => alpha(theme.palette.primary.main, 0.04)
                                                        },
                                                        ...(isChecked && {
                                                            bgcolor: theme => alpha(theme.palette.primary.main, 0.08)
                                                        })
                                                    }}
                                                    control={
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onChange={(e) => handleChange(optionValue, e.target.checked)}
                                                            disabled={disabled || option.disabled}
                                                            sx={{ ml: -0.5 }}
                                                        />
                                                    }
                                                    label={
                                                        <Stack spacing={0.5} sx={{ ml: 1 }}>
                                                            <Typography variant="body2" fontWeight={isChecked ? 500 : 400}>
                                                                {optionLabel}
                                                            </Typography>
                                                            {typeof option === 'object' && option.description && (
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    {option.description}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    }
                                                />
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </FormGroup>
                        </Paper>

                        {error && (
                            <FormHelperText sx={{ mt: 1 }}>{error.message}</FormHelperText>
                        )}
                    </FormControl>
                );
            }}
        />
    );
}