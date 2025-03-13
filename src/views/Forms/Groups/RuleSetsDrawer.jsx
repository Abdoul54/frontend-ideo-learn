'use client';

import { useForm, useFieldArray } from "react-hook-form";
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
    Typography,
    IconButton,
    Box,
    FormHelperText,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
import SelectInput from "@/components/inputs/SelectInput";
import AutoCompleteInput from "@/components/inputs/AutoCompleteInput";
import { useUseAllUserFields } from "@/hooks/api/tenant/useUserFields";
import {
    ruleTypes, userFieldsOptions,
    operators, enrollmentStatuses,
    setsSchema
} from "@/constants/Groups";


// Default payloads by rule type
const getDefaultPayload = (type) => {
    switch (type) {
        case 'enrollment_status':
            return {
                course_id: '',
                enrollment_status: 'enrolled'
            };
        case 'branch':
            return {
                branch_id: ''
            };
        case 'user':
            return {
                field: 'email',
                operator: 'is_equal',
                value: ''
            };
        case 'userfield':
            return {
                userfield_id: '',
                operator: 'is_equal',
                value: ''
            };
        default:
            return {};
    }
};

const RuleSetsDrawer = ({ open, onClose, data, onSubmit: onSubmitProp }) => {
    const methods = useForm({
        defaultValues: {
            rules_operator: data?.rules_operator || 'AND',
            rules: []
        },
        resolver: yupResolver(setsSchema),
        mode: 'onChange'
    });

    const { data: userFields } = useUseAllUserFields();


    const { control, handleSubmit, reset, watch, formState: { errors } } = methods;

    // Initialize useFieldArray
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "rules"
    });

    // Synchronize data when it changes
    useEffect(() => {
        if (data) {
            // Preserve the API-generated IDs
            const rulesWithApiIds = data.rules?.map(rule => ({
                ...rule,
                apiId: rule.id // Store the API ID separately
            })) || [];

            reset({
                rules_operator: data.rules_operator || 'AND',
                ...data,
                rules: rulesWithApiIds
            });
        } else {
            reset({
                rules_operator: 'AND',
                rules: []
            });
        }
    }, [data, reset]);

    // Function to handle form submission
    const onSubmit = (formData) => {
        // Map back the apiId to id for each rule before submitting
        const processedData = {
            ...formData,
            rules: formData.rules.map(rule => ({
                ...rule,
                id: rule.apiId || rule.id, // Use the API ID if available
            }))
        };
        onSubmitProp && onSubmitProp(processedData);
    };

    // Function to add a new rule
    const addRule = () => {
        append({
            type: 'enrollment_status',
            payload: getDefaultPayload('enrollment_status')
        });
    };

    // Function to handle rule type change
    const handleRuleTypeChange = (index, value) => {
        // Update the rule type and reset the payload
        update(index, {
            ...fields[index],
            type: value,
            payload: getDefaultPayload(value)
        });
    };

    // Get nested errors for a specific rule
    const getRuleErrors = (index) => {
        return errors.rules?.[index] || {};
    };

    return (
        <DrawerFormContainer
            title={data ? 'Edit Rule Set' : 'Add Rule Set'}
            open={open}
            onClose={onClose}
        >
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
                        <Grid item xs={12} component={ListItem} disablePadding>
                            <SelectInput
                                name="rules_operator"
                                control={control}
                                label="Rules Operator"
                                options={[
                                    { value: 'AND', label: 'All rules must match (AND)' },
                                    { value: 'OR', label: 'Any rule must match (OR)' }
                                ]}
                                defaultValue="AND"
                                error={!!errors.rules_operator}
                                helperText={errors.rules_operator?.message}
                            />
                        </Grid>

                        <Grid item xs={12} component={ListItem} disablePadding>
                            <Box width="100%">
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">Rules ({fields.length})</Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<i className="solar-add-circle-outline" />}
                                        onClick={addRule}
                                    >
                                        Add Rule
                                    </Button>
                                </Box>

                                {fields.length === 0 && (
                                    <>
                                        <Typography color="text.secondary" align="center" py={4}>
                                            No rules added yet. Click "Add Rule" to begin.
                                        </Typography>
                                        {errors.rules && (
                                            <FormHelperText error sx={{ textAlign: 'center', mb: 2 }}>
                                                {errors.rules.message}
                                            </FormHelperText>
                                        )}
                                    </>
                                )}

                                {fields.map((field, index) => {
                                    const ruleType = watch(`rules.${index}.type`);
                                    const ruleErrors = getRuleErrors(index);

                                    return (
                                        <Box
                                            key={field.id}
                                            sx={{
                                                mb: 3,
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: ruleErrors.payload ? 'error.main' : 'divider',
                                                borderRadius: 1
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="subtitle1">Rule {index + 1}</Typography>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => remove(index)}
                                                    size="small"
                                                >
                                                    <i className="solar-close-circle-outline" />
                                                </IconButton>
                                            </Box>

                                            {/* Preserve the server-generated ID if it exists */}
                                            {field.apiId && (
                                                <input
                                                    type="hidden"
                                                    {...methods.register(`rules.${index}.id`)}
                                                    defaultValue={field.apiId}
                                                />
                                            )}

                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <SelectInput
                                                        name={`rules.${index}.type`}
                                                        control={control}
                                                        label="Rule Type"
                                                        options={ruleTypes}
                                                        onChange={(e) => handleRuleTypeChange(index, e.target.value)}
                                                        error={!!ruleErrors.type}
                                                        helperText={ruleErrors.type?.message}
                                                    />
                                                </Grid>

                                                {/* Enrollment Status Fields */}
                                                {ruleType === 'enrollment_status' && (
                                                    <>
                                                        <Grid item xs={12} md={6}>
                                                            <TextInput
                                                                name={`rules.${index}.payload.course_id`}
                                                                control={control}
                                                                label="Course ID"
                                                                type="number"
                                                                error={!!ruleErrors.payload?.course_id}
                                                                helperText={ruleErrors.payload?.course_id?.message}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <SelectInput
                                                                name={`rules.${index}.payload.enrollment_status`}
                                                                control={control}
                                                                label="Enrollment Status"
                                                                options={enrollmentStatuses}
                                                                error={!!ruleErrors.payload?.enrollment_status}
                                                                helperText={ruleErrors.payload?.enrollment_status?.message}
                                                            />
                                                        </Grid>
                                                    </>
                                                )}

                                                {/* Branch Fields */}
                                                {ruleType === 'branch' && (
                                                    <Grid item xs={12}>
                                                        <TextInput
                                                            name={`rules.${index}.payload.branch_id`}
                                                            control={control}
                                                            label="Branch ID"
                                                            type="number"
                                                            error={!!ruleErrors.payload?.branch_id}
                                                            helperText={ruleErrors.payload?.branch_id?.message}
                                                        />
                                                    </Grid>
                                                )}

                                                {/* User Fields */}
                                                {ruleType === 'user' && (
                                                    <>
                                                        <Grid item xs={12} md={4}>
                                                            <SelectInput
                                                                name={`rules.${index}.payload.field`}
                                                                control={control}
                                                                label="User Field"
                                                                options={userFieldsOptions}
                                                                error={!!ruleErrors.payload?.field}
                                                                helperText={ruleErrors.payload?.field?.message}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <SelectInput
                                                                name={`rules.${index}.payload.operator`}
                                                                control={control}
                                                                label="Operator"
                                                                options={operators}
                                                                error={!!ruleErrors.payload?.operator}
                                                                helperText={ruleErrors.payload?.operator?.message}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <TextInput
                                                                name={`rules.${index}.payload.value`}
                                                                control={control}
                                                                label="Value"
                                                                error={!!ruleErrors.payload?.value}
                                                                helperText={ruleErrors.payload?.value?.message}
                                                            />
                                                        </Grid>
                                                    </>
                                                )}

                                                {/* Userfield Fields */}
                                                {ruleType === 'userfield' && (
                                                    <>
                                                        <Grid item xs={12} md={4}>
                                                            <AutoCompleteInput
                                                                name={`rules.${index}.payload.userfield_id`}
                                                                label="User Field ID"
                                                                control={control}
                                                                options={userFields || []}
                                                                valueKey="id"
                                                                labelKey="title"
                                                            />
                                                            {/* 
                                                            <TextInput
                                                                name={`rules.${index}.payload.userfield_id`}
                                                                control={control}
                                                                label="User Field ID"
                                                                type="number"
                                                                error={!!ruleErrors.payload?.userfield_id}
                                                                helperText={ruleErrors.payload?.userfield_id?.message}
                                                            /> */}
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <SelectInput
                                                                name={`rules.${index}.payload.operator`}
                                                                control={control}
                                                                label="Operator"
                                                                options={operators}
                                                                error={!!ruleErrors.payload?.operator}
                                                                helperText={ruleErrors.payload?.operator?.message}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <TextInput
                                                                name={`rules.${index}.payload.value`}
                                                                control={control}
                                                                label="Value"
                                                                error={!!ruleErrors.payload?.value}
                                                                helperText={ruleErrors.payload?.value?.message}
                                                            />
                                                        </Grid>
                                                    </>
                                                )}
                                            </Grid>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={fields.length === 0}
                    >
                        Submit
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default RuleSetsDrawer;