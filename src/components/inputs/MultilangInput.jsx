import {
    TextField,
    InputAdornment,
    Select,
    MenuItem
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

export default function SmartMultilangTextInput({
    name,
    control,
    label,
    setValue,
    getValues,
    watch,
    required = true,
}) {
    const { language, languages } = useLanguage();

    const [lang, setLang] = useState();

    // Set initial language once it's available
    useEffect(() => {
        if (language?.locale) {
            setLang(language.locale);
        }
    }, [language]);

    // Ensure the current language field has a default value
    useEffect(() => {
        if (lang) {
            const currentValue = getValues(`${name}.${lang}`);
            if (currentValue === undefined) {
                setValue(`${name}.${lang}`, '');
            }
        }
    }, [lang, getValues, setValue, name]);

    // Guard for when lang isn't set yet
    if (!lang || !languages) return null;

    const currentLangName = languages?.find((l) => l.code === lang)?.name || lang;
    const defaultLangValue = watch(`${name}.${language?.locale}`);

    return (
        <Controller
            key={lang}
            name={`${name}.${lang}`}
            control={control}
            rules={{
                validate: (val) => {
                    // Ensure default language is required
                    if (required && lang === language?.locale) {
                        if (!val?.trim()) return `${currentLangName} is required`;
                    }
                    return true;
                },
                // Add this to ensure proper object structure
                setValueAs: (value) => {
                    if (value === "") return undefined;
                    return value;
                }
            }}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    fullWidth
                    label={`${label} (${currentLangName})`}
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Select
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value)}
                                    variant="standard"
                                    sx={{ minWidth: 85 }}
                                    disableUnderline
                                    disabled={!defaultLangValue?.trim()}
                                >
                                    {languages.map((l) => (
                                        <MenuItem key={l.code} value={l.code}>
                                            {l.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </InputAdornment>
                        )
                    }}
                />
            )}
        />
    );
}
