// src/components/inputs/CountrySelectInput.tsx
import { Controller } from 'react-hook-form';
import { TextField, MenuItem, Stack } from '@mui/material';
import { countries } from '@/utils/getters/getCountries';

export default function CountrySelectInput({
    name,
    control,
    label = 'Country',
    setCountryCode, // ← Receive this prop
    ...props
}) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => {
                // Use setCountryCode when the value changes
                const handleChange = (e) => {
                    field.onChange(e);

                    // Find the country code based on the selected country name
                    const selectedCountry = countries.find(c => c.name === e.target.value);
                    if (selectedCountry && setCountryCode) {
                        setCountryCode(selectedCountry.code);
                    }
                };

                return (
                    <TextField
                        select
                        {...field}
                        onChange={handleChange} // Use our custom handler
                        label={label}
                        error={!!error}
                        helperText={error?.message}
                        fullWidth
                        // Don't spread props here that shouldn't go to TextField
                        // setCountryCode should NOT be spread here
                        {...props}
                    >
                        {countries.map((country) => (
                            <MenuItem key={country.code} value={country.name} >
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <i className={`${country?.flag} text-2xl`} />
                                    {country.name}
                                </Stack>
                            </MenuItem>
                        ))}
                    </TextField>
                );
            }}
        />
    );
}