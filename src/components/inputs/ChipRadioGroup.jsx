import React, { useState, useEffect } from 'react';
import { Stack, Chip, FormControl, FormLabel, RadioGroup } from '@mui/material';

/**
 * @typedef {Object} Option
 * @property {string} value - The option's value
 * @property {React.ReactNode} label - The option's display label
 */

/**
 * ChipRadioGroup - A customizable radio group that uses MUI Chips as selectable elements
 * 
 * @param {Object} props - Component props
 * @param {Option[]} props.options - Array of options to display
 * @param {string} [props.name='options'] - Name attribute for the radio group
 * @param {React.ReactNode} [props.label='Select an option'] - Label for the form control
 * @param {string} [props.value] - Controlled value
 * @param {string} [props.defaultValue=''] - Initially selected value
 * @param {Function} [props.onChange] - Callback fired when selection changes, receives selected value
 * @param {'row'|'column'|'row-reverse'|'column-reverse'} [props.direction='row'] - Direction of the chips
 * @param {number} [props.spacing=1] - Spacing between chips
 * @param {Object} [props.chipProps={}] - Props passed to each Chip component
 * @param {Object} [props.formControlProps={}] - Props passed to FormControl component
 * @param {Object} [props.labelProps={}] - Props passed to FormLabel component
 * @param {Object} [props.radioGroupProps={}] - Props passed to RadioGroup component
 * @param {Object} [props.stackProps={}] - Props passed to Stack component
 * @returns {React.ReactElement} The ChipRadioGroup component
 */
const ChipRadioGroup = ({
    options,
    name = 'options',
    label = 'Select an option',
    value,
    defaultValue = '',
    onChange,
    direction = 'row',
    spacing = 1,
    chipProps = {},
    formControlProps = {},
    labelProps = {},
    radioGroupProps = {},
    stackProps = {},
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    // Use controlled value if provided, otherwise use internal state
    const selectedValue = value !== undefined ? value : internalValue;

    // Update internal state when value prop changes
    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    /**
     * Handles change in the selected value
     * @param {string} value - The newly selected value
     */
    const handleChange = (value) => {
        setInternalValue(value);
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <FormControl component="fieldset" {...formControlProps} fullWidth>
            {label && <FormLabel component="legend" {...labelProps}>{label}</FormLabel>}
            <RadioGroup
                aria-label={name}
                name={name}
                value={selectedValue}
                {...radioGroupProps}
            >
                <Stack direction={direction} spacing={spacing} sx={{ mt: 1 }} {...stackProps}>
                    {options.map((option) => (
                        <Chip
                            key={option.value}
                            label={option.label}
                            onClick={() => handleChange(option.value)}
                            color={selectedValue === option.value ? "primary" : "default"}
                            variant={selectedValue === option.value ? "filled" : "outlined"}
                            sx={{
                                cursor: 'pointer',
                                ...chipProps.sx,
                            }}
                            {...chipProps}
                        />
                    ))}
                </Stack>
            </RadioGroup>
        </FormControl>
    );
};

export default ChipRadioGroup;