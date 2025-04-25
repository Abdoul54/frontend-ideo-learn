import { Grid, Typography, Divider } from "@mui/material";
import TextInput from "@/components/inputs/TextInput";
import DateInput from "@/components/inputs/DateInput";
import SelectInput from "@/components/inputs/SelectInput";
import FileInput from "@/components/inputs/FileInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { useUserFieldsassigned, useUserFieldsAssigned } from "@/hooks/api/tenant/useUserFields";
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

const StepThreeEdit = ({ control, userData }) => {
    // Extract branch IDs from userData
    const branchIds = React.useMemo(() => {
        if (userData && userData.branches) {
            return userData.branches.map(branch => branch.id);
        } else if (userData && userData.select_orgchart_array) {
            return userData.select_orgchart_array;
        } else if (userData && userData.select_orgchart) {
            return Object.keys(userData.select_orgchart).map(Number);
        }
        return [];
    }, [userData]);

    // Fetch user fields with branch IDs
    const { data: userFieldsData, isLoading, error } = useUserFieldsassigned(branchIds);
    const { data: advancedSettings } = useAdvancedSettings();

    // Check if userfields should be visible
    const shouldShowUserFields = advancedSettings?.user?.use_node_fields_visibility || false;

    // Separate user fields into two categories
    const { associatedFields, nonAssociatedFields } = React.useMemo(() => {
        if (!userFieldsData || !Array.isArray(userFieldsData)) {
            return { associatedFields: [], nonAssociatedFields: [] };
        }

        const fields = userFieldsData.filter(field => field && typeof field === 'object' && field.id);

        return {
            associatedFields: fields.filter(field => field.visible_for_pu === true),
            nonAssociatedFields: fields.filter(field => field.visible_for_pu === false)
        };
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

    if (error || (associatedFields.length === 0 && nonAssociatedFields.length === 0)) {
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
            {/* Associated fields section */}
            {associatedFields.length > 0 && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Additional fields that are associated with the branches to which the user has been assigned
                        </Typography>
                    </Grid>

                    {associatedFields.map(field => (
                        <Grid item xs={12} md={6} key={field.id}>
                            {renderFieldByType(field, control)}
                        </Grid>
                    ))}
                </>
            )}

            {/* Add divider between sections if both have fields */}
            {associatedFields.length > 0 && nonAssociatedFields.length > 0 && (
                <Grid item xs={12} sx={{ my: 3 }}>
                    <Divider />
                </Grid>
            )}

            {/* Non-associated fields section */}
            {nonAssociatedFields.length > 0 && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Additional fields that are not associated with the branches to which the user has been assigned
                        </Typography>
                    </Grid>

                    {nonAssociatedFields.map(field => (
                        <Grid item xs={12} md={6} key={field.id}>
                            {renderFieldByType(field, control)}
                        </Grid>
                    ))}
                </>
            )}
        </>
    );
};

export default StepThreeEdit;