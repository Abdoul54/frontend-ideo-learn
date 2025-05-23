'use client';

import { InputAdornment, MenuItem, Select, TextField, Tooltip } from "@mui/material";
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
    const { watch, getValues, setValue, formState } = formContext || {};
    const [disableOtherLanguages, setDisableOtherLanguages] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

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
        setDisableOtherLanguages(isDefaultEmpty && currentLang !== actualDefaultLang && currentLang !== 'all');
    }, [watch ? watch(`${name}.${actualDefaultLang}`) : null, currentLang, actualDefaultLang, name, formContext, getValues]);

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        const prevLang = currentLang;

        if (!formContext) {
            onLanguageChange(newLang);
            return;
        }

        // Critical fix: When switching FROM "all" TO a specific language
        if (prevLang === 'all' && newLang !== 'all') {
            const allValue = getValues(`${name}.all`);

            // Copy "all" value to the specific language if it has a value
            if (allValue && allValue.trim() !== '') {
                setValue(`${name}.${newLang}`, allValue);

                // IMPORTANT: Clear the "all" field to ensure we get a multi_lang payload
                setTimeout(() => {
                    setValue(`${name}.all`, '');
                }, 100);

                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 5000);
            }
        }

        // When switching TO "all" FROM a specific language
        if (prevLang !== 'all' && newLang === 'all') {
            const specificValue = getValues(`${name}.${prevLang}`);

            // If "all" is empty but the specific language has content, copy it to "all"
            if ((!getValues(`${name}.all`) || getValues(`${name}.all`).trim() === '') &&
                specificValue && specificValue.trim() !== '') {
                setValue(`${name}.all`, specificValue);
            }
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
                        onChange={(e) => {
                            onChange(e);
                            // If we're editing "all" and it was previously cleared, make sure other languages are reset
                            if (currentLang === 'all' && e.target.value && e.target.value.trim() !== '') {
                                // Optionally auto-fill all languages with the same value
                                // This is commented out as it may not be desired behavior
                                // languagesToDisplay.forEach(lang => {
                                //     if (lang.code !== 'all') {
                                //         setValue(`${name}.${lang.code}`, e.target.value);
                                //     }
                                // });
                            }
                        }}
                        value={value || ''}
                        {...props}
                        label={
                            currentLang === actualDefaultLang && systemDefaultLanguage
                                ? `${label} (Default Language)`
                                : currentLang === 'all'
                                    ? `${label} (All Languages)`
                                    : `${label} (${currentLang.toUpperCase()})`
                        }
                        fullWidth
                        error={!!getError(fieldState, name, applyToAllLanguages, currentLang)}
                        helperText={
                            getError(fieldState, name, applyToAllLanguages, currentLang) ||
                            (showWarning && currentLang !== 'all'
                                ? "Switched to multilingual mode. 'All Languages' field was cleared."
                                : "") ||
                            (currentLang === actualDefaultLang && disableOtherLanguages
                                ? "You must fill this field before switching languages"
                                : "") ||
                            (currentLang === 'all'
                                ? "Setting text here will use the same value for all languages"
                                : "")
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
                                                disabled={lang.code !== actualDefaultLang &&
                                                    lang.code !== 'all' &&
                                                    disableOtherLanguages}
                                            >
                                                {lang.code === systemDefaultLanguage && lang.code !== 'all'
                                                    ? `${lang.label} (Default)`
                                                    : lang.label}
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
            {currentLang !== actualDefaultLang &&
                currentLang !== 'all' &&
                disableOtherLanguages && (
                    <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>
                        You must fill the {languagesToDisplay.find(l => l.code === actualDefaultLang)?.label} field first
                    </div>
                )}
        </>
    );
}