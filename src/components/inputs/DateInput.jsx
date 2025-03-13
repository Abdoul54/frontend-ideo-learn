import { Controller } from 'react-hook-form';
import { FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function DateInput({
    name,
    control,
    label,
    minDate,
    maxDate
}) {
    const handleDateChange = (date, onChange) => {

        if (date) {
            // Always convert to string format before updating the form
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            onChange(formattedDate);
        } else {
            onChange(null);
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                return (
                    <FormControl fullWidth error={!!error}>
                        <DatePicker
                            label={label}
                            // For display, convert string to dayjs object
                            value={value ? dayjs(value) : null}
                            // When date changes, convert back to string
                            onChange={(newValue) => handleDateChange(newValue, onChange)}
                            minDate={minDate && dayjs(minDate)}
                            maxDate={maxDate && dayjs(maxDate)}
                            // Make sure the date picker displays dates in the desired format
                            format="YYYY-MM-DD"
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!error,
                                    helperText: error?.message
                                }
                            }}
                        />
                    </FormControl>
                );
            }}
        />
    );
}