// src/components/inputs/PhoneInput.tsx
import { Controller } from 'react-hook-form';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { InputAdornment, TextField } from '@mui/material';
import { countries } from '@/utils/getters/getCountries';

/**
 * PhoneInput component renders a phone input field that integrates with React Hook Form.
 * The country is obtained from props rather than an integrated country selector.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for phone number form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.countryCode - Country code provided from parent component
 * @param {string} props.label - Label text for the phone input field
 * @param {boolean} props.required - Whether the field is required
 * @returns {JSX.Element} Rendered PhoneInput component
 */
export default function PhoneInput({
    name,
    control,
    countryCode = 'MA',
    label = 'Phone Number',
    required = false,
    ...props
}) {
    // Validate phone number for the selected country
    const validatePhone = (phone) => {
        if (!phone && !required) return true;
        if (!phone && required) return 'Phone number is required';

        try {
            const parsedNumber = parsePhoneNumberFromString(phone, countryCode);
            return parsedNumber?.isValid() || 'Invalid phone number for selected country';
        } catch (error) {
            return 'Invalid phone number format';
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={{
                validate: (value) => validatePhone(value)
            }}
            render={({ field, fieldState: { error } }) => {
                // Get selected country for placeholder
                const selectedCountry = countries.find(
                    c => c.code === countryCode
                ) || countries.find(c => c.code === 'US');

                return (
                    <TextField
                        {...field}
                        {...props}
                        sx={{
                            '& textarea': {
                                '&::-webkit-scrollbar': {
                                    width: '0.4em',
                                    height: '0.4em'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'var(--mui-palette-background-paper)'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'var(--mui-palette-primary-main)',
                                    borderRadius: 2
                                }
                            },
                            ...props.sx
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" className='flex items-center gap-1'>
                                <i className={selectedCountry?.flag} />
                                {selectedCountry?.dialCode}
                            </InputAdornment>
                        }}
                        disabled={props.disabled || control.isSubmitting}
                        label={label}
                        type="tel"
                        inputMode="tel"
                        fullWidth
                        placeholder={selectedCountry?.placeholder}
                        error={!!error}
                        helperText={error?.message}
                    />
                );
            }}
        />
    );
}