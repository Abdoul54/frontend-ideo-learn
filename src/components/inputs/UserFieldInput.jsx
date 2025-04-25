import React from 'react';
import { useFormContext } from 'react-hook-form';

// Import all input components
import AutoCompleteInput from './AutoCompleteInput';
import CheckboxInput from './CheckboxInput';
import DateInput from './DateInput';
import FileInput from './FileInput';
import SelectInput from './SelectInput';
import TextInput from './TextInput';

/**
 * UserFieldInput - Renders the appropriate input component based on userfield type
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userField - The userfield configuration object from API
 * @param {string} props.language - Current selected language for translations
 * @param {Array} props.languages - Available languages array with {code, label} objects
 * @param {Function} props.onChange - Optional callback when value changes
 * @returns {JSX.Element} The rendered input component
 */
const UserFieldInput = ({
    userField,
    language = 'fr',
    languages = [],
    control,
    onChange
}) => {

    if (!userField) return null;

    // Get field name - use userField.id as the field identifier
    const fieldName = `additional_fields.${userField.id}`;

    // Get field label from translations or fallback to title
    const getFieldLabel = () => {
        if (userField.translations && userField.translations[language]) {
            return userField.translations[language];
        }
        // console.log('tf', userField.title)
        return userField.title;
    };

    // Handle generating validation rules based on userField properties
    const getValidationRules = () => {
        const rules = {};

        if (userField.mandatory) {
            rules.required = `${getFieldLabel()} is required`;
        }

        // Add more validation rules based on userField.settings if needed

        return rules;
    };

    // Render the appropriate input based on field type
    switch (userField.type) {
        case 'textfield':
            return (
                <TextInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'textarea':
            return (
                <TextInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    multiline
                    rows={4}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'dropdownfield':
            // Transform dropdown options to the format expected by SelectInput
            const dropdownOptions = userField.dropdown_options?.map(option =>
                ({ value: option.id_option, label: option.translations?.[language] || option.translations?.en })) || [];

            return (
                <SelectInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    options={dropdownOptions}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'datefield':
            return (
                <DateInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'filefield':
            return (
                <FileInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'yesnofield':
            return (
                <CheckboxInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'country':
            // Assumes you have a list of countries to use with AutoCompleteInput
            // You might need to fetch this data separately
            return (
                <AutoCompleteInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    options={[]} // Add your country options here
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'fiscalcode':
            // Fiscal code typically needs special validation rules
            return (
                <TextInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    rules={{
                        ...getValidationRules(),
                        pattern: {
                            value: /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i,
                            message: 'Invalid fiscal code format'
                        }
                    }}
                    disabled={userField.invisible_to_user}
                />
            );

        case 'iframe':
            // For iframe, we might just want to show a placeholder or message
            return (
                <TextInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    disabled={true}
                    helperText="This field will be rendered as an iframe"
                />
            );

        default:
            // Fallback to a simple text input if type is not recognized
            return (
                <TextInput
                    name={fieldName}
                    control={control}
                    label={getFieldLabel()}
                    rules={getValidationRules()}
                    disabled={userField.invisible_to_user}
                    helperText={`Unrecognized field type: ${userField.type}`}
                />
            );
    }
};

export default UserFieldInput;