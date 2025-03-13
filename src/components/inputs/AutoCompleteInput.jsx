import { Controller } from 'react-hook-form';
import { Autocomplete, FormControl, FormHelperText, TextField } from '@mui/material';

/**
 * AutoCompleteInput component renders a controlled Material-UI Autocomplete with options.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the autocomplete field
 * @param {Array} props.options - Array of option objects to display
 * @param {string} [props.valueKey="value"] - Key to use for option values
 * @param {string} [props.labelKey="label"] - Key to use for option labels
 * @param {boolean} [props.multiple=false] - Whether multiple values can be selected
 * @param {boolean} [props.freeSolo=false] - Whether the user can enter custom values
 * @param {boolean} [props.disabled=false] - Whether the field is disabled
 * @returns {JSX.Element} Rendered AutoCompleteInput component
 */
export default function AutoCompleteInput({
    name,
    control,
    label,
    options = [],
    valueKey = 'value',
    labelKey = 'label',
    multiple = false,
    freeSolo = false,
    disabled = false,
    ...props
}) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => {
                // Handle different value formats
                const selectedValue = multiple
                    ? Array.isArray(value)
                        ? value.map(val => options.find(option => option[valueKey] === val) || val)
                        : []
                    : options.find(option => option[valueKey] === value) || value;

                return (
                    <FormControl fullWidth error={!!error}>
                        <Autocomplete
                            {...field}
                            fullWidth
                            options={options}
                            value={selectedValue}
                            onChange={(event, newValue) => {
                                if (multiple) {
                                    // For multiple selection, extract the valueKey from each selected option
                                    onChange(
                                        freeSolo
                                            ? newValue // If freeSolo, keep custom values as is
                                            : newValue.map(item =>
                                                typeof item === 'object' && item !== null
                                                    ? item[valueKey]
                                                    : item
                                            )
                                    );
                                } else {
                                    // For single selection
                                    onChange(
                                        freeSolo
                                            ? newValue // If freeSolo, keep custom value as is
                                            : newValue
                                                ? typeof newValue === 'object' && newValue !== null
                                                    ? newValue[valueKey]
                                                    : newValue
                                                : null
                                    );
                                }
                            }}
                            getOptionLabel={(option) => {
                                // Handle different option formats
                                if (typeof option === 'string') return option;
                                if (option && typeof option === 'object') return option[labelKey] || '';
                                return '';
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={label}
                                    error={!!error}
                                    fullWidth
                                />
                            )}
                            multiple={multiple}
                            freeSolo={freeSolo}
                            disabled={disabled || control.isSubmitting}
                            {...props}
                        />
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                );
            }}
        />
    );
}
