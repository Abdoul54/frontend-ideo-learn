import React from 'react'
import { Controller } from 'react-hook-form'
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Switch,
    FormControlLabel,
    Autocomplete,
    Checkbox,
    Box,
    Input,
    IconButton,
    Typography,
    Button
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { ChromePicker } from 'react-color'

const FieldRenderer = ({ field, control, errors }) => {
    const error = errors[field.name]
    const defaultProps = {
        fullWidth: true,
        size: 'small',
        error: !!error,
        helperText: error?.message
    }

    switch (field.type) {
        case 'text':
        case 'number':
        case 'email':
        case 'password':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { ref, ...inputProps } }) => (
                        <TextField
                            {...inputProps}
                            {...defaultProps}
                            inputRef={ref}
                            label={field.label}
                            type={field.type}
                            placeholder={field.placeholder}
                        />
                    )}
                />
            )

        case 'select':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { ref, ...selectProps } }) => (
                        <FormControl {...defaultProps}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select {...selectProps} label={field.label} inputRef={ref}>
                                {field.options?.map((option, index) => (
                                    <MenuItem key={index} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                    )}
                />
            )

        case 'multiselect':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    defaultValue={[]}
                    render={({ field: { ref, value = [], onChange, ...props } }) => (
                        <FormControl {...defaultProps}>
                            <Autocomplete
                                {...props}
                                multiple
                                value={Array.isArray(value) ? value : []}
                                onChange={(_, newValue) => onChange(newValue)}
                                options={field.options || []}
                                getOptionLabel={(option) => option?.label || ''}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        inputRef={ref}
                                        label={field.label}
                                        error={!!error}
                                        helperText={error?.message}
                                    />
                                )}
                            />
                        </FormControl>
                    )}
                />
            )
        case 'date':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { ref, ...dateProps } }) => (
                        <DatePicker
                            {...dateProps}
                            label={field.label}
                            slotProps={{
                                textField: {
                                    ...defaultProps,
                                    inputRef: ref
                                }
                            }}
                        />
                    )}
                />
            )

        case 'switch':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { value, ...switchProps } }) => (
                        <FormControlLabel
                            control={
                                <Switch
                                    {...switchProps}
                                    checked={value}
                                />
                            }
                            label={field.label}
                        />
                    )}
                />
            )

        case 'checkbox':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { value, ...checkboxProps } }) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    {...checkboxProps}
                                    checked={value}
                                />
                            }
                            label={field.label}
                        />
                    )}
                />
            )

        case 'textarea':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { ref, ...textareaProps } }) => (
                        <TextField
                            {...textareaProps}
                            {...defaultProps}
                            inputRef={ref}
                            label={field.label}
                            multiline
                            rows={field.rows || 4}
                        />
                    )}
                />
            )

        case 'color':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { value, onChange, ...props } }) => (
                        <FormControl {...defaultProps}>
                            <InputLabel shrink>{field.label}</InputLabel>
                            <Box sx={{ mt: 3 }}>
                                <ChromePicker
                                    color={value || '#fff'}
                                    onChange={(color) => onChange(color.hex)}
                                    disableAlpha={field.disableAlpha}
                                />
                            </Box>
                            {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                    )}
                />
            )

        case 'file':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { value, onChange, ...props } }) => (
                        <FormControl {...defaultProps}>
                            <InputLabel shrink>{field.label}</InputLabel>
                            <Box sx={{ mt: 3 }}>
                                <Input
                                    fullWidth
                                    type="file"
                                    inputProps={{
                                        multiple: field.multiple,
                                        accept: field.accept,
                                        'data-max-size': field.maxSize,
                                        'data-max-files': field.maxFiles
                                    }}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const maxSize = field.maxSize * 1024 * 1024; // Convert MB to bytes

                                        const validFiles = files.filter(file => {
                                            if (file.size > maxSize) {
                                                alert(`File ${file.name} exceeds ${field.maxSize}MB limit`);
                                                return false;
                                            }
                                            return true;
                                        });

                                        if (field.multiple && field.maxFiles && validFiles.length > field.maxFiles) {
                                            alert(`Maximum ${field.maxFiles} files allowed`);
                                            e.target.value = '';
                                            return;
                                        }

                                        onChange(field.multiple ? validFiles : validFiles[0]);
                                    }}
                                    multiple={field.multiple}
                                    accept={field.accept}
                                    sx={{ display: 'none' }}
                                    id={`file-input-${field.name}`}
                                />
                                <label htmlFor={`file-input-${field.name}`}>
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<i className="lucide-upload" />}
                                    >
                                        Upload {field.multiple ? 'Files' : 'File'}
                                    </Button>
                                </label>
                                {value && (
                                    <Box sx={{ mt: 1 }}>
                                        {field.multiple ? (
                                            value.map((file, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {file.name}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            const newFiles = value.filter((_, i) => i !== index)
                                                            onChange(newFiles)
                                                        }}
                                                    >
                                                        <i className="lucide-x" />
                                                    </IconButton>
                                                </Box>
                                            ))
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    {value.name}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onChange(null)}
                                                >
                                                    <i className="lucide-x" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                            {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                    )}
                />
            )


        case 'radio':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { value, onChange, ...props } }) => (
                        <FormControl {...defaultProps}>
                            <FormLabel>{field.label}</FormLabel>
                            <RadioGroup
                                row={field.row}
                                value={value}
                                onChange={onChange}
                            >
                                {field.options?.map((option, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={option.value}
                                        control={<Radio />}
                                        label={option.label}
                                    />
                                ))}
                            </RadioGroup>
                            {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                    )}
                />
            )

        case 'slider':
            return (
                <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { ...props } }) => (
                        <FormControl {...defaultProps}>
                            <InputLabel shrink>{field.label}</InputLabel>
                            <Box sx={{ mt: 3 }}>
                                <Slider
                                    {...props}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    marks={field.marks}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                    )}
                />
            )
        default:
            return null
    }
}

export default FieldRenderer