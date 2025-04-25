'use client';
import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Chip,
    Checkbox,
    FormLabel,
    Switch,
    CircularProgress,
    IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useGetListUsers } from '@/hooks/api/useUsers';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import { useCreateSessionEvent, useClassroomsByLocation } from '@/hooks/api/tenant/learn/sessions/useSessionEvents';
import { useTimezonesTenant } from '@/hooks/api/tenant/useTimeLangSettings';
import { useLocations } from '@/hooks/api/tenant/learn/classrooms-locations/useLocations';
import { useClassrooms } from '@/hooks/api/tenant/learn/classrooms-locations/useClassrooms';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const eventTypes = [
    { value: 'PILT', label: 'Physical In-person Learning and Training' },
    { value: 'VILT', label: 'Virtual Instructor-Led Training' },
];

const AddEventDrawer = ({ open, onClose, sessionId }) => {
    const [userSearchText, setUserSearchText] = useState('');
    const { data: users = [] } = useGetListUsers({ search_text: userSearchText });
    const [venueEnabled, setVenueEnabled] = useState(false); // Default unchecked for venue
    const [videoConferenceEnabled, setVideoConferenceEnabled] = useState(false); // Default unchecked for video conference
    const [selectedJoinButtonOption, setSelectedJoinButtonOption] = useState('false'); // 'true' or 'false'
    const [selectedLocationId, setSelectedLocationId] = useState(null);


    // Fetch timezones, locations, and classrooms
    const { data: timezones = [] } = useTimezonesTenant();
    const { data: locations = { items: [] } } = useLocations({});
    const { data: classrooms = { items: [] } } = useClassrooms({});

    const { data: locationClassrooms = { items: [] }, isLoading: isLoadingClassrooms } = useClassroomsByLocation(selectedLocationId);

    const createSessionEventMutation = useCreateSessionEvent();

    // Initialize form with dayjs objects for date/time fields
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            day: 'Monday',
            date: dayjs(),
            description: '',
            time_begin: dayjs('09:00', 'HH:mm'),
            time_end: dayjs('18:00', 'HH:mm'),
            break_begin: null,
            break_end: null,
            timezone: timezones[0]?.id || '',
            event_type: 'PILT',
            custom_url: null,
            video_conference_tool: null,
            instructors: [],
            venue_enabled: false,
            id_classroom: null,
            id_location: null,
            video_conference_enabled: false,
            mark_join_attended: false,
            mark_recording_attended: false,
            join_button_option: 'false' // 'true' or 'false'
        },

        validate: (values) => {
            const errors = {};

            // Validate break times - only if both are provided
            if (values.break_begin && values.break_end) {
                const breakBegin = dayjs.isDayjs(values.break_begin)
                    ? values.break_begin
                    : dayjs(values.break_begin, 'HH:mm');

                const breakEnd = dayjs.isDayjs(values.break_end)
                    ? values.break_end
                    : dayjs(values.break_end, 'HH:mm');

                if (breakEnd.isBefore(breakBegin)) {
                    errors.break_end = 'Break end time must be after break start time';
                }
            }

            return errors;
        }
    });

    const eventType = watch('event_type');
    const selectedLocation = watch('id_location');

    const requiresVideoConference = ['VILT'].includes(eventType);
    const requiresVenue = ['PILT'].includes(eventType);

    // Watch for location changes to reset classroom and update selectedLocationId
    useEffect(() => {
        if (selectedLocation) {
            setSelectedLocationId(selectedLocation);
            // Reset classroom selection when location changes
            setValue('id_classroom', '');
        } else {
            setSelectedLocationId(null);
        }
    }, [selectedLocation, setValue]);

    useEffect(() => {
        if (venueEnabled) {
            setValue('event_type', 'PILT');
            setVideoConferenceEnabled(false);
        }
    }, [venueEnabled, setValue]);

    useEffect(() => {
        if (videoConferenceEnabled) {
            setValue('event_type', 'VILT');
            setVenueEnabled(false);
        }
    }, [videoConferenceEnabled, setValue]);

    // Handle user search with debounce
    const handleUserSearch = debounce((value) => {
        setUserSearchText(value);
    }, 300);

    const handleClose = () => {
        reset();
        setVenueEnabled(false);
        setVideoConferenceEnabled(false);
        setSelectedJoinButtonOption('false');
        onClose();
    };

    const onSubmit = async (formData) => {
        try {
            // Convert instructors to IDs array
            const instructorIds = formData.instructors.map(instructor => instructor.id || instructor.user_id);

            // Format the date and time fields properly
            const formatTimeString = (timeObj) => {
                if (!timeObj) return null;
                // Ensure it's a dayjs object before formatting
                return dayjs.isDayjs(timeObj) ? timeObj.format('HH:mm') : timeObj;
            };

            // Format the date as YYYY-MM-DD
            const formattedDate = dayjs.isDayjs(formData.date)
                ? formData.date.format('YYYY-MM-DD')
                : dayjs(formData.date).format('YYYY-MM-DD');

            // Base payload
            const baseData = {
                name: formData.name,
                day: formattedDate,
                description: formData.description,
                time_begin: formatTimeString(formData.time_begin),
                time_end: formatTimeString(formData.time_end),
                break_begin: formatTimeString(formData.break_begin),
                break_end: formatTimeString(formData.break_end),
                timezone: formData.timezone,
                event_type: formData.event_type,
                instructors: instructorIds,
            };

            // Add venue fields only for PILT/PVILT
            const venueData = requiresVenue ? {
                id_classroom: venueEnabled ? parseInt(formData.id_classroom) : null,
                id_location: venueEnabled ? parseInt(formData.id_location) : null,
            } : {};

            // Add video conference fields only for VILT/PVILT
            const videoConferenceData = requiresVideoConference ? {
                custom_url: formData.custom_url,
                video_conference_tool: formData.video_conference_tool,
                mark_join_attended: formData.mark_join_attended,
                mark_recording_attended: formData.mark_recording_attended,
                join_button_option: formData.join_button_option
            } : {};

            // Merge all data
            const mergedData = {
                ...baseData,
                ...venueData,
                ...videoConferenceData
            };

            // Clean null values
            const cleanData = Object.fromEntries(
                Object.entries(mergedData).filter(([_, v]) => v !== null)
            );

            console.log("Submitting event data:", cleanData);

            await createSessionEventMutation.mutateAsync({
                sessionId,
                data: cleanData
            });

            handleClose();
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Failed to create event');
        }
    };


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 700 },
                    p: 3,
                    overflow: 'auto'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">New event</Typography>
                <IconButton onClick={handleClose}>
                    <i className="lucide-x" fontSize="small" />
                </IconButton>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Event information
                </Typography>

                <Grid container spacing={2}>
                    {/* Event Name */}
                    <Grid item xs={12}>
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
                                    inputProps={{ maxLength: 255 }}
                                />
                            )}
                        />
                        <Typography variant="caption" color="textSecondary" align="right" sx={{ display: 'block' }}>
                            {watch('name')?.length || 0}/255
                        </Typography>
                    </Grid>

                    {/* Event Date */}
                    <Grid item xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="date"
                                control={control}
                                rules={{ required: 'Date is required' }}
                                render={({ field, fieldState: { error } }) => (
                                    <DatePicker
                                        label="Date"
                                        value={field.value}
                                        onChange={(date) => {
                                            field.onChange(date);
                                            // Make sure date is a valid dayjs object before using it
                                            if (date && dayjs.isDayjs(date)) {
                                                setValue('day', date.format('dddd'));
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                                error: !!error,
                                                helperText: error ? error.message : "Insert or select a date. Format example D/MM/YYYY."
                                            }
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* Event Description */}
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
                                    rows={3}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    Event time
                </Typography>

                <Grid container spacing={2}>
                    {/* Start Time */}
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="time_begin"
                                control={control}
                                rules={{ required: 'Start time is required' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TimePicker
                                        label="Start time"
                                        value={field.value}
                                        onChange={(time) => {
                                            if (time) {
                                                field.onChange(time);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                                error: !!error,
                                                helperText: error ? error.message : null
                                            }
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* End Time */}
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="time_end"
                                control={control}
                                rules={{ required: 'End time is required' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TimePicker
                                        label="End time"
                                        value={field.value}
                                        onChange={(time) => {
                                            if (time) {
                                                field.onChange(time);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                                error: !!error,
                                                helperText: error ? error.message : null
                                            }
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* Break Start Time */}
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="break_begin"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TimePicker
                                        label="Break start time"
                                        value={field.value}
                                        onChange={(time) => {
                                            if (time) {
                                                field.onChange(time);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!error,
                                                helperText: error ? error.message : 'Insert time in hh:mm format'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* Break End Time */}
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                                name="break_end"
                                control={control}
                                rules={{
                                    validate: (value) => {
                                        if (!value || !watch('break_begin')) return true;
                                        
                                        const breakBegin = dayjs.isDayjs(watch('break_begin')) 
                                            ? watch('break_begin') 
                                            : dayjs(watch('break_begin'), 'HH:mm');
                                            
                                        const breakEnd = dayjs.isDayjs(value) 
                                            ? value 
                                            : dayjs(value, 'HH:mm');
                                            
                                        return breakEnd.isAfter(breakBegin) || 'Break end time must be after break start time';
                                    }
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <TimePicker
                                        label="Break end time"
                                        value={field.value}
                                        onChange={(time) => {
                                            if (time) {
                                                field.onChange(time);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!error,
                                                helperText: error ? error.message : 'Insert time in hh:mm format'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* Timezone */}
                    <Grid item xs={12}>
                        <Controller
                            name="timezone"
                            control={control}
                            rules={{ required: 'Timezone is required' }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl fullWidth error={!!error} required>
                                    <InputLabel>Time zone</InputLabel>
                                    <Select
                                        {...field}
                                        label="Time zone"
                                    >
                                        {timezones.map((timezone) => (
                                            <MenuItem key={timezone.id} value={timezone.id}>
                                                {timezone.text}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {error && <Typography color="error" variant="caption">{error.message}</Typography>}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    {/* Duration Display */}
                    <Grid item xs={12}>
                        {(() => {
                            const startTime = watch('time_begin');
                            const endTime = watch('time_end');

                            let duration = 'Calculated automatically based on start and end times';

                            if (startTime && endTime && dayjs.isDayjs(startTime) && dayjs.isDayjs(endTime)) {
                                // Calculate duration in minutes
                                let diffMinutes = endTime.diff(startTime, 'minute');

                                // Handle times that cross midnight if needed
                                if (diffMinutes < 0) {
                                    diffMinutes += 24 * 60; // Add a full day in minutes
                                }

                                const hours = Math.floor(diffMinutes / 60);
                                const minutes = diffMinutes % 60;

                                // Format the duration
                                duration = `${hours}:${minutes.toString().padStart(2, '0')} h`;
                            }

                            return (
                                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                        Duration:
                                    </Typography>
                                    <Typography variant="body2">
                                        {duration}
                                    </Typography>
                                </Box>
                            );
                        })()}
                    </Grid>
                </Grid>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    Event type
                </Typography>

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    Venue and video conference tool (required)
                </Typography>

                <Grid container spacing={2}>
                    {/* Venue/Classroom Selection for PILT*/}
                    <>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={venueEnabled}
                                        onChange={(e) => setVenueEnabled(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Venue"
                            />
                        </Grid>

                        {venueEnabled && (
                            <>
                                <Grid item xs={12}>
                                    <Controller
                                        name="id_location"
                                        control={control}
                                        rules={{ required: venueEnabled ? 'Location is required' : false }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl fullWidth error={!!error} required={venueEnabled}>
                                                <InputLabel>Location (required)</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Location (required)"
                                                >
                                                    {locations.items.map((location) => (
                                                        <MenuItem key={location.id} value={location.id}>
                                                            {location.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {error && <Typography color="error" variant="caption">{error.message}</Typography>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name="id_classroom"
                                        control={control}
                                        rules={{ required: venueEnabled ? 'Classroom is required' : false }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl
                                                fullWidth
                                                error={!!error}
                                                required={venueEnabled}
                                                disabled={!selectedLocationId}
                                            >
                                                <InputLabel>Classroom</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Classroom"
                                                >
                                                    {isLoadingClassrooms ? (
                                                        <MenuItem disabled>Loading classrooms...</MenuItem>
                                                    ) : locationClassrooms.items.length === 0 ? (
                                                        <MenuItem disabled>No classrooms available for this location</MenuItem>
                                                    ) : (
                                                        locationClassrooms.items.map((classroom) => (
                                                            <MenuItem key={classroom.id} value={classroom.id}>
                                                                {classroom.name}
                                                            </MenuItem>
                                                        ))
                                                    )}
                                                </Select>
                                                {error && <Typography color="error" variant="caption">{error.message}</Typography>}
                                                {!selectedLocationId && !error && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Please select a location first
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            </>
                        )}
                    </>

                    {/* Video Conference Tool for VILT*/}

                    <>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={videoConferenceEnabled}
                                        onChange={(e) => setVideoConferenceEnabled(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Video conference tool"
                            />
                        </Grid>

                        {videoConferenceEnabled && (
                            <>
                                <Grid item xs={12}>
                                    <Controller
                                        name="custom_url"
                                        control={control}
                                        rules={{
                                            required: requiresVideoConference ? 'Video conference URL is required' : false,
                                            validate: value => {
                                                if (!requiresVideoConference) return true;
                                                try {
                                                    new URL(value);
                                                    return true;
                                                } catch {
                                                    return 'Must be a valid URL';
                                                }
                                            }
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                label="Video conference URL"
                                                fullWidth
                                                required={requiresVideoConference}
                                                error={!!error}
                                                helperText={error ? error.message : "URL for the video conference tool"}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="medium">
                                        Attendance options
                                    </Typography>

                                    <Box sx={{ mt: 1 }}>
                                        <Controller
                                            name="mark_join_attended"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                        />
                                                    }
                                                    label="Mark the event as attended when the user joins the webinar"
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Box>
                                        <Controller
                                            name="mark_recording_attended"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                        />
                                                    }
                                                    label="Mark the event as attended if the user accesses the recordings"
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>

                                {/* Join button options */}
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="medium">
                                        Join button options
                                    </Typography>

                                    <Controller
                                        name="join_button_option"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                {...field}
                                                value={selectedJoinButtonOption}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    setSelectedJoinButtonOption(e.target.value);
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="true"
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1" sx={{ mt: 2 }}>Display the Join button at the beginning of the event (default)</Typography>
                                                            <Typography variant="caption" sx={{ mt: 1 }} color="text.secondary">
                                                                Both instructors and learners will see the Join button when the video conference starts
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                                <FormControlLabel
                                                    value="false"
                                                    control={<Radio />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1" sx={{ mt: 4 }}>Display the Join button before the event starts</Typography>
                                                            <Typography variant="caption" sx={{ mt: 1 }} color="text.secondary">
                                                                Customize how many hours before the video conference starts instructors and learners will display the Join button (ex. 1:00 - one hour before). You can configure two different times for instructors and learners.
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </RadioGroup>
                                        )}
                                    />
                                </Grid>
                            </>
                        )}
                    </>
                </Grid>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    Event instructors
                </Typography>

                <Grid container spacing={2}>
                    {/* Instructors */}
                    <Grid item xs={12}>
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
                                    onChange={(_, newValue) => onChange(newValue)}
                                    onInputChange={(_, value) => handleUserSearch(value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Instructors"
                                            placeholder="Type to search..."
                                            fullWidth
                                        />
                                    )}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => (
                                            <Chip
                                                key={option.id || option.user_id || index}
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
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={createSessionEventMutation.isPending}
                        startIcon={createSessionEventMutation.isPending ? <CircularProgress size={20} /> : null}
                    >
                        {createSessionEventMutation.isPending ? 'Creating...' : 'Confirm'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default AddEventDrawer;