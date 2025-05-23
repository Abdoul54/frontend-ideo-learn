import React, { useState, useCallback } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    FormLabel,
    CircularProgress,
    Autocomplete,
    Chip,
    Stack,
    Grid,
    Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useCreateCourseSession } from '@/hooks/api/tenant/learn/course/useCourse';
import { useGetListUsers } from '@/hooks/api/useUsers';
import debounce from 'lodash/debounce';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/@core/contexts/translationContext';

const AddSessionDrawer = ({ open, onClose, courseId }) => {
    const { translate } = useTranslation();
    
    // Form and API hooks
    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            max_enroll: 30,
            evaluation_type: 3,
            score_base: 100,
            instructors: []
        }
    });

    const createSessionMutation = useCreateCourseSession();
    const [userSearchText, setUserSearchText] = useState('');
    const { data: usersData } = useGetListUsers({ search_text: userSearchText });
    // Ensure users is always an array, even if data is undefined
    const users = Array.isArray(usersData) ? usersData : [];

    const router = useRouter();

    // Watch evaluation_type to conditionally show fields
    const evaluationType = watch('evaluation_type');

    // Handle user search with debounce
    const handleUserSearch = useCallback(
        debounce((value) => {
            setUserSearchText(value);
        }, 300),
        []
    );

    // Form submission
    const onSubmit = async (data) => {
        try {
            // Convert instructors from objects to IDs array
            const instructorIds = data.instructors?.map(instructor =>
                instructor?.id || instructor?.user_id
            ).filter(Boolean);

            // Create session data payload
            const sessionData = {
                name: data.name,
                max_enroll: parseInt(data.max_enroll || 0),
                evaluation_type: parseInt(data.evaluation_type || 3),
                instructors: instructorIds || []
            };

            // Add score_base if evaluation_type is 0
            if (parseInt(data.evaluation_type) === 0) {
                sessionData.score_base = parseInt(data.score_base || 0);
            }

            const result = await createSessionMutation.mutateAsync({ courseId, sessionData });

            console.log('Session created successfully:', result);
            // Close the drawer
            onClose();

            // Redirect to the session edit page if we have a sessionId in the result
            if (result && result.session_id) {
                router.push(`/learn/course/session/${result.session_id}`);
            } else {
                // Reset the form if no redirect
                reset();
            }
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    // Close handler with form reset
    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <DrawerFormContainer
            open={open}
            onClose={handleClose}
            title={translate('Course management.MODAL_TITLE_CREATE_SESSION', 'Create a new session')}
            description={translate('Course management.MODAL_SUBTITLE_CREATE_SESSION', 'Fill in the form below to start creating the base for your session')}
            width={500}
        >
            <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <Stack spacing={3}>
                            {/* Session Name */}
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: translate('Course management.SESSION_NAME_REQUIRED', 'Session name is required') }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={translate('Course management.SESSION_NAME', 'Name')}
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />

                            {/* Maximum enrollments */}
                            <Controller
                                name="max_enroll"
                                control={control}
                                rules={{
                                    required: translate('Course management.max_enroll_required', 'Maximum enrollments is required'),
                                    min: { value: 0, message: translate('Course management.min_value', 'Must be at least 0') }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={translate('Course management.FIELD_MAXIMUM_ENROLLMENTS', 'Maximum enrollments')}
                                        type="number"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.max_enroll}
                                        helperText={errors.max_enroll?.message}
                                    />
                                )}
                            />

                            <Divider />

                            {/* Instructors Selection */}
                            <Box mt={4} mb={3}>
                                <Typography variant="subtitle1" mb={1}>
                                    {translate('Course management.SUB_SECTION_SESSION_INSTRUCTORS', 'Session instructors')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    {translate('Course management.SUB_SECTION_SUBTITLE_SESSION_INSTRUCTORS', 'Session instructors can mark the attendance and evaluate learners')}
                                </Typography>

                                <Controller
                                    name="instructors"
                                    control={control}
                                    defaultValue={[]}
                                    render={({ field: { onChange, value } }) => (
                                        <Autocomplete
                                            multiple
                                            options={users || []}
                                            getOptionLabel={(user) => {
                                                if (!user) return '';
                                                return user.fullname ||
                                                    (user.first_name && user.last_name ?
                                                        `${user.first_name} ${user.last_name}` :
                                                        `User ${user.id || user.user_id || 'unknown'}`);
                                            }}
                                            value={value || []}
                                            onChange={(_, newValue) => onChange(newValue || [])}
                                            onInputChange={(_, value) => handleUserSearch(value || '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={translate('Course management.DROPDOWN_INSTRUCTORS', 'Instructors')}
                                                    placeholder={translate('common.type_to_search', 'Type to search...')}
                                                    fullWidth
                                                    helperText={`${value.length}/200`}
                                                />
                                            )}
                                            renderTags={(tagValue, getTagProps) =>
                                                tagValue.map((option, index) => {
                                                    if (!option) return null;
                                                    const label = option.fullname ||
                                                        `${option.first_name || ''} ${option.last_name || ''}`.trim() ||
                                                        `User ${option.id || option.user_id || 'unknown'}`;
                                                    return (
                                                        <Chip
                                                            key={index}
                                                            label={label}
                                                            {...getTagProps({ index })}
                                                        />
                                                    );
                                                })
                                            }
                                            renderOption={(props, option) => {
                                                if (!option) return null;
                                                return (
                                                    <Box component="li" {...props}>
                                                        <Box>
                                                            <Typography variant="body1">
                                                                {option.fullname ||
                                                                    `${option.first_name || ''} ${option.last_name || ''}`.trim() ||
                                                                    `User ${option.id || option.user_id || 'unknown'}`}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {option.email || 'Unknown email'} (ID: {option.id || option.user_id || 'unknown'})
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            }}
                                            isOptionEqualToValue={(option, value) => {
                                                if (!option || !value) return false;
                                                return String(option.id || option.user_id || '') ===
                                                    String(value.id || value.user_id || '');
                                            }}
                                        />
                                    )}
                                />
                            </Box>

                            <Divider />

                            {/* Evaluation Type */}
                            <Box mt={3} mb={3}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">{translate('Course management.SESSION_EVALUATION_COMPLETION', 'Session evaluation / Completion')}</FormLabel>
                                    <Controller
                                        name="evaluation_type"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup {...field} value={parseInt(field.value)}>
                                                <FormControlLabel
                                                    value={3}
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1">{translate('Course management.RADIO_MANUAL_TITLE', 'Manual')}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {translate('Course management.RADIO_MANUAL_SUBTITLE', 'The session can be marked as completed manually only by Superadmins and Power Users')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                                <FormControlLabel
                                                    value={0}
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1">{translate('Course management.RADIO_EVALUATION_TITLE', 'Evaluation based')}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {translate('Course management.RADIO_EVALUATION_SUBTITLE', 'The session is marked as completed when the evaluation is Passed. You can also configure a maximum score for the session.')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />

                                                {/* Only show score_base field when evaluation_type is 0 */}
                                                {parseInt(evaluationType) === 0 && (
                                                    <Box ml={4} mt={1} mb={1}>
                                                        <Controller
                                                            name="score_base"
                                                            control={control}
                                                            rules={{
                                                                required: translate('Course management.MAX_SCORE_REQUIRED', 'Maximum score is required'),
                                                                min: { value: 0, message: translate('Course management.MIN_VALUE_REQUIRED', 'Must be at least 0') }
                                                            }}
                                                            render={({ field }) => (
                                                                <TextField
                                                                    {...field}
                                                                    label={translate('Course management.FIELD_MAXIMUM_SCORE', 'Maximum score')}
                                                                    type="number"
                                                                    fullWidth
                                                                    margin="normal"
                                                                    error={!!errors.score_base}
                                                                    helperText={errors.score_base?.message}
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
                                                            <Typography variant="body1">{translate('Course management.RADIO_ATTENDANCE_TITLE', 'Attendance based')}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {translate('Course management.RADIO_ATTENDANCE_SUBTITLE', 'The session is marked as completed when the attendance status in the attendance sheet is Present for all the events or a custom number of them')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />

                                                <FormControlLabel
                                                    value={1}
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1">{translate('Course management.RADIO_TRAINING_TITLE', 'Training material based')}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {translate('Course management.RADIO_TRAINING_SUBTITLE', 'The session is marked as completed when the learner completes the test training material')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </RadioGroup>
                                        )}
                                    />
                                </FormControl>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ p: 2, mt: 2, backgroundColor: 'background.paper' }}>
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    onClick={handleClose}
                                >
                                    {translate('common.cancel', 'Cancel')}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={createSessionMutation.isLoading}
                                    startIcon={createSessionMutation.isLoading ? <CircularProgress size={20} /> : null}
                                >
                                    {createSessionMutation.isLoading ? 
                                        translate('common.adding', 'Adding...') : 
                                        translate('Course management.BUTTON_CREATE_EDIT', 'Create & Edit')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </form>
        </DrawerFormContainer >
    );
};

export default AddSessionDrawer;