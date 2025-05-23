import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Grid,
    Alert,
    Box,
    Typography
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useBulkEnroll, useEnrollUser } from "@/hooks/api/tenant/learn/enrollment/UseEnrollments";
import SelectUsersStep from "@/views/Forms/Tenant/EnrollUserSteps/SelectUsersStep";
import SelectSessionStep from "@/views/Forms/Tenant/EnrollUserSteps/SelectSessionStep";
import AdditionalInfoStep from "@/views/Forms/Tenant/EnrollUserSteps/AdditionalInfoStep";
import NotificationsStep from "@/views/Forms/Tenant/EnrollUserSteps/NotificationsStep";
import { useTranslation } from '@/@core/contexts/translationContext';

// Create validation schema for single course enrollment
const singleEnrollmentSchema = yup.object().shape({
    users: yup.array().min(1, "Select at least one user").required("Users are required"),
    enrollmentType: yup.string().required("Please select an enrollment type"),
    session_id: yup.mixed().when('enrollmentType', {
        is: 'session',
        then: () => yup.number().required('Session selection is required'),
        otherwise: () => yup.mixed().nullable()
    }),
    level: yup.number().required("User level is required"),
    date_begin_validity: yup.string().nullable(),
    date_expire_validity: yup.string().nullable()
        .test('is-after-begin', 'End date must be after start date', function (value) {
            const { date_begin_validity } = this.parent;
            if (!date_begin_validity || !value) return true;
            return new Date(value) >= new Date(date_begin_validity);
        })
});

// Create validation schema for bulk enrollment
const bulkEnrollmentSchema = yup.object().shape({
    users: yup.array().min(1, "Select at least one user").required("Users are required"),
    group_ids: yup.array(),
    branches: yup.array(),
    includeDescendants: yup.boolean(), // Add this line to track the toggle state
    enrollmentType: yup.string().required("Please select an enrollment type"),
    session_id: yup.mixed().when('enrollmentType', {
        is: 'session',
        then: () => yup.number().required('Session selection is required'),
        otherwise: () => yup.mixed().nullable()
    }),
    // Add validation for course_sessions - if any course has enrollment type 'session',
    // it must have a corresponding entry in course_sessions
    course_sessions: yup.array().test(
        'sessions-selected',
        'You must select a session for each course marked for session enrollment',
        function (value, context) {
            // Only validate if we're in bulk enrollment mode with classroom courses
            const { courseEnrollmentTypes } = context.parent;
            if (!courseEnrollmentTypes) return true;

            // For each course with enrollment type 'session', check if we have a session selected
            const coursesNeedingSessions = Object.entries(courseEnrollmentTypes)
                .filter(([_, type]) => type === 'session')
                .map(([courseId]) => parseInt(courseId, 10));

            if (coursesNeedingSessions.length === 0) return true;

            // Make sure all courses that need sessions have them
            if (!value) return false;

            const selectedCoursesWithSessions = value.map(cs => cs.course_id);
            return coursesNeedingSessions.every(courseId =>
                selectedCoursesWithSessions.includes(courseId)
            );
        }
    ),
    level: yup.number().required("User level is required"),
    date_begin_validity: yup.string().nullable(),
    date_expire_validity: yup.string().nullable()
        .test('is-after-begin', 'End date must be after start date', function (value) {
            const { date_begin_validity } = this.parent;
            if (!date_begin_validity || !value) return true;
            return new Date(value) >= new Date(date_begin_validity);
        })
});

