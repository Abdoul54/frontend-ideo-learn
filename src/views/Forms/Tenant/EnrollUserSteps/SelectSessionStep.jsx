import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import {
    Box,
    Typography,
    Grid,
    TextField,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment,
    IconButton,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert
} from "@mui/material";
import dayjs from "dayjs";
import { useCourseSessions } from "@/hooks/api/tenant/learn/course/useCourse";

export default function SelectSessionStep({ control, errors, courseId, selectedCourses = [], isBulkEnrollment = false, setValue, getValues, watch }) {
    // State for search text
    const [searchText, setSearchText] = useState("");
    // Pagination state
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([{ id: 'name', desc: true }]);

    // State to track course-specific enrollment types
    const [courseEnrollmentTypes, setCourseEnrollmentTypes] = useState({});

    // State to track which accordion is expanded
    const [expandedCourse, setExpandedCourse] = useState(null);

    // State to track selected course for session
    const [selectedCourseForSession, setSelectedCourseForSession] = useState(null);

    // Use the passed watch function instead of extracting from control
    const enrollmentType = watch("enrollmentType");
    const selectedSessionId = watch("session_id");

    // Filter classroom courses if we're in bulk enrollment mode
    const classroomCourses = isBulkEnrollment
        ? selectedCourses.filter(course => course.course_type === "classroom")
        : [{ id: courseId }];

    // Set the first classroom course as initially expanded
    useEffect(() => {
        if (classroomCourses.length > 0 && !expandedCourse) {
            setExpandedCourse(classroomCourses[0].id);
        }

        // Initialize with default enrollmentType
        if (!enrollmentType) {
            setValue("enrollmentType", "course");
        }
    }, [classroomCourses]);

    useEffect(() => {
        if (enrollmentType === "course") {
            setValue("session_id", null);
            setSelectedCourseForSession(null);
        }
    }, [enrollmentType, setValue]);

    const handleEnrollmentTypeChange = (value) => {
        if (value === 'course') {
            // Clear session ID when switching to course enrollment
            setValue('session_id', null);
            setSelectedCourseForSession(null);
        }
    };

    // Handle changing the selected course for session
    const handleCourseSessionToggle = (courseId) => {
        // Toggle the accordion
        setExpandedCourse(expandedCourse === courseId ? null : courseId);

        // If this course is now selected for sessions, update tracking state
        if (expandedCourse !== courseId && enrollmentType === "session") {
            setSelectedCourseForSession(courseId);
        }
    };

    // // Initialize session selections on mount
    // useEffect(() => {
    //     if (isBulkEnrollment && classroomCourses.length > 0) {
    //         // Initialize course_sessions if it doesn't exist
    //         if (!getValues('course_sessions')) {
    //             setValue('course_sessions', []);
    //         }

    //         // Set default enrollment type for each course
    //         const initialEnrollmentTypes = {};
    //         classroomCourses.forEach(course => {
    //             initialEnrollmentTypes[course.id] = 'course';
    //         });
    //         setCourseEnrollmentTypes(initialEnrollmentTypes);

    //         // Set the first classroom course as initially expanded
    //         if (classroomCourses.length > 0 && !expandedCourse) {
    //             setExpandedCourse(classroomCourses[0].id);
    //         }
    //     }
    // }, [classroomCourses]);

    // Handle enrollment type change for a specific course
    const handleCourseEnrollmentTypeChange = (courseId, value) => {
        setCourseEnrollmentTypes(prev => ({
            ...prev,
            [courseId]: value
        }));

        // Update course_sessions
        const currentSessions = getValues('course_sessions') || [];

        if (value === 'course') {
            // Remove this course's session selection if switching to course enrollment
            setValue('course_sessions', currentSessions.filter(cs => cs.course_id !== courseId));
        }
    };

    // Handle session selection for a specific course
    const handleSessionSelection = (courseId, sessionId) => {
        const currentSessions = getValues('course_sessions') || [];

        // Remove any existing selection for this course
        const filteredSessions = currentSessions.filter(cs => cs.course_id !== courseId);

        // Add the new selection
        const newSessions = [...filteredSessions, { course_id: courseId, session_id: sessionId }];
        setValue('course_sessions', newSessions);
    };

    // Handle the global enrollment type (used in single course mode)
    const handleGlobalEnrollmentTypeChange = (value) => {
        if (value === 'course') {
            // Clear session ID when switching to course enrollment
            setValue('session_id', null);
        }
    };

    // Check if a session is selected for a specific course
    const isSessionSelected = (courseId, sessionId) => {
        const sessions = getValues('course_sessions') || [];
        return sessions.some(s => s.course_id === courseId && s.session_id === sessionId);
    };

    // Search and pagination for bulk enrollment mode
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    return (
        <Grid container spacing={3}>
        <Grid item xs={12} sx={{ mb: 2, mt: 2 }}>
            <Typography variant="subtitle1">
                Enrolling users to {isBulkEnrollment ? 'courses or sessions' : 'course or session'}
            </Typography>
            {isBulkEnrollment && classroomCourses.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    You've selected {classroomCourses.length} classroom courses. 
                    You can enroll users either directly to all courses or to a single session.
                </Typography>
            )}
        </Grid>

        <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Controller
                        name="enrollmentType"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                {...field}
                                aria-label="enrollment type"
                                onChange={(e) => {
                                    field.onChange(e);
                                    handleEnrollmentTypeChange(e.target.value);
                                }}
                            >
                                <FormControlLabel
                                    value="course"
                                    control={<Radio />}
                                    label={`I want to enroll users to ${isBulkEnrollment ? 'all selected courses' : 'the course'}`}
                                />
                                <FormControlLabel
                                    value="session"
                                    control={<Radio />}
                                    label={`I want to enroll users to a session${isBulkEnrollment ? ' of one course' : ''}`}
                                />
                            </RadioGroup>
                        )}
                    />
                </Box>

                <Controller
                    name="enrollmentType"
                    control={control}
                    render={({ field }) => (
                        field.value === "session" && (
                            <>
                                {isBulkEnrollment ? (
                                    // BULK ENROLLMENT MODE - MULTIPLE COURSES
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                            Select a classroom course to view its sessions:
                                        </Typography>
                                        
                                        {classroomCourses.length === 0 ? (
                                            <Alert severity="info">
                                                You haven't selected any classroom courses with sessions.
                                            </Alert>
                                        ) : (
                                            classroomCourses.map((course) => (
                                                <Accordion 
                                                    key={course.id}
                                                    expanded={expandedCourse === course.id}
                                                    onChange={() => handleCourseSessionToggle(course.id)}
                                                    sx={{ mb: 2 }}
                                                >
                                                    <AccordionSummary 
                                                        expandIcon={<i className="solar-alt-arrow-down-bold" />}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                                                {course.name || `Course ID: ${course.id}`}
                                                            </Typography>
                                                            
                                                            {selectedSessionId && selectedCourseForSession === course.id && (
                                                                <Chip 
                                                                    label="Session Selected" 
                                                                    size="small" 
                                                                    color="primary" 
                                                                    variant="outlined" 
                                                                    sx={{ ml: 2 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <SessionTableForBulk
                                                            courseId={course.id}
                                                            control={control}
                                                            searchText={searchText}
                                                            pagination={pagination}
                                                            setPagination={setPagination}
                                                            sorting={sorting}
                                                            selectedSessionId={selectedSessionId}
                                                            setValue={setValue}
                                                            onSelectSession={() => setSelectedCourseForSession(course.id)}
                                                        />
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))
                                        )}
                                    </Box>
                                ) : (
                                    // SINGLE COURSE ENROLLMENT MODE
                                    <SingleCourseSessionTable 
                                        courseId={courseId}
                                        control={control}
                                        searchText={searchText}
                                        pagination={pagination}
                                        setPagination={setPagination}
                                        sorting={sorting}
                                    />
                                )}
                            </>
                        )
                    )}
                />
            </Paper>
        </Grid>

        {errors.enrollmentType && (
            <Grid item xs={12}>
                <Typography color="error">{errors.enrollmentType.message}</Typography>
            </Grid>
        )}

        {errors.session_id && (
            <Grid item xs={12}>
                <Typography color="error">{errors.session_id.message}</Typography>
            </Grid>
        )}
    </Grid>
);
}

// Component for session table in single course mode
function SingleCourseSessionTable({ courseId, control, searchText, pagination, setPagination, sorting }) {
const [searchQuery, setSearchQuery] = useState(searchText || '');

// Fetch session data for the course
const {
    data: sessionsData,
    isLoading,
    error
} = useCourseSessions({
    courseId,
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    sort_attr: sorting[0]?.id || 'name',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    search_text: searchQuery
});

// Transform API data for display
const sessions = sessionsData?.items || [];
const totalSessions = sessionsData?.pagination?.total || 0;

// Handle search input change
const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
};

return (
    <>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <i className="solar-magnifer-linear" />
                        </InputAdornment>
                    )
                }}
            />
        </Box>

        <Controller
            name="session_id"
            control={control}
            render={({ field: sessionField }) => (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width="5%"></TableCell>
                                <TableCell>NAME</TableCell>
                                <TableCell>SESSION CODE</TableCell>
                                <TableCell>CAPACITY</TableCell>
                                <TableCell>ENROLLMENT</TableCell>
                                <TableCell>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Loading sessions...</TableCell>
                                </TableRow>
                            ) : sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No sessions found</TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((session) => {
                                    // Calculate enrollment status
                                    const enrollmentCount = session.enrolled_count || 0;
                                    const maxEnroll = session.max_enroll || Infinity;
                                    const isFull = enrollmentCount >= maxEnroll;

                                    return (
                                        <TableRow
                                            key={session.id}
                                            sx={{
                                                backgroundColor: isFull ? 'rgba(211, 47, 47, 0.05)' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: isFull ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Radio
                                                    checked={sessionField.value === session.id}
                                                    onChange={() => sessionField.onChange(session.id)}
                                                    disabled={isFull}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {session.name}
                                                {session.enrollment_deadline && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Deadline: {dayjs(session.enrollment_deadline).format("DD/MM/YYYY")}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{session.code}</TableCell>
                                            <TableCell>
                                                {session.max_enroll ? `${session.max_enroll} seats` : 'Unlimited'}
                                            </TableCell>
                                            <TableCell>
                                                {enrollmentCount}/{maxEnroll === Infinity ? '∞' : maxEnroll}
                                                <IconButton size="small" sx={{ ml: 1 }}>
                                                    <i className="solar-users-group-rounded-bold" />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                {isFull ? (
                                                    <Chip
                                                        label="Full"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Available"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        />

        {/* Pagination display */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2">
                {pagination.pageIndex * pagination.pageSize + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalSessions)} of {totalSessions}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    disabled={pagination.pageIndex === 0}
                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                >
                    <i className="solar-arrow-left-bold" />
                </IconButton>
                <IconButton
                    disabled={(pagination.pageIndex + 1) * pagination.pageSize >= totalSessions}
                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                >
                    <i className="solar-arrow-right-bold" />
                </IconButton>
            </Box>
        </Box>
    </>
);
}

// Component for session table in bulk enrollment mode
function SessionTableForBulk({ courseId, control, searchText, pagination, setPagination, sorting, selectedSessionId, setValue, onSelectSession }) {
const [searchQuery, setSearchQuery] = useState(searchText || '');

// Fetch session data for the specific course
const {
    data: sessionsData,
    isLoading,
    error
} = useCourseSessions({
    courseId,
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    sort_attr: sorting[0]?.id || 'name',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
    search_text: searchQuery
});

// Transform API data for display
const sessions = sessionsData?.items || [];
const totalSessions = sessionsData?.pagination?.total || 0;

// Handle search input change
const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
};

// Handle session selection
const handleSessionSelect = (sessionId) => {
    setValue("session_id", sessionId);
    // Store the selected course ID for tracking
    if (onSelectSession) {
        onSelectSession();
    }
};

return (
    <>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <i className="solar-magnifer-linear" />
                        </InputAdornment>
                    )
                }}
            />
        </Box>

        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width="5%"></TableCell>
                        <TableCell>NAME</TableCell>
                        <TableCell>SESSION CODE</TableCell>
                        <TableCell>CAPACITY</TableCell>
                        <TableCell>ENROLLMENT</TableCell>
                        <TableCell>STATUS</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">Loading sessions...</TableCell>
                        </TableRow>
                    ) : sessions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">No sessions found</TableCell>
                        </TableRow>
                    ) : (
                        sessions.map((session) => {
                            // Calculate enrollment status
                            const enrollmentCount = session.enrolled_count || 0;
                            const maxEnroll = session.max_enroll || Infinity;
                            const isFull = enrollmentCount >= maxEnroll;

                            return (
                                <TableRow
                                    key={session.id}
                                    sx={{
                                        backgroundColor: isFull ? 'rgba(211, 47, 47, 0.05)' : 'inherit',
                                        '&:hover': {
                                            backgroundColor: isFull ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Radio
                                            checked={selectedSessionId === session.id}
                                            onChange={() => handleSessionSelect(session.id)}
                                            disabled={isFull}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {session.name}
                                        {session.enrollment_deadline && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Deadline: {dayjs(session.enrollment_deadline).format("DD/MM/YYYY")}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{session.code}</TableCell>
                                    <TableCell>
                                        {session.max_enroll ? `${session.max_enroll} seats` : 'Unlimited'}
                                    </TableCell>
                                    <TableCell>
                                        {enrollmentCount}/{maxEnroll === Infinity ? '∞' : maxEnroll}
                                        <IconButton size="small" sx={{ ml: 1 }}>
                                            <i className="solar-users-group-rounded-bold" />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        {isFull ? (
                                            <Chip
                                                label="Full"
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                            />
                                        ) : (
                                            <Chip
                                                label="Available"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        {/* Pagination display */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2">
                {pagination.pageIndex * pagination.pageSize + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalSessions)} of {totalSessions}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    disabled={pagination.pageIndex === 0}
                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                >
                    <i className="solar-arrow-left-bold" />
                </IconButton>
                <IconButton
                    disabled={(pagination.pageIndex + 1) * pagination.pageSize >= totalSessions}
                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                >
                    <i className="solar-arrow-right-bold" />
                </IconButton>
            </Box>
        </Box>
    </>
);
}