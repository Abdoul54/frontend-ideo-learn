'use client';
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Button,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    ListItemText,
    FormHelperText,
    List,
    ListItem,
    CircularProgress,
    Paper,
    Chip,
    Autocomplete,
    Card,
    CardHeader,
    CardContent,
    Checkbox,
    CardActions,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Tab
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateCourse } from '@/hooks/api/tenant/learn/course/useCourse';
import { useSkills } from '@/hooks/api/tenant/skills/useSkills';
import toast from 'react-hot-toast';
import CategorySelector from '@/components/CategorySelector';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { TabContext, TabPanel } from "@mui/lab";
import { useTranslation } from '@/@core/contexts/translationContext';

// Custom input components
import DateInput from '@/components/inputs/DateInput';
import CheckboxInput from '@/components/inputs/CheckboxInput';
import RadioInput from '@/components/inputs/RadioInput';
import FileDropzone from '@/components/inputs/FileDropzone';
import CustomTabList from '@/@core/components/mui/TabList';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';
import TextEditorInput from '@/components/inputs/TextEditorInput';

const CourseProperties = ({ course }) => {
    const { translate } = useTranslation();
    
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [skillSearchTerm, setSkillSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [categoryDetails, setCategoryDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [validityPeriodEnabled, setValidityPeriodEnabled] = useState(false);
    const [validityDaysEnabled, setValidityDaysEnabled] = useState(false);
    const [periodType, setPeriodType] = useState('start_date');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validityTimeUpdateExisting, setValidityTimeUpdateExisting] = useState(false);
    const { data: activeLanguages = [], isLoading: isLoadingLanguages, error: languagesError } = useActiveLanguages();
    const [showLanguageWarning, setShowLanguageWarning] = useState(false);

    // Form initialization
    const { control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            id: course?.id || '',
            uuid: course?.uuid || '',
            name: course?.name || '',
            code: course?.code || '',
            description: course?.description || '',
            short_description: course?.short_description || '',
            course_type: course?.course_type || 'elearning',
            image: { url: course?.image || null, file: null },
            status: course?.status || 'published',
            category_id: course?.category_id || null,
            language: course?.language || 'fr',
            lang_code: course?.lang_code || 'fr',
            lang_string: course?.lang_string || 'French',
            duration_hours: course?.duration_hours || 0,
            duration_minutes: course?.duration_minutes || 0,
            duration_seconds: course?.duration_seconds || 0,
            formatted_duration: course?.formatted_duration || '',

            // Enrollment options
            enable_self_unenrollment: course?.enrollment_options?.enable_self_unenrollment === 1,
            enable_session_self_unenrollment: course?.enrollment_options?.enable_session_self_unenrollment === 1,
            enable_unenrollment_on_course_completion: course?.enrollment_options?.enable_unenrollment_on_course_completion === 1,
            enable_session_change: course?.enrollment_options?.enable_session_change === 1,
            allow_automatically_enroll: course?.enrollment_options?.allow_automatically_enroll === 0,
            enable_deep_link: course?.enrollment_options?.enable_deep_link === 1,
            deep_link: course?.enrollment_options?.deep_link === 1,
            enrollment_url: course?.enrollment_options?.enrollment_url || '',

            // Time options
            can_subscribe: course?.time_options?.can_subscribe === 1,
            sub_start_date: course?.time_options?.sub_start_date || null,
            sub_end_date: course?.time_options?.sub_end_date || null,
            date_begin: course?.time_options?.date_begin || null,
            date_end: course?.time_options?.date_end || null,
            soft_deadline: course?.time_options?.soft_deadline === 1,
            valid_time: course?.time_options?.valid_time || 0,
            valid_time_type: course?.time_options?.valid_time_type || 0,
            validity_time_update_existing: course?.time_options?.validity_time_update_existing || false,

            created_at: course?.created_at || '',
            updated_at: course?.updated_at || '',
            created_by: course?.created_by || '',
            updated_by: course?.updated_by || ''
        }
    });

    const languageOptions = React.useMemo(() => {
        if (isLoadingLanguages) {
            return []; // Don't show any options while loading
        }

        if (!activeLanguages || activeLanguages.length === 0) {
            // Fallback to at least showing French as a default option
            return [
                {
                    id: 1,
                    code: 'fr',
                    name: 'French',
                    native_name: 'français',
                    is_default: true
                }
            ];
        }

        return activeLanguages;
    }, [activeLanguages, isLoadingLanguages]);

    useEffect(() => {
        const formValue = watch('validity_period_enabled');
        if (formValue !== undefined && validityPeriodEnabled !== formValue) {
            setValidityPeriodEnabled(formValue);
        }
    }, [watch('validity_period_enabled')]);

    // Keep validityDaysEnabled in sync with form values
    useEffect(() => {
        const formValue = watch('validity_days_enabled');
        if (formValue !== undefined && validityDaysEnabled !== formValue) {
            setValidityDaysEnabled(formValue);
        }
    }, [watch('validity_days_enabled')]);

    // Keep validityTimeUpdateExisting in sync with form values
    useEffect(() => {
        const formValue = watch('validity_time_update_existing');
        if (formValue !== undefined && validityTimeUpdateExisting !== formValue) {
            setValidityTimeUpdateExisting(formValue);
        }
    }, [watch('validity_time_update_existing')]);

    // Initialize state from course data
    useEffect(() => {
        if (course) {
            if (course.skills && Array.isArray(course.skills)) {
                // Map skills from course data to have predefined_UID
                const mappedSkills = course.skills.map(skill => ({
                    ...skill,
                    predefined_UID: skill.code // Use code as predefined_UID for course skills
                }));
                setSelectedSkills(mappedSkills);
            }

            if (course.category_id) {
                setSelectedCategory([course.category_id]);
                if (course.category) {
                    setCategoryDetails(course.category);
                }
            }

            // Process time options
            const hasDateBegin = !!course.time_options?.date_begin;
            const hasDateEnd = !!course.time_options?.date_end;
            const hasSubStartDate = !!course.time_options?.sub_start_date;
            const hasSubEndDate = !!course.time_options?.sub_end_date;
            const hasValidTime = course.time_options?.valid_time > 0;

            // Set validity-related states based on API data
            const shouldEnableValidityPeriod = hasDateBegin || hasDateEnd || hasSubStartDate || hasSubEndDate;
            setValidityPeriodEnabled(shouldEnableValidityPeriod);
            setValidityDaysEnabled(hasValidTime);
            setValidityTimeUpdateExisting(!!course.time_options?.validity_time_update_existing);

            // Determine period type based on dates
            if ((hasDateBegin || hasSubStartDate) && (hasDateEnd || hasSubEndDate)) {
                setPeriodType('period');
            } else if (hasDateBegin || hasSubStartDate) {
                setPeriodType('start_date');
            } else if (hasDateEnd || hasSubEndDate) {
                setPeriodType('end_date');
            }

            // Set default values for the form
            setValue('validity_period_enabled', shouldEnableValidityPeriod);
            setValue('validity_days_enabled', hasValidTime);
            setValue('validity_time_update_existing', !!course.time_options?.validity_time_update_existing);

            // Process enrollment options
            const allowAutoEnroll = course.enrollment_options?.allow_automatically_enroll === 1;
            setValue('enrollment_enabled', allowAutoEnroll);

            // Initialize allow_automatically_type based on allow_automatically_enroll value
            setValue('allow_automatically_type', allowAutoEnroll ? "1" : "0");

            const softDeadline = course.time_options?.soft_deadline === 1;
            setValue('soft_deadline_enabled', softDeadline);

            setValue('soft_deadline_type', softDeadline ? "1" : "0");

            // Reset form with course data - make sure we include the checkbox values
            reset({
                id: course.id || '',
                uuid: course.uuid || '',
                name: course.name || '',
                code: course.code || '',
                description: course.description || '',
                short_description: course.short_description || '',
                course_type: course.course_type || 'elearning',
                image: { url: course.image || null, file: null },
                status: course.status || 'published',
                category_id: course.category_id || null,
                language: course.language || 'fr',
                lang_code: course.lang_code || 'fr',
                lang_string: course.lang_string || 'French',
                duration_hours: course.duration_hours || 0,
                duration_minutes: course.duration_minutes || 0,
                duration_seconds: course.duration_seconds || 0,
                formatted_duration: course.formatted_duration || '',

                // ENROLLMENT OPTIONS - Convert 0/1 to boolean
                enable_self_unenrollment: course.enrollment_options?.enable_self_unenrollment === 1,
                enable_session_self_unenrollment: course.enrollment_options?.enable_session_self_unenrollment === 1,
                enable_unenrollment_on_course_completion: course.enrollment_options?.enable_unenrollment_on_course_completion === 1,
                enable_session_change: course.enrollment_options?.enable_session_change === 1,
                allow_automatically_enroll: course.enrollment_options?.allow_automatically_enroll === 1,
                enrollment_enabled: course.enrollment_options?.allow_automatically_enroll === 1,
                allow_automatically_type: course.enrollment_options?.allow_automatically_enroll === 1 ? "1" : "0",
                enable_deep_link: course.enrollment_options?.enable_deep_link === 1,
                deep_link: course.enrollment_options?.deep_link === 1,
                enrollment_url: course.enrollment_options?.enrollment_url || '',

                // TIME OPTIONS - Convert time options with proper typing
                can_subscribe: course.time_options?.can_subscribe === 1,
                sub_start_date: course.time_options?.sub_start_date || null,
                sub_end_date: course.time_options?.sub_end_date || null,
                date_begin: course.time_options?.date_begin || null,
                date_end: course.time_options?.date_end || null,
                soft_deadline: course.time_options?.soft_deadline === 1,
                soft_deadline_type: course.time_options?.soft_deadline === 1 ? "1" : "0",
                soft_deadline_enabled: course.time_options?.soft_deadline === 1,

                // CRUCIAL: Make sure valid_time is properly set
                valid_time: course.time_options?.valid_time || '',

                // Set valid_time_type properly
                valid_time_type: course.time_options?.valid_time_type === 1 ? 'first_access' : 'enrollment_date',
                validity_time_update_existing: course.time_options?.validity_time_update_existing === true,

                // Form control states for validity options
                validity_period_enabled: shouldEnableValidityPeriod,
                validity_days_enabled: hasValidTime,

                created_at: course.created_at || '',
                updated_at: course.updated_at || '',
                created_by: course.created_by || '',
                updated_by: course.updated_by || ''
            });

            console.log("Form reset with values:", {
                allow_automatically_enroll: course.enrollment_options?.allow_automatically_enroll === 1,
                valid_time: course.time_options?.valid_time,
                valid_time_type: course.time_options?.valid_time_type === 1 ? 'first_access' : 'enrollment_date',
                sub_start_date: course.time_options?.sub_start_date,
                sub_end_date: course.time_options?.sub_end_date,
                validity_period_enabled: shouldEnableValidityPeriod,
                validity_days_enabled: hasValidTime,
                periodType,
                apiValue: course.time_options?.soft_deadline,
                formValue: course.time_options?.soft_deadline === 1,
            });
        }
    }, [course, reset, setValue]);

    useEffect(() => {
        if (!isLoadingLanguages && (!activeLanguages || activeLanguages.length === 0)) {
            setShowLanguageWarning(true);
        } else {
            setShowLanguageWarning(false);
        }
    }, [activeLanguages, isLoadingLanguages]);

    useEffect(() => {
        if (languagesError) {
            console.error('Failed to load languages:', languagesError);
            toast.error('Failed to load languages. Some form features may not work correctly.');
        }
    }, [languagesError]);

    // Skills search
    const debouncedSetSkillSearch = React.useCallback(
        debounce((term) => {
            setSkillSearchTerm(term);
        }, 300),
        []
    );

    const { data: skillsData, isLoading: skillsLoading } = useSkills({
        search: skillSearchTerm,
        page: 1,
        page_size: 10
    });

    const skills = skillsData?.items || [];

    // Handle skill selection
    const handleSkillChange = (event, newValue) => {
        if (newValue) {
            // Avoid duplicates
            if (!selectedSkills.some(skill => skill.predefined_UID === newValue.predefined_UID)) {
                setSelectedSkills([...selectedSkills, newValue]);
            }
            setInputValue('');
        }
    };

    // Handle skill deletion
    const handleDeleteSkill = (skillToDelete) => {
        setSelectedSkills(selectedSkills.filter(skill => skill.predefined_UID !== skillToDelete.predefined_UID));
    };

    // Handle category change
    const handleCategoryChange = (categoryIds) => {
        console.log('Category IDs changed to:', categoryIds);
        setSelectedCategory(categoryIds);

        // Update the form control value directly
        if (categoryIds && categoryIds.length > 0) {
            setValue('category_id', categoryIds[0], { shouldDirty: true, shouldTouch: true });
            console.log('Updated form category_id to:', categoryIds[0]);
        } else {
            setValue('category_id', null, { shouldDirty: true, shouldTouch: true });
            console.log('Cleared form category_id');
        }

        // If the category was deselected, clear the details
        if (!categoryIds || categoryIds.length === 0) {
            setCategoryDetails(null);
        }
    };

    // Store selected category details
    const handleCategorySelect = (category) => {
        setCategoryDetails(category);
    };

    // Handle file selection
    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    const updateCourseMutation = useUpdateCourse();

    // Handle tab change
    const handleTabChange = (newValue) => {
        setActiveTab(newValue);
    };

    const description = watch("description");

    const handleEditorUpdate = (content) => {
        setValue("description", content);
    };

    const handlePeriodTypeChange = (e) => {
        const newValue = e.target.value;
        console.log('Period type changed from', periodType, 'to', newValue);
        setPeriodType(newValue);
    };

    // Form submission
    const onSubmit = async (formData) => {
        try {
            console.log("Form data before submission:", formData);
            console.log("State values:", {
                periodType,
                validityPeriodEnabled: formData.validity_period_enabled, // Use form values instead of state
                validityDaysEnabled: formData.validity_days_enabled,     // Use form values instead of state  
                validityTimeUpdateExisting: formData.validity_time_update_existing // Use form values instead of state
            });

            // Create FormData object for submission
            const formDataToSend = new FormData();

            // Basic fields
            formDataToSend.append('_method', 'PUT');
            formDataToSend.append('name', formData.name);
            if (formData.code) formDataToSend.append('code', formData.code);
            if (formData.description) formDataToSend.append('description', formData.description);
            if (formData.short_description) formDataToSend.append('short_description', formData.short_description);
            formDataToSend.append('course_type', formData.course_type);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('language', formData.language || 'fr');

            // Duration
            formDataToSend.append('duration_hours', formData.duration_hours);
            formDataToSend.append('duration_minutes', formData.duration_minutes);
            formDataToSend.append('duration_seconds', formData.duration_seconds);

            // Category
            if (formData.category_id) {
                console.log('Sending category ID:', formData.category_id);
                formDataToSend.append('category_id', formData.category_id);
            }

            // Skills
            if (selectedSkills.length > 0) {
                selectedSkills.forEach((skill, index) => {
                    if (skill && skill.predefined_UID) {
                        formDataToSend.append(`skill_codes[${index}]`, String(skill.predefined_UID));
                    }
                });
            }

            // Image
            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            // ENROLLMENT OPTIONS - Boolean values as 0/1
            formDataToSend.append('enable_self_unenrollment', formData.enable_self_unenrollment ? 1 : 0);
            formDataToSend.append('enable_session_self_unenrollment', formData.enable_session_self_unenrollment ? 1 : 0);
            formDataToSend.append('enable_unenrollment_on_course_completion', formData.enable_unenrollment_on_course_completion ? 1 : 0);
            formDataToSend.append('enable_session_change', formData.enable_session_change ? 1 : 0);
            formDataToSend.append('enable_deep_link', formData.enable_deep_link ? 1 : 0);

            formDataToSend.append('allow_automatically_enroll', formData.allow_automatically_enroll ? 1 : 0);

            console.log(`Submitting allow_automatically_enroll as: ${formData.allow_automatically_enroll ? 1 : 0}`);
            console.log(`Current enrollment_enabled value: ${formData.enrollment_enabled}`);
            console.log(`Current allow_automatically_type value: ${formData.allow_automatically_type}`);

            // TIME OPTIONS
            formDataToSend.append('can_subscribe', formData.can_subscribe ? 1 : 0);

            // Format date fields
            const formatDate = (date) => {
                if (!date) return '';
                return typeof date === 'string' ? date : dayjs(date).format('YYYY-MM-DD');
            };

            // Handle dates based on validity period and period type
            if (formData.validity_period_enabled) {
                // Set date values based on period type
                if (periodType === 'start_date' || periodType === 'period') {
                    formDataToSend.append('date_begin', formatDate(formData.date_begin));
                    formDataToSend.append('sub_start_date', formatDate(formData.sub_start_date));
                } else {
                    formDataToSend.append('date_begin', '');
                    formDataToSend.append('sub_start_date', '');
                }

                if (periodType === 'end_date' || periodType === 'period') {
                    formDataToSend.append('date_end', formatDate(formData.date_end));
                    formDataToSend.append('sub_end_date', formatDate(formData.sub_end_date));
                } else {
                    formDataToSend.append('date_end', '');
                    formDataToSend.append('sub_end_date', '');
                }
            } else {
                // Clear all dates if validity period is disabled
                formDataToSend.append('date_begin', '');
                formDataToSend.append('date_end', '');
                formDataToSend.append('sub_start_date', '');
                formDataToSend.append('sub_end_date', '');
            }

            // Soft deadline
            formDataToSend.append('soft_deadline', formData.soft_deadline ? 1 : 0);

            // IMPORTANT: Changed condition to use form values instead of state
            // Validity days
            if (formData.validity_days_enabled) {
                formDataToSend.append('valid_time', formData.valid_time || '');
                const validTimeType = formData.valid_time_type === 'first_access' ? 1 : 0;
                formDataToSend.append('valid_time_type', validTimeType);
                formDataToSend.append('validity_time_update_existing', formData.validity_time_update_existing ? true : false);
            } else {
                formDataToSend.append('valid_time', '');
                formDataToSend.append('valid_time_type', '0');
                formDataToSend.append('validity_time_update_existing', false);
            }

            // Debug the form data being sent
            console.log("Form data being sent:");
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}: ${value}`);
            }

            // Send the update
            await updateCourseMutation.mutateAsync({
                courseId: course.id,
                data: formDataToSend
            });
        } catch (error) {
            console.error('Failed to update course:', error);
        }
    };

    // Radio options for valid time type
    const validTimeTypeOptions = [
        { value: 'first_access', label: 'Start calculation from the first access date' },
        { value: 'enrollment_date', label: 'Start calculation from the enrollment date' }
    ];


    return (
        <TabContext value={activeTab}>
            <Grid container spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Left Navigation */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={0} sx={{ bgcolor: 'background.paper', p: 2 }}>
                        <CustomTabList
                            onChange={(e, newValue) => handleTabChange(newValue)}
                            orientation='vertical'
                            vertical="true"
                            variant="fullWidth"
                            sx={{ width: '100%', '& .MuiTabs-flexContainer': { width: '100%' } }}
                        >
                            <Tab value="details" label={translate('Course management.SIDEBAR_MENU_DETAILS', 'Details')} />
                            <Tab value="enrollment_options" label={translate('Course management.SIDEBAR_MENU_ENROLLMENT_OPTIONS', 'Enrollment options')} />
                            <Tab value="time_options" label={translate('Course management.SIDEBAR_MENU_TIME_OPTIONS', 'Time options')} />
                        </CustomTabList>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} md={9}>
                    <TabPanel value="details" sx={{ p: 0 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary={translate('Course management.SECTION_COURSE_INFORMATION', 'Course Information')}
                                        secondary={translate('Course management.SECTION_SUBTITLE_COURSE_MANAGEMENT_INFO', 'Configure the course basic options: course information, thumbnail, cover, skills, e-signature, and average completion time')}
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* Course ID */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="id"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Course ID"
                                                    fullWidth
                                                    disabled
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Course Type */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="course_type"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth>
                                                    <InputLabel>{translate('Course management.FIELD_COURSE_TYPE', 'Course Type')}</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label={translate('Course management.FIELD_COURSE_TYPE', 'Course Type')}
                                                    >
                                                        <MenuItem value="elearning">{translate('Course management.DROPDOWN_ELEARNING', 'E-Learning')}</MenuItem>
                                                        <MenuItem value="classroom">{translate('Course management.DROPDOWN_CLASSROOM', 'Classroom')}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    {/* Course Status */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth>
                                                    <InputLabel>{translate('Course management.FIELD_STATUS', 'Status')}</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label={translate('Course management.FIELD_STATUS', 'Status')}
                                                    >
                                                        <MenuItem value="published">{translate('Course management.DROPDOWN_STATUS_PUBLISHED', 'Published')}</MenuItem>
                                                        <MenuItem value="unpublished">{translate('Course management.DROPDOWN_STATUS_UNPUBLISHED', 'Unpublished')}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    {/* Course Name */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label={translate('Course management.FIELD_COURSE_NAME', 'Course Name')}
                                                    fullWidth
                                                    required
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Course Code */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="code"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label={translate('Course management.FIELD_COURSE_CODE', 'Course Code')}
                                                    fullWidth
                                                    error={!!error}
                                                    helperText={error ? error.message : translate('Course management.FIELD_CODE_DESCRIPTION', 'Unique identifier for this course')}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Language */}
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="language"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth error={!!languagesError}>
                                                    <InputLabel>{translate('Course management.TABLE_HEADER_LANGUAGE', 'Language')}</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label={translate('Course management.TABLE_HEADER_LANGUAGE', 'Language')}
                                                        disabled={isLoadingLanguages}
                                                        startAdornment={
                                                            isLoadingLanguages ? (
                                                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                                            ) : null
                                                        }
                                                    >
                                                        {languageOptions.map((lang) => (
                                                            <MenuItem
                                                                key={lang.code}
                                                                value={lang.code}
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    fontWeight: field.value === lang.code ? 'bold' : 'normal',
                                                                    bgcolor: field.value === lang.code ? 'action.selected' : 'transparent'
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <Typography variant="body1">{lang.name}</Typography>
                                                                </Box>
                                                                {lang.is_default && (
                                                                    <Chip
                                                                        size="small"
                                                                        label="Default"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                )}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {languagesError && (
                                                        <FormHelperText error>
                                                            {translate('Course management.FAILED_TO_LOAD_LANGUAGES', 'Failed to load languages. Please try again.')}
                                                        </FormHelperText>
                                                    )}
                                                    {!languagesError && !isLoadingLanguages && activeLanguages?.length === 0 && (
                                                        <FormHelperText>
                                                            {translate('Course management.NO_ACTIVE_LANGUAGES', 'No active languages found')}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    {showLanguageWarning && (
                                        <Grid item xs={12}>
                                            <Alert severity="warning" sx={{ mt: 2 }}>
                                                {translate('Course management.NO_LANGUAGES_WARNING', 'No active languages were loaded. Using default language settings.')}
                                            </Alert>
                                        </Grid>
                                    )}

                                    {/* Duration */}
                                    <Grid item xs={12} md={6}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Controller
                                                    name="duration_hours"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={translate('Course management.FIELD_DURATION_HOURS', 'Hours')}
                                                            type="number"
                                                            fullWidth
                                                            InputProps={{ inputProps: { min: 0 } }}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 0;
                                                                field.onChange(value);
                                                            }}
                                                            variant="outlined"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Controller
                                                    name="duration_minutes"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={translate('Course management.FIELD_DURATION_MINUTES', 'Minutes')}
                                                            type="number"
                                                            fullWidth
                                                            InputProps={{ inputProps: { min: 0, max: 59 } }}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 0;
                                                                field.onChange(value > 59 ? 59 : value);
                                                            }}
                                                            variant="outlined"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Controller
                                                    name="duration_seconds"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={translate('Course management.FIELD_DURATION_SECONDS', 'Seconds')}
                                                            type="number"
                                                            fullWidth
                                                            InputProps={{ inputProps: { min: 0, max: 59 } }}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 0;
                                                                field.onChange(value > 59 ? 59 : value);
                                                            }}
                                                            variant="outlined"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Short Description */}
                                    <Grid item xs={12}>
                                        <Controller
                                            name="short_description"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    label={translate('Course management.FIELD_SHORT_DESCRIPTION', 'Short Description')}
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    error={!!error}
                                                    helperText={error ? error.message : translate('Course management.FIELD_SHORT_DESCRIPTION_HINT', 'Brief description shown in listings')}
                                                    variant="outlined"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Full Description */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {translate('Course management.SUB_SECTION_FULL_DESCRIPTION', 'Full Description')}
                                        </Typography>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <TextEditorInput
                                                    content={description}
                                                    onUpdate={handleEditorUpdate}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Course Image */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {translate('Course management.SUB_SECTION_COURSE_IMAGE', 'Course Image')}
                                        </Typography>
                                        <Controller
                                            name="image"
                                            control={control}
                                            defaultValue={{ url: course?.image || null, file: null }}
                                            render={({ field }) => (
                                                <FileDropzone
                                                    type="image"
                                                    maxSize={2097152} // 2MB
                                                    onFileSelect={(fileData) => {
                                                        field.onChange({
                                                            url: fileData?.url || null,
                                                            file: fileData?.file || null
                                                        });
                                                        // Also update the selectedFile state for form submission
                                                        setSelectedFile(fileData?.file || null);
                                                    }}
                                                    defaultValue={field.value?.url || course?.image}
                                                    helperText={translate('Course management.TEXT_UPLOAD_IMAGE', 'Upload an image for this course')}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Skills */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {translate('Course management.SUB_SECTION_SKILLS', 'Skills')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                            {translate('Course management.TEXT_ASSOCIATE_SKILLS', 'Associate skills with this course to help users find it based on their interests.')}
                                        </Typography>

                                        {selectedSkills.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 3 }}>
                                                {selectedSkills.map((skill) => (
                                                    <Chip
                                                        key={skill.predefined_UID}
                                                        label={skill.name}
                                                        onDelete={() => handleDeleteSkill(skill)}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        )}

                                        <Autocomplete
                                            value={null}
                                            onChange={handleSkillChange}
                                            inputValue={inputValue}
                                            onInputChange={(event, newInputValue) => {
                                                setInputValue(newInputValue);
                                                debouncedSetSkillSearch(newInputValue);
                                            }}
                                            options={skills}
                                            getOptionLabel={(option) => option.name}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            noOptionsText={translate('Course management.NO_SKILLS_FOUND', 'No skills found')}
                                            loading={skillsLoading}
                                            loadingText={translate('Course management.LOADING_SKILLS', 'Loading skills...')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={translate('Course management.FIELD_SEARCH_SKILLS', 'Search for skills')}
                                                    placeholder={translate('Course management.PLACEHOLDER_SEARCH_SKILLS', 'Type to search...')}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {skillsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                    variant="outlined"
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Typography variant="body2">
                                                        {option.name} {option.is_custom ? '(Custom)' : ''}
                                                    </Typography>
                                                </li>
                                            )}
                                        />
                                    </Grid>

                                    {/* Category */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {translate('Course management.SUB_SECTION_CATEGORY', 'Category')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                            {translate('Course management.TEXT_ASSIGN_CATEGORY', 'Assign this course to a category to help organize your courses.')}
                                        </Typography>

                                        {categoryDetails && (
                                            <Box mb={2} mt={2}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {translate('Course management.TEXT_SELECTED_CATEGORY', 'Selected Category')}: {categoryDetails.title}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ height: '500px', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, overflow: 'auto', mt: 2 }}>
                                            <CategorySelector
                                                control={control}
                                                name="category_id"
                                                selectedValues={selectedCategory}
                                                onChange={handleCategoryChange}
                                                onCategorySelect={handleCategorySelect}
                                                singleSelect={true}
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Creation Info */}
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={translate('Course management.FIELD_CREATED_BY', 'Created By')}
                                            value={course?.created_by || 'N/A'}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={translate('Course management.FIELD_CREATED_AT', 'Created At')}
                                            value={course?.created_at || 'N/A'}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    <TabPanel value="enrollment_options" sx={{ p: 0 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary={translate('Course management.SECTION_ENROLLMENT_OPTIONS', 'Enrollment options')}
                                        secondary={translate('Course management.SECTION_SUBTITLE_ENROLLMENT_OPTIONS', 'Configure the course enrollment policy: self-unenrollment, enrollment links and codes')}
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* Self-unenrollment */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {translate('Course management.SUB_SECTION_SELF_UNENROLLMENT', 'Self-unenrollment')}
                                        </Typography>

                                        <CheckboxInput
                                            name="enable_self_unenrollment"
                                            control={control}
                                            label={translate('Course management.CHECKBOX_ENABLE_SELF_UNENROLLMENT', 'Enable self-unenrollment for this course')}
                                        />

                                        {watch('enable_self_unenrollment') && (
                                            <Box sx={{ ml: 4, mt: 1 }}>
                                                <CheckboxInput
                                                    name="enable_unenrollment_on_course_completion"
                                                    control={control}
                                                    label={translate('Course management.CHECKBOX_ALLOW_SELF_UNENROLLMENT', 'Allow self-unenrollment from the course even if the learner has completed it')}
                                                />
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Enrollment link */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                                            {translate('Course management.SUB_SECTION_ENROLLMENT_LINK', 'Enrollment link')}
                                        </Typography>

                                        <CheckboxInput
                                            name="enable_deep_link"
                                            control={control}
                                            label={translate('Course management.CHECKBOX_ENABLE_ENROLLMENT_LINK', 'Enable enrollment link for this course')}
                                        />

                                        {watch('enable_deep_link') && (
                                            <Box sx={{ ml: 4, mt: 1 }}>
                                                <TextField
                                                    label={translate('Course management.PLACEHOLDER_ENROLLMENT_URL', 'Enrollment URL')}
                                                    variant="outlined"
                                                    fullWidth
                                                    value={watch('enrollment_url')}
                                                    disabled
                                                    helperText={translate('Course management.TEXT_ENROLLMENT_URL_DESCRIPTION', 'Learners can enroll in the course using this link')}
                                                />
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Quick enrollment */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                                            {translate('Course management.SUB_SECTION_QUICK_ENROLLMENT', 'Quick enrollment')}
                                        </Typography>

                                        <Controller
                                            name="enrollment_enabled"
                                            control={control}
                                            defaultValue={watch('allow_automatically_enroll')}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => {
                                                                field.onChange(e.target.checked);

                                                                // When checkbox is checked, set allow_automatically_enroll based on radio selection
                                                                // When checkbox is unchecked, always set allow_automatically_enroll to false
                                                                if (e.target.checked) {
                                                                    // Get the current radio value or default to "1"
                                                                    const radioValue = watch('allow_automatically_type') || "1";
                                                                    setValue('allow_automatically_enroll', radioValue === "1");
                                                                } else {
                                                                    setValue('allow_automatically_enroll', false);
                                                                }

                                                                console.log("Quick enrollment enabled changed to:", e.target.checked);
                                                            }}
                                                        />
                                                    }
                                                    label={translate('Course management.CHECKBOX_ENABLE_QUICK_ENROLLMENT', 'Enable quick enrollment for this course')}
                                                />
                                            )}
                                        />

                                        {watch('enrollment_enabled') && (
                                            <Box sx={{ ml: 4, mt: 1 }}>
                                                <FormControl component="fieldset">
                                                    <FormLabel component="legend">{translate('Course management.SUBTITLE_ENROLLMENT_TYPE', 'Enrollment Type')}</FormLabel>
                                                    <Controller
                                                        name="allow_automatically_type"
                                                        control={control}
                                                        defaultValue="1"
                                                        render={({ field }) => (
                                                            <RadioGroup
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);

                                                                    // Update the actual allow_automatically_enroll value based on radio selection
                                                                    // Only if enrollment is enabled
                                                                    if (watch('enrollment_enabled')) {
                                                                        setValue('allow_automatically_enroll', e.target.value === "1");
                                                                    }
                                                                }}
                                                            >
                                                                <FormControlLabel
                                                                    value="1"
                                                                    control={<Radio />}
                                                                    label={translate('Course management.RADIO_ALLOW_AUTOMATIC_ENROLLMENT', 'Allow automatic enrollment')}
                                                                />
                                                                <FormControlLabel
                                                                    value="0"
                                                                    control={<Radio />}
                                                                    label={translate('Course management.RADIO_DO_NOT_ALLOW_AUTOMATIC', 'Do not allow automatic enrollment (default)')}
                                                                />
                                                            </RadioGroup>
                                                        )}
                                                    />
                                                </FormControl>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </TabPanel>

                    <TabPanel value="time_options" sx={{ p: 0 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardHeader
                                title={
                                    <ListItemText
                                        primary={translate('Course management.SECTION_TIME_OPTIONS', 'Time options')}
                                        secondary={translate('Course management.SECTION_SUBTITLE_TIME_OPTIONS', 'Configure the course time options: validity period, days of validity and soft deadline')}
                                        primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                                    />
                                }
                            />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* Course validity period */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {translate('Course management.SUB_SECTION_COURSE_VALIDITY', 'Course validity period')}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            {translate('Course management.TEXT_COURSE_VALIDITY_DESCRIPTION', 'Learners will be able to access the course according to the selected dates')}
                                        </Typography>

                                        <Controller
                                            name="validity_period_enabled"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => {
                                                                // Update both the form value and the state
                                                                field.onChange(e.target.checked);
                                                                setValidityPeriodEnabled(e.target.checked);
                                                            }}
                                                        />
                                                    }
                                                    label={translate('Course management.CHECKBOX_ENABLE_VALIDITY_PERIOD', 'Enable a validity period for this course')}
                                                />
                                            )}
                                        />

                                        {watch('validity_period_enabled') && (
                                            <Box sx={{ ml: 4, mt: 2 }}>
                                                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mt: 2, mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Box component="span" sx={{ mr: 1 }}>ℹ️</Box>
                                                        <Typography variant="subtitle2">{translate('Course management.INFO_VALIDITY_TIME_DETAILS', 'Validity time details')}</Typography>
                                                    </Box>
                                                    <Typography variant="body2">
                                                        {translate('Course management.TEXT_VALIDITY_PERIOD_UTC', 'The course validity period starts at 00:00:00 UTC of the start date and ends at 23:59:59 UTC of the end date')}
                                                    </Typography>
                                                </Box>

                                                <FormControl component="fieldset">
                                                    <FormLabel component="legend">{translate('Course management.FIELD_SELECT_PERIOD_TYPE', 'Select Period Type')}</FormLabel>
                                                    <RadioGroup
                                                        name="period_type_direct"
                                                        value={periodType}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            console.log("Period type changed to:", newValue);
                                                            setPeriodType(newValue);
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="start_date"
                                                            control={<Radio />}
                                                            label={translate('Course management.RADIO_START_DATE', 'Start date (Learners will be able to access the course from the selected start date onwards)')}
                                                        />
                                                        <FormControlLabel
                                                            value="end_date"
                                                            control={<Radio />}
                                                            label={translate('Course management.RADIO_END_DATE', 'End date (Learners will be able to access the course up to the selected end date)')}
                                                        />
                                                        <FormControlLabel
                                                            value="period"
                                                            control={<Radio />}
                                                            label={translate('Course management.RADIO_PERIOD', 'Period (Learners will be able to access the course during the period extending from the start date to the end date)')}
                                                        />
                                                    </RadioGroup>
                                                </FormControl>

                                                {/* Use key prop to force re-render when periodType changes */}
                                                <Box key={`date-fields-${periodType}`} sx={{ mt: 3 }}>
                                                    {periodType === 'start_date' && (
                                                        <Box sx={{ ml: 4, mt: 2, mb: 2, border: '1px solid', borderColor: 'primary.main', p: 2, borderRadius: 1 }}>
                                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                                {translate('Course management.FIELD_START_DATE_CONFIGURATION', 'Start Date Configuration (Current type: start_date)')}
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12}>
                                                                    <DateInput
                                                                        name="sub_start_date"
                                                                        control={control}
                                                                        label={translate('Course management.PLACEHOLDER_SUBSCRIPTION_START_DATE', 'Subscription start date')}
                                                                        value={watch('sub_start_date')}
                                                                        onChange={(date) => {
                                                                            setValue('sub_start_date', date, { shouldDirty: true });
                                                                            console.log("sub_start_date set to:", date);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    )}

                                                    {periodType === 'end_date' && (
                                                        <Box sx={{ ml: 4, mt: 2, mb: 2, border: '1px solid', borderColor: 'primary.main', p: 2, borderRadius: 1 }}>
                                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                                {translate('Course management.FIELD_END_DATE', 'End Date Configuration (Current type: end_date)')}
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12}>
                                                                    <DateInput
                                                                        name="sub_end_date"
                                                                        control={control}
                                                                        label={translate('Course management.SUB_SECTION_SELF_ENROLLMENT', 'Subscription end date')}
                                                                        value={watch('sub_end_date')}
                                                                        onChange={(date) => {
                                                                            setValue('sub_end_date', date, { shouldDirty: true });
                                                                            console.log("sub_end_date set to:", date);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    )}

                                                    {periodType === 'period' && (
                                                        <Box sx={{ ml: 4, mt: 2, mb: 2, border: '1px solid', borderColor: 'primary.main', p: 2, borderRadius: 1 }}>
                                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                                {translate('Course management.FULL_PERIOD_CONFIGURATION', 'Full Period Configuration (Current type: period)')}
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="subtitle2" color="primary" gutterBottom mt={2}>
                                                                        {translate('Course management.SUB_SECTION_ENROLLMENT_VALIDITY_PERIOD', 'Subscription Period')}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <DateInput
                                                                        name="sub_start_date"
                                                                        control={control}
                                                                        label={translate('Course management.PLACEHOLDER_SUBSCRIPTION_START_DATE', 'Subscription start date')}
                                                                        value={watch('sub_start_date')}
                                                                        onChange={(date) => {
                                                                            setValue('sub_start_date', date, { shouldDirty: true });
                                                                            console.log("sub_start_date set to:", date);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <DateInput
                                                                        name="sub_end_date"
                                                                        control={control}
                                                                        label={translate('Course management.SUB_SECTION_SELF_ENROLLMENT', 'Subscription end date')}
                                                                        minDate={watch('sub_start_date')}
                                                                        value={watch('sub_end_date')}
                                                                        onChange={(date) => {
                                                                            setValue('sub_end_date', date, { shouldDirty: true });
                                                                            console.log("sub_end_date set to:", date);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Days of validity */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                                            {translate('Course management.SUB_SECTION_ENROLLMENT_VALIDITY_PERIOD', 'Enrollment validity period')}
                                        </Typography>

                                        <Controller
                                            name="validity_days_enabled"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => {
                                                                // Update both the form value and the state
                                                                field.onChange(e.target.checked);
                                                                setValidityDaysEnabled(e.target.checked);
                                                                console.log("Validity days enabled changed to:", e.target.checked);
                                                            }}
                                                        />
                                                    }
                                                    label={translate('Course management.CHECKBOX_ENABLE_DAYS_VALIDITY', 'Enable days of validity for this course')}
                                                />
                                            )}
                                        />

                                        {watch('validity_days_enabled') && (
                                            <Box sx={{ ml: 4, mt: 2 }}>
                                                <Typography variant="body2" gutterBottom>
                                                    {translate('Course management.TEXT_DAYS_VALIDITY_DESCRIPTION', 'Set the number of days for learners to access the course/learning plan within the course availability period')}
                                                </Typography>

                                                <Controller
                                                    name="valid_time"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label={translate('Course management.PLACEHOLDER_NUMBER_OF_DAYS', 'Number of days available to learners (required)')}
                                                            fullWidth
                                                            type="number"
                                                            InputProps={{ inputProps: { min: 0 } }}
                                                            helperText={translate('Course management.TEXT_NUMBER_VALIDATION', 'Insert numbers greater than 0')}
                                                            sx={{ mt: 2, mb: 2 }}
                                                        />
                                                    )}
                                                />

                                                <Controller
                                                    name="valid_time_type"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControl component="fieldset">
                                                            <FormLabel component="legend">{translate('Course management.FIELD_CALCULATION', 'Calculation Start Date')}</FormLabel>
                                                            <RadioGroup
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                    console.log("valid_time_type changed to:", e.target.value);
                                                                }}
                                                            >
                                                                <FormControlLabel
                                                                    value="first_access"
                                                                    control={<Radio />}
                                                                    label={translate('Course management.RADIO_CALCULATION_FIRST_ACCESS', 'Start calculation from the first access date')}
                                                                />
                                                                <FormControlLabel
                                                                    value="enrollment_date"
                                                                    control={<Radio />}
                                                                    label={translate('Course management.RADIO_CALCULATION_ENROLLMENT_DATE', 'Start calculation from the enrollment date')}
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    )}
                                                />

                                                <Box sx={{ mt: 2, mb: 2 }}>
                                                    <Controller
                                                        name="validity_time_update_existing"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onChange={(e) => {
                                                                            field.onChange(e.target.checked);
                                                                            setValidityTimeUpdateExisting(e.target.checked);
                                                                            console.log("validity_time_update_existing changed to:", e.target.checked);
                                                                        }}
                                                                    />
                                                                }
                                                                label={translate('Course management.CHECKBOX_APPLY_TO_ALL_USERS', 'Apply settings to all users, including those already enrolled')}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Soft deadline */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                                            {translate('Course management.SUB_SECTION_SOFT_DEADLINE', 'Soft deadline')}
                                        </Typography>

                                        <Controller
                                            name="soft_deadline_enabled"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.value}
                                                            onChange={(e) => {
                                                                field.onChange(e.target.checked);
                                                                console.log("Soft deadline changed to:", e.target.checked, "- Will be sent as:", e.target.checked ? 1 : 0);

                                                                if (e.target.checked) {
                                                                    const softRadioValue = watch('soft_deadline_type') || "1";
                                                                    setValue('soft_deadline', softRadioValue === "1");
                                                                } else {
                                                                    setValue('soft_deadline', false);
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={translate('Course management.CHECKBOX_ENABLE_SOFT_DEADLINE', 'Enable soft deadline (access after end date)')}
                                                />
                                            )}
                                        />

                                        {watch('soft_deadline_enabled') && (
                                            <Box sx={{ ml: 4, mt: 2 }}>
                                                <FormControl component="fieldset">
                                                    <FormLabel component="legend">{translate('Course management.FIELD_SOFT_DEADLINE_TYPE', 'Soft Deadline Type')}</FormLabel>
                                                    <Controller
                                                        name="soft_deadline_type"
                                                        control={control}
                                                        defaultValue="1"
                                                        render={({ field }) => (
                                                            <RadioGroup
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                    if (watch('soft_deadline_enabled')) {
                                                                        setValue('soft_deadline', e.target.value === "1");
                                                                    }
                                                                    console.log("soft_deadline_type changed to:", e.target.value);
                                                                }}
                                                            >
                                                                <FormControlLabel
                                                                    value="1"
                                                                    control={<Radio />}
                                                                    label={translate('Course management.RADIO_SOFT_DEADLINE_ON', 'Soft deadline on')}
                                                                />
                                                                <FormHelperText sx={{ mt: -1, ml: 4 }}>
                                                                    {translate('Course management.TEXT_SOFT_DEADLINE_ON_DESCRIPTION', "Learners will be able to access the course's training material after the course end date")}
                                                                </FormHelperText>
                                                                
                                                                <FormControlLabel
                                                                    value="0"
                                                                    control={<Radio />}
                                                                    label={translate('Course management.RADIO_SOFT_DEADLINE_OFF', 'Soft deadline off (default)')}
                                                                />
                                                                <FormHelperText sx={{ mt: -1, ml: 4 }}>
                                                                    {translate('Course management.TEXT_SOFT_DEADLINE_OFF_DESCRIPTION', 'Learners will not be allowed to access the course after the end date')}
                                                                </FormHelperText>
                                                            </RadioGroup>
                                                        )}
                                                    />
                                                </FormControl>
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
                            disabled={updateCourseMutation.isPending}
                            startIcon={updateCourseMutation.isPending ? <CircularProgress size={20} /> : null}
                        >
                            {updateCourseMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </TabContext>
    );
};

export default CourseProperties;