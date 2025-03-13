import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stepper, Step, StepLabel, Card, CardHeader, CardContent, CardActions, Grid, Alert } from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useCreateUser, useGetUser, useUpdateUser } from "@/hooks/api/useUsers";
import { createUserSchema, defaultValues } from "@/constants/Users";
import StepOne from "./UserSteps/StepOne";
import StepTwo from "./UserSteps/StepTwo";
import StepThree from "./UserSteps/StepThree";
import { useUseAllUserFields } from "@/hooks/api/tenant/useUserFields";
import StepFour from "./UserSteps/StepFour";
import { useManagerTypes } from "@/hooks/api/tenant/useManager";
import { useAdvancedSettings } from "@/hooks/api/tenant/useAdvancedSettings";

export default function UserForm({ open, onClose, userId }) {
    const { data: userfields } = useUseAllUserFields();
    const { data: managerTypesData } = useManagerTypes();
    const managerTypes = managerTypesData?.items || [];

    const { data: userData, isLoading: isUserLoading } = useGetUser(userId);
    const createUserMutation = useCreateUser(onClose);
    const updateUserMutation = useUpdateUser(onClose);

    const { data: advancedSettings } = useAdvancedSettings();
    const shouldShowUserFields = advancedSettings?.user?.use_node_fields_visibility || false;

    // Pass isUpdate flag to the schema resolver
    const { control, handleSubmit, trigger, watch, reset, formState } = useForm({
        resolver: yupResolver(createUserSchema(managerTypes, !!userId)),
        defaultValues: {
            ...(userId ? userData : defaultValues),
            select_orgchart: Array.isArray(userData?.select_orgchart)
                ? userData.select_orgchart
                : Object.values(userData?.select_orgchart || {}).map(Number),
            manager: managerTypes.reduce((acc, type) => {
                acc[type.manager_type_id] = { user: null, can_manage: false };
                return acc;
            }, {}),
            employees: managerTypes.reduce((acc, type) => {
                acc[type.manager_type_id] = [];
                return acc;
            }, {}),
            can_manage_subordinates: false,
        },
        mode: 'onChange',
        context: { 
            userfields, 
            isUpdate: !!userId, 
            shouldShowUserFields 
        },
    });

    useEffect(() => {
        return () => {
            if (!open) {
                reset(defaultValues);
                setActiveStep(0);
            }
        };
    }, [open]);

    useEffect(() => {
        if (userId && userData) {
            console.log('Resetting form with user data:', userData);
            setOriginalData(userData);

            // Format manager data properly for the form
            const formattedManager = {};
            Object.entries(userData.manager || {}).forEach(([typeId, userId]) => {
                formattedManager[typeId] = {
                    user: { id: String(userId), fullname: `User ${userId}` }, // String ID
                    can_manage: true
                };
            });

            const formattedEmployees = {};
            Object.entries(userData.employees || {}).forEach(([typeId, employeeIds]) => {
                formattedEmployees[typeId] = employeeIds.map(id => String(id)); // String IDs
            });

            // Format orgchart data
            const orgchart = userData.select_orgchart ?
                Object.keys(userData.select_orgchart).map(Number) :
                [];

            // Reset form with complete user data
            reset({
                ...userData,
                username: userData.username, // Ensure username is explicitly set
                email: userData.email,       // Ensure email is explicitly set
                firstname: userData.firstname,
                lastname: userData.lastname,
                manager: formattedManager,
                employees: formattedEmployees,
                can_manage_subordinates: userData.can_manage_subordinates,
                select_orgchart: orgchart,
                password: '',
                password_confirmation: ''
            });
        }
    }, [userId, userData, reset]);

    const [activeStep, setActiveStep] = useState(0);
    const [validationError, setValidationError] = useState("");
    const totalSteps = shouldShowUserFields ? 4 : 3;
    const [originalData, setOriginalData] = useState(null);

    const handleClose = () => {
        reset();
        setActiveStep(0);
        onClose();
    };

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
        if (!shouldShowUserFields && step >= 2) {
            // Shift steps after userfields
            step = step + 1;
        }

        switch (step) {
            case 0: return ['username', 'email', 'password', 'password_confirmation', 'firstname', 'lastname', 'level', 'language', 'expiration', 'timezone', 'email_validation_status', 'valid', 'force_change'];
            case 1: return ['select_orgchart'];
            case 2: return ['additional_fields']; // This step might be skipped
            case 3: return ['manager'];
            default: return [];
        }
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const createUser = useCreateUser(handleClose);

    const onSubmit = (data) => {
        // Define editable fields that the API likely accepts for updates
        const editableFields = [
            'username',
            'email',
            'password',
            'password_confirmation',
            'firstname',
            'lastname',
            'level',
            'language',
            'expiration',
            'timezone',
            'email_validation_status',
            'valid',
            'force_change',
            'manager',
            'employees',
            'select_orgchart',
            'can_manage_subordinates',
            'additional_fields',
            'send_notification_email'
        ];

        // Start with a clean object containing only editable fields
        const formattedData = {};
        editableFields.forEach(field => {
            if (field in data) {
                formattedData[field] = data[field];
            }
        });

        // Set default branch ID 1 if no branches are selected
        if (!formattedData.select_orgchart || formattedData.select_orgchart.length === 0) {
            formattedData.select_orgchart = [1]; // Default to Platform branch (ID 1)
        }

        if (!formattedData.valid) {
            formattedData.valid = 1;
        }

        // Define these variables in the outer scope so they're accessible throughout the function
        let formattedManager = {};
        let hasManager = false;
        let formattedEmployees = {};
        let hasEmployees = false;

        // Handle manager data
        if (formattedData.manager) {
            Object.entries(formattedData.manager).forEach(([typeId, config]) => {
                if (config?.user?.id) {
                    formattedManager[typeId] = String(config.user.id);
                    hasManager = true;
                }
            });

            // Only include manager if it has changed
            if (hasManager && JSON.stringify(formattedManager) !== JSON.stringify(originalData?.manager)) {
                formattedData.manager = formattedManager;
            } else {
                delete formattedData.manager;
            }
        }

        // Handle employees data
        if (formattedData.employees && formattedData.can_manage_subordinates) {
            Object.entries(formattedData.employees).forEach(([typeId, users]) => {
                if (Array.isArray(users) && users.length > 0) {
                    formattedEmployees[typeId] = users.map(id => String(id));
                    hasEmployees = true;
                }
            });

            // Only include employees if they have changed
            if (hasEmployees && JSON.stringify(formattedEmployees) !== JSON.stringify(originalData?.employees)) {
                formattedData.employees = formattedEmployees;
            } else {
                delete formattedData.employees;
            }
        } else {
            formattedData.employees = undefined;
        }

        // Now these comparisons will work because the variables are defined in the outer scope
        const compareManager = Object.fromEntries(
            Object.entries(formattedManager).map(([k, v]) => [k, String(v)])
        );

        const compareOriginalManager = Object.fromEntries(
            Object.entries(originalData?.manager || {}).map(([k, v]) => [k, String(v)])
        );

        if (hasManager && JSON.stringify(compareManager) !== JSON.stringify(compareOriginalManager)) {
            formattedData.manager = formattedManager;
        }

        // Similar conversion for employees
        const compareEmployees = Object.fromEntries(
            Object.entries(formattedEmployees).map(([k, v]) => [k, v.map(String)])
        );

        const compareOriginalEmployees = Object.fromEntries(
            Object.entries(originalData?.employees || {}).map(([k, v]) => [k, v.map(String)])
        );

        if (hasEmployees && JSON.stringify(compareEmployees) !== JSON.stringify(compareOriginalEmployees)) {
            formattedData.employees = formattedEmployees;
        }

        // Convert booleans to numbers where required
        formattedData.force_change = formattedData.force_change ? 1 : 0;
        formattedData.valid = formattedData.valid ? 1 : 0 || 1;
        formattedData.email_validation_status = parseInt(formattedData.email_validation_status, 10);
        formattedData.can_manage_subordinates = !!formattedData.can_manage_subordinates;
        formattedData.send_notification_email = !!formattedData.send_notification_email;

        // Explicitly remove password fields if empty during update
        if (userId && (!formattedData.password || formattedData.password.trim() === '')) {
            delete formattedData.password;
            delete formattedData.password_confirmation;
        }

        // Log the final payload for debugging
        console.log('Submitting user data:', formattedData);

        if (userId) {
            updateUserMutation.mutate({ userId, userData: formattedData });
        } else {
            createUserMutation.mutate(formattedData);
        }
    };

    const StepRenderer = (step) => {
        if (!shouldShowUserFields && step >= 2) {
            // Skip the userfields step (StepThree)
            switch (step) {
                case 0: return <StepOne control={control} watch={watch} />;
                case 1: return <StepTwo control={control} watch={watch} />;
                case 2: return <StepFour control={control} userData={userData} />;
                default: return null;
            }
        } else {
            switch (step) {
                case 0: return <StepOne control={control} watch={watch} />;
                case 1: return <StepTwo control={control} watch={watch} />;
                case 2: return <StepThree control={control} />;
                case 3: return <StepFour control={control} userData={userData} />;
                default: return null;
            }
        }
    };

    return (
        <DrawerFormContainer open={open} onClose={handleClose} title={userId ? 'Edit User' : 'Create User'}>
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardHeader
                    title={
                        <Stepper activeStep={activeStep}>
                            <Step><StepLabel>General Information</StepLabel></Step>
                            <Step><StepLabel>Branches</StepLabel></Step>
                            {shouldShowUserFields && <Step><StepLabel>Additional fields</StepLabel></Step>}
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
                            <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
                        )}
                        {StepRenderer(activeStep)}
                        {formState.isSubmitted && Object.keys(formState.errors).length > 0 && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Please fix the errors in the form before submitting.
                                {console.log('Validation errors:', formState.errors)}
                            </Alert>
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
                            disabled={userId ? updateUserMutation.isPending : createUser.isPending}
                        >
                            {userId
                                ? (updateUserMutation.isPending ? 'Updating...' : 'Update User')
                                : (createUser.isPending ? 'Submitting...' : 'Create User')
                            }
                        </Button>
                    )}
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
}