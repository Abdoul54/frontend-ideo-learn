import { Controller } from 'react-hook-form';
import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';

/**
 * RadioInput component renders a controlled Material-UI RadioGroup with options.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the radio group
 * @param {Array} props.options - Array of option objects to display
 * @param {string} [props.valueKey="value"] - Key to use for option values
 * @param {string} [props.labelKey="label"] - Key to use for option labels
 * @param {boolean} [props.row=false] - Whether to display options in a row
 * @returns {JSX.Element} Rendered RadioInput component
 */
export default function RadioInput({
    name,
    control,
    label,
    options,
    valueKey = 'value',
    labelKey = 'label',
    row = false
}) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <FormControl error={!!error}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <RadioGroup
                        {...field}
                        row={row}
                    >
                        {options.map((option) => (
                            <FormControlLabel
                                key={option[valueKey]}
                                value={option[valueKey]}
                                control={<Radio />}
                                label={option[labelKey]}
                            />
                        ))}
                    </RadioGroup>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
            )}
        />
    );
}