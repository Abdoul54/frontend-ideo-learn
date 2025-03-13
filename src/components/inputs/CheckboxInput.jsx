import { Controller } from 'react-hook-form';
import { Checkbox, FormControl, FormControlLabel, FormHelperText } from '@mui/material';

/**
 * CheckboxInput component renders a controlled Material-UI Checkbox with a label.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the checkbox
 * @param {boolean} [props.defaultValue=false] - Default value of the checkbox
 * @param {boolean} [props.disabled=false] - Whether the checkbox is disabled
 * @param {*} [props.checkedValue=true] - Value when checkbox is checked
 * @param {*} [props.uncheckedValue=false] - Value when checkbox is unchecked
 * @returns {JSX.Element} Rendered CheckboxInput component
 */
export default function CheckboxInput({
    name,
    control,
    label,
    defaultValue = false,
    disabled = false,
    checkedValue = true,
    uncheckedValue = false
}) {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl error={!!error}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value === checkedValue}
                                onChange={(e) => {
                                    onChange(e.target.checked ? checkedValue : uncheckedValue);
                                }}
                                disabled={disabled}
                            />
                        }
                        label={label}
                    />
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
            )}
        />
    );
}