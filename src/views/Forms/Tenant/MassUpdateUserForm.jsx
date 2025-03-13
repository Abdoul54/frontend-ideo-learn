// frontend/src/views/Forms/Tenant/MassUpdateUserForm.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stepper, Step, StepLabel, Card, CardHeader, CardContent, CardActions, Grid, Alert, Typography, Box, Chip } from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useMassUpdateUsers } from "@/hooks/api/useUsers";
import * as yup from 'yup';
import StepThree from "./UserSteps/StepThree"; // Reuse the additional fields step
import { useManagerTypes } from "@/hooks/api/tenant/useManager";
import MassUpdateStepTwo from "./MassUpdateSteps/MassUpdateStepTwo";
import MassUpdateStepOne from "./MassUpdateSteps/MassUpdateStepOne";

const createMassUpdateSchema = (managerTypes = []) => {
    // Manager shape for validation
    const managerShape = managerTypes.reduce((acc, type) => {
        acc[type.manager_type_id] = yup.string().nullable();
        return acc;
    }, {});

    return yup.object().shape({
        password: yup.string()
            .test({
                name: 'min-length-if-provided',
                message: 'Password must be at least 8 characters',
                test: value => {
                    return !value || value.trim() === '' || value.length >= 8;
                }
            }),
        password_confirmation: yup.string()
            .oneOf([yup.ref('password'), null], 'Passwords must match'),
        language: yup.string().nullable(),
        expiration: yup.string().nullable(),
        email_status: yup.number().transform(value =>
            value === '' ? undefined : Number(value)
        ).nullable(),
        date_format: yup.string().nullable(),
        timezone: yup.string().nullable(),
        manager: yup.object().shape(managerShape).nullable(),
        additional_fields: yup.object().nullable(),
    });
};

// Changed to accept selectedRows instead of selectedUsers to match how it's called in HaykalPage
export default function MassUpdateUserForm({ open, onClose, selectedRows = [] }) {
    const { data: managerTypesData } = useManagerTypes();
    const managerTypes = managerTypesData?.items || [];

    const { control, handleSubmit, trigger, watch, reset, formState } = useForm({
        resolver: yupResolver(createMassUpdateSchema(managerTypes)),
        defaultValues: {
            password: '',
            password_confirmation: '',
            language: '',
            expiration: '',
            email_status: '',
            date_format: '',
            timezone: '',
            manager: {},
            additional_fields: {},
        },
        mode: 'onChange',
    });

    useEffect(() => {
        return () => {
            if (!open) {
                reset();
                setActiveStep(0);
            }
        };
    }, [open, reset]);

    const [activeStep, setActiveStep] = useState(0);
    const [validationError, setValidationError] = useState("");
    const totalSteps = 3;

    const handleClose = () => {
        reset();
        setActiveStep(0);
        onClose();
    };

    const handleNext = async () => {
        try {
            const fieldsToValidate = getFieldsForStep(activeStep);
            const isStepValid = await trigger(fieldsToValidate);

            if (isStepValid) {
                setValidationError("");
                setActiveStep(prev => prev + 1);
            } else {
                const errorFields = Object.keys(formState.errors)
                    .filter(field => fieldsToValidate.includes(field))
                    .map(field => `${field}: ${formState.errors[field].message}`);

                setValidationError(
                    errorFields.length > 0
                        ? `Please fix the following errors: ${errorFields.join(', ')}`
                        : "Please complete all required fields in this step before proceeding."
                );
            }
        } catch (error) {
            console.error("Error during validation:", error);
            setValidationError("An error occurred during validation. Please try again.");
        }
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 0: return ['password', 'password_confirmation', 'language', 'expiration', 'email_status', 'date_format', 'timezone'];
            case 1: return ['manager'];
            case 2: return ['additional_fields'];
            default: return [];
        }
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const massUpdateMutation = useMassUpdateUsers(handleClose);

    const onSubmit = (data) => {
        // Validate the selectedRows array
        if (!selectedRows || !Array.isArray(selectedRows) || selectedRows.length === 0) {
            setValidationError("Please select at least one user to update");
            return;
        }

        // Filter out empty values
        const formattedData = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key === 'manager' && typeof value === 'object') {
                    // Filter out manager entries with empty values
                    const managerEntries = Object.entries(value).filter(([_, v]) => v !== null && v !== '');
                    if (managerEntries.length > 0) {
                        formattedData[key] = Object.fromEntries(managerEntries);
                    }
                } else if (key === 'additional_fields' && typeof value === 'object') {
                    // Filter out empty additional_fields entries
                    const fieldEntries = Object.entries(value).filter(([_, v]) => v !== null && v !== '');
                    if (fieldEntries.length > 0) {
                        formattedData[key] = Object.fromEntries(fieldEntries);
                    }
                } else {
                    formattedData[key] = value;
                }
            }
        });

        // Add user_ids to the payload
        const userIds = selectedRows
            .filter(user => user && (user.id || user.user_id)) // Filter out invalid users
            .map(user => Number(user.id || user.user_id));     // Convert to numbers

        if (userIds.length === 0) {
            setValidationError("No valid user IDs found in the selected rows");
            return;
        }

        formattedData.user_ids = userIds;

        console.log('Submitting mass update data:', formattedData);
        console.log('Selected rows:', selectedRows);
        console.log('User IDs being sent:', userIds);

        massUpdateMutation.mutate(formattedData);
    };

    const StepRenderer = (step) => {
        switch (step) {
            case 0: return <MassUpdateStepOne control={control} watch={watch} />;
            case 1: return <MassUpdateStepTwo control={control} />;
            case 2: return <StepThree control={control} />;
            default: return null;
        }
    };

    return (
        <DrawerFormContainer open={open} onClose={handleClose} title='Mass Update Users'>
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardHeader
                    title={
                        <>
                            <Box mb={3}>
                                <Typography variant="h6" gutterBottom>
                                    Updating {selectedRows.length} users
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1} maxHeight="100px" overflow="auto">
                                    {selectedRows.map(user => (
                                        <Chip
                                            key={user.id || user.user_id}
                                            label={user.username || user.email || `User ${user.id || user.user_id}`}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </Box>
                            <Stepper activeStep={activeStep}>
                                <Step><StepLabel>Basic Settings</StepLabel></Step>
                                <Step><StepLabel>Manager Settings</StepLabel></Step>
                                <Step><StepLabel>Additional Fields</StepLabel></Step>
                            </Stepper>
                        </>
                    }
                />
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 3,
                    '&::-webkit-scrollbar': { width: '0.3em' },
                    '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <Grid container spacing={3} sx={{ marginTop: 2 }}>
                        {validationError && (
                            <Grid item xs={12}>
                                <Alert severity="error">{validationError}</Alert>
                            </Grid>
                        )}
                        {StepRenderer(activeStep)}
                        {formState.isSubmitted && Object.keys(formState.errors).length > 0 && (
                            <Grid item xs={12}>
                                <Alert severity="error">
                                    Please fix the errors in the form before submitting.
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    {activeStep > 0 && <Button sx={{ marginTop: '5px' }} onClick={handleBack}>Back</Button>}
                    {activeStep < totalSteps - 1 && (
                        <Button variant="contained" onClick={handleNext}>Next</Button>
                    )}
                    {activeStep === totalSteps - 1 && (
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={massUpdateMutation.isPending}
                        >
                            {massUpdateMutation.isPending ? 'Updating...' : 'Update Users'}
                        </Button>
                    )}
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
}