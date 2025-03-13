// frontend/src/views/Forms/Tenant/UserSteps/StepThree.jsx
import { Grid, Typography } from "@mui/material";
import TextInput from "@/components/inputs/TextInput";
import DateInput from "@/components/inputs/DateInput";
import SelectInput from "@/components/inputs/SelectInput";
import FileInput from "@/components/inputs/FileInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { useUseAllUserFields } from "@/hooks/api/tenant/useUserFields";
import React from "react";
import { useAdvancedSettings } from "@/hooks/api/tenant/useAdvancedSettings";

const renderFieldByType = (field, control) => {
    const commonProps = {
        name: `additional_fields.${field.id}`,
        control,
        label: field.title,
        required: field.mandatory,
        disabled: field.invisible_to_user
    };

    switch (field.type) {
        case 'textfield':
        case 'textarea':
            return <TextInput {...commonProps} multiline={field.type === 'textarea'} />;

        case 'datefield':
            return <DateInput {...commonProps} />;

        case 'dropdownfield':
            return (
                <SelectInput
                    {...commonProps}
                    options={field.dropdown_options?.map(option => ({
                        value: option.value,
                        label: option.translations?.en || option.value
                    })) || []}
                />
            );

        case 'filefield':
            return <FileInput {...commonProps} />;

        case 'yesnofield':
            return <SwitchInput {...commonProps} />;

        case 'iframe':
        case 'fiscalecode':
        case 'country':
            return <TextInput {...commonProps} />;

        default:
            return <TextInput {...commonProps} />;
    }
};

const StepThree = ({ control }) => {
    const { data: userFieldsData, isLoading, error } = useUseAllUserFields();
    const { data: advancedSettings } = useAdvancedSettings();

    // Check if userfields should be visible
    const shouldShowUserFields = advancedSettings?.user?.use_node_fields_visibility || false;
    
    const userFields = React.useMemo(() => {
        if (!userFieldsData || !Array.isArray(userFieldsData)) return [];
        return userFieldsData.filter(field => field && typeof field === 'object' && field.id);
    }, [userFieldsData]);
    
    // If userfields shouldn't be shown, return empty placeholder
    if (!shouldShowUserFields) {
        return (
            <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                    Additional fields are disabled in system settings.
                </Typography>
            </Grid>
        );
    }

    if (isLoading) {
        return (
            <Grid item xs={12}>
                <Typography>Loading additional fields...</Typography>
            </Grid>
        );
    }

    if (error || userFields.length === 0) {
        return (
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
                <Typography color={error ? "error" : "text.secondary"}>
                    {error ? "Error loading additional fields." : "No additional fields found."}
                </Typography>
            </Grid>
        );
    }

    return (
        <>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    Additional Information
                </Typography>
            </Grid>

            {userFields.map(field => (
                <Grid item xs={12} md={6} key={field.id}>
                    {renderFieldByType(field, control)}
                </Grid>
            ))}
        </>
    );
};

export default StepThree;