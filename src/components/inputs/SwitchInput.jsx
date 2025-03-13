import { Controller } from 'react-hook-form';
import { FormControl, FormControlLabel, FormHelperText, Switch } from '@mui/material';

/**
 * SwitchInput component renders a controlled Material-UI Switch with a label.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the switch
 * @param {boolean} [props.defaultValue=false] - Default value of the switch
 * @param {boolean} [props.disabled=false] - Whether the switch is disabled
 * @param {*} [props.checkedValue=true] - Value when switch is checked
 * @param {*} [props.uncheckedValue=false] - Value when switch is unchecked
 * @returns {JSX.Element} Rendered SwitchInput component
 */
export default function SwitchInput({
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
                            <Switch
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