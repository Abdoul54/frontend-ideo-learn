'use client';
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Button,
    Typography,
    TextField,
    FormControl,
    RadioGroup,
    Radio,
    FormControlLabel,
    Box,
    CircularProgress,
    Paper,
    Chip,
    Autocomplete,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Checkbox,
    IconButton,
    Tab,
    FormLabel,
    ListItemText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from '@/@core/components/mui/TabList';
import debounce from 'lodash/debounce';
import { useGetListUsers } from '@/hooks/api/useUsers';
import toast from 'react-hot-toast';
import DateInput from '@/components/inputs/DateInput';
import { useUpdateSession } from '@/hooks/api/tenant/learn/course/useSessionCourse';
import CheckboxInput from '@/components/inputs/CheckboxInput';

const SessionProperties = ({ session, courseId }) => {

    console.log("Session Properties - Session Data:", session);
    console.log("Session Properties - Course ID:", courseId);

    const [enrollmentDeadline, setEnrollmentDeadline] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [selectedInstructors, setSelectedInstructors] = useState([]);
    const [userSearchText, setUserSearchText] = useState('');
    const [selfEnrollmentDeadline, setSelfEnrollmentDeadline] = useState(false);
    const [deadlineEnrollmentType, setDeadlineEnrollmentType] = useState('automatic_deadline');
    const [attendanceType, setAttendanceType] = useState(null);
    const { data: users = [] } = useGetListUsers({ search_text: userSearchText });

    // Use the real update session mutation hook
    const updateSessionMutation = useUpdateSession();

    useEffect(() => {
        if (session) {
            console.log('Session data:', session);
            // Always enable self-enrollment deadline when custom_deadline_days is defined (even if it's 0)
            const hasDeadline = session.enrollment_deadline !== null || session.custom_deadline_days !== undefined;
            setSelfEnrollmentDeadline(hasDeadline);

            // Determine deadline type
            if (session.enrollment_deadline) {
                setDeadlineEnrollmentType('deadline_date');
            } else if (session.custom_deadline_days > 0) {
                setDeadlineEnrollmentType('dynamic_deadline');
            } else {
                // For custom_deadline_days: 0 or undefined, use automatic deadline
                setDeadlineEnrollmentType('automatic_deadline');
            }

            // Determine attendance type
            if (session.evaluation_type === 2) {
                setAttendanceType(session.min_attended_dates_for_completion ? '1' : null);
            }
        }
    }, [session]);

    // Form initialization with default values
    const { control, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            id: session?.id || '',
            name: session?.name || '',
            code: session?.code || '',
            description: session?.description || '',
            min_enroll: session?.min_enroll || 0,
            max_enroll: session?.max_enroll || 30,
            score_base: session?.score_base || 100,
            enrollment_deadline: session?.enrollment_deadline || null,
            custom_deadline_days: session?.custom_deadline_days || 7,
            evaluation_type: session?.evaluation_type !== undefined ? session.evaluation_type : 3,
            attendance_type: session?.min_attended_dates_for_completion ? '1' : null,
            min_attended_dates_for_completion: session?.min_attended_dates_for_completion || 1,
            deeplink_enabled: session?.deeplink_enabled || false,
            self_enrollment_deadline: !!(session?.enrollment_deadline !== null || session?.custom_deadline_days !== undefined),
            instructors: session?.instructors || [],
            enrollment_url: session?.deep_link_hash ?
                `${window.location.origin}/learn/course/session/enroll/${session.deep_link_hash}` : ''
        }
    });

    // Watch evaluation type to conditionally show fields
    const evaluationType = watch('evaluation_type');

    // Initialize form with session data when it becomes available
    useEffect(() => {
        if (session) {
            console.log('Resetting form with session data:', session);

            reset({
                id: session.id || '',
                name: session.name || '',
                code: session.code || '',
                description: session.description || '',
                min_enroll: session.min_enroll || 0,
                max_enroll: session.max_enroll || 30,
                score_base: session.score_base || 100,
                enrollment_deadline: session.enrollment_deadline || null,
                custom_deadline_days: session.custom_deadline_days || 7,
                evaluation_type: session.evaluation_type !== undefined ? session.evaluation_type : 3,
                attendance_type: session.min_attended_dates_for_completion ? '1' : null,
                min_attended_dates_for_completion: session.min_attended_dates_for_completion || 1,
                deeplink_enabled: session.deeplink_enabled || false,
                self_enrollment_deadline: !!(session.enrollment_deadline !== null || session.custom_deadline_days !== undefined),
                instructors: session.instructors || [],
                enrollment_url: session.deep_link_hash ?
                    `${window.location.origin}/learn/course/session/enroll/${session.deep_link_hash}` : ''
            });

            if (session.instructors && session.instructors.length > 0) {
                setSelectedInstructors(session.instructors);
            }

            // Update attendance type state based on session data
            if (session.evaluation_type === 2) {
                setAttendanceType(session.min_attended_dates_for_completion ? '1' : null);
            }
        }
    }, [session, reset]);

    // Handle instructor search with debounce
    const handleUserSearch = debounce((value) => {
        setUserSearchText(value);
    }, 300);

    // Handle tab change
    const handleTabChange = (newValue) => {
        setActiveTab(newValue);
    };

    // Handle copy enrollment URL to clipboard
    const handleCopyEnrollmentUrl = () => {
        const url = watch('enrollment_url');
        if (url) {
            navigator.clipboard.writeText(url);
            toast.success('Enrollment URL copied to clipboard');
        }
    };


    // Form submission
    const onSubmit = async (formData) => {
        try {
            console.log('Form data at submission:', formData);
            console.log('Course ID at submission:', courseId);

            const courseIdToUse = courseId || session?.course_id;
            console.log('Using course ID:', courseIdToUse);

            if (!courseIdToUse) {
                toast.error("Course ID is missing. Cannot update session.");
                return;
            }

            // Convert instructors from objects to IDs array
            const instructorIds = formData.instructors.map(instructor => instructor.id || instructor.user_id);

            // Create the data payload
            const sessionData = {
                course_id: parseInt(courseIdToUse),
                name: formData.name,
                code: formData.code,
                description: formData.description,
                min_enroll: parseInt(formData.min_enroll),
                max_enroll: parseInt(formData.max_enroll),
                evaluation_type: parseInt(formData.evaluation_type),
                deeplink_enabled: formData.deeplink_enabled,
                instructors: instructorIds
            };

            // Handle evaluation type specific fields
            if (parseInt(formData.evaluation_type) === 0) { // Evaluation based
                sessionData.score_base = parseInt(formData.score_base);
            } else if (parseInt(formData.evaluation_type) === 2) { // Attendance based
                // For attendance type "all events" set to null, for "custom" set to the input value
                sessionData.min_attended_dates_for_completion =
                    formData.attendance_type === '1' ? parseInt(formData.min_attended_dates_for_completion) : null;
            }

            // Handle enrollment deadline based on type
            if (formData.self_enrollment_deadline) {
                if (deadlineEnrollmentType === 'deadline_date' && formData.enrollment_deadline) {
                    sessionData.enrollment_deadline = formData.enrollment_deadline;
                    sessionData.custom_deadline_days = 0;
                } else if (deadlineEnrollmentType === 'dynamic_deadline') {
                    sessionData.custom_deadline_days = parseInt(formData.custom_deadline_days) || 7;
                    sessionData.enrollment_deadline = null;
                } else if (deadlineEnrollmentType === 'automatic_deadline') {
                    sessionData.custom_deadline_days = 0;
                    sessionData.enrollment_deadline = null;
                }
            } else {
                // If self enrollment deadline is disabled, send null instead of 0
                sessionData.enrollment_deadline = null;
                sessionData.custom_deadline_days = null;
            }

            console.log('Sending session data to API:', sessionData);

            await updateSessionMutation.mutateAsync({
                sessionId: session?.id,
                data: sessionData
            });
        } catch (error) {
            console.error('Failed to update session:', error);
            toast.error('Failed to update session');
        }
    };

    return (
        <TabContext value={activeTab}>
            <Grid container spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Left Navigation */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={0} sx={{ bgcolor: 'background.paper', p: 2 }}>
                        <CustomTabList
                            pill='false'
                            onChange={(e, newValue) => handleTabChange(newValue)}
                            orientation='vertical'
                            variant="fullWidth"
                            sx={{ width: '100%', '& .MuiTabs-flexContainer': { width: '100%' } }}
                        >
                            <Tab value="general" label="General" />
                            <Tab value="details" label="Details" />
                        </CustomTabList>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} md={9}>
                    <TabPanel value="general" sx={{ p: 0 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary="Session Information"
                                        secondary="Customize the session changing its code, name, enrollments and score info."
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* Session Name */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="name"
                                            control={control}
                                            rules={{ required: 'Name is required' }}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label="Name"
                                                    fullWidth
                                                    required
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Session Code */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="code"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label="Code"
                                                    fullWidth
                                                    error={!!error}
                                                    helperText={error ? error.message : "Unique identifier for this session"}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Enrollment Limits */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="min_enroll"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Minimum enrollments"
                                                    type="number"
                                                    fullWidth
                                                    InputProps={{ inputProps: { min: 0 } }}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="max_enroll"
                                            control={control}
                                            rules={{ required: 'Maximum enrollments is required' }}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label="Maximum enrollments"
                                                    type="number"
                                                    fullWidth
                                                    required
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                    InputProps={{ inputProps: { min: 0 } }}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Session Description */}
                                    <Grid item xs={12}>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label="Description"
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Session Completion Options */}
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mt: 4 }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary="Session completion"
                                        secondary="Configure how the session will be marked as completed"
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <FormControl component="fieldset" fullWidth>
                                    <Controller
                                        name="evaluation_type"
                                        control={control}
                                        render={({ field }) => {
                                            // Ensure evaluation_type is always a number
                                            const evalTypeNum = typeof field.value === 'string'
                                                ? parseInt(field.value, 10)
                                                : field.value;

                                            return (
                                                <RadioGroup
                                                    value={evalTypeNum}
                                                    onChange={(e) => {
                                                        const newValue = parseInt(e.target.value, 10);
                                                        field.onChange(newValue);
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value={3}
                                                        control={<Radio />}
                                                        label={
                                                            <Box>
                                                                <Typography variant="body1">Manual</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    The session can be marked as completed manually only by Superadmins and Power Users
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                    <FormControlLabel
                                                        value={0}
                                                        control={<Radio />}
                                                        label={
                                                            <Box>
                                                                <Typography variant="body1">Evaluation based</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    The session is marked as completed when the evaluation is Passed. You can also configure a maximum score for the session.
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />

                                                    {/* Only show score_base field when evaluation_type is 0 */}
                                                    {evalTypeNum === 0 && (
                                                        <Box ml={4} mt={1} mb={1}>
                                                            <Controller
                                                                name="score_base"
                                                                control={control}
                                                                rules={{
                                                                    required: 'Maximum score is required',
                                                                    min: { value: 0, message: 'Must be at least 0' }
                                                                }}
                                                                render={({ field, fieldState: { error } }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        label="Maximum score"
                                                                        type="number"
                                                                        fullWidth
                                                                        margin="normal"
                                                                        error={!!error}
                                                                        helperText={error ? error.message : null}
                                                                    />
                                                                )}
                                                            />
                                                        </Box>
                                                    )}

                                                    <FormControlLabel
                                                        value={2}
                                                        control={<Radio />}
                                                        label={
                                                            <Box>
                                                                <Typography variant="body1">Attendance based</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    The session is marked as completed when the attendance status in the attendance sheet is Present for all the events or a custom number of them
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />

                                                    {/* Only show attendance options when evaluation_type is 2 */}
                                                    {evalTypeNum === 2 && (
                                                        <Box ml={4} mt={1} mb={1}>
                                                            <FormControl component="fieldset">
                                                                <Controller
                                                                    name="attendance_type"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <RadioGroup
                                                                            {...field}
                                                                            value={field.value}
                                                                            onChange={(e) => {
                                                                                field.onChange(e);
                                                                                setAttendanceType(e.target.value);
                                                                            }}
                                                                        >
                                                                            <FormControlLabel
                                                                                value={null}
                                                                                control={<Radio />}
                                                                                label="All events"
                                                                            />
                                                                            <FormControlLabel
                                                                                value="1"
                                                                                control={<Radio />}
                                                                                label="Custom number of events"
                                                                            />
                                                                        </RadioGroup>
                                                                    )}
                                                                />

                                                                {/* Only show min_attended_dates_for_completion field when attendance_type is custom */}
                                                                {attendanceType === "1" && (
                                                                    <Controller
                                                                        name="min_attended_dates_for_completion"
                                                                        control={control}
                                                                        rules={{
                                                                            required: 'Minimum attendance is required',
                                                                            min: { value: 1, message: 'Must be at least 1' }
                                                                        }}
                                                                        render={({ field, fieldState: { error } }) => (
                                                                            <TextField
                                                                                {...field}
                                                                                label="Minimum attended dates for completion"
                                                                                type="number"
                                                                                fullWidth
                                                                                margin="normal"
                                                                                error={!!error}
                                                                                helperText={error ? error.message : null}
                                                                            />
                                                                        )}
                                                                    />
                                                                )}
                                                            </FormControl>
                                                        </Box>
                                                    )}

                                                    <FormControlLabel
                                                        value={1}
                                                        control={<Radio />}
                                                        label={
                                                            <Box>
                                                                <Typography variant="body1">Training material based</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    The session is marked as completed when the learner completes the Test training material
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </RadioGroup>
                                            );
                                        }}
                                    />
                                </FormControl>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    <TabPanel value="details" sx={{ p: 0 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary="Session Details"
                                        secondary="Additional configuration options for this session"
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>

                                    {/* Session Instructors */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            Session instructors
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Session instructors can mark the attendance and evaluate learners
                                        </Typography>

                                        <Controller
                                            name="instructors"
                                            control={control}
                                            defaultValue={[]}
                                            render={({ field: { onChange, value } }) => (
                                                <Autocomplete
                                                    multiple
                                                    options={users}
                                                    getOptionLabel={(user) => {
                                                        if (!user) return '';
                                                        return user.full_name || user.fullname ||
                                                            (user.firstname && user.lastname ?
                                                                `${user.firstname} ${user.lastname}` :
                                                                `User ${user.id || user.user_id}`);
                                                    }}
                                                    value={value}
                                                    onChange={(_, newValue) => {
                                                        // Update both the form value and selectedInstructors state
                                                        onChange(newValue);
                                                        setSelectedInstructors(newValue);
                                                    }}
                                                    onInputChange={(_, value) => handleUserSearch(value)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Instructors"
                                                            placeholder="Type to search..."
                                                            fullWidth
                                                            helperText={`${value.length}/200`}
                                                        />
                                                    )}
                                                    renderTags={(tagValue, getTagProps) =>
                                                        tagValue.map((option, index) => (
                                                            <Chip
                                                                key={option.id || option.user_id}
                                                                label={option.full_name || option.fullname || option.name ||
                                                                    `${option.firstname || ''} ${option.lastname || ''}`.trim() ||
                                                                    `User ${option.id || option.user_id}`}
                                                                {...getTagProps({ index })}
                                                            />
                                                        ))
                                                    }
                                                    renderOption={(props, option) => (
                                                        <Box component="li" {...props} key={option.id || option.user_id}>
                                                            <Box>
                                                                <Typography variant="body1">
                                                                    {option.full_name || option.fullname ||
                                                                        `${option.firstname || ''} ${option.lastname || ''}`.trim() ||
                                                                        `User ${option.id || option.user_id}`}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {option.email || 'Unknown email'} (ID: {option.id || option.user_id})
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    isOptionEqualToValue={(option, value) => {
                                                        if (!option || !value) return false;
                                                        return String(option.id || option.user_id) === String(value.id || value.user_id);
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Self enrollment deadline */}
                                    <Grid item xs={12} sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            Self enrollment deadline
                                        </Typography>

                                        <Controller
                                            name="self_enrollment_deadline"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => {
                                                                field.onChange(e.target.checked);
                                                                setSelfEnrollmentDeadline(e.target.checked);
                                                            }}
                                                        />
                                                    }
                                                    label="Enable deadline for self enrollment"
                                                />
                                            )}
                                        />

                                        {watch('self_enrollment_deadline') && (
                                            <Box sx={{ ml: 4, mt: 1 }}>
                                                <FormControl component="fieldset">
                                                    <RadioGroup
                                                        name="deadline_enrollment_type"
                                                        value={deadlineEnrollmentType}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            setDeadlineEnrollmentType(newValue);
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="automatic_deadline"
                                                            control={<Radio />}
                                                            label="Automatic deadline, based on the session start date"
                                                        />
                                                        <FormControlLabel
                                                            value="deadline_date"
                                                            control={<Radio />}
                                                            label="Deadline date"
                                                        />

                                                        {/* Enrollment Deadline */}
                                                        {deadlineEnrollmentType === 'deadline_date' && (
                                                            <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
                                                                <Controller
                                                                    name="enrollment_deadline"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <DateInput
                                                                            name="enrollment_deadline"
                                                                            control={control}
                                                                            label="Enrollment deadline"
                                                                            value={field.value}
                                                                            onChange={(date) => {
                                                                                setValue('enrollment_deadline', date, { shouldDirty: true });
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </Box>
                                                        )}

                                                        <FormControlLabel
                                                            value="dynamic_deadline"
                                                            control={<Radio />}
                                                            label="Dynamic deadline"
                                                        />

                                                        {/* Custom Deadline Days */}
                                                        {deadlineEnrollmentType === 'dynamic_deadline' && (
                                                            <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
                                                                <Controller
                                                                    name="custom_deadline_days"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <TextField
                                                                            {...field}
                                                                            label="Custom deadline days"
                                                                            type="number"
                                                                            fullWidth
                                                                            InputProps={{ inputProps: { min: 1 } }}
                                                                            helperText="Number of days before session start that enrollment is allowed"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                />
                                                            </Box>
                                                        )}
                                                    </RadioGroup>
                                                </FormControl>
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Deep Link Option */}
                                    <Grid item xs={12} sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            Session enrollment link
                                        </Typography>

                                        <Controller
                                            name="deeplink_enabled"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                        />
                                                    }
                                                    label="Enable enrollment link for this session"
                                                />
                                            )}
                                        />

                                        {watch('deeplink_enabled') && session?.deep_link_hash && (
                                            <Box sx={{ ml: 4, mt: 1 }}>
                                                <TextField
                                                    label="Enrollment URL"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={watch('enrollment_url')}
                                                    InputProps={{
                                                        readOnly: true,
                                                        endAdornment: (
                                                            <IconButton
                                                                onClick={handleCopyEnrollmentUrl}
                                                                edge="end"
                                                                aria-label="copy enrollment url"
                                                            >
                                                                <i className="solar-copy-linear" />
                                                            </IconButton>
                                                        ),
                                                    }}
                                                    helperText="Learners will be automatically enrolled in the session upon clicking the link"
                                                />
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </TabPanel>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={updateSessionMutation.isPending}
                            startIcon={updateSessionMutation.isPending ? <CircularProgress size={20} /> : null}
                        >
                            {updateSessionMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </TabContext>
    );
};

export default SessionProperties;