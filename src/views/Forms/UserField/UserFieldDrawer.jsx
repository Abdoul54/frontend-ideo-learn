'use client';

import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    List,
    ListItem,
    TextField,
    FormControlLabel,
    Switch,
    IconButton,
    Typography,
    Stack,
    ListItemText,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useState, useEffect } from "react";
import MultilingualTextInput from "@/components/inputs/MultilingualTextInput";
import SelectInput from "@/components/inputs/SelectInput";
import TextInput from "@/components/inputs/TextInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { usePostUserField, useUpdateUserField } from "@/hooks/api/tenant/useUserFields";
import { createSchema, defaultValues, fieldTypes } from "@/constants/UserFields";



const UserFieldDrawer = ({ open, onClose, data, defaultLanguage = 'fr' }) => {
    const [isUniversal, setIsUniversal] = useState(false);
    const [schema, setSchema] = useState(() => createSchema(false, defaultLanguage));
    const [currentLang, setCurrentLang] = useState(defaultLanguage);
    const addUserField = usePostUserField()
    const updateUserField = useUpdateUserField()

    // Update schema when isUniversal or defaultLanguage changes
    useEffect(() => {
        setSchema(createSchema(isUniversal, defaultLanguage));
    }, [isUniversal, defaultLanguage]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        const newData = {}
        if (data) {
            newData.type = data?.type
            newData.mandatory = data?.mandatory
            newData.invisible_to_user = data?.invisible_to_user
            newData.translations = data?.translations
            newData.sequence = data?.sequence

            if (data?.type === 'dropdownfield')
                newData.dropdown_options = data?.dropdown_options

            if (data?.type === 'iframe')
                newData.settings = data?.settings
            methods.reset(newData)
        }

    }, [data])
    const { control, handleSubmit, watch, setValue } = methods;
    const selectedType = watch('type');

    const onSubmit = (formData) => {
        console.log("Form being submitted", formData);
        console.log("Form state", methods.formState);

        // Create a copy of the form data to modify
        const submissionData = structuredClone(formData);

        // Handle dropdown options
        if (submissionData.type !== 'dropdownfield') {
            submissionData.dropdown_options = [];
        }

        // Handle iframe settings
        if (submissionData.type !== 'iframe') {
            submissionData.settings = {}; // Use empty object instead of null
        }

        // Handle translations based on universal flag
        if (isUniversal) {
            // Keep the universal translation and set language-specific ones to empty strings
            submissionData.translations.en = "";
            submissionData.translations.fr = "";
            submissionData.translations.ar = "";
            submissionData.translations.es = "";

            if (submissionData.dropdown_options?.length > 0) {
                submissionData.dropdown_options.forEach(option => {
                    option.translations.en = "";
                    option.translations.fr = "";
                    option.translations.ar = "";
                    option.translations.es = "";
                });
            }
        } else {
            // If not universal, remove the all translation but ensure language-specific ones exist
            delete submissionData.translations.all;

            // Ensure all language translations exist (even if empty)
            submissionData.translations.en = submissionData.translations.en || "";
            submissionData.translations.fr = submissionData.translations.fr || "";
            submissionData.translations.ar = submissionData.translations.ar || "";
            submissionData.translations.es = submissionData.translations.es || "";

            if (submissionData.dropdown_options?.length > 0) {
                submissionData.dropdown_options.forEach(option => {
                    delete option.translations.all;
                    // Ensure all option translations exist
                    option.translations.en = option.translations.en || "";
                    option.translations.fr = option.translations.fr || "";
                    option.translations.ar = option.translations.ar || "";
                    option.translations.es = option.translations.es || "";
                });
            }
        }

        // Convert boolean values to integers
        submissionData.mandatory = submissionData.mandatory ? 1 : 0;
        submissionData.invisible_to_user = submissionData.invisible_to_user ? 1 : 0;

        if (data) {
            updateUserField.mutateAsync({ id: data?.id, data: submissionData })
                .then(() => {
                    onClose();
                    methods.reset(defaultValues);
                })
                .catch(error => {
                    console.error('Error updating user field:', error);
                    // Reset form state for re-submission
                    methods.clearErrors();
                });
        } else {
            addUserField.mutateAsync(submissionData)
                .then(() => {
                    onClose();
                    methods.reset(defaultValues);
                })
                .catch(error => {
                    console.error('Error adding user field:', error);
                    // Reset form state for re-submission
                    methods.clearErrors();
                });
        }
    };

    const handleTranslationTypeChange = (value) => {
        setIsUniversal(value);

        // Reset main translations
        setValue('translations', {
            all: '',
            en: '',
            fr: '',
            es: '',
            ar: ''
        });

        // Reset all dropdown options translations
        const currentOptions = watch('dropdown_options') || [];
        const resetOptions = currentOptions.map(option => ({
            ...option,
            translations: {
                all: '',
                en: '',
                fr: '',
                es: '',
                ar: ''
            }
        }));
        setValue('dropdown_options', resetOptions);
    };

    const handleAddDropdownOption = () => {
        const currentOptions = watch('dropdown_options') || [];
        setValue('dropdown_options', [...currentOptions, {
            translations: {
                all: '',
                en: '',
                fr: '',
                es: '',
                ar: ''
            }
        }]);
    };

    const handleRemoveDropdownOption = (index) => {
        const currentOptions = watch('dropdown_options');
        setValue('dropdown_options', currentOptions.filter((_, i) => i !== index));
    };

    return (
        <DrawerFormContainer
            title="User Field"
            open={open}
            onClose={onClose}
        >
            <FormProvider {...methods}>
                <Card
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
                >
                    <CardContent sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'var(--mui-palette-background-paper)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}>
                        <Grid container rowSpacing={3} padding={2} component={List}>
                            {/* Field Type Selection */}
                            <Grid item xs={12} component={ListItem}>
                                <SelectInput
                                    control={control}
                                    name="type"
                                    options={fieldTypes}
                                />
                            </Grid>

                            {/* Universal Translation Toggle */}
                            <Grid item xs={12} component={ListItem}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isUniversal}
                                            onChange={(e) => handleTranslationTypeChange(e.target.checked)}
                                        />
                                    }
                                    label={<ListItemText
                                        primary="Apply to all languages"
                                        secondary="Enable to use a single translation across all languages."
                                    />}
                                />
                            </Grid>

                            {/* Main Translation Fields */}
                            {isUniversal ? (
                                <Grid item xs={12} component={ListItem}>
                                    <TextInput
                                        name="translations.all"
                                        control={control}
                                        label="Universal"
                                        type="text"
                                    />
                                </Grid>
                            ) : (
                                <Grid item xs={12} component={ListItem}>
                                    <MultilingualTextInput
                                        name="translations"
                                        control={control}
                                        label="Field Translation"
                                        applyToAllLanguages={false}
                                        currentLang={currentLang}
                                        onLanguageChange={setCurrentLang}
                                        defaultLanguage={defaultLanguage}
                                    />
                                </Grid>
                            )}

                            {/* Other Fields */}
                            <Grid item xs={12} component={ListItem}>
                                <TextInput
                                    name="sequence"
                                    control={control}
                                    label="Sequence"
                                    type="number"
                                />
                            </Grid>

                            {/* Switches */}
                            <Grid item xs={12} component={ListItem}>
                                <SwitchInput
                                    name="mandatory"
                                    control={control}
                                    label={
                                        <ListItemText
                                            primary="Mandatory"
                                            secondary="Field must be completed"
                                        />
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} component={ListItem}>
                                <SwitchInput
                                    name="invisible_to_user"
                                    control={control}
                                    label={
                                        <ListItemText
                                            primary="Invisible to User"
                                            secondary="Field exists but isn't displayed"
                                        />
                                    }
                                />
                            </Grid>

                            {/* IFrame Fields */}
                            {selectedType === 'iframe' && (
                                <>
                                    <Grid item xs={12} component={ListItem}>
                                        <TextInput
                                            name="settings.url"
                                            control={control}
                                            label="URL"
                                            type="text"
                                        />
                                    </Grid>
                                    <Grid item xs={12} component={ListItem}>
                                        <TextInput
                                            name="settings.iframe_height"
                                            control={control}
                                            label="Height"
                                            type="text"
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Dropdown Options */}
                            {selectedType === 'dropdownfield' && (
                                <Grid container sx={{
                                    backgroundColor: 'background.paper',
                                    border: !watch('dropdown_options') || watch('dropdown_options')?.length === 0 ? 0 : 1,
                                    borderStyle: 'dashed',
                                    borderRadius: 1,
                                    p: 2
                                }}>
                                    {!watch('dropdown_options') || watch('dropdown_options')?.length === 0 && <Grid item xs={12} sx={{ mb: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<i className="solar-add-circle-outline" />}
                                            onClick={handleAddDropdownOption}
                                            size="small"
                                        >
                                            Add Option
                                        </Button>
                                    </Grid>}

                                    {watch('dropdown_options')?.map((option, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            key={index}
                                            sx={{
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 2,
                                                backgroundColor: 'background.paper',
                                                mb: 2
                                            }}
                                        >
                                            <Grid container spacing={2} sx={{ p: 2 }}>
                                                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="h5">Option {index + 1}</Typography>
                                                    <Stack direction="row" spacing={2}>
                                                        <IconButton onClick={handleAddDropdownOption}
                                                            sx={{
                                                                color: 'text.secondary'
                                                            }}
                                                        >
                                                            <i className="solar-add-circle-outline" />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleRemoveDropdownOption(index)}
                                                            sx={{
                                                                color: 'error.main'
                                                            }}
                                                        >
                                                            <i className="solar-trash-bin-trash-outline" />
                                                        </IconButton>
                                                    </Stack>
                                                </Grid>
                                                {isUniversal ? (
                                                    <Grid item xs={12}>
                                                        <Controller
                                                            name={`dropdown_options.${index}.translations.all`}
                                                            control={control}
                                                            render={({ field, fieldState }) => (
                                                                <TextField
                                                                    {...field}
                                                                    label={`Option ${index + 1} - Universal`}
                                                                    fullWidth
                                                                    size="small"
                                                                    error={!!fieldState.error}
                                                                    helperText={fieldState.error?.message || ''}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                ) : (
                                                    <Grid item xs={12}>
                                                        <MultilingualTextInput
                                                            name={`dropdown_options.${index}.translations`}
                                                            control={control}
                                                            label={`Option ${index + 1}`}
                                                            applyToAllLanguages={false}
                                                            currentLang={currentLang}
                                                            onLanguageChange={setCurrentLang}
                                                            defaultLanguage={defaultLanguage}
                                                        />
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                        <Button onClick={onClose} disabled={addUserField?.isPending || updateUserField?.isPending}>Cancel</Button>
                        <Button variant="contained" color="primary" type="submit"
                            disabled={addUserField?.isPending || updateUserField?.isPending}>Submit</Button>
                    </CardActions>
                </Card>
            </FormProvider>
        </DrawerFormContainer>
    );
};

export default UserFieldDrawer;