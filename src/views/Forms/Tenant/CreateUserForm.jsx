import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stepper, Step, StepLabel, Card, CardHeader, CardContent, CardActions, Grid, Alert } from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useCreateUser } from "@/hooks/api/useUsers";
import { createUserSchema, defaultValues } from "@/constants/Users";
import StepOne from "./UserSteps/StepOne";
import StepTwo from "./UserSteps/StepTwo";
import StepThree from "./UserSteps/StepThree";
import StepFour from "./UserSteps/StepFour";
import { useUseAllUserFields } from "@/hooks/api/tenant/useUserFields";
import { useManagerTypes } from "@/hooks/api/tenant/useManager";

export default function CreateUserForm({ open, onClose }) {
    const { data: userfields } = useUseAllUserFields();
    const { data: managerTypesData } = useManagerTypes();
    const managerTypes = managerTypesData?.items || [];
    const createUserMutation = useCreateUser(onClose);

    // Initialize manager structure with nested objects
    const initialManagerValues = {};
    managerTypes.forEach(type => {
        initialManagerValues[type.manager_type_id] = { 
            user: null, 
            can_manage: false 
        };
    });

    // Initialize employees structure
    const initialEmployeesValues = {};
    managerTypes.forEach(type => {
        initialEmployeesValues[type.manager_type_id] = [];
    });

    // Create form default values
    const formDefaultValues = {
        ...defaultValues,
        manager: initialManagerValues,
        employees: initialEmployeesValues,
        can_manage_subordinates: false,
    };

    const { control, handleSubmit, trigger, watch, reset, formState, getValues } = useForm({
        resolver: yupResolver(createUserSchema(managerTypes, false)), // false = not update mode
        defaultValues: formDefaultValues,
        mode: "onChange",
        context: { userfields, isUpdate: false },
    });

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            reset(formDefaultValues);
            setActiveStep(0);
            setValidationError("");
        }
    }, [open, reset]);

    const [activeStep, setActiveStep] = useState(0);
    const [validationError, setValidationError] = useState("");
    const totalSteps = 4;

    const handleNext = async () => {
        try {
            const fieldsToValidate = getFieldsForStep(activeStep);
            console.log("Validating fields:", fieldsToValidate);

            const isStepValid = await trigger(fieldsToValidate);
            console.log("Validation result:", isStepValid, "Current errors:", formState.errors);

            if (isStepValid) {
                setValidationError("");
                setActiveStep(prev => prev + 1);
            } else {
                // Convert errors to a readable message
                const errorFields = Object.keys(formState.errors)
                    .filter(field => fieldsToValidate.includes(field))
                    .map(field => `${field}: ${formState.errors[field].message}`);

                console.log("Validation failed for fields:", errorFields);

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
            case 0: return ['username', 'email', 'password', 'password_confirmation', 'firstname', 'lastname', 'level', 'language', 'expiration', 'timezone', 'email_validation_status', 'valid', 'force_change'];
            case 1: return ['select_orgchart'];
            case 2: return ['additional_fields'];
            case 3: return ['manager', 'employees', 'can_manage_subordinates'];
            default: return [];
        }
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const onSubmit = (data) => {
        console.log("Form data before processing:", data);

        // Start with a clean payload
        const payload = {
            username: data.username,
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            firstname: data.firstname || null,
            lastname: data.lastname || null,
            level: Number(data.level),
            language: data.language,
            expiration: data.expiration || null,
            timezone: data.timezone,
            email_validation_status: Number(data.email_validation_status),
            valid: Number(data.valid),
            select_orgchart: Array.isArray(data.select_orgchart) ? data.select_orgchart.map(Number) : [],
            force_change: data.force_change ? 1 : 0,
            send_notification_email: !!data.send_notification_email,
            can_manage_subordinates: !!data.can_manage_subordinates
        };

        // Process additional fields if they exist
        if (data.additional_fields && Object.keys(data.additional_fields).length > 0) {
            payload.additional_fields = data.additional_fields;
        }

        // Process manager data - transform from {typeId: {user: {id, name}}} to {typeId: "id"}
        if (data.manager) {
            const formattedManager = {};
            let hasManager = false;

            Object.entries(data.manager).forEach(([typeId, config]) => {
                if (config?.user?.id) {
                    formattedManager[typeId] = String(config.user.id);
                    hasManager = true;
                }
            });

            if (hasManager) {
                payload.manager = formattedManager;
            }
        }

        // Process employees data - keep array structure but ensure string IDs
        if (data.can_manage_subordinates && data.employees) {
            const formattedEmployees = {};
            let hasEmployees = false;

            Object.entries(data.employees).forEach(([typeId, employeeIds]) => {
                if (Array.isArray(employeeIds) && employeeIds.length > 0) {
                    // Filter out any invalid entries and convert to strings
                    const validEmployeeIds = employeeIds
                        .filter(id => id !== undefined && id !== null && id !== '')
                        .map(id => String(id));
                    
                    if (validEmployeeIds.length > 0) {
                        formattedEmployees[typeId] = validEmployeeIds;
                        hasEmployees = true;
                    }
                }
            });

            if (hasEmployees) {
                payload.employees = formattedEmployees;
            }
        }

        console.log('Final payload to be submitted:', payload);
        createUserMutation.mutate(payload);
    };

    // Prevent form submission on enter key press
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    };

    const StepRenderer = (step) => {
        switch (step) {
            case 0: return <StepOne control={control} watch={watch} />;
            case 1: return <StepTwo control={control} watch={watch} />;
            case 2: return <StepThree control={control} />;
            case 3: return <StepFour control={control} />;
            default: return null;
        }
    };

    return (
        <DrawerFormContainer open={open} onClose={onClose} title="Create User">
            <div onKeyDown={handleKeyDown}>
                <Card
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
                >
                    <CardHeader
                        title={
                            <Stepper activeStep={activeStep}>
                                <Step><StepLabel>General Information</StepLabel></Step>
                                <Step><StepLabel>Branches</StepLabel></Step>
                                <Step><StepLabel>Additional fields</StepLabel></Step>
                                <Step><StepLabel>Team Members</StepLabel></Step>
                            </Stepper>
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
                                    <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
                                </Grid>
                            )}
                            {StepRenderer(activeStep)}
                            {formState.isSubmitted && Object.keys(formState.errors).length > 0 && (
                                <Grid item xs={12}>
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        Please fix the errors in the form before submitting.
                                        {console.log('Validation errors:', formState.errors)}
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end", gap: 2, p: 2 }}>
                        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                        {activeStep < totalSteps - 1 ? (
                            <Button variant="contained" onClick={handleNext}>Next</Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleSubmit(onSubmit)}
                                disabled={createUserMutation.isPending}
                            >
                                {createUserMutation.isPending ? "Submitting..." : "Create User"}
                            </Button>
                        )}
                    </CardActions>
                </Card>
            </div>
        </DrawerFormContainer>
    );
}