'use client';

import { InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";

export default function MultilingualTextInput({
    name,
    control,
    label,
    applyToAllLanguages = false,
    currentLang,
    onLanguageChange,
    adorment,
    required = false,
    defaultLanguage = 'en',
    languages = [],
    ...props
}) {
    // Access form context - will be available because we wrapped with FormProvider
    const formContext = useFormContext();
    const { watch, getValues, formState } = formContext || {};
    const [disableOtherLanguages, setDisableOtherLanguages] = useState(false);

    // Use provided languages or fallback to defaults
    const languagesToDisplay = languages.length > 0 ? languages : [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Spanish' },
        { code: 'fr', label: 'French' },
        { code: 'ar', label: 'Arabic' },
    ];

    // Check if default language has value
    useEffect(() => {
        if (!formContext) return;

        const defaultValue = getValues(`${name}.${defaultLanguage}`);
        const isDefaultEmpty = !defaultValue || defaultValue.trim() === '';
        setDisableOtherLanguages(isDefaultEmpty && currentLang !== defaultLanguage);

        // If default is empty and user is on a different language, force back to default
        if (isDefaultEmpty && currentLang !== defaultLanguage) {
            onLanguageChange(defaultLanguage);
        }
    }, [watch ? watch(`${name}.${defaultLanguage}`) : null, currentLang, defaultLanguage, name, formContext]);

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        if (!formContext) {
            onLanguageChange(newLang);
            return;
        }

        const defaultValue = getValues(`${name}.${defaultLanguage}`);

        // Only allow changing if default language has content or user is selecting default language
        if (!defaultValue && newLang !== defaultLanguage) {
            return; // Prevent language change
        }

        onLanguageChange(newLang);
    };

    // Get error message based on field state
    const getError = (fieldState, fieldName, applyToAllLanguages, lang) => {
        if (!fieldState.error) return '';

        // For universal translation
        if (applyToAllLanguages && fieldState.error?.message) {
            return fieldState.error.message;
        }

        // For specific language errors
        if (fieldState.error?.types?.[lang]) {
            return fieldState.error.types[lang];
        }

        // General error for this field
        return fieldState.error?.message || '';
    };

    return (
        <>
            <Controller
                name={`${name}.${currentLang}`}
                control={control}
                key={currentLang} // Re-create the controller when language changes
                render={({ field: { onChange, value, ...field }, fieldState }) => (
                    <TextField
                        {...field}
                        onChange={onChange}
                        value={value || ''}
                        {...props}
                        label={label}
                        fullWidth
                        error={!!getError(fieldState, name, applyToAllLanguages, currentLang)}
                        helperText={
                            getError(fieldState, name, applyToAllLanguages, currentLang) ||
                            (currentLang === defaultLanguage && disableOtherLanguages ?
                                "You must fill this field before switching languages" : "")
                        }
                        InputProps={{
                            ...props.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Select
                                        value={currentLang}
                                        onChange={handleLanguageChange}
                                        variant="standard"
                                        sx={{ minWidth: 100 }}
                                    >
                                        {languagesToDisplay.map(lang => (
                                            <MenuItem
                                                key={lang.code}
                                                value={lang.code}
                                                disabled={lang.code !== defaultLanguage && disableOtherLanguages}
                                            >
                                                {lang.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {adorment}
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            />
            {currentLang !== defaultLanguage && disableOtherLanguages && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>
                    You must fill the {languagesToDisplay.find(l => l.code === defaultLanguage)?.label} field first
                </div>
            )}
        </>
    );
}