export default function EnrollUserDrawer({
    open,
    onClose,
    courseId = null,
    courseType = null,
    courseName = null,
    selectedCourses = [],
    isBulkEnrollment = false
}) {
    const { translate } = useTranslation();

    // Determine if it's a classroom course (affects showing the session step)
    const isClassroomCourse = courseType === "classroom";

    // Form setup with validation - choose schema based on isBulkEnrollment
    const { control, handleSubmit, trigger, watch, reset, setValue, getValues, formState: { errors } } = useForm({
        resolver: yupResolver(isBulkEnrollment ? bulkEnrollmentSchema : singleEnrollmentSchema),
        defaultValues: {
            users: [],
            group_ids: [],
            branches: [],
            includeDescendants: true, // Default to include descendants
            enrollmentType: 'course',
            session_id: null,
            course_sessions: [], // New field for tracking multiple course/session selections
            courseEnrollmentTypes: {},
            level: 1, // Default to "Learner"
            date_begin_validity: null,
            date_expire_validity: null,
            send_notification: false
        },
        mode: 'onChange'
    });

    // State for step navigation
    const [activeStep, setActiveStep] = useState(0);
    const [validationError, setValidationError] = useState("");

    // Watch form values for conditional logic
    const selectedUsers = watch("users");
    const enrollmentType = watch("enrollmentType");
    const selectedGroups = watch("group_ids") || [];
    const selectedBranches = watch("branches") || [];
    const includeDescendants = watch("includeDescendants"); // Watch this value to use when processing branches

    // API mutations
    const enrollUserMutation = useEnrollUser(onClose);
    const bulkEnrollMutation = useBulkEnroll(onClose);

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            reset({
                users: [],
                group_ids: [],
                branches: [],
                includeDescendants: true, // Reset to default
                enrollmentType: 'course',
                session_id: null,
                level: 1,
                date_begin_validity: null,
                date_expire_validity: null,
                send_notification: false
            });
            setActiveStep(0);
            setValidationError("");
        }
    }, [open, reset]);

    // Handle closing the drawer
    const handleClose = () => {
        onClose();
    };

    // Calculate total steps based on course type and enrollment type
    const getTotalSteps = () => {
        let steps = 0;

        // Step 1: User, Groups, Branches Selection (always present)
        steps++;

        // Step 2: Session Selection (only for classroom courses)
        if (isClassroomCourse || (isBulkEnrollment && selectedCourses.some(course => course.course_type === "classroom"))) {
            steps++;
        }

        // Step 3: Additional Info (always present)
        steps++;

        // Step 4: Notifications (always present)
        steps++;

        return steps;
    };

    const totalSteps = getTotalSteps();

    // Functions to determine which fields to validate at each step
    const getFieldsForStep = (step) => {
        if (isClassroomCourse || (isBulkEnrollment && selectedCourses.some(course => course.course_type === "classroom"))) {
            switch (step) {
                case 0: return ['users'];
                case 1: return ['enrollmentType', 'session_id'];
                case 2: return ['level', 'date_begin_validity', 'date_expire_validity'];
                case 3: return ['send_notification'];
                default: return [];
            }
        } else {
            switch (step) {
                case 0: return ['users'];
                case 1: return ['level', 'date_begin_validity', 'date_expire_validity'];
                case 2: return ['send_notification'];
                default: return [];
            }
        }
    };

    // Handle next button click with validation
    const handleNext = async () => {
        try {
            // Determine which fields to validate based on current step
            const fieldsToValidate = getFieldsForStep(activeStep);

            // Special case for session step validation
            if (fieldsToValidate.includes('session_id') && enrollmentType === 'course') {
                setValue('session_id', null);
                // Only validate enrollmentType
                const isStepValid = await trigger('enrollmentType');

                if (isStepValid) {
                    setValidationError("");
                    setActiveStep(prev => prev + 1);
                    return;
                }
            } else {
                // Validate all required fields for this step
                const isStepValid = await trigger(fieldsToValidate);

                if (isStepValid) {
                    setValidationError("");
                    setActiveStep(prev => prev + 1);
                    return;
                }
            }

            // If validation failed, show errors
            const errorFields = Object.keys(errors)
                .filter(field => fieldsToValidate.includes(field))
                .map(field => `${field}: ${errors[field].message}`);

            setValidationError(
                errorFields.length > 0
                    ? `Please fix the following errors: ${errorFields.join(', ')}`
                    : "Please complete all required fields in this step before proceeding."
            );
        } catch (error) {
            console.error("Error during validation:", error);
            setValidationError("An error occurred during validation. Please try again.");
        }
    };

    // Handle back button click
    const handleBack = () => {
        setActiveStep(prev => prev - 1);
        setValidationError("");
    };

    // Submit form data
    const onSubmit = (data) => {
        if (isBulkEnrollment) {
            // Bulk enrollment - multiple courses
            const enrollmentData = {
                course_ids: selectedCourses.map(course => course.id),
                user_ids: data.users.map(user => user.id),
                group_ids: data.group_ids?.length > 0 ? data.group_ids : undefined,
                branches: data.branches?.length > 0 ? data.branches : undefined,
                level: parseInt(data.level, 10),
                date_begin_validity: data.date_begin_validity,
                date_expire_validity: data.date_expire_validity,
                session_id: data.enrollmentType === 'session' ? data.session_id : undefined
            };

            if (enrollmentData.branches && enrollmentData.branches.length > 0) {
                // Make sure each branch has branch_id and selected_status
                enrollmentData.branches = enrollmentData.branches.map(branch => {
                    // If it's just a number or an object without branch_id
                    if (typeof branch === 'number') {
                        return {
                            branch_id: branch,
                            selected_status: data.includeDescendants ? 1 : 2 // Use the tracked includeDescendants value
                        };
                    } else if (!branch.branch_id && branch.id) {
                        return {
                            branch_id: branch.id,
                            // Use branch.selected_status if available, otherwise use the form's includeDescendants value
                            selected_status: branch.selected_status !== undefined ? branch.selected_status : (data.includeDescendants ? 1 : 2)
                        };
                    }
                    return branch;
                });
            }

            if (data.course_sessions && data.course_sessions.length > 0) {
                // Some courses are being enrolled to specific sessions
                // We need to build the course_ids array based on which courses are not in sessions
                const courseIdsWithSessions = data.course_sessions.map(cs => cs.course_id);

                // Get courses that should be enrolled directly (not to sessions)
                const directEnrollCourseIds = selectedCourses
                    .filter(course => !courseIdsWithSessions.includes(course.id))
                    .map(course => course.id);

                // Add course_ids for direct enrollment
                if (directEnrollCourseIds.length > 0) {
                    enrollmentData.course_ids = directEnrollCourseIds;
                }

                // Add course_sessions data for session enrollments
                enrollmentData.course_sessions = data.course_sessions;
            } else {
                // No session enrollments, enroll to all courses directly
                enrollmentData.course_ids = selectedCourses.map(course => course.id);
            }

            // Remove empty arrays or null values
            Object.keys(enrollmentData).forEach(key => {
                if (
                    enrollmentData[key] === null ||
                    enrollmentData[key] === undefined ||
                    (Array.isArray(enrollmentData[key]) && enrollmentData[key].length === 0)
                ) {
                    delete enrollmentData[key];
                }
            });

            console.log("Submitting bulk enrollment:", enrollmentData);
            // Submit bulk enrollment
            bulkEnrollMutation.mutate(enrollmentData);
        } else {
            // Single course enrollment - process each user
            const userIds = data.users.map(user => user.id);

            // Handle enrollments for each selected user
            userIds.forEach(userId => {
                const enrollmentData = {
                    level: parseInt(data.level, 10),
                    date_begin_validity: data.date_begin_validity,
                    date_expire_validity: data.date_expire_validity,
                    session_id: data.enrollmentType === 'session' ? data.session_id : undefined
                };

                // Remove null/undefined values
                Object.keys(enrollmentData).forEach(key => {
                    if (enrollmentData[key] === null || enrollmentData[key] === undefined) {
                        delete enrollmentData[key];
                    }
                });

                console.log("Submitting single enrollment:", {
                    courseId,
                    userId,
                    enrollmentData
                });

                // Submit enrollment
                enrollUserMutation.mutate({
                    courseId,
                    userId,
                    enrollmentData
                });
            });
        }
    };

    // Render the appropriate step component
    const StepRenderer = (step) => {
        if (isClassroomCourse || (isBulkEnrollment && selectedCourses.some(course => course.course_type === "classroom"))) {
            switch (step) {
                case 0: return <SelectUsersStep
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    isBulkEnrollment={isBulkEnrollment}
                />;
                case 1: return <SelectSessionStep
                    control={control}
                    errors={errors}
                    courseId={isBulkEnrollment ? selectedCourses[0]?.id : courseId}
                    selectedCourses={selectedCourses}
                    isBulkEnrollment={isBulkEnrollment}
                    setValue={setValue}
                    getValues={getValues}
                    watch={watch}
                />;
                case 2: return <AdditionalInfoStep
                    control={control}
                    errors={errors}
                    userCount={selectedUsers.length}
                />;
                case 3: return <NotificationsStep
                    control={control}
                    errors={errors}
                    bulkEnrollment={isBulkEnrollment}
                    courseCount={isBulkEnrollment ? selectedCourses.length : 1}
                    groupCount={selectedGroups.length}
                    branchCount={selectedBranches.length}
                />;
                default: return null;
            }
        } else {
            switch (step) {
                case 0: return <SelectUsersStep
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    isBulkEnrollment={isBulkEnrollment}
                />;
                case 1: return <AdditionalInfoStep
                    control={control}
                    errors={errors}
                    userCount={selectedUsers.length}
                />;
                case 2: return <NotificationsStep
                    control={control}
                    errors={errors}
                    bulkEnrollment={isBulkEnrollment}
                    courseCount={isBulkEnrollment ? selectedCourses.length : 1}
                    groupCount={selectedGroups.length}
                    branchCount={selectedBranches.length}
                />;
                default: return null;
            }
        }
    };

    // Generate title based on enrollment type
    const drawerTitle = (
        <Box>
            <Typography variant="h6">
                {isBulkEnrollment
                    ? translate('Course management.MODAL_TITLE_BULK_ENROLL', `Enroll Users to ${selectedCourses.length} Courses`)
                    : translate('Course management.MODAL_TITLE_ENROLL_USERS', "Enroll Users")}
            </Typography>
            {!isBulkEnrollment && courseName && (
                <Typography variant="body2" color="text.secondary">
                    {courseName}
                </Typography>
            )}
        </Box>
    );

    // Generate step labels based on enrollment type
    const getStepLabels = () => {
        const labels = [translate('Course management.STEP_LABEL_1', "Users")];

        if (isClassroomCourse || (isBulkEnrollment && selectedCourses.some(course => course.course_type === "classroom"))) {
            labels.push(translate('Course management.STEP_LABEL_2', "Sessions"));
        }

        labels.push(translate('Course management.STEP_LABEL_3', "Additional Information"), translate('Course management.STEP_LABEL_4', "Notifications"));

        return labels;
    };

    return (
        <DrawerFormContainer
            open={open}
            onClose={handleClose}
            title={drawerTitle}
            width="800px"
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardHeader
                    title={
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {getStepLabels().map((label, index) => (
                                <Step key={index}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
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
                    <Grid container spacing={3}>
                        {validationError && (
                            <Grid item xs={12}>
                                <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
                            </Grid>
                        )}
                        {StepRenderer(activeStep)}
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    {activeStep > 0 && (
                        <Button onClick={handleBack}>
                            {translate('Course management.BUTTON_PREVIOUS', 'Previous')}
                        </Button>
                    )}
                    {activeStep < totalSteps - 1 && (
                        <Button variant="contained" onClick={handleNext}>
                            {translate('Course management.BUTTON_NEXT', 'Next')}
                        </Button>
                    )}
                    {activeStep === totalSteps - 1 && (
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={isBulkEnrollment ? bulkEnrollMutation.isPending : enrollUserMutation.isPending}
                        >
                            {isBulkEnrollment
                                ? (bulkEnrollMutation.isPending
                                    ? translate('Course management.ENROLLING_USERS', 'Enrolling Users...')
                                    : translate('Course management.BUTTON_ENROLL_USERS', 'Enroll Users'))
                                : (enrollUserMutation.isPending
                                    ? translate('Course management.ENROLLING_USERS', 'Enrolling Users...')
                                    : translate('Course management.BUTTON_ENROLL_USERS', 'Enroll Users'))
                            }
                        </Button>
                    )}
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
}