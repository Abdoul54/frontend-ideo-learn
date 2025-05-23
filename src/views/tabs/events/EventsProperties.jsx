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
    Select,
    MenuItem,
    InputLabel,
    Checkbox,
    ListItemText,
    Tab,
    Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from '@/@core/components/mui/TabList';
import debounce from 'lodash/debounce';
import { useGetListUsers } from '@/hooks/api/useUsers';
import toast from 'react-hot-toast';
import { useClassroomsByLocation, useUpdateEvent } from '@/hooks/api/tenant/learn/sessions/useSessionEvents';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTimezonesTenant } from '@/hooks/api/tenant/useTimeLangSettings';
import { useLocations } from '@/hooks/api/tenant/learn/classrooms-locations/useLocations';
import { useClassrooms } from '@/hooks/api/tenant/learn/classrooms-locations/useClassrooms';

const EventProperties = ({ event, sessionId }) => {
    // State variables
    const [activeTab, setActiveTab] = useState('general');
    const [userSearchText, setUserSearchText] = useState('');
    const [venueEnabled, setVenueEnabled] = useState(false);
    const [videoConferenceEnabled, setVideoConferenceEnabled] = useState(false);
    const [selectedJoinButtonOption, setSelectedJoinButtonOption] = useState('false');
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    const { data: users = [] } = useGetListUsers({ search_text: userSearchText });
    const { data: timezones = [] } = useTimezonesTenant();
    const { data: locations = { items: [] } } = useLocations({});

    // Use the update event mutation hook
    const updateEventMutation = useUpdateEvent();

    // Form initialization with default values
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            day: dayjs(),
            date: dayjs(),
            description: '',
            time_begin: dayjs('09:00', 'HH:mm'),
            time_end: dayjs('18:00', 'HH:mm'),
            break_begin: null,
            break_end: null,
            timezone: '',
            event_type: 'PILT',
            custom_url: '',
            instructors: [],
            id_classroom: '',
            id_location: '',
            allow_join_completion: false,
            allow_recording_completion: false,
            join_button_options: false
        }
    });

    // Watch fields for conditional rendering
    const eventType = watch('event_type');
    const selectedLocation = watch('id_location');

    const requiresVideoConference = ['VILT'].includes(eventType);
    const requiresVenue = ['PILT'].includes(eventType);

    const initialClassroomList = React.useMemo(() => {
        if (event?.classroom) {
            return { items: [event.classroom] };
        }
        return { items: [] };
    }, [event?.classroom]);

    const { data: apiClassrooms = { items: [] }, isLoading: isLoadingClassrooms } =
        useClassroomsByLocation(selectedLocationId);

    // 3. Create a merged classrooms object
    const locationClassrooms = React.useMemo(() => {
        // If we don't have event classroom data, just use API data
        if (!event?.classroom) {
            return apiClassrooms;
        }

        // If API has loaded data for THIS location
        if (apiClassrooms.items.length > 0 && selectedLocationId === event?.id_location) {
            // Check if our current classroom exists in the API results
            const classroomExists = apiClassrooms.items.some(
                classroom => classroom.id === event.id_classroom
            );

            if (classroomExists) {
                // The API returned our classroom, so we can use the full API result
                return apiClassrooms;
            } else {
                // The API didn't return our classroom (which is strange), 
                // merge our classroom with API results
                return {
                    items: [...initialClassroomList.items, ...apiClassrooms.items]
                };
            }
        }

        // Otherwise use initial classroom data
        return initialClassroomList;
    }, [apiClassrooms, initialClassroomList, event, selectedLocationId]);

    // Auto-adjust event type when checkboxes are changed
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

    // Watch for location changes
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
        console.log('Debug classroom selection:', {
            selectedLocationId,
            eventClassroom: event?.classroom,
            formClassroomValue: watch('id_classroom'),
            apiClassrooms: apiClassrooms?.items,
            mergedClassrooms: locationClassrooms?.items
        });
    }, [selectedLocationId, event?.classroom, watch('id_classroom'), apiClassrooms, locationClassrooms]);

    // Initialize form with event data when it becomes available
    useEffect(() => {
        if (
            event &&
            Array.isArray(locationClassrooms.items) &&
            locationClassrooms.items.length > 0
        ) {
            console.log('Initializing form with event data:', event);

            // Determine if venue or video conference is enabled based on event type
            const isVilt = event.event_type === 'VILT';
            const isPilt = event.event_type === 'PILT';

            setVenueEnabled(isPilt);
            setVideoConferenceEnabled(isVilt);

            if (event.id_location) {
                setSelectedLocationId(event.id_location);
            }

            const current = watch('id_classroom');
            if (current !== event.id_classroom) {
                setValue('id_classroom', event.id_classroom);
            }

            const parseDateTime = (dateTimeStr) => {
                if (!dateTimeStr) return null;
                try {
                    // Create dayjs object from ISO string
                    const date = dayjs(dateTimeStr);
                    // Verify it's valid
                    if (!date.isValid()) {
                        console.warn("Invalid date:", dateTimeStr);
                        return null;
                    }
                    return date;
                } catch (e) {
                    console.error("Error parsing date time:", e);
                    return null;
                }
            };

            // This handles both the "join_button_options" and possibly an older "join_button_option" field
            const joinButtonOption = (event.join_button_options || event.join_button_option) ? 'true' : 'false';
            setSelectedJoinButtonOption(joinButtonOption);

            const classroomId = event.id_classroom !== null && event.id_classroom !== undefined
                ? Number(event.id_classroom)
                : '';

            // Log what we're setting for debugging
            console.log('Setting classroom ID in form to:', classroomId);

            // Reset form with event data - FIXED: Uncommented id_classroom field
            reset({
                name: event.name || '',
                day: parseDateTime(event.day) || dayjs(),
                date: parseDateTime(event.day) || dayjs(),
                description: event.description || '',
                time_begin: parseDateTime(event.time_begin) || dayjs('09:00', 'HH:mm'),
                time_end: parseDateTime(event.time_end) || dayjs('18:00', 'HH:mm'),
                break_begin: parseDateTime(event.break_begin),
                break_end: parseDateTime(event.break_end),
                timezone: event.timezone || '',
                event_type: event.event_type || 'PILT',
                custom_url: event.custom_url || '',
                instructors: event.instructors || [],
                id_classroom: classroomId, // This line was commented out in the original code
                id_location: event.id_location || '',
                allow_join_completion: event.allow_join_completion || false,
                allow_recording_completion: event.allow_recording_completion || false,
                join_button_options: joinButtonOption === 'true'
            });
        }
    }, [event, reset, setValue, watch, locationClassrooms]);

    // Handle user search with debounce
    const handleUserSearch = debounce((value) => {
        setUserSearchText(value);
    }, 300);

    // Handle tab change
    const handleTabChange = (newValue) => {
        setActiveTab(newValue);
    };

    // Form submission
    const onSubmit = async (formData) => {
        try {
            // Convert instructors to IDs array
            const instructorIds = formData.instructors.map(instructor => instructor.id || instructor.user_id);

            // Format the date and time fields properly
            const formatTimeString = (timeObj) => {
                if (!timeObj) return null;
                // Ensure it's a dayjs object before formatting
                return dayjs.isDayjs(timeObj) ? timeObj.format('HH:mm:ss') : timeObj;
            };

            // Base payload
            const baseData = {
                name: formData.name,
                day: formData.day,
                description: formData.description,
                time_begin: formatTimeString(formData.time_begin),
                time_end: formatTimeString(formData.time_end),
                break_begin: formatTimeString(formData.break_begin),
                break_end: formatTimeString(formData.break_end),
                timezone: formData.timezone,
                event_type: formData.event_type,
                instructors: instructorIds,
            };

            // Add venue fields only for PILT
            const venueData = requiresVenue ? {
                id_classroom: venueEnabled ? parseInt(formData.id_classroom) : null,
                id_location: venueEnabled ? parseInt(formData.id_location) : null,
            } : {};

            // Add video conference fields only for VILT
            const videoConferenceData = requiresVideoConference ? {
                custom_url: formData.custom_url,
                join_button_options: formData.join_button_options,
                allow_join_completion: formData.allow_join_completion,
                allow_recording_completion: formData.allow_recording_completion,
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

            await updateEventMutation.mutateAsync({
                eventId: event.id,
                data: cleanData
            });

            toast.success('Event updated successfully');
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Failed to update event');
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
                            vertical="true"
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
                                        primary="Event information"
                                        secondary="Customize the event changing its name, date and description info."
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* Event Name */}
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
                                                    inputProps={{ maxLength: 255 }}
                                                />
                                            )}
                                        />
                                        <Typography variant="caption" color="textSecondary" align="right" sx={{ display: 'block' }}>
                                            {watch('name')?.length || 0}/255
                                        </Typography>
                                    </Grid>

                                    {/* Date Picker */}
                                    <Grid item xs={12} md={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Controller
                                                name="day"
                                                control={control}
                                                rules={{ required: 'Date is required' }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <DatePicker
                                                        label="Date"
                                                        value={field.value}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                field.onChange(date);
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

                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 1, mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Event time
                                            </Typography>
                                            <Divider />
                                        </Box>
                                    </Grid>

                                    {/* Start Time */}
                                    <Grid item xs={12} md={6}>
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
                                    <Grid item xs={12} md={6}>
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
                                    <Grid item xs={12} md={6}>
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
                                    <Grid item xs={12} md={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Controller
                                                name="break_end"
                                                control={control}
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

                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 3, mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Event type
                                            </Typography>
                                            <Divider />
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                                                Venue and video conference tool (required)
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={venueEnabled}
                                                    onChange={(e) => setVenueEnabled(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Physical In-person Learning and Training (PILT)"
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
                                                                {isLoadingClassrooms && locationClassrooms.items.length === 0 ? (
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

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={videoConferenceEnabled}
                                                    onChange={(e) => setVideoConferenceEnabled(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Virtual Instructor-Led Training (VILT)"
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
                                                        name="allow_join_completion"
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
                                                        name="allow_recording_completion"
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
                                                    name="join_button_options"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <RadioGroup
                                                            value={field.value ? 'true' : 'false'}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value === 'true';
                                                                field.onChange(newValue);
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
                                </Grid>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    <TabPanel value="details" sx={{ p: 0 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary="Details"
                                        secondary="Additional configuration options for this event"
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* Event Instructors */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            Event instructors
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Event instructors can mark the attendance and evaluate learners
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
                            disabled={updateEventMutation.isPending}
                            startIcon={updateEventMutation.isPending ? <CircularProgress size={20} /> : null}
                        >
                            {updateEventMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </TabContext >
    );
};

export default EventProperties;