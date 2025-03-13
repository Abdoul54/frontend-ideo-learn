import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stepper, Step, StepLabel, Card, CardHeader, CardContent, CardActions, Grid, Alert, CircularProgress } from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useGetUser, useUpdateUser } from "@/hooks/api/useUsers";
import { createUserSchema, defaultValues } from "@/constants/Users";
import StepOne from "./UserSteps/StepOne";
import StepTwo from "./UserSteps/StepTwo";
import StepThree from "./UserSteps/StepThree";
import StepFour from "./UserSteps/StepFour";
import { useUseAllUserFields } from "@/hooks/api/tenant/useUserFields";
import { useManagerTypes } from "@/hooks/api/tenant/useManager";

export default function EditUserForm({ open, onClose, userId }) {
  const { data: userfields } = useUseAllUserFields();
  const { data: managerTypesData } = useManagerTypes();
  const managerTypes = managerTypesData?.items || [];

  const { data: userData, isLoading: isUserLoading } = useGetUser(userId);
  const updateUserMutation = useUpdateUser(onClose);

  const [originalData, setOriginalData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const totalSteps = 4;

  // Create initial form state
  const { control, handleSubmit, trigger, watch, reset, formState } = useForm({
    resolver: yupResolver(createUserSchema(managerTypes, true)), // true = update mode
    defaultValues: defaultValues, // Initially use defaultValues, will update once userData loads
    mode: "onChange",
    context: { userfields, isUpdate: true },
  });

  // Update form with user data when it loads
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
        (Array.isArray(userData.select_orgchart) ?
          userData.select_orgchart :
          Object.keys(userData.select_orgchart).map(Number)) :
        [];

      // Reset form with complete user data
      reset({
        ...userData,
        username: userData.username,
        email: userData.email,
        firstname: userData.firstname,
        lastname: userData.lastname,
        manager: formattedManager,
        employees: formattedEmployees,
        can_manage_subordinates: !!userData.can_manage_subordinates,
        select_orgchart: orgchart,
        password: '',
        password_confirmation: ''
      });
    }
  }, [userId, userData, reset]);

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
    switch (step) {
      case 0: return ['username', 'email', 'firstname', 'lastname', 'level', 'language', 'expiration', 'timezone', 'email_validation_status', 'valid', 'force_change'];
      case 1: return ['select_orgchart'];
      case 2: return ['additional_fields'];
      case 3: return ['manager', 'employees', 'can_manage_subordinates'];
      default: return [];
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const onSubmit = (data) => {
    // Define editable fields that the API accepts for updates
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
      if (hasManager) {
        const compareManager = Object.fromEntries(
          Object.entries(formattedManager).map(([k, v]) => [k, String(v)])
        );

        const compareOriginalManager = Object.fromEntries(
          Object.entries(originalData?.manager || {}).map(([k, v]) => [k, String(v)])
        );

        if (JSON.stringify(compareManager) !== JSON.stringify(compareOriginalManager)) {
          formattedData.manager = formattedManager;
        } else {
          delete formattedData.manager;
        }
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
      if (hasEmployees) {
        const compareEmployees = Object.fromEntries(
          Object.entries(formattedEmployees).map(([k, v]) => [k, v.map(String)])
        );

        const compareOriginalEmployees = Object.fromEntries(
          Object.entries(originalData?.employees || {}).map(([k, v]) => [k, v.map(String)])
        );

        if (JSON.stringify(compareEmployees) !== JSON.stringify(compareOriginalEmployees)) {
          formattedData.employees = formattedEmployees;
        } else {
          delete formattedData.employees;
        }
      } else {
        delete formattedData.employees;
      }
    } else {
      formattedData.employees = {}; // Empty object to indicate no employees
    }

    // Convert boolean values to numbers as needed
    formattedData.force_change = formattedData.force_change ? 1 : 0;
    formattedData.valid = formattedData.valid ? 1 : 0;
    formattedData.email_validation_status = parseInt(formattedData.email_validation_status, 10);
    formattedData.can_manage_subordinates = !!formattedData.can_manage_subordinates;
    formattedData.send_notification_email = !!formattedData.send_notification_email;

    // Handle organization chart
    if (formattedData.select_orgchart) {
      formattedData.select_orgchart = Array.isArray(formattedData.select_orgchart)
        ? formattedData.select_orgchart.map(Number)
        : [];
    }

    // Remove empty password fields for update
    if (!formattedData.password || formattedData.password.trim() === '') {
      delete formattedData.password;
      delete formattedData.password_confirmation;
    }

    // Log the final payload for debugging
    console.log('Submitting user update data:', formattedData);

    updateUserMutation.mutate({ userId, userData: formattedData });
  };

  const StepRenderer = (step) => {
    switch (step) {
      case 0: return <StepOne control={control} watch={watch} isUpdate={true} />;
      case 1: return <StepTwo control={control} watch={watch} />;
      case 2: return <StepThree control={control} />;
      case 3: return <StepFour control={control} userData={userData} />;
      default: return null;
    }
  };

  if (isUserLoading) {
    return (
      <DrawerFormContainer open={open} onClose={handleClose} title="Edit User">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </DrawerFormContainer>
    );
  }

  return (
    <DrawerFormContainer open={open} onClose={handleClose} title="Edit User">
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
        <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
          {activeStep > 0 && <Button sx={{ marginTop: '5px' }} onClick={handleBack}>Back</Button>}
          {activeStep < totalSteps - 1 && (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          )}
          {activeStep === totalSteps - 1 && (
            <Button
              variant="contained"
              type="submit"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          )}
        </CardActions>
      </Card>
    </DrawerFormContainer>
  );
}