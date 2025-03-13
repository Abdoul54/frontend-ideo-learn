// src/components/inputs/TextInput.tsx
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

/**
 * TextInput component renders a controlled Material-UI TextField.
 * 
 * @param {Object} props - The component props
 * @param {string} props.name - Field name for form control
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the input field
 * @param {string} [props.type="text"] - Input type (text, password, email, etc.)
 * @returns {JSX.Element} Rendered TextInput component
 */
export default function TextInput({ name, control, label, type = "text", ...props }) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
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
                        }
                    }}
                    disabled={props.disabled || control.isSubmitting}
                    label={label}
                    type={type}
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                />
            )}
        />
    );
}
