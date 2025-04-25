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
    defaultLanguage = null, // Changed from 'en' to null
    languages = [],
    defaultLocale = null, // System default language from API
    ...props
}) {
    // Access form context - will be available because we wrapped with FormProvider
    const formContext = useFormContext();
    const { watch, getValues, formState } = formContext || {};
    const [disableOtherLanguages, setDisableOtherLanguages] = useState(false);

    // Use provided languages or fallback to empty array - don't use hardcoded defaults
    const languagesToDisplay = languages.length > 0 ? languages : [];

    // Identify the system default language (if any)
    const systemDefaultLanguage = defaultLocale;
    // Use systemDefaultLanguage as the actual default if provided, otherwise use defaultLanguage or first language in list
    const actualDefaultLang = systemDefaultLanguage || 
                              defaultLanguage || 
                              (languagesToDisplay.length > 0 ? languagesToDisplay[0].code : null);

    // Check if default language has value
    useEffect(() => {
        if (!formContext || !actualDefaultLang) return;

        const defaultValue = getValues(`${name}.${actualDefaultLang}`);
        const isDefaultEmpty = !defaultValue || defaultValue.trim() === '';
        setDisableOtherLanguages(isDefaultEmpty && currentLang !== actualDefaultLang);

        // If default is empty and user is on a different language, force back to default
        if (isDefaultEmpty && currentLang !== actualDefaultLang) {
            onLanguageChange(actualDefaultLang);
        }
    }, [watch ? watch(`${name}.${actualDefaultLang}`) : null, currentLang, actualDefaultLang, name, formContext]);

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        if (!formContext) {
            onLanguageChange(newLang);
            return;
        }

        const defaultValue = getValues(`${name}.${actualDefaultLang}`);

        // Only allow changing if default language has content or user is selecting default language
        if (!defaultValue && newLang !== actualDefaultLang) {
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
                        label={
                            currentLang === actualDefaultLang && systemDefaultLanguage
                                ? `${label} (Default Language)`
                                : label
                        }
                        fullWidth
                        error={!!getError(fieldState, name, applyToAllLanguages, currentLang)}
                        helperText={
                            getError(fieldState, name, applyToAllLanguages, currentLang) ||
                            (currentLang === actualDefaultLang && disableOtherLanguages ?
                                "You must fill this field before switching languages" : "") ||
                            (currentLang === systemDefaultLanguage && required && !value ?
                                "This field is required when 'All Languages' is not provided" : "")
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
                                                disabled={lang.code !== actualDefaultLang && disableOtherLanguages}
                                            >
                                                {lang.code === systemDefaultLanguage ?
                                                    `${lang.label} (Default)` :
                                                    lang.label}
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
            {currentLang !== actualDefaultLang && disableOtherLanguages && (
                <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>
                    You must fill the {languagesToDisplay.find(l => l.code === actualDefaultLang)?.label} field first
                </div>
            )}
        </>
    );
}