// src/components/inputs/SelectInput.tsx
import { Controller } from 'react-hook-form';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';

/**
 * SelectInput component renders a controlled Material-UI Select with options.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the select field
 * @param {Array} props.options - Array of option objects to display
 * @param {string} [props.valueKey="value"] - Key to use for option values
 * @param {string} [props.labelKey="label"] - Key to use for option labels
 * @returns {JSX.Element} Rendered SelectInput component
 */
export default function SelectInput({ name, control, label, options = [], valueKey = 'value', labelKey = 'label', ...props }) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        {...field}
                        {...props}
                        label={label}
                        error={!!error}
                    >
                        {options.map((option) => (
                            <MenuItem key={option?.[valueKey]} value={option?.[valueKey]}>
                                {option?.[labelKey]}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                </FormControl>
            )}
        />
    );
}