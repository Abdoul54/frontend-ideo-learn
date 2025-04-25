'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Grid,
    Tab,
    Box,
    Typography,
    CircularProgress,
    Paper,
    Button,
    IconButton
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import CustomTabList from "@/@core/components/mui/TabList";
import { useCourse } from "@/hooks/api/tenant/learn/course/useCourse";
import ToolBar from "@/components/ToolBar";
import CourseProperties from '@/views/tabs/course/CourseProperties';
import CourseSessionsTab from '@/views/tabs/session/CourseSessionsTab';
import CourseEnrollmentsTab from '@/views/tabs/session/CourseEnrollmentsTab';
import EnrollUserDrawer from '@/views/Drawers/Learn/Enroll/EnrollUserDrawer';

export default function CourseEditPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.id;

    // Fetch course data
    const { data: courseData, isLoading, error } = useCourse(courseId);

    // Add debug log to verify data loading
    useEffect(() => {
        if (courseData) {
            console.log("Course data loaded:", courseData);
        }
    }, [courseData]);

    // Set default tab to 'properties' or use the tab from URL
    const [activeTab, setActiveTab] = useState(() => {
        const tabParam = searchParams.get("tab");
        return tabParam || "properties";
    });

    // State for enrollment drawer
    const [enrollDrawerOpen, setEnrollDrawerOpen] = useState(false);

    // Update tab when URL changes
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Handle tab change
    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
        router.push(`/learn/course/edit/${courseId}?tab=${newValue}`);
    };

    // Toggle enrollment drawer
    const toggleEnrollDrawer = () => {
        setEnrollDrawerOpen(!enrollDrawerOpen);
    };

    // If loading, show a loader
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // // If error, show error message
    // if (error) {
    //     return (
    //         <Box sx={{ p: 4 }}>
    //             <Typography variant="h5" color="error">Error loading course</Typography>
    //             <Typography variant="body1">{error.message}</Typography>
    //             <Button
    //                 variant="outlined"
    //                 color="primary"
    //                 sx={{ mt: 2 }}
    //                 onClick={() => router.push('/learn/course')}
    //             >
    //                 Back to Courses
    //             </Button>
    //         </Box>
    //     );
    // }

    // Check if the course is a classroom course
    const isClassroomCourse = courseData?.course_type === "classroom";

    // Breadcrumbs for the toolbar
    const breadcrumbs = [
        { label: 'Course Management', link: '/learn/course' },
        { label: courseData?.name || 'Edit Course', link: '#' }
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ToolBar breadcrumbs={breadcrumbs} />
            </Grid>

            <Grid item xs={12} sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2, // Add margin bottom for better spacing
                flexWrap: 'wrap' // Allow wrapping on smaller screens
            }}>
                <Typography
                    variant="h4"
                    sx={{ mb: 0 }} // Override gutterBottom with explicit margin
                >
                    {courseData?.name || 'Edit Course'}
                </Typography>

                {/* Improved Enroll Users button with more visible styling */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<i className="solar-user-plus-bold" />}
                    onClick={toggleEnrollDrawer}
                    className="enroll-users-btn" // Add class for easier debugging
                    sx={{
                        minWidth: '140px',
                        display: 'flex',
                        visibility: 'visible', // Ensure visibility
                        zIndex: 1 // Ensure proper stacking
                    }}
                >
                    Enroll Users
                </Button>
            </Grid>

            <Grid item xs={12}>
                <TabContext value={activeTab}>
                    <CustomTabList
                        pill='true'
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                width: '100%'
                            }
                        }}
                    >
                        <Tab value="properties" label="Properties" />
                        <Tab value="training_material" label="Training Material" />
                        {isClassroomCourse && <Tab value="sessions" label="Sessions" />}
                        <Tab value="enrollments" label="Enrollments" />
                        <Tab value="learning_plans" label="Learning Plans" />
                        <Tab value="reports" label="Reports" />
                    </CustomTabList>

                    {/* Tab Panels */}
                    <TabPanel value="properties" sx={{ p: 0 }}>
                        <CourseProperties course={courseData} />
                    </TabPanel>

                    <TabPanel value="training_material" sx={{ p: 0 }}>
                        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6">Training Material</Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Training Material coming soon.
                            </Typography>
                        </Paper>
                    </TabPanel>

                    {isClassroomCourse && (
                        <TabPanel value="sessions" sx={{ p: 0 }}>
                            <CourseSessionsTab courseId={courseId} />
                        </TabPanel>
                    )}

                    <TabPanel value="enrollments" sx={{ p: 0 }}>
                        <CourseEnrollmentsTab courseId={courseId} />
                    </TabPanel>

                    <TabPanel value="learning_plans" sx={{ p: 0 }}>
                        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6">Course Learning Plans</Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Learning Plans coming soon.
                            </Typography>
                        </Paper>
                    </TabPanel>

                    <TabPanel value="reports" sx={{ p: 0 }}>
                        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6">Course Reports</Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Reports coming soon.
                            </Typography>
                        </Paper>
                    </TabPanel>
                </TabContext>
            </Grid>

            {/* Enroll Users Drawer */}
            <EnrollUserDrawer
                open={enrollDrawerOpen}
                onClose={() => setEnrollDrawerOpen(false)}
                courseId={courseId}
                courseType={courseData?.course_type}
                courseName={courseData?.name}
                isBulkEnrollment={false}
            />
        </Grid>
    );
}